import type { Pattern } from "../types.js";

export const refundsChargebacksDisputes: Pattern = {
  "slug": "refunds-chargebacks-disputes",
  "version": "1.0.0",
  "name": "Refunds, Chargebacks, and Disputes",
  "tagline": "Model every payment reversal as an auditable state transition with deadlines, evidence, and ledger impact.",
  "description": "Refunds and disputes reverse value through different actors, timelines, and evidence requirements. This bundle preserves the original charge, separates requested and confirmed refunds, models dispute deadlines and evidence, posts compensating ledger entries, and keeps customer access decisions explicit. Unlike Dunning and Churn Recovery, it governs post-payment reversals and claims rather than failed recurring collection.",
  "category": "Billing",
  "icon": "undo-2",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Refund and dispute operations pattern for agents",
  "metaDescription": "Idempotent refund intents, dispute deadlines and evidence, immutable reversal postings, access policy, webhook reconciliation, and case review controls.",
  "problem": "Agents mark an order refunded before money moves, overwrite the original charge, miss dispute deadlines, or revoke access inconsistently across partial and contested reversals.",
  "audience": "Payments, support, risk, and finance teams handling refunds, chargebacks, inquiries, and payment disputes",
  "prevents": [
    "Duplicate refunds after timeout or support retries",
    "Dispute evidence submitted late or without a reproducible case file",
    "Ledger and customer access state disagreeing with provider outcomes"
  ],
  "appliesTo": {
    "paths": [
      "/src/payments/refunds",
      "/src/payments/disputes",
      "/src/ledger",
      "/ops/risk"
    ],
    "stacks": [
      "payments",
      "refunds",
      "disputes",
      "chargebacks"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/payments/refunds",
      "title": "Create one refund intent before calling the provider",
      "summary": "A refund begins as an idempotent internal intent with amount, currency, allocation, reason, and actor before external mutation.",
      "body": "A refund API response can time out after the processor accepted the request, and support may retry from another screen. Create one internal refund intent first with a stable operation key, original charge, amount, currency, affected items, reason, actor, and expected allocation. Reuse that intent until the provider outcome is known.\n\n- Validate cumulative confirmed and pending refunds against the refundable amount in the original currency.\n- Send the stable idempotency key on every provider retry and resolve ambiguity by provider lookup.\n- Distinguish requested, submitted, pending, succeeded, failed, canceled, and reversed states instead of setting refunded immediately.\n- Authorize partial and full refunds through explicit policy and preserve the original charge unchanged.\n\nVerification: Inject timeouts before and after provider acceptance, race two agents, and attempt overlapping partial refunds; confirm at most one external mutation per intent.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments/disputes",
      "title": "Dispute cases preserve deadlines and evidence provenance",
      "summary": "Every dispute records the provider deadline, current stage, claim reason, evidence sources, submission receipt, and accountable owner.",
      "body": "A dispute is a time-bounded case, not a boolean on a payment. Capture each provider event, deadline, reason code, contested amount, currency, liability, and current stage in an append-only case timeline. Evidence must be traceable to its source and reviewed for relevance, accuracy, privacy, and provider limits before submission.\n\n- Assign an owner and escalation clock as soon as a dispute or inquiry becomes actionable.\n- Store hashes or immutable references for submitted documents and the exact field set accepted by the provider.\n- Never fabricate, backdate, or alter customer communications to improve a case.\n- Record whether the case was accepted, lost, won, withdrawn, or moved to another stage and retain the provider receipt.\n\nVerification: Simulate duplicate events, an updated deadline, partial evidence failure, and a late case; confirm the timeline, alerting, and submission record remain coherent.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ledger",
      "title": "Post reversals without rewriting the original payment",
      "summary": "Refunds, dispute withdrawals, fees, wins, and losses create linked compensating entries in the original transaction currency.",
      "body": "The original charge remains historical truth even when value later moves back. Post a linked set of immutable entries for refund principal, non-returned fees, dispute withdrawal, dispute fee, provisional credit, reversal, win, or loss as the provider lifecycle requires. Keep provider effective time separate from the business decision time.\n\n- Balance each posting set per currency and store the original payment, refund, dispute, and balance movement references.\n- Represent partial outcomes explicitly instead of replacing a payment status or netting unrelated cases.\n- Use actual settlement conversion evidence for cross-currency bank effects while retaining the original transaction currency.\n- Reconcile every provider balance movement to exactly one recognized internal intent or classified exception.\n\nVerification: Replay a partial refund, a lost dispute, a won dispute with fee treatment, and a reversed refund; confirm the original payment is unchanged and totals reconcile.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/payments/disputes",
      "title": "Money reversal and product access are separate decisions",
      "summary": "A refund or dispute changes financial state, while access follows a documented fulfillment, fraud, service, and legal policy.",
      "body": "Do not let a provider status directly delete user data or revoke product access. A full refund may end a future service, a partial refund may not change access, an inquiry may require only monitoring, and a dispute may trigger a temporary risk hold while evidence is reviewed. Define these outcomes by product type, fulfillment state, fraud signal, contractual terms, and applicable policy.\n\nStore the policy version and reason behind every access transition, make the action reversible where possible, and preserve customer data under retention rules rather than destructive shortcuts. Notify the customer through approved language when required and separate support visibility from sensitive risk notes. See /src/ledger for financial postings and /ops/risk for case handling evidence."
    },
    {
      "kind": "memory",
      "nodePath": "/src/payments/refunds",
      "title": "Refund reason taxonomy drives reporting and controls",
      "summary": "Customer-facing explanations, internal root causes, fraud signals, and accounting treatment use separate controlled reason fields.",
      "body": "One free-form refund reason cannot serve the customer, support, product, risk, and finance at the same time. Keep a controlled internal reason code, optional subreason, customer-visible explanation, actor note, affected items, and evidence reference as separate fields. Version the taxonomy so historical reporting does not change when labels are reorganized.\n\nUse reason codes to route approval thresholds, fraud review, supplier recovery, product defect follow-up, and accounting treatment, but never let a code alone authorize money movement. Restrict sensitive risk notes from customer-facing exports and analytics with broad access. Review high use of generic or other codes as a data-quality failure. See /ops/risk for dispute evidence handling and /src/ledger for financial classification."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/risk",
      "title": "Dispute state is a timeline, not the latest webhook label",
      "summary": "Inquiry, warning, formal dispute, evidence review, provider decision, appeal, and financial settlement can progress on different clocks.",
      "body": "The latest provider label may omit earlier deadlines, provisional withdrawals, reopened stages, appeal rights, or final settlement timing. Preserve every state transition and provider event with effective time, received time, evidence deadline, actionability, financial effect, and source id. Derive the current case view from that timeline without deleting superseded facts.\n\nKeep operational status separate from ledger settlement: a case can be won while a fee remains, or decided before money returns. Alert from the authoritative deadline and require explicit acknowledgment, ownership transfer, and escalation. Map provider-specific reason and stage values to an internal model while retaining the raw value. See /src/payments/disputes for submission evidence and /src/ledger for money effects."
    },
    {
      "kind": "skill",
      "nodePath": "/ops/risk",
      "title": "prepare-dispute-evidence",
      "summary": "Build a truthful, minimal, deadline-aware dispute case from retained order, identity, delivery, and communication evidence.",
      "body": "---\nname: prepare-dispute-evidence\ndescription: Build a truthful and deadline-aware payment dispute evidence package from retained records.\n---\n\n# Prepare Dispute Evidence\n\n1. Confirm provider case id, reason, stage, contested amount, currency, response deadline, owner, and the exact evidence fields allowed.\n2. Assemble only relevant records from the original order, payment authorization, customer identity checks, terms acceptance, delivery or usage, refund policy, and communications.\n3. Verify timestamps, identities, document provenance, completeness, and privacy; remove unrelated personal or secret data.\n4. Write a concise case narrative that connects each claim to attached evidence without inventing intent or altering source material.\n5. Submit before the internal cutoff, retain the exact payload and provider receipt, and schedule outcome follow-up.\n\nIf evidence is missing or contradictory, record that limitation and escalate. Never create retrospective evidence to fill a gap.",
      "skillTags": [
        "disputes",
        "payments",
        "risk",
        "evidence"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/src/payments/refunds",
      "title": "audit-refund-controls",
      "summary": "Review refund authorization, idempotency, cumulative limits, provider reconciliation, access effects, and ledger postings.",
      "body": "---\nname: audit-refund-controls\ndescription: Review refund authorization, idempotency, limits, reconciliation, and downstream effects.\n---\n\n# Audit Refund Controls\n\n1. Trace full and partial refunds from support or API request through authorization, internal intent, provider call, webhook confirmation, customer notice, access policy, and ledger posting.\n2. Test duplicate clicks, concurrent agents, network timeouts, provider retry, stale order state, currency mismatch, and cumulative over-refund attempts.\n3. Compare internal refund records with provider refunds and balance movements, then classify every missing, duplicate, failed, reversed, or amount-different case.\n4. Sample approved refunds for actor, reason, evidence, policy version, item allocation, and immutable audit history.\n5. Record control failures, affected period and amount, remediation owner, and proof from a clean rerun.\n\nA green audit requires explainable money movement, not merely matching order labels.",
      "skillTags": [
        "refunds",
        "payments",
        "audit",
        "ledger"
      ]
    }
  ]
};
