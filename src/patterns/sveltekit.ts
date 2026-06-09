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
      "body": "Any data that needs secrets, cookies, a database, or private APIs belongs in a server load function, not a universal one.\n\n- Use `+page.server.ts` / `+layout.server.ts` for `load` that touches `$env/static/private`, `$env/dynamic/private`, `cookies`, or `locals`.\n- Reserve `+page.ts` / `+layout.ts` (universal) for public external APIs and non-serializable returns like component constructors.\n- Never import anything from `$lib/server` or a `$env/.../private` module into universal load or client code. Vite will refuse to build it, and that signal means the logic is in the wrong file.\n- When both load functions exist on a route, the server load runs first and its result reaches the universal load via `data`. Universal output cannot flow back to the server.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Mutations go through form actions or remote form/command, not load",
      "summary": "Use form actions or remote functions for writes; load is read-only and reruns on navigation.",
      "body": "`load` functions are for reading data and must stay side-effect free, because SvelteKit can rerun them on navigation, invalidation, and SSR.\n\n- Handle writes with named `actions` in `+page.server.ts` and `<form method=\"POST\">`, or with experimental remote `form` / `command` functions, so they are progressively enhanced and type-safe.\n- Validate input server-side and return `fail(status, data)` on validation errors; return a serializable object on success.\n- Use `enhance` for client-side progressive enhancement instead of hand-rolled `fetch`, and trigger `invalidate` / `invalidateAll` to refresh affected `load` data after a mutation.\n- Do not perform POST/PUT/DELETE logic inside a `load` function or call mutating remote `command`s from one.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Svelte 5 runes are the default; classes replace stores",
      "summary": "Prefer $state/$derived/$effect/$props; use reactive classes in $lib over writable stores.",
      "body": "This codebase targets Svelte 5, so reactivity is rune-based, not store-based.\n\n- Use `$state` for mutable reactive values, `$derived` (or `$derived.by`) for computed values, `$effect` only for genuine side effects, and `$props` for component inputs.\n- Reach for `$state` only when a value drives the UI. Plain `const`/`let` is cheaper and clearer for everything else.\n- For shared logic, write a reactive class in `$lib` that uses `$state`/`$derived` on its fields and import it, instead of authoring `writable`/`readable` stores. Runes work inside plain `.svelte.ts` modules and classes.\n- Avoid `$:` reactive statements and the implicit let-is-reactive model from Svelte 4. They do not exist in runes mode."
    },
    {
      "kind": "memory",
      "nodePath": "/src/routes",
      "title": "Avoid load waterfalls; stream non-critical data",
      "summary": "Fire independent fetches before await parent(); return unawaited promises for slow, non-essential data.",
      "body": "Load performance hinges on not serializing requests that could run in parallel.\n\n- Start independent `fetch` calls before `await parent()` so they do not block on parent data they do not need.\n- Return unresolved promises from a server `load` for non-essential data; SvelteKit streams them to the client so the page renders before they settle.\n- Attach `.catch()` to any streamed promise that does not use SvelteKit's enhanced `fetch`, or an unhandled rejection can crash the response.\n- Use the injected `fetch` argument inside `load` (not global `fetch`) so SvelteKit forwards credentials, resolves relative URLs, and tracks the request as a dependency for `invalidate`. Call `depends('app:key')` for custom clients that bypass `fetch`."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "sveltekit-review",
      "summary": "Pre-merge checklist for SvelteKit 2 routes: data boundaries, secrets, runes, and mutations.",
      "body": "---\nname: sveltekit-review\ndescription: Review a SvelteKit 2 (Svelte 5) change before merge - verify load placement, secret isolation, runes usage, form actions, and load performance. Use when reviewing or authoring routes, load functions, form actions, or shared $lib reactivity.\n---\n\n# SvelteKit review\n\n- [ ] Secrets, DB access, cookies, and `locals` only appear in `+page.server.ts` / `+layout.server.ts`, never in universal load or client code.\n- [ ] No `$lib/server` or `$env/.../private` import reaches a `+page.ts`, `+layout.ts`, or component.\n- [ ] Universal `load` returns only serializable data or intentional non-serializable values (components/classes); server `load` returns serializable data only.\n- [ ] `load` functions are read-only; all writes go through `actions` or remote `form`/`command`.\n- [ ] Form actions validate input server-side and use `fail(status, data)` for errors; `<form>` uses `enhance` for progressive enhancement.\n- [ ] Data is refreshed after mutations via `invalidate` / `invalidateAll` rather than manual refetch.\n- [ ] Reactivity uses runes (`$state`, `$derived`, `$effect`, `$props`); no `$:` statements or new `writable`/`readable` stores where a reactive class fits.\n- [ ] `$effect` is used only for true side effects, not for deriving values that `$derived` should compute.\n- [ ] `load` uses the injected `fetch` argument; independent fetches start before `await parent()`.\n- [ ] Slow non-critical data is streamed via returned promises with `.catch()` handlers where needed.\n",
      "skillTags": [
        "sveltekit",
        "svelte5",
        "code-review",
        "ssr",
        "runes"
      ]
    }
  ]
};
