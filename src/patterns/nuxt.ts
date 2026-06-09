import type { Pattern } from "../types.js";

export const nuxt: Pattern = {
  "slug": "nuxt",
  "version": "1.0.0",
  "name": "Nuxt",
  "tagline": "Ship Nuxt 4 apps with correct data fetching, server routes, and SSR-safe code.",
  "description": "An opinionated bundle for Nuxt 4 on Vue 3 that keeps agents on the current API surface. It covers when to use useFetch, useAsyncData, and $fetch, how to write Nitro server routes, and how to keep secrets and client-only code out of the universal render.",
  "category": "Framework",
  "icon": "hexagon",
  "color": "bg-green-500/10 text-green-600 dark:bg-green-400/15 dark:text-green-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Nuxt 4 AI Coding Pattern: Data Fetching and SSR Rules",
  "metaDescription": "Pathrule pattern for Nuxt 4 and Vue 3. Teaches AI agents correct useFetch and useAsyncData usage, Nitro server routes, runtimeConfig secrets, and SSR-safe code.",
  "problem": "AI agents reach for stale Nuxt 2 and 3 habits, misuse the data-fetching composables, and leak secrets or break hydration in the universal render.",
  "audience": "Teams building full-stack Nuxt 4 apps on Vue 3 with Nitro",
  "prevents": [
    "Calling raw $fetch for initial page data, causing double fetches and hydration mismatches",
    "Reading server-only secrets through runtimeConfig.public or env vars on the client",
    "Touching window, document, or localStorage during SSR without a client guard"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/server",
      "/app/pages",
      "/app/composables"
    ],
    "stacks": [
      "nuxt",
      "nuxt4",
      "vue",
      "vue3",
      "nitro",
      "typescript",
      "ssr"
    ],
    "packages": [
      "nuxt",
      "vue",
      "nitropack",
      "h3",
      "ofetch"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Use useFetch and useAsyncData for render data, not raw $fetch",
      "summary": "Fetch initial component data through the SSR-aware composables so it survives hydration.",
      "body": "Use `useFetch` and `useAsyncData` for any data that feeds the initial render. They transfer the server payload to the client and dedupe, while raw `$fetch` re-runs on hydration.\n\n- Use `useFetch(url)` for plain endpoint calls. It keys on the URL automatically and infers types from `server/api`.\n- Use `useAsyncData(key, fn)` when you wrap an SDK, combine endpoints, or shape the payload. Always pass an explicit unique `key`.\n- Reserve bare `$fetch` for client-side event handlers (submit, click), never for initial data.\n- Do not pass `$fetch` directly as the `useFetch` handler. It breaks caching and dedup.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/server",
      "title": "Define Nitro routes with defineEventHandler, one handler per file",
      "summary": "Write server/api handlers the Nitro way and keep secrets server-side.",
      "body": "Files in `server/api` are auto-prefixed with `/api`; files in `server/routes` map at the root. Export one `defineEventHandler` per file.\n\n- Encode the method in the filename (`users.get.ts`, `users.post.ts`) instead of branching on `event.method`.\n- Read inputs with `getQuery`, `getRouterParam`, and `await readBody(event)` from `h3`; never parse the raw request yourself.\n- Throw `createError({ statusCode, statusMessage })` for failures so Nitro returns a proper error response.\n- Access secrets via `useRuntimeConfig(event)`, passing `event` so env overrides apply at runtime.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Nuxt 4 SSR-safe and auto-import conventions",
      "summary": "What runs where, plus how auto-imports change how you write components.",
      "body": "Nuxt 4 renders universally by default, so component setup runs on both server and client. Guard browser-only access.\n\n- Wrap `window`, `document`, `localStorage`, and similar in `if (import.meta.client)` or `onMounted`, which only runs on the client.\n- Use `import.meta.server` / `import.meta.client` for branch logic; the legacy `process.server` / `process.client` flags are gone.\n- Composables, components, and `utils`/`composables` exports are auto-imported. Do not add manual imports for them; `$fetch` is the global auto-imported alias for `ofetch`.\n- In Nuxt 4 the `data` from `useFetch`/`useAsyncData` is a `shallowRef`. Replace the value to trigger reactivity rather than mutating nested fields in place."
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Nuxt 4 directory layout and runtimeConfig",
      "summary": "Where source lives in Nuxt 4 and how to split public vs private config.",
      "body": "Nuxt 4 moved app source under `app/` (`app/pages`, `app/components`, `app/composables`) while `server/`, `modules/`, `layers/`, and `shared/` stay at the project root.\n\n- Put API handlers in `server/api`, shared cross-runtime helpers in `shared/`, and Vue UI under `app/`.\n- Define secrets in `runtimeConfig` (server-only) and browser-safe values in `runtimeConfig.public`. Never put tokens in `public`.\n- Override config at runtime with `NUXT_*` env vars (for example `NUXT_API_SECRET`, `NUXT_PUBLIC_SITE_URL`).\n- Read config with `useRuntimeConfig()` in components and `useRuntimeConfig(event)` in server handlers."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "nuxt-review",
      "summary": "Pre-merge checklist for Nuxt 4 data fetching, server routes, and SSR safety.",
      "body": "---\nname: nuxt-review\ndescription: Review a Nuxt 4 change for correct data fetching, Nitro server routes, runtimeConfig secret handling, and SSR-safe code before merging.\n---\n\n# Nuxt 4 review\n\n- [ ] Initial render data uses `useFetch` or `useAsyncData`, not raw `$fetch`.\n- [ ] Every `useAsyncData` call passes an explicit, unique `key`.\n- [ ] `$fetch` is only used in client event handlers, never for initial data.\n- [ ] `lazy: true` / `server: false` choices match the data's SEO and blocking needs.\n- [ ] Server handlers use `defineEventHandler` with method-suffixed filenames.\n- [ ] Inputs read via `getQuery`, `getRouterParam`, `readBody`; errors via `createError`.\n- [ ] Secrets live in `runtimeConfig` (server-only), never `runtimeConfig.public`.\n- [ ] `useRuntimeConfig(event)` is used inside server handlers.\n- [ ] Browser-only APIs are guarded with `import.meta.client` or `onMounted`.\n- [ ] No manual imports added for auto-imported composables, components, or utils.\n",
      "skillTags": [
        "nuxt",
        "vue",
        "nitro",
        "ssr",
        "review"
      ]
    }
  ]
};
