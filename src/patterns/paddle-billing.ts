import type { Pattern } from "../types.js";

export const paddleBilling: Pattern = {
  "slug": "paddle-billing",
  "version": "1.0.0",
  "name": "Paddle Billing",
  "tagline": "Treat Paddle transactions and webhooks as evidence while your application owns access state.",
  "description": "Paddle acts as Merchant of Record, but the application still owns the product access and operational state derived from its billing events. This bundle separates transactions, payments, and subscriptions, handles at-least-once and out-of-order webhook delivery, preserves proration intent, and reconciles local access against Paddle. Unlike Stripe Billing, it follows Paddle's transaction-centered lifecycle and hosted customer-management model.",
  "category": "Billing",
  "icon": "landmark",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Paddle billing lifecycle pattern for agents",
  "metaDescription": "Paddle transaction states, idempotent ordered webhooks, subscription proration, temporary portal links, access projection, and reconciliation controls.",
  "problem": "Agents grant access from a checkout return, assume Paddle events arrive once and in order, or collapse transactions, payments, and subscriptions into one mutable status.",
  "audience": "SaaS teams using Paddle for recurring billing, checkout, invoicing, and customer self-service",
  "prevents": [
    "Granting durable access from an unverified browser redirect",
    "Older webhook events overwriting a newer subscription state",
    "Caching temporary customer portal URLs as permanent links"
  ],
  "appliesTo": {
    "paths": [
      "/src/billing/paddle",
      "/src/webhooks/paddle",
      "/src/access"
    ],
    "stacks": [
      "paddle",
      "billing",
      "subscriptions",
      "webhooks"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/webhooks/paddle",
      "title": "Process Paddle webhooks idempotently and by occurrence time",
      "summary": "Every event is authenticated, deduplicated by event id, and applied only when it is newer than the local projection.",
      "body": "Paddle webhook delivery is at least once and related events can arrive out of order, so receipt order cannot define billing truth. Authenticate the raw request before parsing, persist the event id and occurred_at value, and make the projection update conditional on the incoming evidence being newer than the state already applied.\n\n- Acknowledge quickly after durable capture and move business processing to a retryable worker.\n- Deduplicate by Paddle event_id and keep successful replays as no-ops with an auditable receipt.\n- Compare occurred_at or a stronger entity version before changing subscription, transaction, or access state.\n- Quarantine unrecognized event shapes and repeated failures instead of returning success while dropping them.\n\nVerification: Deliver duplicates and reverse the order of paid, subscription-created, and completed events; confirm one durable receipt per event and the same final projection.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/access",
      "title": "Grant access from verified billing evidence",
      "summary": "Checkout redirects improve user experience, but only verified Paddle state can create or revoke durable product access.",
      "body": "A browser success page is user-controlled navigation, not durable payment evidence. Create access only from authenticated Paddle events or an explicit server-side Paddle lookup, then store the provider ids and evidence that caused each transition. Keep access projection separate from the raw billing objects so temporary delivery gaps do not erase history.\n\n- Map each price or product to an internal entitlement set through versioned configuration.\n- Record the Paddle customer, transaction, subscription, event, and occurrence time behind every access change.\n- Define grace, past-due, canceled, paused, and resumed behavior as explicit transitions rather than scattered status checks.\n- Make repeated grants and revocations idempotent and preserve the previous state for audit.\n\nVerification: Skip the return page, replay the webhook, delay subscription creation, and restore a paused subscription; confirm access converges from verified evidence alone.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/billing/paddle",
      "title": "State proration intent on every subscription item change",
      "summary": "A subscription item update names its proration billing mode and expected commercial effect before it reaches Paddle.",
      "body": "Changing Paddle subscription items can alter what is charged now, deferred, credited, or left unchanged. Never let a generic update helper choose that commercial decision implicitly. The application command must name the proration billing mode, expected effective time, actor, reason, and preview accepted by the customer or operator.\n\n- Validate that the requested price, quantity, currency, and billing interval are compatible before calling Paddle.\n- Present or log the previewed immediate charge, credit, and next recurring total before confirmation.\n- Use one idempotent internal change intent and reconcile ambiguous provider responses by subscription lookup.\n- Persist the requested and resulting item sets so support can explain a later invoice.\n\nVerification: Exercise upgrade, downgrade, quantity change, interval change, retry after timeout, and no-proration cases; confirm the result matches the named mode.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing/paddle",
      "title": "Transactions, payments, and subscriptions answer different questions",
      "summary": "A Paddle transaction is the commercial record, payments are collection attempts, and a subscription governs recurring lifecycle.",
      "body": "Do not compress Paddle transactions, payments, and subscriptions into a single local status. A transaction describes priced commercial items and its billing lifecycle, a payment describes an attempt to collect money for that transaction, and a subscription describes the recurring relationship that can produce later transactions. Financial records are preserved and post-billing changes are represented through adjustments rather than deletion.\n\nKeep the three provider identifiers on separate local records and link them to the same internal account and order context. Decide which object is authoritative for each question: transaction for the amount and completion evidence, payment for attempt diagnostics, and subscription for renewal or item state. See /src/access for the derived product-access projection and /src/webhooks/paddle for ordering rules."
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing/paddle",
      "title": "Customer management URLs are temporary capabilities",
      "summary": "Paddle management URLs are generated when needed and returned directly to an authorized user instead of stored as durable account data.",
      "body": "Paddle customer and subscription management URLs are temporary capabilities. Caching one in a user profile, database row, support note, or analytics event turns a short-lived delegated action into a stale or leaked link. Generate the appropriate URL on demand after authenticating the user and authorizing access to the internal account connected to the Paddle customer.\n\nReturn the link only through the requesting secure session, avoid logging the full value, and let expiration require a fresh request. Never accept a customer or subscription id from the client without resolving it through the server-owned account mapping. If a custom management action exists, keep the same authorization and audit boundary. See /src/access for ownership checks that precede link generation."
    },
    {
      "kind": "skill",
      "nodePath": "/src/billing/paddle",
      "title": "reconcile-paddle-access",
      "summary": "Compare Paddle customers, transactions, subscriptions, and adjustments with the local access projection and repair explainable drift.",
      "body": "---\nname: reconcile-paddle-access\ndescription: Compare Paddle billing records with the local access projection and repair explainable drift.\n---\n\n# Reconcile Paddle Access\n\n1. Select a bounded account or time window and export local Paddle ids, event receipts, subscription snapshots, transaction states, adjustments, and access transitions.\n2. Fetch the current Paddle customer, subscription, and relevant transactions; preserve raw evidence and retrieval time without overwriting prior snapshots.\n3. Classify differences as delayed delivery, out-of-order application, missing mapping, manual provider change, configuration drift, or unsupported state.\n4. Replay the smallest verified event or run an explicit idempotent repair command; never edit access without linking the provider evidence and reason.\n5. Re-run the comparison and record counts, unresolved cases, owner, and next review time.\n\nA successful run proves that the same provider facts produce the same local access state and that every repair can be explained from retained evidence.",
      "skillTags": [
        "paddle",
        "billing",
        "subscriptions",
        "reconciliation"
      ]
    }
  ]
};
