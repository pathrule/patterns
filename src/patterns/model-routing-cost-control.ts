import type { Pattern } from "../types.js";

export const modelRoutingCostControl: Pattern = {
  "slug": "model-routing-cost-control",
  "version": "1.0.0",
  "name": "Model Routing and Cost Control",
  "tagline": "Route AI work by capability, risk, latency, reliability, and budget with observable fallbacks.",
  "description": "Model routing and cost control require a policy layer because model names, capabilities, availability, latency, and prices change independently from product intent. This bundle keeps a capability registry, route budgets, retry and fallback rules, quality gates, and per-request cost evidence. Unlike AI SDK, it decides which model or provider should serve a task rather than teaching a particular generation API.",
  "category": "AI",
  "icon": "brain-cog",
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
  "metaTitle": "Model routing cost control for AI agents",
  "metaDescription": "Capability-based model routes, per-task budgets, bounded retries, safe fallbacks, quality gates, and cost telemetry for multi-provider AI systems.",
  "problem": "Agents hard-code one model name, retry expensive failures blindly, or fall back to a cheaper model whose capabilities and safety behavior do not satisfy the task.",
  "audience": "Teams operating production AI workloads across several models, providers, regions, or service tiers",
  "prevents": [
    "Model identifiers and prices scattered through product code",
    "Fallbacks that change tool, schema, or safety capabilities silently",
    "Retries and long contexts that exceed a task's cost budget"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai/providers",
      "/src/ai",
      "/src/observability"
    ],
    "stacks": [
      "llm",
      "model-routing",
      "cost-control",
      "multi-provider"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai",
      "title": "Route from a task policy, never a raw model name",
      "summary": "Product code requests a named task class with capability, data, latency, quality, and budget requirements.",
      "body": "Product code requests a named task class with capability, data, latency, quality, and budget requirements. Direct provider and model strings couple business behavior to a changing catalog and let callers bypass routing safeguards. Enforce this boundary in /src/ai so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Define task classes such as extraction, classification, chat, coding, or high-risk review with explicit required capabilities.\n- Resolve the route in one service using environment, tenant, region, data handling, and current health signals.\n- Reject a request when no candidate satisfies mandatory requirements instead of silently relaxing them.\n- Return the selected route and policy version in internal telemetry without exposing sensitive configuration to clients.\n\nVerification: Attempt each task with a missing capability, forbidden data region, exhausted budget, and healthy candidate; confirm only policy-compliant routes are selected.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ai",
      "title": "Bound retries and fallbacks by one request budget",
      "summary": "All attempts share a deadline, token allowance, monetary ceiling, and side-effect identity.",
      "body": "All attempts share a deadline, token allowance, monetary ceiling, and side-effect identity. Independent provider retries can multiply latency and cost, while a late fallback may repeat tools or return after the caller abandoned the work. Enforce this boundary in /src/ai so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Allocate attempt count, input and output token ceilings, time, and cost before the first call.\n- Deduct every failed and successful attempt from the same budget, including cached or speculative work.\n- Retry only failures classified as transient and stop when the remaining budget cannot complete a useful attempt.\n- Propagate cancellation and one idempotency identity through model calls, tools, storage, and streaming.\n\nVerification: Inject timeouts, rate limits, partial streams, and provider errors at every attempt; verify total time, tokens, cost, and side effects never exceed the route budget.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ai/providers",
      "title": "Fallbacks must preserve mandatory behavior",
      "summary": "A fallback is eligible only when it supports the task's required schema, tools, modalities, context, safety, and data controls.",
      "body": "A fallback is eligible only when it supports the task's required schema, tools, modalities, context, safety, and data controls. A nominally available model can produce a response that the application cannot parse, authorize, or legally process. Enforce this boundary in /src/ai/providers so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Maintain explicit capability declarations for every candidate rather than inferring from model-family names.\n- Run compatibility fixtures for structured outputs, tool calls, streaming events, and refusal handling before enabling a route.\n- Separate quality downgrade from emergency availability and require product approval for user-visible behavior changes.\n- Disable a candidate automatically when health or compatibility signals cross the route's policy threshold.\n\nVerification: Remove each required capability in a test candidate and confirm routing skips it; simulate degradation and verify the intended circuit and recovery behavior.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/providers",
      "title": "The capability registry is an observed contract",
      "summary": "Provider documentation describes support, but production routing also depends on the exact account, region, endpoint, model, and integration behavior.",
      "body": "Provider documentation describes support, but production routing also depends on the exact account, region, endpoint, model, and integration behavior. Store declared capabilities beside results from recurring compatibility probes and route from the intersection.\n\nTrack schema subsets, tool semantics, event types, context limits, modalities, data handling, and known incompatibilities. Version registry changes and make route decisions reproducible from the policy and observation snapshot. Quarantine a capability when probes disagree with the declaration until a human reviews the difference. Keep the decision explicit at /src/ai/providers; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /tests/ai for probes and /src/ai for task policy. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/observability",
      "title": "Cost belongs to the product operation",
      "summary": "Provider invoices aggregate usage too late to explain which feature, tenant, route, retry, or prompt caused spend.",
      "body": "Provider invoices aggregate usage too late to explain which feature, tenant, route, retry, or prompt caused spend. Emit usage for every attempt against a stable product operation and route decision.\n\nCapture provider, model, task class, policy version, cache result, input, output, reasoning where reported, latency, finish state, and normalized cost. Attribute shared context and retry cost consistently so product metrics do not hide expensive failure paths. Keep raw prompts and personal content out of routine cost telemetry. Keep the decision explicit at /src/observability; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/ai for budget enforcement and the routing review skill for decisions. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-model-routes",
      "summary": "Review model routes against capability probes, quality evidence, reliability, latency, data policy, and cost.",
      "body": "---\nname: review-model-routes\ndescription: Review model routes against capability probes, quality evidence, reliability, latency, data policy, and cost.\n---\n\n# Review Model Routes\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Inventory task classes, mandatory capabilities, candidate order, budgets, retry classes, fallback behavior, and product owners.\n2. Run current compatibility and quality fixtures on every candidate using representative context sizes, schemas, tools, and refusal cases.\n3. Compare observed latency, error rate, quality, and normalized cost by task and retry path; investigate missing or incomparable usage data.\n4. Change one policy variable at a time, roll out by cohort, watch quality and budget guardrails, and preserve the previous policy for immediate rollback.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "llm",
        "model-routing",
        "cost-control",
        "review"
      ]
    }
  ]
};
