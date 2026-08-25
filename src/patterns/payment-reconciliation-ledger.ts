import type { Pattern } from "../types.js";

export const paymentReconciliationLedger: Pattern = {
  "slug": "payment-reconciliation-ledger",
  "version": "1.0.0",
  "name": "Payment Reconciliation Ledger",
  "tagline": "Close the gap between internal orders, provider balances, bank payouts, fees, refunds, and disputes.",
  "description": "Payment reconciliation proves that internal commercial intent, processor money movement, and bank settlement describe the same economic activity. This bundle establishes immutable provider evidence, clearing accounts, deterministic matching, exception queues, and period close. Unlike Marketplace Payments and Payouts, it does not allocate seller obligations; it reconciles a merchant's own records across orders, processor balances, and bank deposits.",
  "category": "Billing",
  "icon": "chart-no-axes-combined",
  "color": "bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Payment reconciliation pattern for agents",
  "metaDescription": "Clearing accounts, immutable processor evidence, deterministic transaction matching, exception ownership, payout-to-bank proof, and reproducible close.",
  "problem": "Agents compare gross sales directly with bank deposits, ignore fees and settlement timing, or patch unexplained differences with balancing rows that destroy the audit trail.",
  "audience": "Finance and engineering teams reconciling application orders, payment processors, accounting ledgers, and bank payouts",
  "prevents": [
    "Treating a net bank payout as if it were one customer payment",
    "Silently deleting or force-matching unexplained differences",
    "Closing a period from mutable provider exports with no retained evidence"
  ],
  "appliesTo": {
    "paths": [
      "/src/payments",
      "/src/ledger/reconciliation",
      "/ops/finance"
    ],
    "stacks": [
      "payments",
      "ledger",
      "accounting",
      "reconciliation"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ledger/reconciliation",
      "title": "Post processor movements through clearing accounts",
      "summary": "Charges, fees, refunds, disputes, reserves, conversions, and payouts post separately before a bank deposit clears the balance.",
      "body": "A processor payout is a net settlement assembled from many balance movements, not a substitute for customer payment detail. Represent processor cash as one or more clearing accounts and post each charge, fee, refund, dispute, reserve, currency conversion, and payout movement separately using stable provider references.\n\n- Keep debit and credit entries immutable and balanced per currency, with effective and available dates retained.\n- Link application order ids, provider object ids, balance transaction ids, payout ids, and bank references without collapsing them.\n- Record corrections as compensating entries and never change a closed movement to make totals agree.\n- Clear the processor account only when the bank deposit and its exact payout composition are proven.\n\nVerification: Reconstruct a payout containing fees, refunds, a dispute, and transactions from several days; confirm ledger balances reach the bank amount without an unexplained plug.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ledger/reconciliation",
      "title": "Matching never hides an unresolved difference",
      "summary": "Automatic matches use explicit keys and tolerances, while ambiguous or unmatched items remain visible with an owner and reason.",
      "body": "Reconciliation is evidence, not a nearest-number search. Define deterministic match rules in priority order and record which rule matched each pair or group. An amount and date tolerance may help locate candidates, but it cannot silently decide between several plausible records or explain a currency, fee, or timing difference.\n\n- Prefer shared immutable ids, then documented composite keys with currency and expected lifecycle state.\n- Keep one-to-many and many-to-one matches explicit so a payout, partial capture, or grouped deposit remains traceable.\n- Route ambiguous, unmatched, duplicated, and amount-different items into named exception classes.\n- Require an owner, evidence, disposition, and aging status before an exception leaves the queue.\n\nVerification: Seed duplicates, partial captures, delayed refunds, two same-amount orders, and a missing fee; confirm only deterministic cases auto-match and every remainder stays reportable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/payments",
      "title": "Provider balance transactions are settlement evidence",
      "summary": "The processor's balance movement records explain actual money movement and exchange rates more reliably than mutable object summaries.",
      "body": "A charge or refund object describes a business operation, while the processor's balance transaction or equivalent settlement record explains how that operation affected the provider balance. Preserve both. The settlement record supplies fees, net amount, availability timing, payout association, and often the actual conversion applied.\n\nImport provider evidence incrementally with a stable cursor or time overlap, deduplicate by immutable id, and retain the raw source fields needed to reproduce derived postings. Never replace historical imports with a current object snapshot. Separate retrieval time from the provider's effective and available times so delayed records are assigned to the correct operational and accounting periods. See /src/ledger/reconciliation for matching and clearing policy."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/finance",
      "title": "Period close is a reproducible evidence set",
      "summary": "A closed reconciliation period records its source boundaries, imports, rules, exceptions, approvals, and resulting balances.",
      "body": "A dashboard that shows zero today is not proof of what was reconciled yesterday. For every close, preserve the processor report parameters or immutable export, bank statement boundary, application query boundary, importer version, matching-rule version, exchange-rate source, exception snapshot, approvals, and resulting account balances.\n\nDefine how late-arriving events enter a later period or trigger a controlled reopen. Keep materiality thresholds explicit without using them to erase differences. The close artifact should let another reviewer rerun the process from the same inputs and obtain the same matches and totals. See /src/payments for imported settlement evidence and /src/ledger/reconciliation for the deterministic match record."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ledger/reconciliation",
      "title": "Reconciliation completeness is measured at every import boundary",
      "summary": "Cursor progress alone does not prove that all processor records, report pages, payout details, or bank lines were imported.",
      "body": "A successful request or advanced cursor can still hide a skipped page, narrowed filter, changed account, delayed provider record, or partial report. Define completeness controls for each source: expected account and currency set, report or payout totals, first and last effective time, row count, pagination evidence, overlap window, and source identifier or hash.\n\nRun imports idempotently and compare source control totals with stored raw evidence before matching begins. Keep retrieval failures and late-arriving movements visible across period boundaries. If the provider offers both API objects and financial reports, document which source closes which gap rather than mixing them silently. See /src/payments for settlement evidence and /ops/finance for the frozen period close artifact."
    },
    {
      "kind": "skill",
      "nodePath": "/ops/finance",
      "title": "close-payment-reconciliation",
      "summary": "Run a processor-to-ledger-to-bank close with frozen inputs, classified exceptions, approvals, and reproducible totals.",
      "body": "---\nname: close-payment-reconciliation\ndescription: Run a processor-to-ledger-to-bank close with frozen evidence and classified exceptions.\n---\n\n# Close Payment Reconciliation\n\n1. Freeze the application, processor, ledger, and bank boundaries for the period, including timezone, currencies, and late-event policy.\n2. Import immutable provider balance movements and confirm completeness through report totals, pagination evidence, and last successful cursor overlap.\n3. Run deterministic matching, then reconcile processor clearing balances to payouts and payouts to bank deposits.\n4. Review every unmatched, ambiguous, duplicate, timing, currency, and amount exception; attach evidence, disposition, and owner.\n5. Record approvals, source hashes or export ids, rule versions, final balances, and the command needed to reproduce the close.\n\nDo not close by inserting a generic balancing entry. A remaining difference is either classified and approved under policy or the period stays open.",
      "skillTags": [
        "payments",
        "reconciliation",
        "accounting",
        "close"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/src/ledger/reconciliation",
      "title": "triage-reconciliation-break",
      "summary": "Locate the first boundary where application, provider, payout, ledger, and bank evidence stop agreeing.",
      "body": "---\nname: triage-reconciliation-break\ndescription: Locate the first boundary where payment evidence stops agreeing without hiding the difference.\n---\n\n# Triage Reconciliation Break\n\n1. Capture the exact account, currency, period, mismatch amount, report version, and latest successful close before changing data.\n2. Compare counts and sums at each boundary: order to payment object, payment object to balance movement, movement to payout, payout to bank, and postings to ledger.\n3. Check missing pages, cursor gaps, duplicate imports, timezone edges, delayed availability, conversion records, manual provider changes, and changed match rules.\n4. Reproduce the smallest mismatching group from raw evidence and identify the first incorrect or absent record.\n5. Repair through an idempotent import or compensating posting, document cause and prevention, then rerun the full bounded reconciliation.\n\nNever rewrite source evidence or broaden tolerances merely to make the report green.",
      "skillTags": [
        "payments",
        "ledger",
        "debugging",
        "reconciliation"
      ]
    }
  ]
};
