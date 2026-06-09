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
      "title": "Never fetch in useEffect for server state",
      "summary": "Use useQuery instead of useEffect plus useState for any server data.",
      "body": "Server state belongs to TanStack Query, not to component effects. Fetching in `useEffect` and storing the result in `useState` reintroduces every bug the library exists to solve: no caching, no dedupe, manual loading and error flags, and race conditions on fast navigation.\n\n- Replace any `useEffect` that calls `fetch` or an API client with `useQuery` or `useSuspenseQuery`.\n- Read status from `query.status`, `isPending`, and `isError` instead of hand-rolled `useState` flags.\n- Use `enabled` (or component composition with `useSuspenseQuery`) for dependent queries rather than gating fetches inside an effect.\n- Reserve `useEffect` for true side effects like subscriptions and DOM work, never for data loading.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Invalidate related queries after every mutation",
      "summary": "Each useMutation must invalidate or update the queries its write affects.",
      "body": "A mutation that changes server data must tell the cache. Without invalidation the UI keeps rendering stale data until a refetch trigger happens to fire.\n\n- In `onSuccess` (or `onSettled`), call `queryClient.invalidateQueries({ queryKey: keys.lists() })` for every list or detail the write touches.\n- Prefer key-factory references over inline arrays so invalidation targets match the keys that were set.\n- For optimistic UI, use `onMutate` to `cancelQueries`, snapshot with `getQueryData`, write with `setQueryData`, and roll back in `onError`; still invalidate in `onSettled`.\n- Do not manually `setQueryData` as a substitute for invalidation unless you return the exact server shape.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Query key factories are the cache contract",
      "summary": "Centralize hierarchical query keys per entity so invalidation is predictable.",
      "body": "Query keys are how TanStack Query identifies, dedupes, and invalidates cache entries, so they live in one factory per entity rather than as scattered inline arrays.\n\n- Shape each factory hierarchically: `all`, `lists()`, `list(filters)`, `details()`, `detail(id)` so a single `invalidateQueries({ queryKey: keys.all })` can clear a whole entity.\n- Include every input a query depends on (filters, ids, pagination) in the key; changing the key is how a new fetch is triggered.\n- Pair factories with `queryOptions()` from v5 so the same key, `queryFn`, and `staleTime` are reused across `useQuery`, `useSuspenseQuery`, `prefetchQuery`, and `setQueryData`.\n- Keys must be serializable and order-stable; objects are compared by deep structure, not reference.",
      "skillTags": []
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "TanStack Query v5 defaults and staleTime tuning",
      "summary": "Know the v5 defaults before overriding refetch and cache behavior.",
      "body": "TanStack Query v5 (`@tanstack/react-query` 5.x) ships aggressive freshness defaults that surprise teams expecting cache-first behavior.\n\n- `staleTime` defaults to `0`, so data is stale immediately and refetches on mount, window focus, and reconnect; set a realistic value like `5 * 60 * 1000` per query for data that does not change every second.\n- `gcTime` (renamed from `cacheTime`) defaults to 5 minutes and controls when inactive cache entries are garbage collected, not staleness.\n- Use `staleTime: Infinity` for data that only changes via your own mutations, and `staleTime: 'static'` for truly immutable data like feature flags.\n- v5 removed the `suspense: true` flag on `useQuery`; use the dedicated `useSuspenseQuery`, and note it has no `enabled` option since loading is handled by Suspense and errors by an Error Boundary.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "tanstack-query-review",
      "summary": "Checklist for reviewing TanStack Query v5 usage before merge.",
      "body": "---\nname: tanstack-query-review\ndescription: Review checklist for TanStack Query v5 code. Use when adding or changing useQuery, useSuspenseQuery, useMutation, query keys, or QueryClient config in a React or Next.js codebase.\n---\n\n# TanStack Query review\n\n- [ ] No server data is fetched in `useEffect` plus `useState`; every read uses `useQuery` or `useSuspenseQuery`\n- [ ] Query keys come from a centralized factory, not inline ad-hoc arrays, and include every input the query depends on\n- [ ] Shared queries are defined with `queryOptions()` and reused across hooks, prefetch, and `setQueryData`\n- [ ] `staleTime` and `gcTime` are set deliberately rather than relying on the `0ms` stale default\n- [ ] Every `useMutation` invalidates or updates the queries its write affects in `onSuccess` or `onSettled`\n- [ ] Optimistic updates cancel in-flight queries, snapshot previous data, and roll back in `onError`\n- [ ] Loading and error states read from `isPending`, `isError`, and Error Boundaries, not hand-rolled flags\n- [ ] `enabled` or component composition handles dependent queries; nothing gates fetching inside an effect\n",
      "skillTags": [
        "tanstack-query",
        "react",
        "code-review",
        "data-fetching"
      ]
    }
  ]
};
