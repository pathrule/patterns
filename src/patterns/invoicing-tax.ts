import type { Pattern } from "../types.js";

export const invoicingTax: Pattern = {
  "slug": "invoicing-tax",
  "version": "1.0.0",
  "name": "Invoicing and Tax",
  "tagline": "Keep invoice facts immutable, tax evidence traceable, and corrections auditable across providers.",
  "description": "Invoicing and tax systems turn mutable product and customer data into financial evidence that must remain explainable after prices, addresses, rates, and providers change. This bundle snapshots invoice facts, separates calculation from presentation, controls finalization and corrections, and reconciles provider events. Unlike Stripe Billing, it is provider-independent and owns invoice and tax evidence rather than checkout integration.",
  "category": "Billing",
  "icon": "receipt-text",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Invoicing and tax pattern for AI agents",
  "metaDescription": "Immutable invoice snapshots, tax evidence, explicit finalization, credit-note corrections, numbering controls, and provider reconciliation for billing teams.",
  "problem": "Agents render invoices from live product and address records, recompute historical tax, or edit finalized documents, destroying the evidence needed for customers and finance.",
  "audience": "Teams issuing invoices, calculating transaction tax, and reconciling provider billing records",
  "prevents": [
    "Historical invoices changing after product or customer edits",
    "Tax decisions with no retained location and calculation evidence",
    "Finalized documents edited instead of corrected through linked records"
  ],
  "appliesTo": {
    "paths": [
      "/src/billing/invoices",
      "/src/tax",
      "/src/webhooks"
    ],
    "stacks": [
      "invoicing",
      "tax",
      "billing",
      "accounting"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/billing/invoices",
      "title": "Snapshot every fact printed on an invoice",
      "summary": "Final invoice lines preserve description, quantity, unit amount, currency, tax treatment, parties, and address evidence.",
      "body": "Final invoice lines preserve description, quantity, unit amount, currency, tax treatment, parties, and address evidence. Rendering from live catalog or customer records rewrites history when a name, price, tax identifier, or address changes. Enforce this boundary in /src/billing/invoices so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Create immutable invoice-line and party snapshots when the invoice is finalized, not when a PDF is later requested.\n- Store monetary values as integers in the currency's minor unit and preserve the currency with every amount.\n- Retain the tax calculation inputs, jurisdiction result, exemption or reverse-charge evidence, and provider calculation identifier.\n- Generate all human and machine exports from the same finalized snapshot.\n\nVerification: Change the live product, customer address, and tax configuration after finalization; confirm the invoice and its regenerated exports remain byte-for-byte equivalent where format permits.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/billing/invoices",
      "title": "Correct finalized invoices with linked documents",
      "summary": "A finalized invoice is never mutated; credits, voids, and replacement documents preserve the original audit chain.",
      "body": "A finalized invoice is never mutated; credits, voids, and replacement documents preserve the original audit chain. In-place edits make ledger totals, customer copies, provider records, and tax reports disagree with no durable explanation. Enforce this boundary in /src/billing/invoices so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Restrict mutable drafts and make finalization an explicit, idempotent transition with authorization and audit evidence.\n- Represent reductions with a credit note or equivalent linked document and preserve reason, amount, currency, and affected lines.\n- Use a replacement document only through the jurisdiction and provider flow the business has approved.\n- Keep document numbering unique and allocated by one transactional service, including retries and concurrent finalization.\n\nVerification: Race two finalization requests and retry a correction event; confirm one number is allocated, one immutable original remains, and ledger totals reconcile.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/tax",
      "title": "Tax calculation consumes evidence, not guesses",
      "summary": "A billing country or card country alone may not represent the location evidence, registration, exemption, or product tax category required for a transaction.",
      "body": "A billing country or card country alone may not represent the location evidence, registration, exemption, or product tax category required for a transaction. Define the evidence fields the tax engine receives and the precedence used when sources disagree.\n\nKeep product tax codes separate from marketing categories and version changes prospectively. Record why tax was charged, not charged, or reverse charged with the transaction snapshot. Send uncertain or conflicting evidence to an explicit review or collection path instead of silently selecting a favorable result. Keep the decision explicit at /src/tax; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/billing/invoices for immutable snapshots and /src/webhooks for provider reconciliation. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "reconcile-invoices",
      "summary": "Reconcile internal invoices, provider documents, payments, credits, and tax totals for a closed period.",
      "body": "---\nname: reconcile-invoices\ndescription: Reconcile internal invoices, provider documents, payments, credits, and tax totals for a closed period.\n---\n\n# Reconcile Invoices\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Freeze the period input set and export internal invoices, provider invoices, payments, refunds, credits, voids, and tax summaries using stable identifiers.\n2. Match documents by internal and provider IDs, then compare currency, subtotal, discount, tax, total, paid, credited, and outstanding amounts.\n3. Classify mismatches as timing, duplicate event, missing event, configuration, rounding, or manual provider change; never force a balancing row without cause.\n4. Resolve or accrue every difference, record evidence and owner, and rerun until the reconciliation is reproducible from the same input set.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "invoicing",
        "tax",
        "billing",
        "reconciliation"
      ]
    }
  ]
};
