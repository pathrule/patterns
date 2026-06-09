import type { Pattern } from "../types.js";

export const nextjsAppRouter: Pattern = {
  slug: "nextjs-app-router",
  version: "1.0.0",
  name: "Next.js App Router",
  tagline:
    "Battle-tested conventions for a Next.js App Router codebase, scoped to the paths they belong to.",
  description:
    "Rules, memories, and a review skill for teams building on the Next.js App Router. Each piece is pre-scoped so your AI assistant applies it only where it is relevant: server and client boundaries, caching, and secret safety in the app directory, plus a route review checklist at the root.",
  category: "Framework",
  icon: "layout-panel-left",
  color: "text-blue-600 dark:text-blue-400",
  installs: 0,
  updatedAt: "2026-06-09",
  changelog: [{ version: "1.0.0", date: "2026-06-09", note: "First release." }],
  metaTitle: "Next.js App Router patterns for AI coding agents",
  metaDescription:
    "A ready-to-use Pathrule pattern for Next.js App Router projects: server-component defaults, caching policy, secret safety, and a route review skill, scoped to the right paths.",
  appliesTo: {
    paths: ["/app", "/apps/web", "/src/app"],
    stacks: ["nextjs", "react"],
    packages: ["next"],
  },
  pieces: [
    {
      kind: "rule",
      nodePath: "/app",
      title: "Server Components by default",
      summary: "Add 'use client' only when a component truly needs interactivity.",
      body: "Components under the `app` directory are Server Components by default.\n\n- Add `'use client'` only for components that use state, effects, refs, or browser APIs.\n- Fetch data in Server Components and pass plain, serializable props down.\n- Push the client boundary as far down the tree as possible so most of the page stays server-rendered.",
      scopeType: "folder",
      priority: "high",
      enforcement: "advisory",
    },
    {
      kind: "rule",
      nodePath: "/app",
      title: "Never leak server secrets to the client",
      summary: "Server-only env and modules must not be imported by client components.",
      body: "Only `NEXT_PUBLIC_` variables may reach the client bundle.\n\n- Never import a server-only module, database client, or secret-bearing config from a `'use client'` file.\n- Use the `server-only` package so the build fails if a server module is imported client-side.\n- Keep API keys and tokens in Server Components, Route Handlers, or Server Actions.",
      scopeType: "folder",
      priority: "high",
      enforcement: "strict",
    },
    {
      kind: "memory",
      nodePath: "/app",
      title: "Route segment config conventions",
      summary: "Where we set revalidate, dynamic, and runtime, and why.",
      body: "Caching is set at the segment level, not scattered per fetch.\n\n- Use `export const revalidate` when the whole segment shares a freshness need.\n- Default runtime is `nodejs`.\n- Any `export const dynamic = 'force-dynamic'` carries a one-line comment explaining why the segment cannot be cached.\n- Prefer fetch-level cache options for mixed-freshness pages.",
    },
    {
      kind: "memory",
      nodePath: "/app",
      title: "Data fetching and caching policy",
      summary: "Fetch on the server, cache deliberately, revalidate by tag.",
      body: "Fetch on the server, cache deliberately, revalidate by tag.\n\n- Fetch in Server Components or Route Handlers, never in client effects.\n- Set explicit `cache` and `next.revalidate` options on `fetch`.\n- Use `revalidateTag` for targeted invalidation after mutations.\n- Start independent requests in parallel to avoid waterfalls.",
    },
    {
      kind: "skill",
      nodePath: "/",
      title: "nextjs-route-review",
      summary: "Checklist for reviewing a new App Router route.",
      body: "---\nname: nextjs-route-review\ndescription: Review a new Next.js App Router route for correctness, caching, and safety.\n---\n\n# Next.js route review\n\nRun this before merging a new route or layout.\n\n- [ ] Server vs client boundary is minimal and correct ('use client' only where needed)\n- [ ] No server-only module or secret is reachable from a client component\n- [ ] Caching and revalidate are intentional and documented\n- [ ] loading.tsx and error.tsx exist where the route fetches data\n- [ ] generateMetadata or static metadata is exported for SEO\n- [ ] Dynamic params are validated and not trusted blindly\n- [ ] Mutations use Server Actions or Route Handlers, and revalidate the right tags\n",
      skillTags: ["nextjs", "review"],
    },
  ],
};
