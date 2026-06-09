import type { Pattern } from "../types.js";

export const stripeBilling: Pattern = {
  "slug": "stripe-billing",
  "version": "1.0.0",
  "name": "Stripe Billing",
  "tagline": "Safe Stripe integration: verified webhooks, idempotent handlers, and the right API for the job.",
  "description": "Rules, memories, and a review skill for adding Stripe billing to a product. Pre-scoped to your Stripe API routes and serverless functions so your AI assistant verifies webhook signatures, keeps handlers idempotent, and picks the correct payment API.",
  "category": "Billing",
  "icon": "credit-card",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Stripe billing patterns for AI coding agents",
  "metaDescription": "A ready-to-use Pathrule pattern for Stripe: webhook signature verification, idempotent handlers, Checkout vs PaymentIntents guidance, and a billing review skill.",
  "problem": "Billing code trusts unverified webhooks or double-applies retried events, causing security holes and wrong charges.",
  "audience": "teams adding subscriptions or payments with Stripe",
  "prevents": [
    "Acting on a webhook before verifying its signature",
    "Non-idempotent handlers that double-process retried events",
    "Driving entitlements from the client redirect instead of webhooks"
  ],
  "appliesTo": {
    "paths": [
      "/api/stripe",
      "/app/api/stripe",
      "/supabase/functions"
    ],
    "stacks": [
      "stripe"
    ],
    "packages": [
      "stripe"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/api/stripe",
      "title": "Verify the webhook signature against the raw request body",
      "summary": "Reject any webhook whose Stripe-Signature does not verify against the unparsed body.",
      "body": "Verify the `Stripe-Signature` header with the endpoint's signing secret using the official SDK (`stripe.webhooks.constructEvent`, or `constructEventAsync` on edge/Workers runtimes) before reading any field of the event.\n\n- Pass the EXACT raw bytes of the request body. Any re-serialization, key reordering, whitespace change, or Unicode normalization makes verification fail. In Express, mount `express.raw({ type: 'application/json' })` on the webhook route only, never a global `express.json()` ahead of it. In Next.js route handlers read `await req.text()`; in Supabase Edge Functions read `await req.text()` and never `await req.json()` first.\n- Read the signing secret from server config, never from the request.\n- Return `400` on verification failure and do not run any handler logic.\n- During a signing-secret rotation Stripe signs with both the old and new secret over an overlap window, so deploy the new secret before retiring the old one.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/api/stripe",
      "title": "Make webhook handlers idempotent and return 2xx fast",
      "summary": "The same event can arrive more than once; dedupe it and answer before heavy work.",
      "body": "Stripe delivers events at least once, so the same event (and occasionally two distinct Event objects for one change) can arrive more than once.\n\n- Dedupe on `event.id`: record processed IDs and skip a repeat, or make the side effect idempotent (upsert by a stable key such as the subscription or invoice ID). For the rare two-Events case, key on `event.type` plus `data.object.id`.\n- Return a `2xx` BEFORE any logic that could time out. Offload slow work (emails, accounting sync, provisioning) to a queue or background job and acknowledge the delivery immediately, otherwise Stripe retries a delivery you already handled.\n- A non-2xx response triggers Stripe's retry schedule, so only return 4xx/5xx when you actually want a retry.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Send an idempotency key on every Stripe write request",
      "summary": "Pass a stable Idempotency-Key on POST/create/update calls so retries cannot double-charge.",
      "body": "This is a SEPARATE concern from webhook deduplication. It protects outbound calls TO Stripe, not events you receive.\n\n- Every Stripe POST (create/update of PaymentIntents, Subscriptions, Refunds, etc.) accepts an idempotency key. Pass one whenever a network error or your own retry could resend the request: `stripe.paymentIntents.create(params, { idempotencyKey })`.\n- Derive the key from your own stable identity (for example `order:<id>` or a UUID you persist with the order), not a fresh random value per attempt, so a retry reuses the same key.\n- Stripe remembers a key's result for 24 hours; reusing it returns the original response instead of performing the operation twice.\n- The SDK auto-retries some transient failures with its own idempotency handling, but supply your own key for any operation you initiate or retry at the application layer.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Keep Stripe secrets server-side and use restricted keys",
      "summary": "Only the publishable key is client-safe; secret and signing secrets live in server env.",
      "body": "The secret key (`sk_...`) and the webhook signing secret (`whsec_...`) are server-side only. Only the publishable key (`pk_...`) may ship to the client.\n\n- Store both secrets in server/function environment variables, never in client bundles, repos, or logs.\n- For server-side code use a Restricted API Key (RAK) scoped to exactly the resources the integration needs, so a leaked key limits blast radius. Reserve the full secret key for operations a RAK cannot perform.\n- In edge or serverless functions, authenticate the caller (or verify the webhook signature for webhook routes) before any billing action; an unauthenticated function with a secret key is a charge-anyone hole.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/api/stripe",
      "title": "Webhooks grant entitlements, not the success redirect",
      "summary": "Treat the client redirect as a hint; provision access only from verified webhook events.",
      "body": "The redirect to your success URL is only a suggestion that the user came back; it can be skipped, replayed, or forged. The verified webhook is the source of truth for what actually happened.\n\n- Grant or revoke access from events such as `checkout.session.completed`, `customer.subscription.created/updated/deleted`, and `invoice.paid`, not from the success-page query params.\n- On the success page, show a neutral \"finishing up\" state and read entitlement from your own database (which the webhook updates), rather than unlocking features directly from the redirect."
    },
    {
      "kind": "memory",
      "nodePath": "/api/stripe",
      "title": "DB mirrors Stripe; one checker reads active/trialing",
      "summary": "Keep a local subscription mirror updated by webhooks; gate access through a single status function.",
      "body": "Do not call the Stripe API on every request to check billing; that adds latency and rate-limit risk. Keep a local mirror and treat Stripe as the source of truth that flows in through webhooks.\n\n- Maintain a `subscriptions` table mirroring Stripe: subscription ID, customer ID, `status`, price ID, `current_period_end`, and `cancel_at_period_end`. Update it on every relevant webhook.\n- Gate access through ONE shared function so the rule lives in a single place. Only `active` and `trialing` grant access; `past_due`, `canceled`, `incomplete`, `unpaid`, etc. do not.\n- Store the Stripe `customer` ID on the user as soon as it exists so later events map back to the right account."
    },
    {
      "kind": "memory",
      "nodePath": "/api/stripe",
      "title": "Checkout Sessions vs PaymentIntents",
      "summary": "Default to Checkout (including subscriptions); use PaymentIntents only for fully custom flows.",
      "body": "Stripe recommends the Checkout Sessions API for most integrations, and it remains the default choice in 2026.\n\n- Use Checkout with `mode: 'subscription'` for recurring billing: it handles SCA/3DS, tax, currency conversion, trials, Smart Retries, dunning, and proration with far less code.\n- Use Checkout with `mode: 'payment'` for standard one-time payments.\n- Reach for PaymentIntents with the Payment Element only when you must own every part of the in-app flow and are prepared to rebuild discount, tax, and currency logic yourself.\n- Either way, drive entitlements from webhook events (see the entitlements memory), not the API response on the redirect."
    },
    {
      "kind": "memory",
      "nodePath": "/api/stripe",
      "title": "Pin the API version on the webhook endpoint",
      "summary": "Set an explicit API version so event shapes and SDK deserialization stay stable.",
      "body": "Stripe pins your account to an API version on first request and releases new versions monthly (non-breaking) with breaking releases roughly twice a year. Event payload shapes follow the version the webhook endpoint is configured with.\n\n- Set an explicit API version on the endpoint and in the SDK client (`new Stripe(key, { apiVersion: '...' })`) rather than relying on the account default, so an account-level upgrade does not silently change the JSON you parse.\n- With statically typed SDKs (Go, Java, .NET), the webhook endpoint's API version must match the version the SDK was generated for, or event deserialization fails.\n- To upgrade: send the new `Stripe-Version` from staging, diff the responses and events, fix your code, then move the webhook endpoint and pinned version forward."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "stripe-billing-review",
      "summary": "Checklist for reviewing a Stripe billing change before merge.",
      "body": "---\nname: stripe-billing-review\ndescription: Review a Stripe billing change for security and correctness before merging.\n---\n\n# Stripe billing review\n\n## Webhooks\n- [ ] Signature verified with constructEvent/constructEventAsync against the RAW body before any logic\n- [ ] No global JSON body parser runs ahead of the webhook route (Express raw, Next req.text(), Edge req.text())\n- [ ] Returns 400 on verification failure with no side effects\n- [ ] Handler is idempotent: dedupes on event.id or upserts by a stable key\n- [ ] Returns 2xx fast; slow work is offloaded to a queue/background job\n- [ ] Webhook endpoint has an explicit pinned API version\n\n## Entitlements and state\n- [ ] Access is granted from webhook events, not the success-page redirect\n- [ ] Local subscription mirror is updated by webhooks; one shared function gates access on active/trialing only\n- [ ] Stripe customer ID is stored on the user\n\n## Outbound calls and keys\n- [ ] POST/create/update calls send a stable Idempotency-Key for safe retries\n- [ ] Secret key and webhook signing secret are server-side only; only pk_ ships to the client\n- [ ] Server uses a restricted API key scoped to what it needs\n\n## Money\n- [ ] Amounts are integers in the currency's minor unit (and account for zero-decimal currencies); no float math\n- [ ] Correct API chosen: Checkout for standard/subscription, PaymentIntents only for fully custom flows\n",
      "skillTags": [
        "stripe",
        "billing",
        "webhooks",
        "security",
        "review"
      ]
    }
  ]
};
