import type { Pattern } from "../types.js";

export const reactRouter: Pattern = {
  "slug": "react-router",
  "version": "1.0.0",
  "name": "React Router 7",
  "tagline": "Build full-stack React apps with framework mode loaders, actions, and generated route types.",
  "description": "React Router 7 merges Remix into a single multi-strategy router with a full framework mode for SSR, data loading, and mutations. This pattern keeps your data flow on loaders and actions, your routes type-safe through codegen, and your navigation fast with single-fetch and prefetching. It is tuned for the 7.17+ API surface and the framework-mode conventions teams ship in 2026.",
  "category": "Framework",
  "icon": "route",
  "color": "bg-pink-500/10 text-pink-600 dark:bg-pink-400/15 dark:text-pink-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "React Router 7 pattern for AI coding agents",
  "metaDescription": "Teach your AI agent React Router 7 framework mode: loaders, actions, generated route types, single-fetch, and prefetch. Rules, memories, and a review skill.",
  "problem": "Agents write React Router 7 like v6 SPAs, fetching in effects and ignoring loaders, actions, and generated route types.",
  "audience": "Teams building full-stack React apps on React Router 7 framework mode",
  "prevents": [
    "Fetching data in useEffect instead of route loaders",
    "Hand-typing route params and loaderData instead of using generated Route types",
    "Mutating data with fetch in event handlers instead of route actions"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/app/routes",
      "/src"
    ],
    "stacks": [
      "React",
      "React Router 7",
      "TypeScript",
      "Vite",
      "SSR"
    ],
    "packages": [
      "react-router",
      "@react-router/dev",
      "@react-router/node"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app/routes",
      "title": "Load and mutate through loaders and actions",
      "summary": "Route data comes from loaders; mutations go through actions submitted with Form or useFetcher, never useEffect or ad-hoc fetch.",
      "body": "In framework mode, route data and mutations live on the route module, not in component effects.\n\n- Read data with `loader` (server) or `clientLoader` (browser); never fetch route data in `useEffect`.\n- Mutate with `action` / `clientAction` submitted via `<Form method=\"post\">` or `useSubmit`, not `fetch` in click handlers. `<Form>` works before hydration, so submissions degrade gracefully without JS.\n- After an action resolves, every matched route loader revalidates automatically. Do not manually refetch. If you see stale data, check that a `shouldRevalidate` export is not returning `false` and blocking the re-run.\n- Use `useFetcher` for non-navigation mutations (likes, inline edits, autosave): it submits to an action and revalidates affected loaders without changing the URL.\n- For control flow, `throw redirect(\"/path\")` from a loader/action instead of navigating imperatively in an effect.\n- Put server-only secrets and DB calls inside `loader`/`action`; that code is stripped from the client bundle. `clientLoader`/`clientAction` ship to the browser, so never put secrets there.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/app/routes",
      "title": "Use generated Route types, not hand-written ones",
      "summary": "Import the per-route Route namespace for params, loaderData, and actionData typing; never edit generated files.",
      "body": "React Router codegen emits a typed `Route` namespace per route file; use it instead of casting.\n\n- Import with `import type { Route } from \"./+types/<route-file>\"` and type handlers as `Route.LoaderArgs`, `Route.ClientLoaderArgs`, `Route.ActionArgs`, `Route.ComponentProps`, `Route.ErrorBoundaryProps`, `Route.HydrateFallbackProps`.\n- The `+types/<name>` segment must mirror the route file name exactly, including `$` params and `.` separators (for example `./+types/posts.$id`). A mismatch is the most common \"types are missing/wrong\" cause.\n- Read `params`, `loaderData`, and `actionData` from the typed props rather than `useParams()` casts; `params` is typed from the route pattern and `loaderData` is inferred from the loader return.\n- Generated declarations live in `.react-router/types/`; they require `rootDirs` in `tsconfig.json` to resolve as if adjacent to the route. Keep `react-router dev` (or `react-router typegen --watch`) running so they stay current. Never hand-edit generated files and do not commit them.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Keep the route config and codegen in sync",
      "summary": "Pick one routing strategy; an app/routes.ts disables file-based convention unless you explicitly spread it back in.",
      "body": "Framework-mode routing is driven by `app/routes.ts`, and the codegen depends on it being correct.\n\n- Define routes with the config helpers: `import { type RouteConfig, route, index, layout, prefix } from \"@react-router/dev/routes\"`.\n- Once `app/routes.ts` exists, the file-system convention is OFF by default. You must declare every route, or routes silently 404. To keep convention-based discovery, spread it back in explicitly: `import { flatRoutes } from \"@react-router/fs-routes\"` then `export default [route(\"/\", \"./home.tsx\"), ...(await flatRoutes())] satisfies RouteConfig`.\n- Use `layout(file, children)` to nest UI without adding a URL segment, and `prefix(path, routes)` to add a path prefix without a new route module. Do not fake these with empty path segments.\n- Every route module referenced in `routes.ts` must exist and export a `default` component (or be a pure layout/resource route); a dangling reference breaks typegen for the whole app.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Framework mode data flow and single-fetch",
      "summary": "How loaders, actions, revalidation, single-fetch, and deferred streaming fit together in RR7 framework mode.",
      "body": "Framework mode (the Remix-merged full-stack setup) drives the data lifecycle from route modules. We are on `react-router` 7.17.x; `react-router-dom` is folded into `react-router`, so import everything from `react-router`.\n\n- One navigation triggers a single HTTP request (single-fetch) that resolves every matched route's loader together. Avoid waterfalling per-component fetches; co-locate data needs on the route loaders.\n- On initial load/SSR the server `loader` runs; on client navigations the server loader is called via an automatic browser fetch. `clientLoader` runs only on the client unless you opt it into hydration.\n- To run a `clientLoader` during hydration, export `clientLoader.hydrate = true as const` and provide a `HydrateFallback` component to render while it runs.\n- Stream slow data: return a promise from a loader and render it with `<Await>` + `<Suspense>` (or `useAsyncValue`) so the shell paints immediately. Loader serialization also handles Dates, Maps, Sets, and promises, not just primitives.\n- Single-fetch merges loader responses; when multiple matched loaders set headers, the deepest matching route wins. Set response headers from the leaf loader/action that owns them.\n\nSee /app/routes for the load/mutate and generated-types rules, and the middleware memory at /app for the request-pipeline layer.",
      "scopeType": "folder"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Middleware and request context (v8_middleware)",
      "summary": "RR7 middleware runs before loaders/actions for auth, logging, and shared context; it is behind a future flag with a strict next() contract.",
      "body": "React Router 7.17 ships middleware behind a future flag; it is the canonical place for auth, logging, and seeding per-request context. It is slated to become default in v8, so the API is stable enough to adopt now.\n\n- Enable it in `react-router.config.ts`: `export default { future: { v8_middleware: true } } satisfies Config`. In data mode (`createBrowserRouter`) you also augment the `Future` interface via `declare module \"react-router\"`.\n- A route exports `middleware: Route.MiddlewareFunction[]` (server) and/or `clientMiddleware: Route.ClientMiddlewareFunction[]`. Each entry receives `({ request, context }, next)` and runs before that route's loader/action.\n- Contract: call `await next()` to continue the chain; on the SERVER you must return the response (`return await next()`), and post-`next()` code runs after handlers (for timing, header rewriting). On the client `next()` is optional. `next()` may be called at most once and never throws; thrown errors route to the nearest `ErrorBoundary`.\n- Share data through typed context, not module globals: `const userCtx = createContext<User | null>(null)`, then `context.set(userCtx, user)` in middleware and `context.get(userCtx)` in downstream middleware/loaders. With a custom server, return a `new RouterContextProvider()` from `getLoadContext`.\n- Auth pattern: in middleware, load the session and `throw redirect(\"/login\")` when missing, otherwise `context.set(userCtx, user)` so every loader on the route reads an authenticated user without re-checking.\n\nSee /app for the single-fetch data-flow memory and /app/routes for the loader/action rules that consume this context.",
      "scopeType": "folder"
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "react-router-review",
      "summary": "Pre-merge checklist for React Router 7 framework mode routes, loaders, actions, and middleware.",
      "body": "---\nname: react-router-review\ndescription: Review a React Router 7 framework-mode change before merging. Use when adding or changing route modules, loaders, actions, middleware, or app/routes.ts.\n---\n\n# React Router 7 review\n\n## Data and mutations\n- [ ] Route data is read via `loader` / `clientLoader`, not `useEffect` fetches\n- [ ] Mutations go through `action` / `clientAction` submitted with `<Form>` or `useFetcher`, not raw `fetch` in handlers\n- [ ] No manual refetch after an action; rely on automatic revalidation (check any `shouldRevalidate` does not block needed loaders)\n- [ ] `useFetcher` is used for non-navigation mutations (likes, inline edits) instead of changing the URL\n- [ ] Slow data is deferred with a returned promise + `<Await>` / `<Suspense>` instead of blocking the whole route\n- [ ] Redirects use `throw redirect()` from loaders/actions, not imperative navigation in effects\n\n## Type safety\n- [ ] Args and props use generated `Route.LoaderArgs` / `Route.ActionArgs` / `Route.ComponentProps` from `./+types/...`\n- [ ] The `+types/<name>` import path mirrors the route file name exactly (including `$` params and `.` separators)\n- [ ] `params`, `loaderData`, `actionData` come from typed props, not `useParams()` casts\n- [ ] No generated files (`.react-router/types/`) were hand-edited or committed\n\n## Routing config\n- [ ] New route is registered in `app/routes.ts` via `route` / `index` / `layout` / `prefix` (or covered by a spread `flatRoutes()`)\n- [ ] Every referenced route module exists and exports a `default` (or is a deliberate layout/resource route)\n\n## Middleware and security\n- [ ] Server-only code (secrets, DB) stays inside `loader` / `action` / `middleware`, never in `clientLoader` / `clientAction`\n- [ ] Middleware calls `await next()` and returns its response on the server; shared state goes through `createContext` + `context.set/get`, not module globals\n- [ ] Auth/redirect checks live in `middleware` (or a loader) rather than being duplicated per component\n\n## Resilience\n- [ ] `<Link>` uses an appropriate `prefetch` mode (`intent` / `viewport` / `render`) for hot navigations\n- [ ] Route exports an `ErrorBoundary` (and `meta` where needed) for failure and SEO paths\n",
      "skillTags": [
        "react-router",
        "framework-mode",
        "loaders",
        "middleware",
        "code-review"
      ]
    }
  ]
};
