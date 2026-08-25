import type { Pattern } from "../types.js";

export const azureFunctions: Pattern = {
  "slug": "azure-functions",
  "version": "1.0.0",
  "name": "Azure Functions Production Patterns",
  "tagline": "Design Azure Functions around trigger semantics, bindings, idempotency, configuration, and scaling.",
  "description": "Azure Functions hides server management but not delivery semantics. Triggers can retry, bindings can obscure network and serialization work, instances scale independently, and one deployment package can contain functions with very different latency and resource profiles. This pattern constrains idempotent handlers and configuration access while recording trigger, binding, scaling, and deployment ownership decisions. It differs from AWS Lambda by focusing on Azure trigger and binding contracts, host-level configuration, function-app grouping, and the operational consequences of sharing one scaled host.",
  "category": "Infra",
  "icon": "cloud-sun",
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
  "metaTitle": "Azure Functions pattern for AI coding agents",
  "metaDescription": "Azure Functions triggers, bindings, idempotency, host configuration, scaling, retries, poison handling, and deployment-unit boundaries. In production.",
  "problem": "AI agents often assume a trigger runs once, hide important I/O behind bindings, share mutable process state across invocations, or group unrelated functions into one scaling and deployment unit.",
  "audience": "Teams operating HTTP, queue, event, timer, or integration workloads on Azure Functions",
  "prevents": [
    "Duplicating side effects when a trigger redelivers",
    "Losing failed messages without a poison or dead-letter path",
    "Sharing unsafe mutable state between concurrent invocations",
    "Scaling a latency-sensitive endpoint with a resource-heavy batch function"
  ],
  "appliesTo": {
    "paths": [
      "/src/functions",
      "/host.json",
      "/infra"
    ],
    "stacks": [
      "azure-functions",
      "serverless",
      "azure",
      "event-driven",
      "cloud"
    ],
    "packages": [
      "@azure/functions"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/functions",
      "title": "Make every triggered effect idempotent",
      "summary": "Derive a stable operation key from the source event and return the prior outcome when Azure retries or redelivers it.",
      "body": "Queue, event, timer, and HTTP infrastructure can repeat an invocation after timeout, lock loss, ambiguous acknowledgement, or client retry. Exactly-once business effects must be created above the trigger delivery guarantee.\n\n- Choose an event, message, schedule occurrence, or client idempotency identifier that remains stable across delivery attempts.\n- Persist the operation state with the business transition where possible and detect completed, in-progress, and retryable-failure outcomes explicitly.\n- Propagate the same identity to downstream queues, APIs, email, and payments rather than generating a new key at each hop.\n- Treat timeout after an external call as ambiguous and reconcile by operation key before retrying an effect that may already have committed.\n\nSee /infra for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/functions",
      "title": "Keep invocation state isolated and dependencies bounded",
      "summary": "Treat module-level objects as shared caches only when they are concurrency-safe, and pass invocation context through explicit services.",
      "body": "A warm function process can handle multiple invocations over time or concurrently depending on the host and language worker. Mutable globals can leak tenant or request state and unbounded clients can exhaust connections.\n\n- Keep actor, tenant, payload, and per-invocation decisions in local immutable values or an explicit context object.\n- Reuse expensive clients only when their libraries support concurrent use and their pools are bounded for the maximum host concurrency.\n- Do not cache authorization results, mutable configuration, or user data globally without a key, expiry, invalidation, and memory bound.\n- Ensure cancellation and timeout propagate to outbound calls so an invocation does not continue consuming dependencies after the host has abandoned its result.\n\nSee /host.json for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/host.json",
      "title": "Trigger settings are part of capacity and retry design",
      "summary": "Review batch size, concurrency, visibility or lock renewal, retries, and poison behavior with downstream capacity.",
      "body": "The host can deliver more concurrent work than the database or remote service can absorb. Defaults that look efficient on a queue can produce lock loss, retry storms, and connection exhaustion downstream.\n\n- Set concurrency and batch behavior from measured execution time, dependency pools, and the largest safe in-flight work count.\n- Keep processing time within the trigger's lock or visibility strategy and make renewal or timeout behavior observable.\n- Use bounded retries with a poison or dead-letter destination and preserve the original operation identity and failure reason.\n- Separate transient dependency failures from permanent validation or authorization failures so poison handling does not repeatedly attack an unrecoverable message.\n\nSee /src/functions for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/infra",
      "title": "A function app is a shared deployment and scaling boundary",
      "summary": "Group functions only when they can share configuration, runtime, network, scaling, and release cadence without harming one another.",
      "body": "Functions in one app share a host process and operational envelope. Combining an HTTP latency path, memory-heavy batch, and high-volume queue consumer can create noisy-neighbor behavior and coupled deployments.\n\n- Group by compatible runtime, permissions, network access, dependency footprint, scaling profile, and ownership rather than by a broad product name.\n- Split functions when one workload needs independent concurrency, memory, deployment timing, or secret access.\n- Keep host-level settings and extension configuration versioned with the deployment and test them in a representative environment.\n- Expose per-function and host-level latency, failure, retry, throttle, and dependency signals so shared-host contention is distinguishable from handler bugs.\n\nSee /host.json for the rule or workflow that puts this decision into practice."
    }
  ]
};
