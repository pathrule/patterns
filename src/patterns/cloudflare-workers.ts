import type { Pattern } from "../types.js";

export const cloudflareWorkers: Pattern = {
  "slug": "cloudflare-workers",
  "version": "1.0.0",
  "name": "Cloudflare Workers",
  "tagline": "Write Workers that use bindings, respect the isolate model, and stay inside the CPU budget.",
  "description": "A Worker is not a small Node server. It runs in a V8 isolate with a CPU-time budget rather than a wall-clock one, it reaches storage and other services through bindings instead of network calls, and module scope is shared by every request that lands on the same isolate. Code written with server habits either fails to deploy, leaks state between requests, or silently exceeds its CPU allowance. This bundle covers bindings and generated types, the isolate rules, the storage decision between KV, D1, Durable Objects, and R2, and the wrangler configuration that keeps a project on the current runtime.",
  "category": "Infra",
  "icon": "globe",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Cloudflare Workers pattern for AI agents",
  "metaDescription": "Cloudflare Workers pattern for AI coding agents: use bindings instead of REST, generate Env types, respect isolate and CPU limits, and pick the right storage.",
  "problem": "AI agents write Workers like Node servers: REST calls to services that have bindings, hand-written Env interfaces, mutable module-scope state shared across requests, and whole responses buffered in memory.",
  "audience": "Teams building APIs and edge logic on Cloudflare Workers",
  "prevents": [
    "Calling a Cloudflare service over its REST API when a binding is available",
    "Hand-writing the Env interface so it drifts from the actual configuration",
    "Keeping request state in a module-scope variable that the next request reads",
    "Buffering a large response in memory instead of streaming it"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/"
    ],
    "stacks": [
      "cloudflare",
      "workers",
      "edge",
      "typescript",
      "serverless"
    ],
    "packages": [
      "wrangler",
      "@cloudflare/workers-types",
      "hono"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Reach every service through a binding, with generated types",
      "summary": "KV, R2, D1, Queues, Durable Objects, and other Workers are accessed through bindings on env, and the Env type is generated from the configuration.",
      "body": "A binding is an in-process reference to another resource: no network hop, no credential to manage, no signing. Calling the same resource over its public API is slower, costs more, and adds a secret you did not need.\n\n- Access resources as `env.MY_KV`, `env.MY_BUCKET`, `env.DB`, `env.MY_QUEUE`, and other Workers through service bindings. Use the REST API only for control-plane work that has no binding.\n- Never hand-write the `Env` interface. Generate it (`wrangler types`) from the configuration so a renamed or missing binding is a compile error rather than a runtime `undefined`.\n- Pass `env` explicitly through your code instead of reading a module-level copy. It is per-request state, and capturing it in module scope is how a preview binding ends up serving production traffic.\n- Keep secrets as secrets (`wrangler secret put`), read them from `env`, and never inline them in source or in the config file.\n- Test against real bindings with the Workers test pool, which runs tests inside the runtime rather than in Node, so KV, D1, and Durable Object behaviour is the actual behaviour.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Write for the isolate: no shared request state, stream, and stay inside CPU time",
      "summary": "Module scope is shared across requests, the limit is CPU time rather than wall clock, and post-response work goes through waitUntil.",
      "body": "Many requests share one isolate, and the runtime bills CPU time, not the time you spend waiting on I/O. Both facts change how code should be written.\n\n- Keep no mutable request state at module scope. Caching an immutable, non-user-specific value (a parsed config, a compiled regex) is fine; storing anything about the current user is a cross-request leak.\n- Waiting on `fetch`, KV, or D1 does not consume CPU budget, so parallel I/O is cheap: fire independent requests together with `Promise.all` rather than sequentially. What does consume the budget is computation, so avoid parsing or transforming large payloads in the Worker.\n- Stream bodies through rather than buffering: pass the response body along, or use `TransformStream` and `pipeTo`. Reading a large response into a string is how a Worker hits its memory ceiling.\n- Return the response first and do follow-up work in `ctx.waitUntil(...)` (analytics, cache writes, logging). Work started without `waitUntil` after the response may be cancelled.\n- Handle failure explicitly at the edge: a subrequest limit, a timeout, or a downstream error should produce a deliberate response, not an unhandled rejection.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Wrangler configuration keeps the runtime current",
      "summary": "New projects use wrangler.jsonc with an explicit compatibility_date, nodejs_compat where needed, per-environment overrides, and observability enabled.",
      "body": "The Worker's behaviour is pinned by its configuration, and stale settings are the most common cause of \"it works locally but not on deploy\".\n\n- Use `wrangler.jsonc` for new projects (some newer features are JSON-config only) and keep it in the repo as the source of truth for bindings, routes, and limits.\n- Set `compatibility_date` explicitly and move it forward deliberately when you have tested the change. It is the runtime's version pin, not a timestamp to ignore.\n- Enable `nodejs_compat` when your code or a dependency imports Node built-ins, and prefer web-standard APIs where you have the choice. A missing flag shows up as a module resolution failure at deploy.\n- Define environments for staging and production with their own bindings and routes, so a promotion is a deploy of the same code with different resources rather than an edited config.\n- Turn on observability and use `wrangler tail` while debugging. Structured logging plus a request id is what makes an edge deployment debuggable at all.\n\nSee /src for the binding and isolate rules this configuration exposes."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Choosing storage: KV, D1, Durable Objects, R2, Queues",
      "summary": "KV for read-heavy config with eventual consistency, D1 for relational data, Durable Objects for coordination and strong consistency, R2 for blobs, Queues for async work.",
      "body": "Each store has one job, and picking the wrong one is the most expensive mistake in a Workers architecture because it shapes the data model.\n\n- KV: read constantly, write rarely, and tolerate eventual consistency. Feature flags, configuration, session lookups. Do not use it as a counter or a write-heavy store; writes propagate globally and reads can be briefly stale.\n- D1: relational application data with SQL. Great for the long tail of app queries; treat it like a small database (index what you filter, keep queries narrow) and remember reads have regional characteristics.\n- Durable Objects: a single addressable instance that serialises access to its own state. This is the only way to get strong consistency and coordination (rate limiters, real-time rooms, per-entity locks, WebSocket hibernation).\n- R2: object storage for blobs, with no egress fee to Workers. Stream to and from it rather than loading objects into memory.\n- Queues for asynchronous work and buffering, and the Cache API (or cache headers) in front of expensive computed responses. If a value is expensive to compute and identical for many requests, cache it before reaching for a store.\n\nSee /src for the isolate rules and the redis-caching pattern for cache invalidation strategy."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "workers-deploy-review",
      "summary": "Pre-deploy checklist for a Cloudflare Worker: bindings, isolate safety, limits, storage choice, and configuration.",
      "body": "---\nname: workers-deploy-review\ndescription: Review checklist for Cloudflare Workers changes covering bindings and generated types, isolate safety, CPU and memory limits, storage selection, and wrangler configuration. Run before deploying.\n---\n\n# Workers deploy review\n\n## Bindings\n- [ ] Every Cloudflare resource is reached through a binding, not its REST API.\n- [ ] `Env` types are generated, not hand-written, and the build fails on a missing binding.\n- [ ] Secrets come from `env`; nothing sensitive is in source or config.\n- [ ] `env` is passed explicitly, never captured at module scope.\n\n## Isolate safety\n- [ ] No mutable module-scope state carries request or user data.\n- [ ] Independent I/O runs in parallel; nothing sequential without a reason.\n- [ ] Bodies are streamed, not buffered, for anything large.\n- [ ] Post-response work runs inside `ctx.waitUntil`.\n\n## Limits\n- [ ] Computation in the request path is bounded and cheap.\n- [ ] Script size is within limits after bundling; no accidental large dependency.\n- [ ] Subrequest and downstream failures produce a deliberate response.\n\n## Storage\n- [ ] The store matches the access pattern (KV read-heavy, D1 relational, Durable Object for consistency, R2 for blobs).\n- [ ] Nothing write-heavy or counter-like is in KV.\n- [ ] Expensive identical responses are cached.\n\n## Configuration\n- [ ] `wrangler.jsonc` in the repo, `compatibility_date` explicit and current.\n- [ ] `nodejs_compat` set if Node built-ins are used.\n- [ ] Staging and production environments have their own bindings and routes.\n- [ ] Observability enabled; logs carry a request id.\n",
      "skillTags": [
        "cloudflare",
        "workers",
        "edge",
        "deployment",
        "code-review"
      ]
    }
  ]
};
