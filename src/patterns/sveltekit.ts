import type { Pattern } from "../types.js";

export const sveltekit: Pattern = {
  "slug": "sveltekit",
  "version": "1.0.0",
  "name": "SvelteKit",
  "tagline": "Keep server secrets, load data, and mutations correct across SvelteKit 2 and Svelte 5.",
  "description": "A pattern bundle for SvelteKit 2 apps built on Svelte 5 runes. It encodes where data loading belongs, how to keep secrets server-side, and how form actions and remote functions stay type-safe and progressively enhanced. Use it so AI agents stop leaking private values into the client bundle and stop reaching for stores when runes are the right tool.",
  "category": "Framework",
  "icon": "flame",
  "color": "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "SvelteKit pattern for AI coding agents | Pathrule",
  "metaDescription": "Pathrule rules, memories, and a review skill that keep AI coding agents correct on SvelteKit 2 and Svelte 5 runes: load functions, form actions, secrets, and remote functions.",
  "problem": "AI agents leak private values into the client bundle and pick the wrong data-loading or reactivity primitive in SvelteKit.",
  "audience": "Teams shipping full-stack apps on SvelteKit 2 with Svelte 5",
  "prevents": [
    "Importing $env/static/private or $env/dynamic/private into universal load or client code, leaking secrets into the bundle",
    "Putting database queries and auth in +page.ts universal load instead of +page.server.ts",
    "Reaching for writable stores where Svelte 5 runes ($state, $derived) are the correct primitive"
  ],
  "appliesTo": {
    "paths": [
      "/src/routes",
      "/src/lib",
      "/src/lib/server",
      "/src/hooks.server.ts"
    ],
    "stacks": [
      "sveltekit",
      "svelte5",
      "typescript",
      "vite",
      "ssr"
    ],
    "packages": [
      "@sveltejs/kit",
      "svelte",
      "@sveltejs/adapter-auto",
      "vite"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Server-only data and secrets live in +page.server.ts",
      "summary": "Put auth, DB access, and private env in server load; keep universal load for public, serializable data.",
      "body": "Any data that needs secrets, cookies, a database, or private APIs belongs in a server load function, not a universal one.\n\n- Use `+page.server.ts` / `+layout.server.ts` for `load` that touches `$env/static/private`, `$env/dynamic/private`, `cookies`, or `locals`.\n- Reserve `+page.ts` / `+layout.ts` (universal) for public external APIs and non-serializable returns like component constructors.\n- Never import anything from `$lib/server`, a `*.server.ts` module, or a `$env/.../private` module into universal load or any client-reachable code. SvelteKit treats the whole import chain as unsafe and Vite refuses to build it; that build error is the signal the logic is in the wrong file, not something to work around.\n- When both load functions exist on a route, the server load runs first and its result reaches the universal load via the `data` property. Universal output cannot flow back to the server.\n- Server load runs only on the server. Universal load runs on the server during SSR, then again in the browser on hydration and on client-side navigation, so it must never assume a server-only global is present."
    },
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Mutations go through form actions or remote functions, never load",
      "summary": "Writes belong in form actions or remote form/command; load is read-only and reruns on navigation.",
      "body": "`load` functions are for reading and must stay side-effect free, because SvelteKit reruns them on navigation, invalidation, and SSR. A write placed in `load` will silently re-fire.\n\n- Handle writes with named `actions` in `+page.server.ts` plus a `<form method=\"POST\">`, or with remote `form` / `command` functions in a `.remote.ts` file.\n- Validate input server-side. In a form action, return `fail(status, data)` on validation errors and a serializable object on success.\n- Use the `enhance` action for progressive enhancement instead of a hand-rolled `fetch`, and call `invalidate('app:key')` / `invalidateAll()` to refresh affected `load` data after the mutation.\n- Do not perform POST/PUT/DELETE logic inside a `load`, and do not call a mutating remote `command` from a `load`.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Svelte 5 runes are the default; reactive classes replace stores",
      "summary": "Prefer $state/$derived/$props; never use $effect to sync state; use reactive classes in $lib over writable stores.",
      "body": "This codebase targets Svelte 5, so reactivity is rune-based, not store-based.\n\n- Use `$state` for mutable reactive values, `$derived` (or `$derived.by`) for computed values, `$props` for component inputs, and `$effect` only as an escape hatch for genuine side effects (DOM, analytics, subscriptions).\n- Do not use `$effect` to synchronise or recompute state from other state. The docs are explicit: use `$derived` instead. Writing to state that the same effect reads also risks an infinite loop; reach for `untrack` only when you deliberately need to read without depending.\n- Reach for `$state` only when a value drives the UI. Plain `const` / `let` is cheaper and clearer for everything else.\n- For shared logic, write a reactive class in `$lib` whose fields use `$state` / `$derived`, and import it, instead of authoring `writable` / `readable` stores. Runes work inside plain `.svelte.ts` modules and classes.\n- Avoid `$:` reactive statements and the implicit let-is-reactive model from Svelte 4. They do not exist in runes mode."
    },
    {
      "kind": "memory",
      "nodePath": "/src/routes",
      "title": "Avoid load waterfalls; stream non-critical data",
      "summary": "Fire independent fetches before await parent(); return unawaited promises for slow, non-essential data.",
      "body": "Load performance hinges on not serializing requests that could run in parallel.\n\n- Start independent `fetch` calls before `await parent()` so they do not block on parent data they do not need.\n- Return unresolved promises from a server `load` for non-essential data. SvelteKit streams them to the client so the page renders before they settle, and the markup can `{#await}` them.\n- Attach `.catch()` to any streamed promise that does NOT come from SvelteKit's injected `fetch`. An unhandled rejection in a streamed promise can crash the response.\n- Use the injected `fetch` argument inside `load` (not global `fetch`) so SvelteKit forwards credentials and cookies, resolves relative URLs, inlines the response during SSR, and tracks the request as a dependency for `invalidate`. For custom clients that bypass `fetch`, call `depends('app:key')` to register a manual dependency."
    },
    {
      "kind": "memory",
      "nodePath": "/src/routes",
      "title": "Remote functions are experimental and the API is still moving",
      "summary": "query/form/command/prerender in .remote.ts behind two experimental flags; validate args with a Standard Schema; expect breaking churn.",
      "body": "Remote functions (available since SvelteKit 2.27) are still experimental as of mid-2026. Treat their surface as unstable and pin against the SvelteKit version in this repo before copying examples.\n\n- Enable them with BOTH flags: `kit.experimental.remoteFunctions: true` and `compilerOptions.experimental.async: true` in `svelte.config.js`. They live in `*.remote.ts` files and export `query` (read, deduped + cached), `form` (progressively-enhanced writes bound to `<form>`), `command` (writes from anywhere, not form-bound), and `prerender` (build-time static data).\n- Every function that takes an argument must validate it with a Standard Schema validator (Zod, Valibot) passed as the first parameter. Do not trust raw input.\n- Use single-flight mutations: inside a `form` / `command` handler, call `.refresh()` / `.set()` on affected queries so the mutation and the data refresh travel in one round-trip. Use `getRequestEvent()` for request context, and `query.batch` to collapse N parallel calls into one request and avoid n+1.\n- Watch the breaking churn: `.run()` was removed from remote queries (await the query directly); `enhance` callbacks now receive a copy of the form instance rather than `{ form, data, submit }`; `query.live()` is the async-iterable real-time subscription helper. Confirm exact signatures against the installed version, not blog posts."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Async-in-components is experimental; reads after await are not tracked",
      "summary": "await in script/$derived/markup needs experimental.async; reactive reads after await or in setTimeout are not tracked; use $effect.pending.",
      "body": "Svelte 5 (since 5.36) lets you use `await` directly in component `<script>`, in `$derived`, and in markup, but it is experimental and must be opted into via `compilerOptions.experimental.async` in `svelte.config.js`. The flag is slated to be removed in Svelte 6.\n\n- Reactive values read ASYNCHRONOUSLY are not tracked. Anything read after an `await`, inside a `setTimeout`, or in a `.then()` callback will not register as a dependency, so the effect or derived will not re-run when it changes. Read the reactive value synchronously first, then await.\n- Use `$effect.pending()` to know how many async operations are still settling in the current boundary (it does not count child boundaries) when you need loading UI.\n- Svelte holds the UI in a consistent state while an `await` that depends on reactive state is in flight, rather than flashing intermediate values; rely on that instead of manual loading flags where possible.\n- This is independent of SvelteKit `load` streaming. Prefer `load` + streamed promises for route data and reserve in-component `await` for leaf-level async that is local to one component."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "sveltekit-review",
      "summary": "Pre-merge checklist for SvelteKit 2 routes: data boundaries, secrets, runes, mutations, and remote functions.",
      "body": "---\nname: sveltekit-review\ndescription: Review a SvelteKit 2 (Svelte 5) change before merge - verify load placement, secret isolation, runes usage, form actions, remote functions, and load performance. Use when reviewing or authoring routes, load functions, form actions, remote functions, or shared $lib reactivity.\n---\n\n# SvelteKit review\n\n## Secrets and data boundaries\n- [ ] Secrets, DB access, `cookies`, and `locals` appear only in `+page.server.ts` / `+layout.server.ts`, never in universal load or client code.\n- [ ] No `$lib/server`, `*.server.ts`, or `$env/.../private` import reaches a `+page.ts`, `+layout.ts`, or component (the build would fail; if it builds, the chain is clean).\n- [ ] Universal `load` returns only serializable data or intentional non-serializable values (components/classes); server `load` returns serializable data only.\n\n## Mutations\n- [ ] `load` functions are read-only; all writes go through `actions` or remote `form` / `command`.\n- [ ] Form actions validate input server-side and use `fail(status, data)` for errors; `<form>` uses `enhance`.\n- [ ] Data is refreshed after mutations via `invalidate` / `invalidateAll` (or remote single-flight `.refresh()` / `.set()`), not manual refetch.\n\n## Reactivity\n- [ ] Reactivity uses runes (`$state`, `$derived`, `$props`); no `$:` statements or new `writable` / `readable` stores where a reactive class fits.\n- [ ] `$effect` is used only for true side effects, never to synchronise or recompute state that `$derived` should produce.\n- [ ] If async-in-components is used, no reactive value is depended on only after an `await` / in a `setTimeout`.\n\n## Load performance\n- [ ] `load` uses the injected `fetch` argument; independent fetches start before `await parent()`.\n- [ ] Slow non-critical data is streamed via returned promises, with `.catch()` on any promise not from the injected `fetch`.\n\n## Remote functions (if used)\n- [ ] Both `experimental.remoteFunctions` and `experimental.async` flags are set; functions live in `*.remote.ts`.\n- [ ] Every argument-taking remote function validates input with a Standard Schema (Zod / Valibot).\n- [ ] API usage matches the installed SvelteKit version (no removed `.run()`; correct `enhance` callback shape).\n",
      "skillTags": [
        "sveltekit",
        "svelte5",
        "code-review",
        "ssr",
        "runes",
        "remote-functions"
      ]
    }
  ]
};
