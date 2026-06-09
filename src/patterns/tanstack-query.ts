import type { Pattern } from "../types.js";

export const tanstackQuery: Pattern = {
  "slug": "tanstack-query",
  "version": "1.0.0",
  "name": "TanStack Query",
  "tagline": "Treat the server as the source of truth and let the cache do the work.",
  "description": "A guardrail bundle for TanStack Query v5 in React apps. It enforces structured query key factories, deliberate staleTime, and mutation-driven invalidation so server state stays consistent. The rules keep data fetching out of effects and push every query through reusable queryOptions.",
  "category": "Frontend",
  "icon": "refresh-cw",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "TanStack Query Pattern for AI Coding Agents",
  "metaDescription": "Pathrule pattern that teaches AI coding agents to use TanStack Query v5 correctly: query key factories, staleTime, mutation invalidation, and no fetching in useEffect.",
  "problem": "Server state drifts out of sync because queries use ad-hoc keys, fetch inside effects, and never invalidate after mutations.",
  "audience": "React and Next.js teams using TanStack Query v5 for server state",
  "prevents": [
    "Fetching data inside useEffect and storing it in component state instead of using useQuery",
    "Ad-hoc string query keys that make invalidation unpredictable and silently serve stale data",
    "Mutations that update the server but never invalidate or update the related query cache"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/src/api",
      "/src/hooks",
      "/app"
    ],
    "stacks": [
      "react",
      "nextjs",
      "typescript",
      "tanstack-query"
    ],
    "packages": [
      "@tanstack/react-query",
      "@tanstack/react-query-devtools"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Never fetch server state in useEffect",
      "summary": "Use useQuery or useSuspenseQuery for any server data, never useEffect plus useState.",
      "body": "Server state belongs to TanStack Query, not to component effects. Fetching in `useEffect` and storing the result in `useState` reintroduces every problem the library exists to solve: no caching, no request dedupe, manual loading and error flags, and race conditions when the user navigates faster than the request resolves.\n\n- Replace any `useEffect` that calls `fetch` or an API client with `useQuery` or `useSuspenseQuery`.\n- Read status from `query.status`, `isPending`, and `isError`, not from hand-rolled `useState` flags. (`isLoading` in v5 means `isPending && isFetching`; the initial-load flag is `isPending`.)\n- Reference `query.data` directly in render. Do not copy it into `useState` or a global store, or background refetches will no longer reflect in the UI.\n- For dependent queries, gate with the `enabled` option or compose `useSuspenseQuery` components; never gate a fetch inside an effect.\n- Reserve `useEffect` for true side effects such as subscriptions and DOM work.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Invalidate related queries after every mutation",
      "summary": "Each useMutation must invalidate or update the queries its write affects.",
      "body": "A mutation that changes server data must tell the cache, or the UI keeps rendering stale data until some unrelated refetch trigger happens to fire. `invalidateQueries` marks matching entries stale and refetches the active ones in the background, overriding any `staleTime`.\n\n- In `onSuccess` (or `onSettled` when you want it to run after errors too), call `queryClient.invalidateQueries({ queryKey: keys.lists() })` for every list or detail the write touches.\n- Pass key-factory references, not inline arrays, so invalidation targets exactly the keys that were set. `invalidateQueries` matches by prefix, so `keys.all` clears an entire entity.\n- For optimistic UI: `onMutate` runs `cancelQueries`, snapshots with `getQueryData`, and writes with `setQueryData`; `onError` rolls the snapshot back; `onSettled` still invalidates to reconcile with the server.\n- Do not lean on `setQueryData` instead of invalidation unless the mutation returns the exact server shape for that key; otherwise the next background refetch silently overwrites your guess.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Query key factories are the cache contract",
      "summary": "Centralize hierarchical query keys per entity so invalidation is predictable.",
      "body": "Query keys are how TanStack Query identifies, dedupes, and invalidates cache entries, so they live in one factory per entity instead of as scattered inline arrays.\n\n- Shape each factory hierarchically so a single call can clear a whole entity:\n\n```ts\nexport const todoKeys = {\n  all: ['todos'] as const,\n  lists: () => [...todoKeys.all, 'list'] as const,\n  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,\n  details: () => [...todoKeys.all, 'detail'] as const,\n  detail: (id: string) => [...todoKeys.details(), id] as const,\n}\n```\n\n- Include EVERY input the query depends on (filters, ids, pagination) in the key. The key is the dependency array: changing it is how a new fetch is triggered, and omitting an input serves stale data for the wrong arguments.\n- Pair each factory with `queryOptions()` so the same key, `queryFn`, and `staleTime` are reused verbatim across `useQuery`, `useSuspenseQuery`, `prefetchQuery`, and `setQueryData`. This also makes `queryClient.getQueryData(todoKeys.detail(id))` fully typed.\n- Keys must be JSON-serializable; objects are compared by deep structure, not reference, but key order within an array matters (`['todos', 'list']` differs from `['list', 'todos']`)."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "TanStack Query v5 defaults you must override",
      "summary": "Know the v5 freshness defaults before tuning refetch and cache behavior.",
      "body": "TanStack Query v5 (`@tanstack/react-query` 5.x) ships aggressive freshness defaults that surprise teams expecting cache-first behavior. Set them deliberately per query rather than fighting symptoms.\n\n- `staleTime` defaults to `0`, so data is stale the instant it arrives and refetches on mount, window focus, and reconnect. For data that does not change every second, set a realistic value such as `staleTime: 5 * 60 * 1000`.\n- `gcTime` (renamed from `cacheTime` in v5) defaults to 5 minutes and controls when INACTIVE cache entries are garbage collected. It is not staleness; a fresh-but-inactive query can still be collected.\n- `retry` defaults to `3` with exponential backoff; turn it down or off for mutations and for endpoints where retrying is pointless (4xx).\n- `staleTime: Infinity` keeps data fresh forever but still honors `invalidateQueries`; use it for data that only changes through your own mutations. `staleTime: 'static'` (v5) never refetches at all, even on manual invalidation, for truly immutable data like build-time feature flags.\n- v5 removed `useQuery({ suspense: true })`. Use the dedicated `useSuspenseQuery`; it has no `enabled` option because loading is handled by Suspense and errors by an Error Boundary. `keepPreviousData` is also gone, replaced by `placeholderData: keepPreviousData` (imported from the package)."
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Next.js App Router QueryClient setup and prefetch",
      "summary": "One QueryClient per request on the server, a browser singleton on the client, then hydrate.",
      "body": "The most damaging real-world TanStack Query bug in Next.js is a module-level QueryClient: on the server it is shared across all requests, so one user's cached data leaks to the next. Use a request-scoped factory.\n\n- Create the client through a helper that returns a fresh instance on the server and a memoized singleton in the browser (the browser branch prevents a new client when React suspends mid-render):\n\n```ts\nfunction makeQueryClient() {\n  return new QueryClient({\n    defaultOptions: { queries: { staleTime: 60 * 1000 } },\n  })\n}\nlet browserClient: QueryClient | undefined\nexport function getQueryClient() {\n  if (typeof window === 'undefined') return makeQueryClient()\n  return (browserClient ??= makeQueryClient())\n}\n```\n\n- Set a default `staleTime` above `0` (60s is the documented baseline). Without it the client immediately refetches everything you just rendered on the server, defeating SSR.\n- In a Server Component, prefetch with `getQueryClient()` + `await queryClient.prefetchQuery(todoQueryOptions(id))`, then render `<HydrationBoundary state={dehydrate(queryClient)}>`. Child Client Components call `useQuery(todoQueryOptions(id))` with the same `queryOptions` and read from the hydrated cache.\n- For streaming, do not `await` the prefetch and enable pending-query dehydration (v5.40+): set `dehydrate.shouldDehydrateQuery` to `(q) => defaultShouldDehydrateQuery(q) || q.state.status === 'pending'`. Keep `'use client'` and the `QueryClientProvider` in a single shared providers component."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "tanstack-query-review",
      "summary": "Pre-merge checklist for TanStack Query v5 usage.",
      "body": "---\nname: tanstack-query-review\ndescription: Review checklist for TanStack Query v5 code. Use when adding or changing useQuery, useSuspenseQuery, useMutation, query keys, queryOptions, QueryClient config, or Next.js SSR hydration in a React or Next.js codebase.\n---\n\n# TanStack Query review\n\n- [ ] No server data is fetched in `useEffect` plus `useState`; every read uses `useQuery` or `useSuspenseQuery`\n- [ ] `query.data` is read directly in render, never copied into `useState` or a global store\n- [ ] Query keys come from a centralized factory and include every input the query depends on (filters, ids, pagination)\n- [ ] Shared queries are defined with `queryOptions()` and reused across hooks, `prefetchQuery`, and `setQueryData`\n- [ ] `staleTime` is set deliberately rather than left at the `0ms` default; `gcTime`, `retry`, and `staleTime: Infinity` vs `'static'` are used with intent\n- [ ] Every `useMutation` invalidates or updates the queries its write affects in `onSuccess` or `onSettled`, using key-factory references\n- [ ] Optimistic updates cancel in-flight queries, snapshot previous data, roll back in `onError`, and reconcile in `onSettled`\n- [ ] Loading and error states read from `isPending` and `isError` (or Suspense + Error Boundary), not hand-rolled flags\n- [ ] In Next.js, the server uses a request-scoped QueryClient (no module-level instance) with a default `staleTime > 0`, and prefetched data is passed through `HydrationBoundary` + `dehydrate`\n- [ ] No deprecated v5 APIs: no `useQuery({ suspense })`, no `cacheTime`, no `keepPreviousData` (use `placeholderData: keepPreviousData`)\n",
      "skillTags": [
        "tanstack-query",
        "react",
        "nextjs",
        "code-review",
        "data-fetching"
      ]
    }
  ]
};
