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
      "summary": "Route data comes from loaders; mutations go through actions, never useEffect or ad-hoc fetch.",
      "body": "In framework mode, route data and mutations live on the route module, not in component effects.\n\n- Read data with `loader` (server) or `clientLoader` (browser); never fetch in `useEffect` for route data.\n- Mutate with `action` / `clientAction` submitted via `<Form>` or `useSubmit`, not `fetch` in click handlers.\n- After an action resolves, all page loaders revalidate automatically. Do not manually refetch.\n- Put server-only secrets and DB calls in `loader`/`action`; they are stripped from the client bundle.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/app/routes",
      "title": "Use generated Route types, not hand-written ones",
      "summary": "Import the per-route Route namespace for params, loaderData, and actionData typing.",
      "body": "React Router codegen emits a typed `Route` namespace per route file; use it instead of casting.\n\n- Import with `import type { Route } from './+types/route-name'` and type args as `Route.LoaderArgs`, `Route.ActionArgs`, `Route.ComponentProps`.\n- Read `params`, `loaderData`, and `actionData` from those typed props rather than `useParams()` casts.\n- Keep `react-router typegen` (or `dev`) running so `.react-router/types/` stays current; do not edit generated files.\n- Define routes in `app/routes.ts` with the config helpers so codegen and the type map stay in sync.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Framework mode data flow and single-fetch",
      "summary": "How loaders, actions, revalidation, and single-fetch fit together in RR7 framework mode.",
      "body": "Framework mode (the Remix-merged full-stack setup) drives the data lifecycle from route modules.\n\n- One navigation triggers a single HTTP request (single-fetch) that resolves every matched route's loader together; avoid waterfalling per-component fetches.\n- `clientLoader` can hydrate the initial SSR render by exporting `clientLoader.hydrate = true`; otherwise it runs on client navigations.\n- Streaming defer happens by returning promises from a loader and resolving them with `<Await>` / `useAsyncValue` so the shell renders immediately.\n- Stable on `react-router` 7.17.x; the legacy `react-router-dom` package is folded into `react-router`."
    },
    {
      "kind": "memory",
      "nodePath": "/app/routes",
      "title": "Prefetch, navigation, and progressive enhancement",
      "summary": "Link prefetch modes, Form-based mutations, and graceful no-JS behavior.",
      "body": "Navigation and forms are built to work before and after hydration.\n\n- Set `<Link prefetch=\"intent\">` for hover/focus prefetch, `\"viewport\"` for in-view, `\"render\"` for eager; prefetch uses `<link rel=\"prefetch\">` tags.\n- Use `<Form method=\"post\">` so submissions work without JS; `useNavigation()` / `useFetcher()` give pending UI once hydrated.\n- `useFetcher` handles non-navigation mutations (likes, inline edits) without changing the URL and still revalidates affected loaders.\n- Throw `redirect()` or `data()` from loaders/actions for control flow instead of imperatively navigating in effects."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "react-router-review",
      "summary": "Pre-merge checklist for React Router 7 framework mode routes, loaders, and actions.",
      "body": "---\nname: react-router-review\ndescription: Review a React Router 7 framework-mode route before merging. Use when adding or changing route modules, loaders, actions, or app/routes.ts.\n---\n\n# React Router 7 review\n\n- [ ] Route data is read via `loader` / `clientLoader`, not `useEffect` fetches\n- [ ] Mutations go through `action` / `clientAction` submitted with `<Form>` or `useFetcher`, not raw `fetch` in handlers\n- [ ] Args and props use generated `Route.LoaderArgs` / `Route.ActionArgs` / `Route.ComponentProps` from `./+types/...`\n- [ ] `params`, `loaderData`, `actionData` come from typed props, not `useParams()` casts\n- [ ] Server-only code (secrets, DB) stays inside `loader`/`action` and out of the client bundle\n- [ ] Route is registered in `app/routes.ts` and codegen (`.react-router/types/`) is up to date\n- [ ] Redirects use `redirect()` thrown from loaders/actions, not imperative navigation in effects\n- [ ] `<Link>` uses an appropriate `prefetch` mode for hot navigations\n- [ ] Slow data is deferred with promises + `<Await>` instead of blocking the whole route\n- [ ] Errors are handled with an exported `ErrorBoundary` / `meta` where needed\n",
      "skillTags": [
        "react-router",
        "framework-mode",
        "loaders",
        "code-review"
      ]
    }
  ]
};
