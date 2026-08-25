import type { Pattern } from "../types.js";

export const b2bBillingNetTerms: Pattern = {
  "slug": "b2b-billing-net-terms",
  "version": "1.0.0",
  "name": "B2B Billing and Net Terms",
  "tagline": "Connect purchase orders, approvals, due dates, partial payments, and collections in one receivable flow.",
  "description": "B2B billing starts before an invoice and continues after it is sent. Customer-specific terms, purchase orders, approval evidence, credit limits, delivery, partial payment, and collections all affect what is collectible and when. This bundle models the receivable lifecycle and ownership across sales, billing, and finance. Unlike Invoicing and Tax, it governs commercial approval, net terms, and accounts receivable rather than invoice evidence and tax calculation.",
  "category": "Billing",
  "icon": "file-clock",
  "color": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "B2B net terms billing pattern for AI agents",
  "metaDescription": "Purchase-order controls, approved credit terms, explicit receivable states, partial payment allocation, aging ownership, collections, and close evidence.",
  "problem": "Agents send invoices from unapproved quotes, let customers choose their own due dates, apply partial payments arbitrarily, or treat overdue receivables as support notes.",
  "audience": "B2B SaaS, service, and finance teams offering invoicing, purchase-order workflows, and net payment terms",
  "prevents": [
    "Issuing credit terms without an approved customer limit and owner",
    "Losing purchase-order and acceptance evidence behind an invoice",
    "Partial payments and credits producing unexplained open balances"
  ],
  "appliesTo": {
    "paths": [
      "/src/billing/accounts-receivable",
      "/src/billing/invoices",
      "/ops/collections"
    ],
    "stacks": [
      "b2b",
      "invoicing",
      "accounts-receivable",
      "net-terms"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/billing/accounts-receivable",
      "title": "Net terms come from an approved credit decision",
      "summary": "Customer terms, credit limit, currency, legal entity, and approval owner are versioned before an invoice can use them.",
      "body": "Net terms extend credit and cannot be accepted from a request field or copied from the last invoice. Resolve them from an approved customer credit record that names the legal entity, billing currency, payment method, term days, credit limit, effective dates, approver, and any purchase-order requirement.\n\n- Check available credit using open receivables, unapplied cash, pending credits, and approved exceptions before finalization.\n- Snapshot the applied terms and approval reference on the invoice so later customer changes do not rewrite history.\n- Route limit overrides and term extensions through a named approval path with reason and expiration.\n- Block invoice issuance when the customer identity, legal entity, currency, or required purchase order does not match the approval.\n\nVerification: Change terms after drafting, exceed the limit concurrently, omit a required purchase order, and retry finalization; confirm only one approved snapshot becomes collectible.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/billing/accounts-receivable",
      "title": "Receivable state changes through posted documents and cash",
      "summary": "Invoices, payments, credits, write-offs, reversals, and disputes change open balance through immutable allocations.",
      "body": "An invoice is not paid because a user toggled a status. Derive receivable state from posted invoice amounts and explicit allocations of payments, credit notes, write-offs, reversals, and disputed amounts. Preserve each allocation with amount, currency, effective time, actor or import source, and linked document.\n\n- Support partial and overpayments without erasing the remaining or unapplied balance.\n- Define deterministic allocation order and require an explicit override when finance chooses another invoice or line.\n- Reverse an incorrect allocation with a linked compensating record rather than editing history.\n- Calculate open, partially paid, paid, overdue, disputed, written-off, and credit-balance states from the ledger evidence.\n\nVerification: Apply one payment across invoices, reverse it, add a partial credit, receive an overpayment, and dispute one amount; confirm every open balance is reproducible.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing/invoices",
      "title": "The invoice carries the approved commercial chain",
      "summary": "A B2B invoice links the accepted quote or order, purchase order, delivery evidence, legal parties, billing contact, and applied terms.",
      "body": "A collectible B2B invoice must be explainable to the buyer's accounts-payable process. Link the accepted quote or contract, internal order, customer purchase order and remaining amount, delivery or acceptance evidence, billing legal entities, remittance instructions, billing contact, tax evidence, and the approved credit-term snapshot.\n\nValidate purchase-order number format, currency, entity, line limits, and expiration before consuming it, and track cumulative use across invoices. Keep buyer portal and email delivery receipts without treating delivery as acceptance unless the contract says so. See /src/billing/accounts-receivable for the open-balance model and the Invoicing and Tax pattern for immutable document correction."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/collections",
      "title": "Collections is a staged ownership workflow",
      "summary": "Aging buckets trigger documented actions, owners, promises, disputes, holds, and escalation rather than untracked reminders.",
      "body": "Define aging from the contractual due date and business calendar, not from the latest support message. Each aging band names the action, communication channel, owner, internal escalation, account hold policy, and evidence required before moving forward. A promise to pay, billing dispute, incorrect invoice, or missing purchase order is a case state with an amount and follow-up date, not free-form text.\n\nKeep customer communications approved and consistent, record delivery, and separate disputed from undisputed balances. Coordinate service restrictions with contract and account policy rather than automatically disabling every overdue customer. See /src/billing/accounts-receivable for authoritative allocations and balances."
    },
    {
      "kind": "skill",
      "nodePath": "/ops/collections",
      "title": "review-b2b-receivables",
      "summary": "Review a B2B receivables portfolio for evidence, allocation integrity, aging, disputes, promises, ownership, and credit exposure.",
      "body": "---\nname: review-b2b-receivables\ndescription: Review B2B receivables for allocation integrity, aging, disputes, ownership, and credit exposure.\n---\n\n# Review B2B Receivables\n\n1. Freeze the review date and reconcile invoice totals, payments, credits, reversals, write-offs, disputes, and unapplied cash to the receivable ledger.\n2. Inspect aging by customer, legal entity, currency, due date, credit limit, and owner; separate disputed and promised amounts from ordinary overdue balances.\n3. Sample invoices for approved terms, purchase order, acceptance evidence, delivery, contact, and immutable allocation history.\n4. Review limit overrides, term extensions, write-offs, service holds, and manual allocations for approver, reason, amount, and expiration.\n5. Assign every material exception an owner and date, record portfolio totals, and rerun after corrections.\n\nA successful review leaves no unexplained open balance and no overdue case without an accountable next action.",
      "skillTags": [
        "b2b",
        "receivables",
        "collections",
        "billing"
      ]
    }
  ]
};
