import type { Pattern } from "../types.js";

export const nodeTsApiHono: Pattern = {
  "slug": "node-ts-api-hono",
  "version": "1.0.0",
  "name": "Node + TypeScript API (Hono)",
  "tagline": "Build type-safe Hono APIs with chained routes, schema validation, and a typed RPC client.",
  "description": "An opinionated baseline for shipping Hono APIs on Node 22 with end-to-end type safety. It covers route chaining for RPC inference, Standard Schema validation at the edge of every handler, centralized error handling with HTTPException, and the conventions that keep the client and server in sync.",
  "category": "Backend",
  "icon": "server",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Node + TypeScript API (Hono) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for Node + TypeScript APIs on Hono: chained routes for RPC, Standard Schema validation, HTTPException error handling, and a typed RPC client, tuned for AI coding agents.",
  "problem": "AI agents writing Hono APIs break RPC type inference, scatter validation, and return inconsistent error shapes.",
  "audience": "Backend teams building type-safe Hono APIs on Node or the edge",
  "prevents": [
    "Mounting sub-apps on separate lines so the RPC client infers responses as unknown",
    "Reading untrusted req.json() or query params without a schema validator",
    "Returning ad-hoc error objects instead of a consistent HTTPException shape"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/src/routes",
      "/src/index.ts"
    ],
    "stacks": [
      "node",
      "typescript",
      "hono",
      "edge"
    ],
    "packages": [
      "hono",
      "@hono/zod-validator",
      "@hono/standard-validator",
      "@hono/node-server",
      "zod"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Chain routes and export AppType for RPC",
      "summary": "Always chain .get/.post/.route calls and export typeof the chained app so the RPC client infers types.",
      "body": "The Hono RPC client only sees routes that are part of a single chained expression. Break the chain and `hc<AppType>` resolves responses to `unknown`.\n\n- Define handlers by chaining directly off `new Hono()` (for example `const app = new Hono().get(...).post(...)`); do not assign `app` then call `app.get(...)` on later lines.\n- Mount sub-apps inline with `.route('/books', books)` inside the same chain, never as a standalone `app.route(...)` statement.\n- Export the route tree as a type with `export type AppType = typeof routes` and import it where you build the client.\n- Skip Rails-style controller files; write handlers right after the path so path-param and validator types infer. If you must split, use `factory.createHandlers()`.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Validate every input and centralize errors",
      "summary": "Guard each handler with a Standard Schema validator and route all failures through app.onError with HTTPException.",
      "body": "Untyped `c.req.json()` and raw query params are untrusted input. Every handler reads validated data, and every failure returns one consistent shape.\n\n- Validate `json`, `query`, `param`, `form`, and `header` targets with `zValidator` or the multi-library `sValidator` (`@hono/standard-validator`), then read with `c.req.valid('json')`.\n- Return a 400 with a structured body from the validator hook on `!result.success`; do not let invalid data reach business logic.\n- Throw `HTTPException` for expected failures (`new HTTPException(404, { message })`) instead of returning ad-hoc error objects.\n- Register a single `app.onError((err, c) => ...)` that serializes `HTTPException` via `err.getResponse()` and maps everything else to a 500 without leaking stack traces.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Hono baseline: versions, runtime, and app wiring",
      "summary": "Pinned stack and the canonical app/server bootstrap for Hono on Node 22.",
      "body": "This API runs Hono v4 (4.12.x line) on Node 22 LTS with TypeScript 5.4+, which the route-param type inference depends on.\n\n- Serve on Node with `@hono/node-server`'s `serve({ fetch: app.fetch, port })`; the same `app` deploys unchanged to Workers, Deno, or Bun because Hono targets Web Standards.\n- Keep `src/index.ts` thin: create the root app, attach global middleware (`logger`, `cors`, `secureHeaders`), mount feature routers via chained `.route()`, then `export default app` plus `export type AppType`.\n- Use `c.json()`, `c.text()`, and typed `c.var`/context variables instead of mutating Node req/res directly.\n- Order middleware deliberately: auth and validation run before handlers; `onError` and `notFound` are registered once on the root app."
    },
    {
      "kind": "memory",
      "nodePath": "/src/client",
      "title": "Typed RPC client usage",
      "summary": "How to consume the server's AppType with hc and avoid the unknown-response trap.",
      "body": "The frontend and internal callers talk to the API through Hono's RPC client, which derives request and response types straight from `AppType` with no codegen step.\n\n- Build the client with `import { hc } from 'hono/client'` and `const client = hc<AppType>(baseUrl)`; types come from the exported server type, so import it as `import type { AppType }`.\n- Call endpoints as method chains, for example `await client.books[':id'].$get({ param: { id } })`, then `await res.json()` is fully typed from the handler's `c.json()` return.\n- If responses come back as `unknown`, the cause is almost always a server route mounted outside the chain, not a client bug; fix the chaining on the server.\n- For large apps, compile the client type once with `hc<AppType>` and re-export it to cut editor type-checking cost (`hcWithType` pattern)."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "node-ts-api-hono-review",
      "summary": "Pre-merge checklist for Hono API changes: RPC type safety, validation, errors, and runtime.",
      "body": "---\nname: node-ts-api-hono-review\ndescription: Review checklist for Node + TypeScript Hono API changes. Run before merging any route, validator, or client change to keep RPC types, validation, and error handling consistent.\n---\n\n# Node + TypeScript API (Hono) review\n\n- [ ] Routes are defined as a single chained expression (`new Hono().get(...).post(...)`), not reassigned line by line.\n- [ ] Sub-apps are mounted inline with `.route()` inside the chain, and `export type AppType = typeof routes` is present.\n- [ ] Every handler reads input via `c.req.valid(...)` behind a `zValidator`/`sValidator`, never raw `c.req.json()` or query params.\n- [ ] Validator failure paths return a structured 400; no invalid data reaches business logic.\n- [ ] Expected failures throw `HTTPException`; a single `app.onError` serializes errors and hides stack traces on 500.\n- [ ] Global middleware (`logger`, `cors`, `secureHeaders`) and `notFound` are registered once on the root app in the right order.\n- [ ] Pinned to Hono v4 on Node 22 LTS with TypeScript 5.4+; Node entry uses `@hono/node-server` `serve()`.\n- [ ] RPC client uses `hc<AppType>` with `import type`, and responses type-check (no `unknown` leaks).\n",
      "skillTags": [
        "hono",
        "typescript",
        "node",
        "rpc",
        "validation",
        "api-review"
      ]
    }
  ]
};
