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
      "summary": "Every framework component stays static HTML unless a client:* directive proves it must be interactive.",
      "body": "Astro renders UI framework components to static HTML by default and ships zero JavaScript for them. A `client:*` directive is a performance contract, not boilerplate. Default to no directive and add the lightest one only when interaction is actually required.\n\n- Reserve `client:load` for above-the-fold controls that must be interactive immediately. Use `client:visible` for below-the-fold widgets and `client:idle` for low-priority ones.\n- Treat `client:only` as a last resort. It skips server rendering, hurts SEO, and removes the static HTML fallback.\n- Split large interactive components so only the truly dynamic part hydrates, keeping the rest as static `.astro` markup.\n- Pass a `rootMargin` to `client:visible` for heavy components to hydrate them just before they scroll into view and reduce layout shift.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src/content",
      "title": "Define every collection with a loader and a Zod schema",
      "summary": "Content lives in the Content Layer API with a loader and validated schema, never raw file reads.",
      "body": "In Astro 5 content collections use the Content Layer API. Each collection is declared in `src/content.config.ts` with an explicit `loader` and a Zod `schema`, so frontmatter is validated at build time and queries are fully typed.\n\n- Use the built-in `glob()` or `file()` loader for local Markdown, MDX, JSON, and YAML. Use a custom or community loader for CMS, API, or database sources.\n- Always give the collection a `schema` so `getCollection()` and `getEntry()` return typed, validated data and bad frontmatter fails the build.\n- Query content only through `getCollection()` / `getEntry()`. Do not read files with `fs` or `import.meta.glob`.\n- For very large stores, set `retainBody: false` on the loader to shrink the deployed data store and avoid size limits.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/pages",
      "title": "Rendering modes: static by default, server islands for the dynamic bits",
      "summary": "Keep pages prerendered and isolate personalized content into server:defer islands.",
      "body": "Astro pages are statically prerendered by default. Keep them that way so the shell can be cached aggressively, and push only the dynamic parts to the edges.\n\n- Mark personalized or per-request fragments (avatar, cart, recommendations) with `server:defer` so they render in their own request without blocking the cached page.\n- Provide a `slot=\"fallback\"` for each server island so users see meaningful placeholder markup until the island resolves.\n- Reach for full on-demand SSR (`export const prerender = false`) only when an entire route is dynamic. Prefer server islands on otherwise-static pages.\n- Server islands need an SSR adapter configured, even when most of the site is static."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "View Transitions and navigation polish without a framework",
      "summary": "Use the native View Transitions API via the ClientRouter for smooth navigation.",
      "body": "Astro supports the native View Transitions API for animated, app-like navigation without adding a client-side framework. Add the `<ClientRouter />` component to a shared layout head to enable it site-wide.\n\n- Persist stateful elements across navigations with `transition:persist` (for example a video player or audio element).\n- Name matched elements with `transition:name` so Astro animates them between pages, and tune motion with `transition:animate`.\n- The router enhances real navigations progressively. Pages still work as full document loads when the API is unavailable, so do not depend on it for correctness.\n- Keep transitions subtle and respect `prefers-reduced-motion`; heavy animations undercut the speed Astro is chosen for."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "astro-review",
      "summary": "Pre-merge checklist for Astro 5 pages, islands, and content collections.",
      "body": "---\nname: astro-review\ndescription: Review checklist for Astro 5 work covering hydration directives, the Content Layer API, server islands, rendering mode, and view transitions before merging.\n---\n\n# Astro review\n\n- [ ] Framework components render static HTML by default; every `client:*` directive is justified and uses the lightest option (`visible`/`idle` over `load`).\n- [ ] No stray `client:only` that drops server rendering and the static fallback.\n- [ ] Content is read through `getCollection()` / `getEntry()`, never raw `fs` or `import.meta.glob`.\n- [ ] Each collection in `src/content.config.ts` has an explicit `loader` and a Zod `schema`.\n- [ ] Pages stay prerendered by default; `prerender = false` is used only for fully dynamic routes.\n- [ ] Personalized fragments use `server:defer` with a `slot=\"fallback\"`, and an SSR adapter is configured.\n- [ ] Large content stores set `retainBody: false` when bodies are not needed at runtime.\n- [ ] View Transitions go through `<ClientRouter />`; `transition:persist` and `transition:name` are applied where state or motion continuity matters.\n- [ ] Animations respect `prefers-reduced-motion`.\n- [ ] No unnecessary JavaScript shipped; the page works with scripts disabled where it reasonably should.\n",
      "skillTags": [
        "astro",
        "islands",
        "content-collections",
        "ssr",
        "performance",
        "review"
      ]
    }
  ]
};
