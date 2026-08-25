import type { Pattern } from "../types.js";

export const marketplacePayouts: Pattern = {
  "slug": "marketplace-payouts",
  "version": "1.0.0",
  "name": "Marketplace Payments and Payouts",
  "tagline": "Keep charges, fees, seller balances, refunds, disputes, and payouts in one auditable ledger.",
  "description": "Marketplace payments and payouts create several financial obligations from one customer charge, while refunds, disputes, reserves, delayed fulfillment, and negative balances can change who is owed later. This bundle defines an internal double-entry ledger, connected-account onboarding, transfer timing, idempotent money movement, and reconciliation. Unlike Stripe Billing, it covers multi-party liability rather than a single merchant charging customers.",
  "category": "Billing",
  "icon": "hand-coins",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Marketplace payout pattern for AI agents",
  "metaDescription": "Double-entry seller balances, connected-account checks, idempotent transfers, refund and dispute allocation, reserves, and payout reconciliation.",
  "problem": "Agents treat a payment provider balance as the marketplace ledger, transfer too early, and discover during refunds or disputes that seller and platform liabilities were never modeled.",
  "audience": "Platforms collecting customer payments and distributing funds to sellers, contractors, or service providers",
  "prevents": [
    "Paying sellers from mutable order totals with no ledger",
    "Refunds and disputes debiting the wrong party or balance",
    "Duplicate transfers or payouts after request and event retries"
  ],
  "appliesTo": {
    "paths": [
      "/src/payments",
      "/src/ledger",
      "/src/webhooks"
    ],
    "stacks": [
      "marketplace",
      "payouts",
      "payments",
      "ledger"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ledger",
      "title": "Record every marketplace movement as balanced entries",
      "summary": "Charges, fees, seller obligations, transfers, refunds, disputes, reserves, and payouts post to an internal double-entry ledger.",
      "body": "Charges, fees, seller obligations, transfers, refunds, disputes, reserves, and payouts post to an internal double-entry ledger. Provider objects report external movement but cannot explain the platform's contractual allocation, pending obligations, or corrections across several parties. Enforce this boundary in /src/ledger so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Post immutable debit and credit entries with currency, party, order, provider reference, effective time, and idempotency key.\n- Separate pending, available, reserved, in-transit, paid, and negative balances instead of overwriting one seller total.\n- Create compensating entries for corrections; never edit or delete posted financial history.\n- Reject a posting set unless debits equal credits per currency and every external movement maps to an internal account.\n\nVerification: Replay the complete lifecycle from charge through split, fee, refund, dispute, reversal, and payout; confirm each posting balances and reproduces every party balance.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Do not transfer funds before the obligation is earned",
      "summary": "Transfer eligibility depends on fulfillment, refund risk, dispute exposure, reserves, and connected-account capability, not payment success alone.",
      "body": "Transfer eligibility depends on fulfillment, refund risk, dispute exposure, reserves, and connected-account capability, not payment success alone. Immediate transfer can leave the platform liable when service is canceled, a charge is disputed, or the seller cannot accept payouts. Enforce this boundary in /src/payments so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Model the event that earns seller funds and keep unearned amounts pending until that evidence arrives.\n- Check account onboarding, capability, sanctions or compliance status supplied by the provider before scheduling movement.\n- Apply reserve and delay policy consistently, with a documented reason and release event.\n- Pause transfers and payouts when the seller balance is negative or an unresolved risk hold exists.\n\nVerification: Exercise delayed fulfillment, cancellation, partial fulfillment, account restriction, refund, and dispute scenarios; confirm no ineligible amount becomes available.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Make every external money mutation idempotent",
      "summary": "Charges, transfers, reversals, refunds, and payouts use stable operation keys tied to one internal ledger intent.",
      "body": "Charges, transfers, reversals, refunds, and payouts use stable operation keys tied to one internal ledger intent. Network timeouts and webhook retries make it unsafe to decide whether money moved from the presence or absence of a response. Enforce this boundary in /src/payments so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Create the ledger intent first with a unique operation key, expected amount, currency, source, destination, and business reference.\n- Send the same idempotency key on provider retries and reconcile ambiguous responses by provider lookup.\n- Allow one worker to claim an intent and make concurrent workers observe its state rather than issuing another mutation.\n- Treat provider success as external evidence to post, not permission to invent a second internal transaction.\n\nVerification: Inject timeouts before and after the provider accepts each mutation, then retry concurrently; confirm one external object and one balanced posting set exist.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/payments",
      "title": "Charge type determines marketplace liability",
      "summary": "Direct, destination, and separate charge-and-transfer models place fees, refunds, disputes, negative balances, statements, and regional constraints on different parties.",
      "body": "Direct, destination, and separate charge-and-transfer models place fees, refunds, disputes, negative balances, statements, and regional constraints on different parties. Choose the provider charge model from the marketplace's legal and operational money flow before implementing endpoints.\n\nWrite who is merchant of record, who appears to the customer, who carries negative balances, and how multi-party splits work. Keep provider charge type behind an adapter while preserving its liability implications in ledger accounts and runbooks. Require finance and legal review before changing the flow for an existing region or seller cohort. Keep the decision explicit at /src/payments; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/ledger for internal obligations and /src/webhooks for provider evidence. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ledger",
      "title": "Refunds and disputes reverse allocations, not history",
      "summary": "A customer refund or dispute changes several liabilities and may require transfer reversal or reserve use, but it does not erase the original sale.",
      "body": "A customer refund or dispute changes several liabilities and may require transfer reversal or reserve use, but it does not erase the original sale. Post a new allocation that links to the original charge and identifies the customer, seller, platform fee, tax, reserve, and provider components affected.\n\nDefine partial allocation order and rounding per currency before taking money from a seller. Represent uncollectible seller amounts as an explicit receivable or platform loss according to policy. Keep dispute provisional and final outcomes distinct so won disputes restore the intended balances exactly once. Keep the decision explicit at /src/ledger; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/payments for provider mutations and the reconciliation skill for external matching. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "reconcile-marketplace-funds",
      "summary": "Reconcile marketplace ledger balances with provider charges, transfers, refunds, disputes, reserves, and payouts.",
      "body": "---\nname: reconcile-marketplace-funds\ndescription: Reconcile marketplace ledger balances with provider charges, transfers, refunds, disputes, reserves, and payouts.\n---\n\n# Reconcile Marketplace Funds\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Freeze a time window and export internal postings plus provider balance transactions using stable charge, transfer, reversal, refund, dispute, and payout identifiers.\n2. Match external movements to balanced posting sets by identifier, currency, amount, party, and effective time; isolate unmatched and many-to-one relationships.\n3. Recompute seller pending, available, reserved, in-transit, paid, and negative balances from entries and compare them with operational views.\n4. Classify and resolve timing, duplicate, missing-event, rounding, manual-provider, and configuration differences; rerun until the same inputs produce zero unexplained variance.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "marketplace",
        "payouts",
        "ledger",
        "reconciliation"
      ]
    }
  ]
};
