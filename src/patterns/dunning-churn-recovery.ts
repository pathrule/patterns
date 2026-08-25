import type { Pattern } from "../types.js";

export const dunningChurnRecovery: Pattern = {
  "slug": "dunning-churn-recovery",
  "version": "1.0.0",
  "name": "Dunning and Churn Recovery",
  "tagline": "Recover failed payments with stateful retries, clear customer action, and safe access transitions.",
  "description": "Dunning and churn recovery is a stateful customer workflow, not a loop that charges every declined payment on the same schedule. This bundle separates recoverable and hard failures, consumes provider events idempotently, coordinates notifications and access, and measures recovery by cohort. Unlike Subscriptions and Usage Billing, it owns failed-payment recovery rather than metering and entitlement calculation.",
  "category": "Billing",
  "icon": "heart-handshake",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Dunning churn recovery for AI coding agents",
  "metaDescription": "Stateful payment retries, hard-decline handling, customer recovery links, idempotent events, access transitions, and cohort metrics for subscription teams.",
  "problem": "Agents retry every failure uniformly, send duplicate notices, revoke access from stale local state, or recover payment without restoring the customer lifecycle coherently.",
  "audience": "Subscription teams reducing involuntary churn after recurring payment failures",
  "prevents": [
    "Retrying hard declines without a new payment method",
    "Duplicate notices and state transitions from webhook retries",
    "Access revoked or restored from an out-of-order billing event"
  ],
  "appliesTo": {
    "paths": [
      "/src/billing/dunning",
      "/src/webhooks",
      "/src/jobs"
    ],
    "stacks": [
      "dunning",
      "revenue-recovery",
      "subscriptions",
      "webhooks"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/webhooks",
      "title": "Drive dunning from idempotent billing events",
      "summary": "Provider events advance a stored recovery state machine and duplicate or out-of-order delivery cannot repeat effects.",
      "body": "Provider events advance a stored recovery state machine and duplicate or out-of-order delivery cannot repeat effects. A webhook handler that sends mail, changes access, and schedules work directly will duplicate side effects and regress state when events retry or arrive late. Enforce this boundary in /src/webhooks so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Persist the provider event identifier and normalized invoice or subscription version before dispatching effects.\n- Compare the incoming provider state with the local transition table and ignore stale transitions while retaining them for audit.\n- Use stable idempotency keys for notices, retry jobs, access changes, and provider mutations.\n- Re-fetch authoritative billing state when event ordering is ambiguous instead of guessing from delivery time.\n\nVerification: Replay, reorder, and concurrently deliver failure, update, paid, and canceled events; confirm each state and side effect occurs exactly once.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing/dunning",
      "title": "Failure reason selects the recovery path",
      "summary": "A temporary issuer decline, expired credential, missing method, required customer action, and terminal account state do not benefit from the same retry cadence.",
      "body": "A temporary issuer decline, expired credential, missing method, required customer action, and terminal account state do not benefit from the same retry cadence. Normalize provider details into a small internal failure taxonomy without exposing sensitive payment data.\n\nUse automatic retries only for categories the provider and payment method can recover without new customer input. Send customers to a short-lived authenticated update or action flow when intervention is required. Stop futile retries and switch messaging when the provider marks a hard decline or no usable method exists. Keep the decision explicit at /src/billing/dunning; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/jobs for retry scheduling and /src/webhooks for authoritative state transitions. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "design-dunning-journey",
      "summary": "Design a failed-payment journey with retry, communication, access, and recovery states for each failure class.",
      "body": "---\nname: design-dunning-journey\ndescription: Design a failed-payment journey with retry, communication, access, and recovery states for each failure class.\n---\n\n# Design Dunning Journey\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Map provider invoice and subscription states into the product's recovery states, including temporary, action-required, hard-failure, recovered, and terminal outcomes.\n2. Choose retry ownership and cadence per payment method and failure class; never run an application scheduler on top of provider-managed retries unintentionally.\n3. Define notice timing, channel, authenticated recovery action, grace behavior, access changes, and support escalation for each transition.\n4. Test event reordering, duplicate delivery, customer update during retry, late payment, cancellation, and payment after access restriction.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "dunning",
        "billing",
        "customer-journey",
        "subscriptions"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/src/billing/dunning",
      "title": "audit-dunning-performance",
      "summary": "Audit recovery performance by failure reason, cohort, retry path, message, and customer outcome.",
      "body": "---\nname: audit-dunning-performance\ndescription: Audit recovery performance by failure reason, cohort, retry path, message, and customer outcome.\n---\n\n# Audit Dunning Performance\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Select a closed cohort and reconcile failed invoices, attempts, customer actions, payments, cancellations, credits, and access outcomes against provider records.\n2. Segment temporary versus hard failures, payment method, tenure, plan, geography where permitted, and the exact recovery journey received.\n3. Measure recovered revenue and customers without counting late duplicates, write-offs, or payments unrelated to the failed invoice.\n4. Identify harmful or futile steps, document an experiment with guardrails, and monitor complaints, opt-outs, and support load alongside recovery.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "dunning",
        "revenue-recovery",
        "analytics",
        "audit"
      ]
    }
  ]
};
