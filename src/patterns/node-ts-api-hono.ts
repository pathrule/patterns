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
      "summary": "Define routes as one chained expression and export typeof the chained app so the RPC client infers types instead of unknown.",
      "body": "The Hono RPC client only sees routes that belong to a single chained expression. Break the chain and `hc<AppType>` resolves responses to `unknown`.\n\n- Define handlers by chaining directly off `new Hono()`, for example `const routes = new Hono().get(...).post(...)`. Do not assign `app` and then call `app.get(...)` on later statements; reassigned, line-by-line definitions are not captured by `typeof`.\n- Mount sub-apps inline inside the same chain with `.route('/books', books)`, never as a standalone `app.route(...)` statement after the chain.\n- Export the route tree as a type at the top level: `export type AppType = typeof routes`. Import it with `import type { AppType }` on the client side.\n- Set `\"strict\": true` in the tsconfig of both the server and any client package. Hono RPC type inference depends on strict mode; without it inference silently degrades.\n- If you must split handlers out of the chain, use `factory.createHandlers()` from `hono/factory` so path-param and validator types still infer. Do not write Rails-style controller files that take a bare `Context`."
    },
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Validate every handler input with a schema validator",
      "summary": "Guard each handler with zValidator or sValidator and read only via c.req.valid(); never touch raw c.req.json() or query params.",
      "body": "Untyped `c.req.json()` and raw query params are untrusted input and also produce no request types for the RPC client. Every handler reads validated data.\n\n- Validate the relevant targets (`json`, `query`, `param`, `form`, `header`, `cookie`) with `zValidator` from `@hono/zod-validator`, or `sValidator` from `@hono/standard-validator` when the team wants library-agnostic schemas (Zod, Valibot, or ArkType via Standard Schema).\n- Read validated data only with `c.req.valid('json')` (and the matching target). Do not call `c.req.json()` / `c.req.query()` directly in a handler that has a validator.\n- Place the validator middleware before the handler in the chain so its types flow into both `c.req.valid()` and the inferred RPC request type.\n- Supply the third hook argument to return a structured failure before business logic runs: `zValidator('json', schema, (result, c) => { if (!result.success) return c.json({ error: result.error }, 400) })`. Returning the error from the hook with an explicit status keeps the 400 in the RPC response union.\n- Note `@hono/zod-validator` 0.8.x supports Zod 3 and 4 (`zod ^3.25.0 || ^4.0.0`); pin one Zod major across the workspace to avoid duplicate-instance validation errors.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Centralize errors through onError and HTTPException",
      "summary": "Throw HTTPException for expected failures and serialize everything through a single root app.onError; never return ad-hoc error objects.",
      "body": "Every failure returns one consistent shape, registered once on the root app.\n\n- Throw `HTTPException` from `hono/http-exception` for expected failures, e.g. `throw new HTTPException(404, { message: 'Not found' })`. Do not scatter ad-hoc `c.json({ error }, 4xx)` shapes across handlers for control-flow errors.\n- Register exactly one `app.onError((err, c) => ...)` on the root app. For an `HTTPException`, return `err.getResponse()`; for anything else, return a generic 500 and do not leak `err.stack` or internal messages to the client.\n- Register `app.notFound(...)` once on the root app as well. Inside a handler, avoid `c.notFound()` when the route is consumed by the RPC client, because it makes the client response type `unknown` (see the RPC footguns memory).\n- Keep `onError` and `notFound` as the last wiring on the root app, after global middleware and after all routes are mounted.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Hono baseline: versions, runtime, and app wiring",
      "summary": "Pinned stack and the canonical app/server bootstrap for Hono on Node 22.",
      "body": "This API runs Hono v4 (4.12.x line, latest as of mid-2026) on Node 22 LTS with TypeScript 5.4+. The route-param and RPC type inference depends on TS 5.4+ const type parameters, so do not downgrade TypeScript.\n\n- Serve on Node with `@hono/node-server`'s `serve({ fetch: app.fetch, port })`. The same `app` deploys unchanged to Cloudflare Workers, Deno, or Bun because Hono targets Web Standards; keep handlers free of Node-only globals.\n- Keep `src/index.ts` thin: create the root app, attach global middleware (`logger`, `cors`, `secureHeaders`), mount feature routers via chained `.route()`, register `onError` + `notFound`, then `export default app` and `export type AppType`.\n- Return responses with `c.json()` / `c.text()` and read request-scoped state via typed `c.var` / `c.set()` context variables; never mutate Node req/res directly.\n- Order middleware deliberately: `logger` and `cors` outermost, then auth, then per-route validators, then the handler. Middleware runs top to bottom on the way in.\n\nSee /src/client for typed RPC client usage and /src for the RPC unknown-response footguns to avoid."
    },
    {
      "kind": "memory",
      "nodePath": "/src/client",
      "title": "Typed RPC client usage",
      "summary": "How to consume the server's AppType with hc and the InferRequestType/InferResponseType helpers.",
      "body": "The frontend and internal callers talk to the API through Hono's RPC client, which derives request and response types straight from `AppType` with no codegen step.\n\n- Build the client with `import { hc } from 'hono/client'` and `const client = hc<AppType>(baseUrl)`. Import the server type as `import type { AppType }` so it is erased at build time.\n- Call endpoints as method chains, for example `await client.books[':id'].$get({ param: { id } })`. The result of `await res.json()` is typed from the handler's `c.json()` return value and is a union across the handler's status codes.\n- Use `InferRequestType<typeof client.books[':id'].$get>` and `InferResponseType<...>` to lift the request/response shapes into shared types (form state, react-query keys, etc.) without re-declaring them.\n- Narrow on `res.status` (or `res.ok`) before reading the body when a handler returns multiple status codes; each branch is independently typed.\n\nSee /src for the RPC unknown-response footguns memory if responses come back as `unknown`."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "RPC unknown-response footguns and fixes",
      "summary": "Why hc responses degrade to unknown and the concrete fixes: chaining, c.json status codes, ApplyGlobalResponse, monorepo type-compile.",
      "body": "When the RPC client types resolve to `unknown`, it is almost always a server-side or build-config issue, not a client bug. The recurring causes, in rough order of frequency:\n\n- Route defined outside the chain: any `app.get(...)` written as a separate statement is invisible to `typeof routes`. Fold it back into the single chained expression.\n- `c.notFound()` inside a handler: it makes that route's response type `unknown` for the client. Return `c.json({ error: 'not found' }, 404)` with an explicit status instead, or augment `interface NotFoundResponse extends TypedResponse<...>` via module augmentation if you must keep `c.notFound()`.\n- Global error types are not auto-included: responses produced by `app.onError()` (and global middleware) are not inferred into the client by default. Merge them with the `ApplyGlobalResponse` type helper so the client union also carries the 500 shape, e.g. `type AppType = ApplyGlobalResponse<typeof app, { 500: { json: { error: string } } }>`.\n- Monorepo / turborepo regression: in workspace setups consuming the server as a package, Hono v4.11+ has shown the imported app type collapsing to `unknown` where v4.10.8 worked (honojs/hono#4638). Mitigations: ensure `\"strict\": true` in every package tsconfig, emit and consume proper `.d.ts` declarations across the workspace boundary, and prefer the compiled-client export below over importing the raw `typeof app` across packages.\n- IDE slowness on large apps: compile the client type once and re-export it rather than re-inferring per file: `export type Client = ReturnType<typeof hc<typeof app>>; export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<typeof app>(...args)`."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "node-ts-api-hono-review",
      "summary": "Pre-merge checklist for Hono API changes: RPC type safety, validation, errors, and runtime.",
      "body": "---\nname: node-ts-api-hono-review\ndescription: Review checklist for Node + TypeScript Hono API changes. Run before merging any route, validator, error-handler, or RPC client change to keep types, validation, and error shapes consistent.\n---\n\n# Node + TypeScript API (Hono) review\n\n- [ ] Routes are one chained expression (`new Hono().get(...).post(...)`), not reassigned line by line, and `export type AppType = typeof routes` is present.\n- [ ] Sub-apps are mounted inline with `.route()` inside the chain, not as a standalone statement.\n- [ ] `\"strict\": true` is set in the tsconfig of both server and any client package.\n- [ ] Every handler reads input via `c.req.valid(...)` behind a `zValidator` / `sValidator`; no raw `c.req.json()` or `c.req.query()` in validated handlers.\n- [ ] Validator failure path returns a structured 400 from the `(result, c)` hook; no invalid data reaches business logic.\n- [ ] Expected failures throw `HTTPException`; a single root `app.onError` returns `err.getResponse()` for HTTPException and a stack-free 500 otherwise.\n- [ ] No `c.notFound()` on RPC-consumed routes (use `c.json(..., 404)`); `notFound` and `onError` registered once on the root app after middleware and routes.\n- [ ] Global error/onError response types are exposed to the client via `ApplyGlobalResponse` if the client needs to narrow on them.\n- [ ] Pinned to Hono v4 (4.12.x) on Node 22 LTS with TypeScript 5.4+; Node entry uses `@hono/node-server` `serve({ fetch: app.fetch })`.\n- [ ] RPC client uses `hc<AppType>` with `import type`; responses type-check with no `unknown` leaks (check monorepo .d.ts emission if they appear).\n- [ ] One Zod major pinned workspace-wide; `@hono/zod-validator` 0.8.x supports Zod 3 and 4.\n",
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
