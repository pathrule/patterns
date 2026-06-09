import type { Pattern } from "../types.js";

export const nextjsAppRouter: Pattern = {
  "slug": "nextjs-app-router",
  "version": "1.0.0",
  "name": "Next.js App Router",
  "tagline": "Battle-tested conventions for a Next.js App Router codebase, scoped to the paths they belong to.",
  "description": "Rules, memories, and a review skill for teams building on the Next.js App Router. Each piece is pre-scoped so your AI assistant applies it only where it is relevant: server and client boundaries, caching, and secret safety in the app directory, plus a route review checklist at the root.",
  "category": "Framework",
  "icon": "layout-panel-left",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Next.js App Router patterns for AI coding agents",
  "metaDescription": "A ready-to-use Pathrule pattern for Next.js App Router projects: server-component defaults, caching policy, secret safety, and a route review skill, scoped to the right paths.",
  "problem": "App Router teams keep relitigating the same server/client and caching decisions, and AI assistants guess them differently every time.",
  "audience": "teams building product UI and routes on the Next.js App Router",
  "prevents": [
    "Marking everything 'use client' and shipping a mostly-client app",
    "Leaking server-only env or modules into the client bundle",
    "Uncached dynamic rendering with no documented reason"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/apps/web",
      "/src/app"
    ],
    "stacks": [
      "nextjs",
      "react"
    ],
    "packages": [
      "next"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Await params, searchParams, cookies, and headers",
      "summary": "In Next.js 16 these are async; accessing them synchronously throws.",
      "body": "In Next.js 16, `params` and `searchParams` props are Promises, and `cookies()`, `headers()`, and `draftMode()` return Promises. Synchronous access is removed and throws at runtime.\n\n- Mark the page/layout/handler `async` and `await` the value before use:\n  ```tsx\n  export default async function Page({ params }: { params: Promise<{ id: string }> }) {\n    const { id } = await params\n  }\n  ```\n- `await cookies()`, `await headers()`, `await draftMode()` in Server Components, Route Handlers, and Server Actions.\n- Type params/searchParams as `Promise<...>` so the compiler catches missing awaits.\n- The `npx @next/codemod@canary upgrade latest` codemod migrates most call sites; review the diffs it produces.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Server Components by default; push 'use client' to the leaves",
      "summary": "Add 'use client' only for interactivity, and keep the boundary as low as possible.",
      "body": "Components under `app` are Server Components by default. The most common App Router mistake is reaching for `'use client'` too early and shipping a mostly-client app.\n\n- Add `'use client'` only for components that use state, effects, refs, event handlers, or browser APIs.\n- Fetch data in Server Components and pass plain serializable props down; never fetch in client effects (it exposes data sources and adds waterfalls).\n- Push the client boundary as far down the tree as possible; a small interactive leaf should not force a whole page client-side.\n- Wrap async Server Components that fetch in `<Suspense>` placed ABOVE the async component, not inside it, so the rest of the page streams.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Never let server secrets cross the client boundary",
      "summary": "Only NEXT_PUBLIC_ vars reach the client; guard with server-only and the taint API.",
      "body": "Only `NEXT_PUBLIC_`-prefixed env vars are inlined into the client bundle. Everything else must stay server-side.\n\n- Never import a database client, secret-bearing config, or server utility from a `'use client'` file.\n- Add `import 'server-only'` to modules that must never run on the client so the build fails if a client module imports them.\n- Keep API keys and tokens in Server Components, Route Handlers, or Server Actions; pass only the specific fields the UI needs as props.\n- For sensitive objects, enable `taint` in `next.config` and use React `experimental_taintObjectReference` / `experimental_taintUniqueValue` as a defensive second layer. Treat it as defense in depth, not the only control: a clone of a tainted object is untainted.\n- Remember the RSC payload is sent to the browser: do not over-select rows/objects and pass them whole into Client Components.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Caching is opt-in via 'use cache'; never read request APIs inside it",
      "summary": "Next.js 16 renders dynamically by default; cache explicitly and keep request data out of cached scopes.",
      "body": "With `cacheComponents: true`, rendering is dynamic by default and caching is entirely opt-in via the `use cache` directive (the old implicit fetch cache, `experimental.ppr`, and `experimental.dynamicIO` are gone).\n\n- Add `'use cache'` at the file, component, or function level to cache its output; place it as close to the data fetch as possible, not blanket on the root layout.\n- Cached functions CANNOT call `cookies()`, `headers()`, or read `searchParams` directly. Read request values OUTSIDE the cached scope and pass them in as serializable arguments.\n- Do not pass Promises of uncached/request data into a `use cache` scope (via props, closure, or shared Maps). Doing so hangs the build with a 50s cache-fill timeout.\n- Arguments and return values must be serializable. No class instances, functions (except pass-through `children`/Server Actions), or `URL` instances as arguments.\n- Set lifetime with `cacheLife('hours')` and tag with `cacheTag('products')` inside the cached scope.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Cache Components caching and revalidation policy",
      "summary": "use cache + cacheLife + cacheTag, and the right invalidation API per use case.",
      "body": "How we cache and invalidate under Next.js 16 Cache Components.\n\n- Default to dynamic; opt specific routes/components/functions into caching with `'use cache'`. To prerender a full route, add `'use cache'` to BOTH `layout` and `page`.\n- Tag every cached fetch with `cacheTag(...)` so it can be invalidated precisely; set freshness with `cacheLife('hours' | 'days' | 'max' | custom)`.\n- Invalidation API by intent:\n  - `updateTag(tag)` in a Server Action when the user must see their own write immediately (read-your-writes: forms, settings).\n  - `revalidateTag(tag, 'max')` for background stale-while-revalidate of shared static content. The single-argument form is deprecated; always pass a cacheLife profile.\n  - `refresh()` in a Server Action to refresh UNCACHED data shown elsewhere (notification counts, live metrics) without touching the cache.\n- Start independent requests in parallel to avoid server-side waterfalls.\n\nSee /app rule 'Caching is opt-in via use cache' for the hard constraints (no request APIs inside cached scopes, serializable args, build-hang footgun)."
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Next.js 16 project conventions and migration notes",
      "summary": "proxy.ts, Turbopack, runtime, removed config, and gotchas specific to this repo's upgrade.",
      "body": "Project-wide Next.js 16 decisions and migration landmines.\n\n- Middleware lives in `proxy.ts` (export a `proxy` function), which runs on the Node.js runtime. `middleware.ts` still works for Edge cases but is deprecated.\n- Turbopack is the default bundler for dev and build. Only fall back with `next dev --webpack` / `next build --webpack` if a webpack-only plugin forces it.\n- Minimums: Node.js 20.9+, TypeScript 5.1+, React 19.2. Node 18 is unsupported.\n- Removed config to delete on sight: `experimental.ppr`, `experimental.dynamicIO` (renamed to `cacheComponents`), `serverRuntimeConfig`/`publicRuntimeConfig` (use env vars), AMP, `next lint` (use ESLint/Biome directly; `next build` no longer lints).\n- All parallel-route slots now require an explicit `default.js` or the build fails.\n- `images.domains` is deprecated; use `images.remotePatterns`. Local `next/image` src with query strings needs `images.localPatterns`.\n- For AI-assisted debugging, the Next.js DevTools MCP exposes routing/caching/render context and unified logs.\n\nSee /app for the server/client, secret-safety, async-request-API, and caching rules."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "nextjs-route-review",
      "summary": "Pre-merge checklist for a new App Router route or layout on Next.js 16.",
      "body": "---\nname: nextjs-route-review\ndescription: Review a new or changed Next.js 16 App Router route, layout, or handler for correctness, caching, and secret safety before merging.\n---\n\n# Next.js 16 route review\n\nRun before merging a new route, layout, or Route Handler.\n\n## Boundaries\n- [ ] `'use client'` is only on components that need interactivity, pushed to the leaves\n- [ ] Async Server Components that fetch are wrapped in `<Suspense>` placed ABOVE them\n- [ ] No data fetching inside client effects\n\n## Async request APIs\n- [ ] `params` and `searchParams` are typed as Promises and `await`ed\n- [ ] `cookies()`, `headers()`, `draftMode()` are `await`ed\n\n## Secret safety\n- [ ] No server-only module, DB client, or secret reachable from a `'use client'` file\n- [ ] Server-only modules import `server-only`\n- [ ] Only the specific fields the UI needs are passed as props (no whole rows/objects into Client Components)\n\n## Caching\n- [ ] Caching is intentional: `'use cache'` only where it should be, close to the data fetch\n- [ ] No `cookies()`/`headers()`/`searchParams` read inside a `use cache` scope; request values passed as serializable args\n- [ ] Cached fetches are tagged with `cacheTag` and have an explicit `cacheLife`\n- [ ] Mutations use `updateTag` (read-your-writes) or `revalidateTag(tag, profile)` (SWR) or `refresh()` (uncached data) appropriately\n\n## Files & metadata\n- [ ] `loading.tsx` and `error.tsx` exist where the route fetches data\n- [ ] `generateMetadata` or static metadata is exported for SEO\n- [ ] Each parallel-route slot has a `default.js`\n- [ ] Dynamic params are validated, not trusted blindly\n",
      "skillTags": [
        "nextjs",
        "review",
        "app-router"
      ]
    }
  ]
};
