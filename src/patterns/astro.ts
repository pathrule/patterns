import type { Pattern } from "../types.js";

export const astro: Pattern = {
  "slug": "astro",
  "version": "1.0.0",
  "name": "Astro",
  "tagline": "Ship content-first sites that send almost no JavaScript by default.",
  "description": "A pattern bundle for Astro 5 projects built around islands architecture, the Content Layer API, and server islands. It keeps agents disciplined about partial hydration, schema-validated content, and the static-first render model so pages stay fast and predictable. Use it for content-driven sites, marketing pages, docs, and blogs that mix static output with a few interactive islands.",
  "category": "Framework",
  "icon": "rocket",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Astro pattern for AI coding agents | Pathrule",
  "metaDescription": "Pathrule's Astro pattern teaches AI coding agents islands architecture, the Content Layer API, server islands, and disciplined partial hydration for fast sites.",
  "problem": "Agents reach for client-side hydration and unvalidated content by default, bloating Astro pages with JavaScript and runtime errors.",
  "audience": "Teams building content-driven Astro sites: marketing pages, docs, blogs, and commerce fronts.",
  "prevents": [
    "Slapping client:load on every interactive component and shipping needless JavaScript",
    "Reading content with raw fs or import.meta.glob instead of schema-validated content collections",
    "Blocking the whole page on a slow personalized request instead of deferring it to a server island"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/src/components",
      "/src/content",
      "/src/pages"
    ],
    "stacks": [
      "astro",
      "typescript",
      "islands-architecture",
      "ssr",
      "content-driven"
    ],
    "packages": [
      "astro",
      "@astrojs/react",
      "@astrojs/mdx",
      "@astrojs/sitemap",
      "zod"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Hydrate islands intentionally, never by reflex",
      "summary": "UI framework components stay static HTML unless a client:* directive proves they must be interactive, and then use the lightest one.",
      "body": "Astro renders UI framework components (React, Vue, Svelte, Solid, Preact) to static HTML by default and ships zero JavaScript for them. A `client:*` directive is a performance contract, not boilerplate. Default to no directive and add the lightest one only when interaction is genuinely required.\n\n- `client:load` is high priority: hydrates immediately on page load. Reserve it for above-the-fold controls that must work the instant the page paints.\n- `client:idle` is medium priority: hydrates after the page finishes loading via `requestIdleCallback`. Pass `client:idle={{ timeout: 500 }}` to cap how long it may wait.\n- `client:visible` is low priority: hydrates when the element scrolls into view via `IntersectionObserver`. For heavy below-the-fold components pass `client:visible={{ rootMargin: \"200px\" }}` so they hydrate just before they appear and avoid layout shift.\n- `client:media=\"(max-width: 50em)\"` hydrates only when the media query matches; use it for controls that only exist at certain breakpoints.\n- Treat `client:only=\"react\"` as a last resort. It skips server rendering entirely, which hurts SEO and removes the static HTML fallback. Provide a `slot=\"fallback\"` when you must use it.\n- Split large interactive components so only the truly dynamic part hydrates and the surrounding markup stays static `.astro` output.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src/content",
      "title": "Every build-time collection needs a loader and a Zod schema",
      "summary": "Build-time content is declared in src/content.config.ts with an explicit loader plus a Zod schema, and queried only through getCollection/getEntry.",
      "body": "Astro's legacy content collections API was removed in Astro 6. All build-time collections use the Content Layer API, declared in `src/content.config.ts` with an explicit `loader` and a Zod `schema` so frontmatter is validated at build time and queries are fully typed.\n\n- Import `z` from `astro/zod` and the loaders from `astro/loaders`. Astro 6 bundles Zod v4, so use the v4 API for custom refinements and error maps.\n- Use the built-in `glob()` loader for a directory of Markdown, MDX, JSON, YAML, or TOML files, and `file()` to load many entries from a single local file. Point them at a `base` directory and a `pattern`.\n- Use a custom or community loader for CMS, API, or database sources that are known at build time.\n- Always declare a `schema`. It makes `getCollection()` and `getEntry()` return typed, validated data and makes bad frontmatter fail the build instead of leaking to runtime.\n- Link collections to each other with the `reference()` helper rather than hardcoding ids.\n- Query content only through `getCollection()` / `getEntry()` from `astro:content`, and render Markdown bodies through the entry's `render()`. Never read collection files with `fs` or a glob import.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Do not use APIs removed in Astro 6",
      "summary": "Astro.glob(), the ViewTransitions component, emitESMImage(), and the legacy src/content/config.ts no longer exist.",
      "body": "Astro 6 removed several long-deprecated APIs. Using them silently breaks the build or behaves unexpectedly, and agents trained on older Astro frequently reach for them.\n\n- `Astro.glob()` is removed. Use Vite's `import.meta.glob()` for arbitrary files, and `getCollection()` for content collections.\n- The `<ViewTransitions />` component is removed. Use `<ClientRouter />` from `astro:transitions` instead. Also drop the `handleForms` prop if you carried it over; form handling is on by default.\n- `emitESMImage()` is removed from the image pipeline.\n- The content config no longer lives at `src/content/config.ts`. It must be `src/content.config.ts` at the `src` root, and config files cannot be `.cjs` or `.cts`.\n- Astro 6 requires Node 22.12.0 or newer and runs on Vite 7. Do not pin Node 18 or 20 in CI or engines.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/pages",
      "title": "Rendering model: static by default, server islands for the dynamic bits",
      "summary": "Keep pages prerendered and isolate personalized fragments into server:defer islands instead of making whole routes dynamic.",
      "body": "Astro pages are statically prerendered by default. Keep them that way so the page shell can be cached aggressively, and push only the per-request parts to their own server-rendered islands.\n\n- Mark personalized or per-request fragments (avatar, cart count, recommendations, A/B variant) with `server:defer` so each renders in its own request without blocking the cached page. The island is effectively a serverless function that returns HTML.\n- Give every server island a `slot=\"fallback\"`. The fallback ships in the initial HTML and is swapped for the real content once the island resolves, so users never see an empty hole.\n- Reach for full on-demand SSR (`export const prerender = false`) only when an entire route is dynamic. On an otherwise-static page, prefer one or more server islands over making the whole route dynamic.\n- Server islands and SSR routes both require an SSR adapter (Node, Netlify, Vercel, Cloudflare) configured in `astro.config`, even when the rest of the site is static. There is no adapter needed in `astro dev`, so this gap only surfaces at deploy time."
    },
    {
      "kind": "memory",
      "nodePath": "/src/content",
      "title": "Build-time collections vs live collections: pick the right one",
      "summary": "src/content.config.ts is for content known at build; src/live.config.ts (new in Astro 6) is for data fetched per request.",
      "body": "Astro 6 added Live Content Collections alongside the existing build-time collections. They share the content layer mental model but are separate APIs with separate config files, and mixing them up is the most common new-in-6 mistake.\n\n- Build-time collections live in `src/content.config.ts`, are validated and frozen at build, and are queried with `getCollection()` / `getEntry()`. Use them for blog posts, docs, marketing copy, anything that can be baked into the deploy.\n- Live collections live in a separate `src/live.config.ts`, fetch at request time, and are queried with `getLiveCollection()` / `getLiveEntry()` from `astro:content`. Use them for inventory, prices, feeds, scores, anything that must be fresh on every request.\n- There are no built-in live loaders. A live loader is a custom object with a `name`, a `loadCollection` method returning an array, and a `loadEntry` method returning one item. This is different from the build-time loader's single `load` method.\n- Live collections run per request, so a route that uses one is dynamic and needs an SSR adapter. Do not default to live collections for content that rarely changes; the build-time path is faster and cacheable.\n\nSee /src/pages for how dynamic data interacts with the static-first rendering model."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "View Transitions and navigation polish without a framework",
      "summary": "Enable the native View Transitions API with <ClientRouter /> in a shared layout; it progressively enhances real navigations.",
      "body": "Astro supports the native View Transitions API for animated, app-like navigation without adding a client-side framework. Add `<ClientRouter />` (from `astro:transitions`, imported into a shared layout head) to enable it site-wide. Note this is `<ClientRouter />`, not the old `<ViewTransitions />`, which was removed in Astro 6.\n\n- Persist stateful elements across navigations with `transition:persist` (for example a playing video or audio element, or a sidebar's scroll position).\n- Name matched elements with `transition:name` so Astro animates them between pages, and tune motion with `transition:animate`.\n- The router enhances real navigations progressively. Pages still work as full document loads when the API is unavailable, so never depend on the router for correctness, only for polish.\n- Keep transitions subtle and respect `prefers-reduced-motion`. Heavy animations undercut the speed Astro is chosen for.\n- Re-run scripts on client-side navigations with the `astro:page-load` event; a plain `DOMContentLoaded` listener fires only on the first full load."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "astro-review",
      "summary": "Pre-merge checklist for Astro 6 pages, islands, content collections, and view transitions.",
      "body": "---\nname: astro-review\ndescription: Review checklist for Astro 6 work covering hydration directives, the Content Layer API, build-time vs live collections, server islands, rendering mode, removed APIs, and view transitions before merging.\n---\n\n# Astro review\n\n## Hydration and shipped JavaScript\n- [ ] Framework components render static HTML by default; every `client:*` directive is justified and uses the lightest option (`visible`/`idle`/`media` over `load`).\n- [ ] Heavy `client:visible` components pass a `rootMargin` to hydrate just before they appear.\n- [ ] No stray `client:only` that drops server rendering and the static fallback; where used, a `slot=\"fallback\"` exists.\n- [ ] No unnecessary JavaScript ships; the page works with scripts disabled where it reasonably should.\n\n## Content collections\n- [ ] Build-time content is declared in `src/content.config.ts` with an explicit `loader` and a Zod `schema` (Zod v4 API, `z` from `astro/zod`).\n- [ ] Content is read through `getCollection()` / `getEntry()`, never raw `fs`, `import.meta.glob`, or the removed `Astro.glob()`.\n- [ ] Cross-collection links use `reference()`.\n- [ ] Live data uses `src/live.config.ts` + `getLiveCollection()` / `getLiveEntry()`, not a build-time collection; rarely-changing content stays build-time.\n\n## Rendering and deployment\n- [ ] Pages stay prerendered by default; `prerender = false` is used only for fully dynamic routes.\n- [ ] Personalized fragments use `server:defer` with a `slot=\"fallback\"`.\n- [ ] An SSR adapter is configured if any route uses SSR, a server island, or a live collection (works in dev without one, fails at deploy).\n\n## Astro 6 removed APIs and view transitions\n- [ ] No `Astro.glob()`, no `<ViewTransitions />`, no `emitESMImage()`, no `src/content/config.ts`, no `.cjs`/`.cts` config.\n- [ ] Node engine is 22.12.0+; project builds on Vite 7.\n- [ ] View Transitions go through `<ClientRouter />`; `transition:persist` and `transition:name` are applied where state or motion continuity matters.\n- [ ] Navigation-dependent scripts listen for `astro:page-load`, and animations respect `prefers-reduced-motion`.\n",
      "skillTags": [
        "astro",
        "astro6",
        "islands",
        "content-collections",
        "ssr",
        "performance",
        "review"
      ]
    }
  ]
};
