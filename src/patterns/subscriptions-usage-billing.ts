import type { Pattern } from "../types.js";

export const subscriptionsUsageBilling: Pattern = {
  "slug": "subscriptions-usage-billing",
  "version": "1.0.0",
  "name": "Subscriptions & Usage Billing",
  "tagline": "Ship metered subscriptions on Stripe Billing without dropping usage or double-charging customers.",
  "description": "A pattern bundle for subscription and usage-based billing on Stripe Billing in 2026. It covers Billing Meters and meter events, idempotent webhook handling, entitlement sync, proration on plan changes, and dunning for failed payments. Keep your own database as the source of truth for usage and entitlements, and treat Stripe events as a queue you reconcile against.",
  "category": "Billing",
  "icon": "gauge",
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
  "metaTitle": "Subscriptions & Usage Billing pattern for AI coding agents",
  "metaDescription": "A Pathrule pattern that teaches AI coding agents to build Stripe metered subscriptions correctly: meters, idempotent webhooks, entitlements, proration, and dunning.",
  "problem": "Usage-based subscription billing silently loses meter events, grants the wrong entitlements, and mis-charges on plan changes when webhooks and metering are handled ad hoc.",
  "audience": "SaaS and AI product teams running subscription plus usage-based billing on Stripe.",
  "prevents": [
    "Dropping usage because meter events are sent without idempotency or outside the accepted timestamp window",
    "Granting or revoking the wrong plan access because entitlements are derived from redirect callbacks instead of webhooks",
    "Double-applying webhook side effects or mis-charging customers on proration during plan upgrades and downgrades"
  ],
  "appliesTo": {
    "paths": [
      "/src/billing",
      "/src/api/webhooks",
      "/src/usage"
    ],
    "stacks": [
      "stripe-billing",
      "node",
      "typescript",
      "postgres"
    ],
    "packages": [
      "stripe",
      "@stripe/stripe-js"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/usage",
      "title": "Report usage through Billing Meters with idempotent meter events",
      "summary": "Send every usage event to a Billing Meter with a unique identifier and a valid timestamp; the legacy usage_records API is gone.",
      "body": "Meter all usage through Stripe Billing Meters and meter events. The legacy usage-based billing APIs (subscription_items.create_usage_record / usage_records) were removed in API version 2025-03-31.basil and only exist on pinned versions on or before 2024-09-30.acacia. Do not use them in new code.\n\n- Set a unique `identifier` on every meter event. Stripe enforces uniqueness within a rolling window of at least 24 hours, so reusing the same identifier on a retry dedupes the event. Use a UUID-like value derived from your own ledger row, not a random per-call value, so retries actually collide.\n- Keep the event `timestamp` within the past 35 calendar days and no more than 5 minutes in the future, or Stripe rejects the event. The event is bucketed into the window containing `timestamp`, not the time you sent it, so backfills land in the correct period.\n- Above roughly 1,000 events/sec, switch from the synchronous v1 `POST /v1/billing/meter_events` to the v2 Meter Event Stream: create a meter event session, use its session token (valid 15 minutes, refresh before expiry) to stream up to 10,000 events/sec. The high-throughput stream is live-mode only.\n- Write to your own `usage_events` ledger first and treat it as the source of truth. Stripe meter event summaries are for billing aggregation, not for showing customers their live usage.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api/webhooks",
      "title": "Verify, dedupe, and acknowledge Stripe webhooks before doing work",
      "summary": "Every Stripe webhook handler verifies the signature against the raw body, is idempotent on event.id in the same transaction, and returns 2xx fast.",
      "body": "Drive all billing state transitions from verified webhooks, never from browser redirects, because the user can close the tab before the redirect fires.\n\n- Verify the signature with `stripe.webhooks.constructEvent` using the unparsed raw request body and the endpoint secret. JSON body-parser middleware re-serializes the payload and silently breaks HMAC verification, so exempt the webhook route from global JSON parsing and read the raw buffer.\n- Make handlers idempotent on `event.id`: a UNIQUE constraint on a processed-events table, checked before mutating state. Stripe can deliver the same event more than once.\n- Record the processed `event.id` and the business side effect in the SAME database transaction. If you commit the side effect but crash before recording the id, the next retry double-applies it.\n- Return 2xx within seconds and offload slow work (emails, ERP sync, provisioning) to a queue. Long handlers trip Stripe's retry timeout and cause duplicate deliveries.\n- Subscribe to `v1.billing.meter.error_report_triggered` and alert on `meter_event_customer_not_found` spikes, which mean a usage integration is silently dropping events.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/billing",
      "title": "Never hand-roll proration, prices, or dunning math",
      "summary": "Let Stripe compute proration and run retries; reference price IDs; pick the right proration_behavior so you do not mis-charge.",
      "body": "Plan changes, seat counts, and failed-payment recovery are owned by Stripe Billing. Computing any of this yourself mis-charges customers, which is a money-correctness bug.\n\n- For upgrades and downgrades, update the subscription item and let Stripe compute proration. Choose `proration_behavior` deliberately: `always_invoice` creates prorations and immediately invoices and collects (use for upgrades you want paid now); `create_prorations` creates the line items but does not invoice until the next cycle; `none` skips proration entirely. Never compute partial-period charges by hand.\n- Set `proration_behavior: 'none'` when the subscription's latest invoice is unpaid, so you do not credit a customer for time they have not paid for.\n- Model seats as a licensed (per-seat) subscription item `quantity`; update the quantity on team-membership changes so Stripe prorates automatically. Do not create one subscription per seat.\n- Never store prices or amounts locally. Always reference Stripe price IDs so the charged amount stays authoritative and packaging changes do not require a deploy.\n- Configure dunning with Smart Retries rather than custom retry loops, and react to `invoice.payment_failed`, `invoice.paid`, and `customer.subscription.updated` to flip account status.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing",
      "title": "Entitlements are derived from subscription webhooks, with paginated refetch",
      "summary": "Mirror Stripe Entitlements locally from webhooks; gate features on stored entitlements; refetch via the list API because the summary webhook truncates at 10.",
      "body": "Stripe Entitlements expose what each customer can access based on their active subscription. We mirror them into a local `entitlements` table rather than hardcoding plan-to-feature maps, because Stripe recommends persisting them for read performance instead of calling the list API on every gate check.\n\n- On `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `entitlements.active_entitlement_summary.updated`, refetch the customer's active entitlements via the list API and upsert them. Do NOT read the entitlement list out of the webhook payload: the `active_entitlement_summary.updated` event is a known footgun that only carries the first 10 entitlements, so payloads with more than 10 silently drop the rest. List with pagination to get the full set.\n- Gate every paid feature on the stored entitlement `lookup_key`, not on the price ID or product name, so packaging changes need no code edits.\n- Treat `customer.subscription.deleted` and `past_due`/`unpaid` states as access removal, but drive a short grace window off `status` rather than deleting rows immediately.\n- Reconcile nightly by listing live subscriptions and entitlements to heal any webhook that was missed or truncated.\n\nSee /src/api/webhooks for signature verification and idempotency, and /src/usage for metering."
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing",
      "title": "Stripe owns proration and dunning; we configure and react to events",
      "summary": "The decision: Stripe Billing is the system of record for plan-change math and revenue recovery; our code only configures behavior and reacts to resulting events.",
      "body": "We deliberately do not own billing math. Stripe Billing computes proration, runs the retry schedule, and emits events; our job is configuration plus reaction. This keeps our database as the source of truth for usage and entitlements while treating Stripe events as a queue we reconcile against.\n\n- Dunning uses Smart Retries (AI-timed retry attempts), not a fixed schedule we maintain. The current Stripe-recommended default is 8 attempts within 2 weeks; the policy is configurable from 1 week up to 2 months. Older docs and tutorials cite a fixed 7-retries-over-21-days schedule, which is the legacy default and no longer the recommendation.\n- Track recovery off `invoice.payment_failed` (read `attempt_count` and `next_payment_attempt`) and `invoice.paid`. Hard declines keep incrementing `attempt_count` but only actually retry once a new payment method is attached, so do not assume a scheduled retry will run.\n- Flip account status (active / past_due / canceled) from subscription and invoice events, never from a redirect or a client call.\n- Because Stripe is authoritative, a nightly reconciliation job that diffs Stripe subscriptions/entitlements against our tables is the safety net for any dropped webhook.\n\nSee /src/billing entitlement memory for feature gating, and the billing rule for the hard constraints on proration_behavior and price IDs."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "subscriptions-usage-billing-review",
      "summary": "Pre-merge checklist for any change touching metering, webhooks, entitlements, proration, or dunning.",
      "body": "---\nname: subscriptions-usage-billing-review\ndescription: Review checklist for subscription and usage-based billing changes on Stripe Billing. Use before merging any code that records usage, handles billing webhooks, syncs entitlements, changes plans or seats, or touches dunning.\n---\n\n# Subscriptions and usage billing review\n\n## Metering\n- [ ] Usage is reported via Billing Meters and meter events, not the removed `usage_records` API.\n- [ ] Every meter event sets a unique `identifier` derived from the local ledger row so retries dedupe inside Stripe's 24h+ window.\n- [ ] Meter event timestamps fall within the past 35 days and under 5 minutes in the future.\n- [ ] Volume above ~1,000 events/sec uses the v2 Meter Event Stream with a 15-minute session token (live mode only).\n- [ ] A local `usage_events` ledger is written first and treated as the source of truth.\n\n## Webhooks\n- [ ] Signatures are verified against the unparsed raw body and endpoint secret; the route is exempt from global JSON parsing.\n- [ ] Handlers are idempotent on `event.id` via a UNIQUE constraint.\n- [ ] The `event.id` record and the business side effect commit in the same transaction.\n- [ ] Handlers return 2xx quickly and push slow work to a queue.\n- [ ] `v1.billing.meter.error_report_triggered` is subscribed and alerts on `meter_event_customer_not_found`.\n\n## Entitlements\n- [ ] Entitlements are synced from subscription and `active_entitlement_summary.updated` webhooks by refetching via the list API, not by reading the (10-item-truncated) webhook payload.\n- [ ] Feature gates read the stored entitlement `lookup_key`, not the price ID or product name.\n- [ ] A nightly reconciliation job re-lists subscriptions and entitlements to heal missed or truncated events.\n\n## Proration, seats, dunning\n- [ ] Plan changes update the subscription item and let Stripe handle proration; no hand-rolled proration math.\n- [ ] `proration_behavior` is chosen deliberately (`always_invoice` vs `create_prorations` vs `none`), and is `none` when the latest invoice is unpaid.\n- [ ] Seats are modeled as a per-seat item `quantity` that updates on membership changes.\n- [ ] No prices or amounts are stored locally; code references Stripe price IDs.\n- [ ] Dunning relies on Smart Retries plus reactions to `invoice.payment_failed` (checking `attempt_count`) and `invoice.paid`.\n",
      "skillTags": [
        "stripe",
        "billing",
        "subscriptions",
        "usage-based",
        "webhooks",
        "entitlements",
        "dunning"
      ]
    }
  ]
};
