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
      "summary": "Send every usage event to a Billing Meter with a unique identifier and a valid timestamp.",
      "body": "Meter all usage through Stripe Billing Meters and meter events; the legacy `usage_records` API is deprecated and must not be used for new code.\n\n- Set a unique `identifier` on every meter event so retries dedupe inside Stripe's rolling 24 hour+ window; reuse the same identifier when you retry a failed send.\n- Keep the event `timestamp` within the past 35 days and no more than 5 minutes in the future, or Stripe rejects it.\n- For high throughput (over a few hundred events/sec) use the v2 meter event stream with a session token instead of one synchronous call per event.\n- Treat your own `usage_events` table as the source of truth; Stripe meter summaries are for billing, not for showing customers their live usage.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api/webhooks",
      "title": "Verify, dedupe, and acknowledge Stripe webhooks before doing work",
      "summary": "Every Stripe webhook handler verifies the signature, is idempotent, and returns 2xx fast.",
      "body": "Drive all billing state transitions from verified webhooks, never from browser redirects, because the user can close the tab before the redirect fires.\n\n- Verify the signature with the raw request body and the endpoint secret; reject anything that fails before parsing.\n- Make handlers idempotent by recording processed `event.id` values and skipping duplicates, since Stripe can deliver the same event more than once.\n- Return a 2xx within seconds and offload slow work to a queue; long handlers cause Stripe retries and duplicate processing.\n- Subscribe to `v1.billing.meter.error_report_triggered` and alert on `meter_event_customer_not_found` spikes, which signal a broken usage integration silently dropping events.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing",
      "title": "Entitlements are derived from subscription webhooks, not local guesses",
      "summary": "Sync feature access from Stripe Entitlements events and gate features on stored entitlements.",
      "body": "Stripe Entitlements expose what each customer can access based on their active subscription, and we mirror them locally rather than hardcoding plan-to-feature maps.\n\n- On `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `entitlements.active_entitlement_summary.updated`, refetch the customer's active entitlements and upsert them into our `entitlements` table.\n- Gate every paid feature on the stored entitlement lookup, not on the price ID or product name, so plan and packaging changes do not require code edits.\n- Treat `customer.subscription.deleted` and past-due states as access removal, but keep a short grace window driven by `status` rather than deleting rows immediately.\n- Reconcile nightly by listing live subscriptions and entitlements to heal any missed webhook."
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing",
      "title": "Proration, seats, and dunning are configured in Stripe, not hand-rolled",
      "summary": "Let Stripe handle proration math, seat quantity changes, and failed-payment recovery.",
      "body": "Plan changes, seat counts, and recovery from failed payments are owned by Stripe Billing; we configure behavior and react to the resulting events.\n\n- For upgrades and downgrades, update the subscription item and let Stripe compute proration (`proration_behavior`); never compute partial-period charges ourselves.\n- Model seats as a licensed (per-seat) subscription item quantity; adjust the quantity on team membership changes so proration applies automatically.\n- Enable Smart Retries for dunning (default schedule is 7 retries over 21 days) and react to `invoice.payment_failed`, `invoice.paid`, and `customer.subscription.updated` to flip account status.\n- Never store prices locally; always reference Stripe price IDs so amounts stay authoritative."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "subscriptions-usage-billing-review",
      "summary": "Pre-merge checklist for any change touching metering, webhooks, entitlements, proration, or dunning.",
      "body": "---\nname: subscriptions-usage-billing-review\ndescription: Review checklist for subscription and usage-based billing changes on Stripe Billing. Use before merging any code that records usage, handles billing webhooks, syncs entitlements, changes plans or seats, or touches dunning.\n---\n\n# Subscriptions & usage billing review\n\n- [ ] Usage is reported via Billing Meters and meter events, not the deprecated `usage_records` API.\n- [ ] Every meter event sets a unique `identifier` and is safe to retry without double counting.\n- [ ] Meter event timestamps fall within the past 35 days and under 5 minutes in the future.\n- [ ] High-volume metering uses the v2 meter event stream rather than one synchronous call per event.\n- [ ] A local `usage_events` ledger is written first and treated as the source of truth.\n- [ ] Webhook signatures are verified against the raw body and endpoint secret before parsing.\n- [ ] Webhook handlers are idempotent on `event.id` and tolerate duplicate delivery.\n- [ ] Handlers return 2xx quickly and push slow work to a queue.\n- [ ] `v1.billing.meter.error_report_triggered` is subscribed and alerts on `meter_event_customer_not_found`.\n- [ ] Entitlements are synced from subscription and entitlement-summary webhooks and feature gates read the stored entitlement, not the price ID.\n- [ ] Plan changes update the subscription item and let Stripe handle proration; no hand-rolled proration math.\n- [ ] Seats are modeled as a per-seat item quantity that updates on membership changes.\n- [ ] Dunning relies on Smart Retries plus reactions to `invoice.payment_failed` and `invoice.paid`.\n- [ ] No prices are stored locally; code references Stripe price IDs.\n- [ ] A nightly reconciliation job heals missed webhooks for subscriptions and entitlements.\n",
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
