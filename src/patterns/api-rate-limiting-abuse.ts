import type { Pattern } from "../types.js";

export const apiRateLimitingAbuse: Pattern = {
  "slug": "api-rate-limiting-abuse",
  "version": "1.0.0",
  "name": "API Rate Limiting and Abuse",
  "tagline": "Bound request frequency, concurrency, payload cost, and expensive business actions.",
  "description": "API rate limiting and abuse protection must bound more than requests per second because authenticated callers can still exhaust compute, storage, third-party spend, or scarce business actions. This bundle defines identity-aware budgets, workload limits, failure responses, and observable exceptions. Unlike REST API Design, it owns adversarial consumption and overload behavior rather than resource shapes and HTTP contracts.",
  "category": "Security",
  "icon": "shield-alert",
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
  "metaTitle": "API rate limiting pattern for AI agents",
  "metaDescription": "Identity-aware rate budgets, concurrency caps, Retry-After responses, and spend guards for APIs that must resist automated abuse and overload safely.",
  "problem": "Agents often add one IP counter and call an API protected, leaving authenticated abuse, expensive operations, queue growth, and third-party spend unbounded.",
  "audience": "Teams operating public or partner APIs with variable-cost work and abuse-sensitive business flows",
  "prevents": [
    "One global limit that lets attackers rotate identities or IPs",
    "Unbounded payload, pagination, concurrency, or downstream spend",
    "Retries that amplify overload because clients receive no backoff contract"
  ],
  "appliesTo": {
    "paths": [
      "/src/api",
      "/src/middleware"
    ],
    "stacks": [
      "api",
      "rate-limiting",
      "abuse-prevention",
      "http"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/middleware",
      "title": "Key limits to authenticated and network identities",
      "summary": "Rate budgets use both account and network signals instead of trusting a single mutable identifier.",
      "body": "Rate budgets use both account and network signals instead of trusting a single mutable identifier. A single IP key punishes shared networks and is trivial to evade, while an account-only key lets unauthenticated endpoints burn resources. Enforce this boundary in /src/middleware so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Key authenticated traffic by tenant or account and add a secondary network or device dimension for anomaly containment.\n- Keep login, recovery, signup, search, export, and write operations in separate buckets with policy names visible in code.\n- Never accept a caller-provided header as the authoritative identity unless a trusted proxy overwrites and authenticates it.\n- Return the same authorization-safe error shape whether the identity exists or not.\n\nVerification: Exercise shared NAT traffic, account rotation, missing proxy headers, and a valid burst; confirm each bucket isolates only the intended subject.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Bound work as well as request count",
      "summary": "Every endpoint caps the dimensions that drive CPU, memory, storage, queue depth, and vendor cost.",
      "body": "Every endpoint caps the dimensions that drive CPU, memory, storage, queue depth, and vendor cost. A cheap request counter does not stop oversized pages, batched queries, decompression bombs, repeated exports, or calls that trigger paid services. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Set explicit payload, page-size, batch, file, fan-out, and execution-time limits at the request boundary.\n- Charge weighted tokens for expensive operations instead of treating a cache hit and a full export as equal work.\n- Cap concurrent in-flight work per tenant and reject before enqueueing when its budget is exhausted.\n- Put hard spend or quota guards around SMS, email, model, map, and other metered downstream calls.\n\nVerification: Load-test the maximum accepted shape and one value beyond every bound; verify rejection happens before allocation, enqueue, or vendor invocation.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Make throttling responses safe to retry",
      "summary": "A rejected caller receives a stable status, bounded retry guidance, and no partial side effects.",
      "body": "A rejected caller receives a stable status, bounded retry guidance, and no partial side effects. Silent connection drops and arbitrary delays cause clients to retry in lockstep, while a late rejection can duplicate writes or paid work. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Use HTTP 429 for policy throttling and emit Retry-After only from a server-controlled calculation.\n- Add jitter to client guidance and cap wait values so corrupt policy data cannot freeze a client indefinitely.\n- Reserve capacity for health checks, control-plane work, and emergency operators instead of disabling the limiter during incidents.\n- Log the policy key and outcome without recording secrets, raw tokens, or unnecessary personal identifiers.\n\nVerification: Replay a throttled idempotent request after Retry-After and confirm no earlier side effect occurred; verify metrics distinguish rejected, delayed, and admitted work.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Rate policies follow business operations",
      "summary": "Limits attach to named business operations rather than whichever URL currently exposes them.",
      "body": "Limits attach to named business operations rather than whichever URL currently exposes them. Routes change, aliases coexist, and GraphQL or RPC calls multiplex many operations through one endpoint, so URL-only policies drift away from the actual cost and abuse surface.\n\nResolve a stable operation identifier after authentication and before work begins. Keep its budget, cost weight, concurrency cap, and exception owner in one reviewed policy table. Share the same operation key across REST, GraphQL, workers, and internal retries so a caller cannot switch transports to reset a budget. Keep the decision explicit at /src/api; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/middleware for identity keys and the API abuse pattern for response behavior. That related boundary consumes this decision and carries the evidence that proves it still holds."
    }
  ]
};
