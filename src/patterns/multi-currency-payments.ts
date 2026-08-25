import type { Pattern } from "../types.js";

export const multiCurrencyPayments: Pattern = {
  "slug": "multi-currency-payments",
  "version": "1.0.0",
  "name": "Multi-Currency Payments",
  "tagline": "Keep presentment, settlement, ledger, and reporting currencies explicit through every money movement.",
  "description": "Multi-currency payment systems fail when one amount is reused for pricing, customer display, processor settlement, and accounting. This bundle makes every amount currency-qualified, snapshots quoted exchange rates, preserves actual settlement evidence, isolates rounding, and reconciles gains and losses. Unlike Pricing and Plan Modeling, it governs currency conversion and money movement rather than subscription packaging or entitlement structure.",
  "category": "Billing",
  "icon": "coins",
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
  "metaTitle": "Multi-currency payment pattern for AI agents",
  "metaDescription": "Currency-qualified amounts, minor-unit rules, immutable FX quotes, actual settlement rates, refund policy, rounding controls, and gain-loss reconciliation.",
  "problem": "Agents store bare decimals, apply today's exchange rate to historical events, or compare presentment amounts directly with settlement deposits and invent unexplained differences.",
  "audience": "Payments and finance teams charging, refunding, settling, and reporting in more than one currency",
  "prevents": [
    "Interpreting the same integer under two different currencies",
    "Recomputing historical conversions with a current rate",
    "Hiding processor conversion and rounding differences in revenue"
  ],
  "appliesTo": {
    "paths": [
      "/src/money",
      "/src/payments",
      "/src/ledger"
    ],
    "stacks": [
      "payments",
      "currency",
      "fx",
      "ledger"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/money",
      "title": "Every amount carries its currency and unit contract",
      "summary": "Money values are integer minor units or explicit decimal quantities paired with an ISO currency and defined rounding rule.",
      "body": "A bare number is not money. Represent every amount with its currency and a documented unit contract, and never infer currency from account, locale, route, or a neighboring field. Currency exponents differ and some operations require provider-specific constraints, so one universal divide-by-100 helper is unsafe.\n\n- Centralize currency metadata, accepted precision, formatting, comparison, allocation, and rounding behavior.\n- Reject arithmetic, equality, aggregation, or persistence that mixes currencies without an explicit conversion operation.\n- Parse machine amounts independently from localized display strings and never round through binary floating point.\n- Allocate remainders deterministically and retain which line received each smallest unit.\n\nVerification: Test zero-decimal and multi-decimal currencies, negative adjustments, large values, allocations, and cross-currency misuse; confirm invalid arithmetic cannot compile or execute.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Snapshot quoted FX and preserve actual settlement FX",
      "summary": "Customer quotes and processor settlements keep separate rates, sources, timestamps, currencies, fees, and converted amounts.",
      "body": "A customer-facing quote and the processor's eventual settlement conversion answer different questions. Snapshot the quote rate, source, timestamp, expiration, base and quote currencies, input amount, output amount, spread, and rounding before confirmation. Later, preserve the provider balance movement that contains the actual settlement amount and exchange rate.\n\n- Never recreate a past quote or settlement using the latest market rate.\n- Define whether checkout guarantees a quoted amount, accepts movement, or charges directly in presentment currency.\n- Keep refund currency and conversion policy explicit, including who bears rate movement and fees.\n- Make retries reuse the accepted quote or fail clearly after expiration instead of silently repricing.\n\nVerification: Delay capture past quote expiry, settle at another rate, partially refund, and retry the request; confirm the customer promise and actual money movement remain separately explainable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ledger",
      "title": "Presentment, settlement, and functional currency stay distinct",
      "summary": "The customer pays in presentment currency, the provider moves settlement currency, and accounting may report in a third functional currency.",
      "body": "Name the currency role of every amount. Presentment currency defines what the customer authorized, settlement currency defines what reaches the processor or bank account, and functional or reporting currency defines how finance measures the event. These values may match, but the data model cannot rely on that coincidence.\n\nPost the original currency amount and its conversion evidence together, then recognize realized and unrealized differences under the approved accounting policy. Keep processor conversion fees separate from exchange gains or losses. Aggregate only after conversion at the required event date and rate source. See /src/payments for actual provider settlement evidence and /src/money for unit and rounding rules."
    },
    {
      "kind": "memory",
      "nodePath": "/src/money",
      "title": "Rounding belongs to named business boundaries",
      "summary": "Conversion, tax, discount, line allocation, invoice total, and ledger posting each use an explicit rounding mode and stage.",
      "body": "Rounding after every intermediate operation and rounding only at final display can produce different totals. Define the required precision, mode, and stage for price conversion, tax, discounts, prorations, line allocation, invoice totals, refunds, and ledger postings. Preserve the pre-rounded value or rational inputs where audit or later allocation needs them.\n\nDo not use formatting output as the source for subsequent arithmetic. When a total must equal the sum of displayed lines, allocate the remainder deterministically and record it. Treat a one-unit difference as explainable data, not permission for a floating tolerance everywhere. See /src/ledger for how rounding entries and exchange differences are classified."
    }
  ]
};
