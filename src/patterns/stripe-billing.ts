import type { Pattern } from "../types.js";

export const stripeBilling: Pattern = {
  slug: "stripe-billing",
  version: "1.0.0",
  name: "Stripe Billing",
  tagline:
    "Safe Stripe integration: verified webhooks, idempotent handlers, and the right API for the job.",
  description:
    "Rules, memories, and a review skill for adding Stripe billing to a product. Pre-scoped to your Stripe API routes and serverless functions so your AI assistant verifies webhook signatures, keeps handlers idempotent, and picks the correct payment API.",
  category: "Billing",
  icon: "credit-card",
  color: "text-violet-600 dark:text-violet-400",
  installs: 0,
  updatedAt: "2026-06-09",
  changelog: [{ version: "1.0.0", date: "2026-06-09", note: "First release." }],
  metaTitle: "Stripe billing patterns for AI coding agents",
  metaDescription:
    "A ready-to-use Pathrule pattern for Stripe: webhook signature verification, idempotent handlers, Checkout vs PaymentIntents guidance, and a billing review skill.",
  appliesTo: {
    paths: ["/api/stripe", "/app/api/stripe", "/supabase/functions"],
    stacks: ["stripe"],
    packages: ["stripe"],
  },
  pieces: [
    {
      kind: "rule",
      nodePath: "/api/stripe",
      title: "Always verify webhook signatures",
      summary: "Reject any webhook whose Stripe signature does not verify.",
      body: "Verify the `Stripe-Signature` header with the endpoint secret, using the raw request body, before trusting any field.\n\n- Never act on an unverified event.\n- Read the webhook secret from server config, not from the request.\n- Return `400` on verification failure.",
      scopeType: "folder",
      priority: "high",
      enforcement: "strict",
    },
    {
      kind: "rule",
      nodePath: "/api/stripe",
      title: "Webhook handlers must be idempotent",
      summary: "The same event can arrive more than once; handle it safely.",
      body: "Stripe delivers at least once, so the same event can arrive more than once.\n\n- Record processed event IDs and skip duplicates, or make the side effect idempotent (upsert by a stable key).\n- Do slow work outside the request and return `2xx` quickly so Stripe does not retry a successful delivery.",
      scopeType: "folder",
      priority: "high",
      enforcement: "advisory",
    },
    {
      kind: "memory",
      nodePath: "/api/stripe",
      title: "Checkout Sessions vs PaymentIntents",
      summary: "Default to Checkout; reach for PaymentIntents for custom flows.",
      body: "Default to Stripe Checkout; reach for PaymentIntents only for fully custom flows.\n\n- Checkout handles SCA, tax, and the payment UI for subscriptions and standard one-time payments.\n- Use PaymentIntents with the Payment Element when you need a custom in-app flow.\n- Drive entitlements from webhook events, not the client redirect result.",
    },
    {
      kind: "memory",
      nodePath: "/supabase/functions",
      title: "Stripe secret handling",
      summary: "Secret key and webhook secret live in server env, never the client.",
      body: "Secret key and webhook signing secret live in server-side env only.\n\n- Only the publishable key is client-safe.\n- In edge or serverless functions, verify the caller and the webhook signature before any billing action.",
    },
    {
      kind: "skill",
      nodePath: "/",
      title: "stripe-integration-review",
      summary: "Checklist for reviewing a Stripe billing change.",
      body: "---\nname: stripe-integration-review\ndescription: Review a Stripe billing change for security and correctness.\n---\n\n# Stripe integration review\n\n- [ ] Webhook signature verified against the raw body before any logic\n- [ ] Handler is idempotent (dedupe by event ID or idempotent side effect)\n- [ ] Entitlements are driven by webhook events, not the client redirect\n- [ ] Secret key and webhook secret are server-side only\n- [ ] Correct API chosen (Checkout for standard, PaymentIntents for custom)\n- [ ] Amounts and currency handled in minor units, no float math\n- [ ] Handler returns 2xx fast and offloads slow work\n",
      skillTags: ["stripe", "billing", "security", "review"],
    },
  ],
};
