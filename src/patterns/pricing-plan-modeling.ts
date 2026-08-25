import type { Pattern } from "../types.js";

export const pricingPlanModeling: Pattern = {
  "slug": "pricing-plan-modeling",
  "version": "1.0.0",
  "name": "Pricing and Plan Modeling",
  "tagline": "Model products, prices, entitlements, and commercial terms without scattering plan-name checks.",
  "description": "Pricing and plan modeling separates what a customer buys, what it costs, and what the product enables so commercial changes do not become conditionals across the codebase. This bundle defines immutable price versions, stable entitlement keys, catalog migrations, and subscription snapshots. Unlike Subscriptions and Usage Billing, it owns the product catalog and commercial model rather than metering and recurring access processing.",
  "category": "Billing",
  "icon": "badge-dollar-sign",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Pricing plan modeling for AI coding agents",
  "metaDescription": "Versioned prices, stable entitlement keys, subscription snapshots, catalog migrations, and explicit commercial terms without scattered plan-name checks.",
  "problem": "Agents branch on labels such as pro or enterprise, mutate prices in place, and conflate billing intervals with product capabilities, making every pricing change risky.",
  "audience": "SaaS teams evolving plans, prices, packaging, trials, add-ons, and customer-specific terms",
  "prevents": [
    "Plan-name conditionals spread through application code",
    "Existing subscriptions changing when a catalog price is edited",
    "Billing interval, price, and entitlement concepts collapsed into one field"
  ],
  "appliesTo": {
    "paths": [
      "/src/billing/catalog",
      "/src/entitlements",
      "/migrations"
    ],
    "stacks": [
      "pricing",
      "plans",
      "entitlements",
      "saas"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/billing/catalog",
      "title": "Never mutate a price already used by a subscription",
      "summary": "Commercial changes create a new immutable price version with an explicit migration policy.",
      "body": "Commercial changes create a new immutable price version with an explicit migration policy. Editing amount, currency, interval, included quantity, or tax behavior in place silently changes the meaning of historical and active subscriptions. Enforce this boundary in /src/billing/catalog so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Give products and entitlements stable internal keys while treating display names as editable presentation.\n- Create a new price identifier for any monetary or billing-term change and record its effective window.\n- Keep legacy prices resolvable for invoices, credits, reporting, and subscriptions that have not migrated.\n- Require a migration decision for existing customers: grandfather, opt in, scheduled move, or contract-specific handling.\n\nVerification: Create an active subscription, publish a replacement price, and confirm the original invoice path and entitlement snapshot do not change until the chosen migration runs.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/entitlements",
      "title": "Entitlements are not plan names",
      "summary": "A plan is a commercial package, while an entitlement is a stable product capability with limits and conditions.",
      "body": "A plan is a commercial package, while an entitlement is a stable product capability with limits and conditions. Resolve a subscription or contract into entitlement keys at one boundary and let product code ask for capabilities such as projects.create or exports.monthly_limit.\n\nKeep marketing labels, provider price IDs, and billing intervals out of authorization checks. Represent quantitative limits and feature access separately so an add-on can alter one without cloning a plan. Version entitlement mappings and preserve the resolved snapshot used for each access period. Keep the decision explicit at /src/entitlements; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/billing/catalog for commercial versions and the subscription billing pattern for access state. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/billing/catalog",
      "title": "Products, prices, and terms have separate identities",
      "summary": "The thing sold, the amount and cadence charged, and the contractual conditions change on different timelines and serve different consumers.",
      "body": "The thing sold, the amount and cadence charged, and the contractual conditions change on different timelines and serve different consumers. Model a product as the durable offer, a price as an immutable charge definition, and terms as eligibility, commitment, trial, renewal, or negotiated conditions.\n\nAllow several prices to reference one product without implying identical entitlement mappings. Keep provider IDs as adapters around internal catalog IDs so a provider migration does not rewrite product logic. Snapshot the accepted commercial terms when an order or subscription begins. Keep the decision explicit at /src/billing/catalog; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /migrations for catalog transitions and /src/entitlements for capability resolution. That related boundary consumes this decision and carries the evidence that proves it still holds."
    }
  ]
};
