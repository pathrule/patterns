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
      "title": "Fetch initial render data with useFetch or useAsyncData, never raw $fetch",
      "summary": "Initial component data must go through the SSR-aware composables so the server payload transfers to the client.",
      "body": "Any data that feeds the initial render must use `useFetch` or `useAsyncData`. These run once on the server and serialize the result into the payload so the client reuses it during hydration. Raw `$fetch` in `<script setup>` runs again on the client after hydration, causing a double fetch, wasted requests, and hydration issues.\n\n- Use `useFetch(url)` for a plain GET against one endpoint. It keys on the URL and method automatically and infers response types from `server/api`.\n- Use `useAsyncData(key, fn)` when the work is not a simple endpoint call: wrapping an SDK, combining several requests, or reshaping the payload. Pass an explicit unique `key` so shared calls dedupe correctly.\n- Reserve bare `$fetch` for client-only event handlers (form submit, button click) where SSR transfer does not apply.\n- Do not pass `$fetch` as the `useFetch` handler (`useFetch(() => $fetch(url))`). Wrap custom `$fetch` logic in `useAsyncData(key, () => $fetch(...))` instead so caching and dedup still work.\n- Errors are not thrown by these composables; read `error` and `status` to render error UI. Only bare `$fetch` throws on a non-2xx response.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Make useFetch URLs and keys reactive with refs or getters, not interpolated strings",
      "summary": "Dynamic data must use a ref/computed/getter URL or key so it refetches and stays hydration-consistent.",
      "body": "When a fetch depends on a reactive value (route param, selected id, search box), pass the URL as a ref, computed, or getter function, not as an eagerly interpolated string. A plain template string is resolved once when the function runs and will not refetch when the value changes, and a `computed` used directly as the key or query is a known cause of hydration-mismatch warnings because the server and client hash it differently.\n\n- Pass a getter URL: `useFetch(() => \\`/api/users/${id.value}\\`)`. It recomputes and refetches when `id` changes.\n- Reactive option values (`query`, `params`, `headers`) trigger a refetch when they change; the `watch` option re-runs the handler but does not rebuild the URL, so put dynamic parts in the URL getter.\n- Give every `useAsyncData` an explicit unique `key`; do not rely on the auto-generated key for anything you fetch in more than one place.\n- When the same key is reused across components, keep `handler`, `transform`, `pick`, `default`, `deep`, and `getCachedData` identical, or Nuxt warns and behavior diverges.\n- Use `lazy: true` (or `useLazyFetch`) only when the data is not needed for the first paint or SEO; otherwise let it block navigation so the markup is complete on the server.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/server",
      "title": "Write Nitro handlers with defineEventHandler and method-suffixed filenames",
      "summary": "One defineEventHandler per file, method in the filename, inputs via h3 helpers, errors via createError.",
      "body": "Files in `server/api` are auto-mounted under `/api`; files in `server/routes` mount at the root. Export exactly one `defineEventHandler` per file.\n\n- Encode the HTTP method in the filename (`users.get.ts`, `users.post.ts`, `users.[id].delete.ts`) instead of branching on `event.method` inside one handler.\n- Read inputs with the `h3` helpers: `getQuery(event)`, `getRouterParam(event, 'id')`, and `await readBody(event)`. Do not parse the raw request stream yourself.\n- Throw `createError({ statusCode, statusMessage, data })` for failures so Nitro returns a structured error response with the right status code; do not return ad-hoc `{ error: ... }` objects with a 200.\n- Keep handlers serializable in and out; return plain objects/arrays, not class instances or functions.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/server",
      "title": "Keep secrets in runtimeConfig and read them with useRuntimeConfig(event)",
      "summary": "Private keys live in the private runtimeConfig block, never in public, and are read server-side with the event.",
      "body": "`runtimeConfig` has two halves: top-level keys are server-only, and `runtimeConfig.public` is shipped to the browser in the payload. Anything secret (API tokens, DB URLs, signing keys) must be a top-level key, never under `public`.\n\n- Define `runtimeConfig: { apiSecret: '', public: { apiBase: '' } }` in `nuxt.config.ts`; only put values you are willing to expose in the page source under `public`.\n- Override at runtime with `NUXT_*` env vars (`NUXT_API_SECRET`, `NUXT_PUBLIC_API_BASE`). Do not read `process.env` directly in app or server code; values must round-trip through `runtimeConfig`.\n- In server handlers call `useRuntimeConfig(event)`, passing `event`, so per-request env overrides apply. Calling it without `event` in a handler can miss runtime overrides.\n- Never reference a top-level (private) runtimeConfig key inside a component or composable that runs on the client; it will be `undefined` there and signals the secret was nearly leaked.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Guard browser-only APIs; component setup runs on the server too",
      "summary": "window, document, localStorage and similar must be guarded for SSR using import.meta.client or onMounted.",
      "body": "Nuxt 4 renders universally by default, so `<script setup>` and composables execute on the server during SSR. Touching browser globals there throws or produces server/client divergence.\n\n- Wrap `window`, `document`, `localStorage`, `navigator`, and DOM measurements in `if (import.meta.client) { ... }` or run them inside `onMounted`, which only fires on the client.\n- Use `import.meta.server` / `import.meta.client` for branch logic. The legacy `process.server` / `process.client` flags are removed in Nuxt 4.\n- Do not derive rendered text from values that differ between server and client (timestamps, `Math.random`, locale-dependent formatting) without `<ClientOnly>` or a mounted guard; that is a classic hydration-mismatch source.\n- For genuinely client-only widgets, wrap them in `<ClientOnly>` and provide a `fallback` so the server output stays stable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Nuxt 4 directory layout: app/ is the new srcDir",
      "summary": "Where source lives after the Nuxt 4 move to app/, and what stays at the project root.",
      "body": "Nuxt 4 changed the default `srcDir` to `app/`. Vue source moved under `app/` (`app/pages`, `app/components`, `app/composables`, `app/layouts`, `app/plugins`, `app/middleware`, plus `app/app.vue`), while several directories deliberately stay at the project root.\n\n- Root-level (not under `app/`): `server/`, `modules/`, `layers/`, `shared/`, `public/`, `content/`, and `nuxt.config.ts`.\n- Put API handlers in `server/api`, Nitro middleware/plugins in `server/`, and code that must run in BOTH the Vue app and the Nitro server in `shared/` (it is auto-imported on both sides).\n- This is a frequent source of confusion when porting Nuxt 2/3 code or following old tutorials that assume a flat root or a `src/` dir. If migrating an existing project, you can keep the old layout by setting `srcDir` and `dir` overrides, but new code should follow the `app/` default.\n\nSee /server for the Nitro handler and runtimeConfig secret conventions.",
      "scopeType": "folder",
      "priority": "medium"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Auto-imports and shallowRef reactivity in Nuxt 4",
      "summary": "What is auto-imported, and why fetched data needs whole-value replacement to stay reactive.",
      "body": "Two Nuxt 4 conventions change how everyday component code is written.\n\nAuto-imports: composables, components, and exports from `app/composables` and `app/utils` are auto-imported. Do not add manual `import` lines for them; a duplicate manual import can shadow the auto-import. `$fetch` is the global auto-imported alias for `ofetch`, and Vue APIs (`ref`, `computed`, `watch`, `onMounted`) are auto-imported too.\n\nshallowRef data: in Nuxt 4 the `data` returned by `useFetch` / `useAsyncData` is a `shallowRef`, not a deeply reactive ref. This is a deliberate performance choice that avoids tracking every nested property. The practical consequence: mutating a nested field in place (`data.value.items.push(x)`) will not reliably trigger reactivity. Replace the whole value (`data.value = { ...data.value, items: [...] }`) or call the composable's `refresh()`. If you genuinely need deep reactivity for one call, opt in with `deep: true`.",
      "scopeType": "folder",
      "priority": "medium"
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "nuxt-review",
      "summary": "Pre-merge checklist for Nuxt 4 data fetching, server routes, secrets, and SSR safety.",
      "body": "---\nname: nuxt-review\ndescription: Review a Nuxt 4 (Vue 3 + Nitro) change for correct data fetching, reactive keys, server route conventions, runtimeConfig secret handling, and SSR-safe code before merging.\n---\n\n# Nuxt 4 review\n\n## Data fetching (app/)\n- [ ] Initial render data uses `useFetch` or `useAsyncData`, not raw `$fetch` in `<script setup>`.\n- [ ] `$fetch` appears only in client event handlers (submit, click), never for first-paint data.\n- [ ] Dynamic URLs are getters/refs/computed, not eagerly interpolated strings.\n- [ ] No bare `computed` passed as a `useFetch` key or query (hydration-mismatch risk).\n- [ ] Every `useAsyncData` call has an explicit unique `key`; shared keys keep `transform`/`pick`/`default` identical.\n- [ ] `error` and `status` are handled in the template (these composables do not throw).\n- [ ] `lazy: true` / `useLazyFetch` used only when the data is not needed for first paint or SEO.\n- [ ] Nested fetched data is replaced wholesale or refreshed, not mutated in place (shallowRef).\n\n## Server routes & secrets (server/)\n- [ ] One `defineEventHandler` per file; method encoded in the filename (`*.get.ts`, `*.post.ts`).\n- [ ] Inputs read via `getQuery`, `getRouterParam`, `await readBody`; errors via `createError`.\n- [ ] Secrets live as top-level `runtimeConfig` keys, never under `runtimeConfig.public`.\n- [ ] Server handlers read config with `useRuntimeConfig(event)` (event passed).\n- [ ] No private runtimeConfig key or secret referenced in client-side component/composable code.\n\n## SSR safety (app/)\n- [ ] Browser-only APIs (`window`, `document`, `localStorage`) guarded with `import.meta.client` or `onMounted`.\n- [ ] No `process.server` / `process.client` (use `import.meta.server` / `import.meta.client`).\n- [ ] Server/client-divergent values (`Date`, random, locale) are wrapped in `<ClientOnly>` or a mounted guard.\n- [ ] No manual imports added for auto-imported composables, components, or utils.\n",
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
