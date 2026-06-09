import type { Pattern } from "../types.js";

export const shadcnUi: Pattern = {
  "slug": "shadcn-ui",
  "version": "1.0.0",
  "name": "shadcn/ui",
  "tagline": "Own your component code and theme it with CSS variables instead of installing a black-box UI library.",
  "description": "shadcn/ui is a code distribution system that copies accessible, Tailwind-styled React components straight into your repo via a CLI and registries, so you own and edit every line. This pattern keeps your team aligned on theming through CSS variables, safe component composition, and the CLI and registry workflow. It encodes the current 2026 conventions: Tailwind v4, the unified Radix UI package, namespaced registries, and the shadcn MCP server.",
  "category": "Frontend",
  "icon": "blocks",
  "color": "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "shadcn/ui pattern for AI coding agents | Pathrule",
  "metaDescription": "Teach your AI agent the right shadcn/ui workflow: CSS-variable theming, component composition, the shadcn CLI v4, and namespaced registries for Tailwind v4 projects.",
  "problem": "AI agents treat shadcn/ui like an npm package, hand-editing generated primitives and hardcoding colors instead of theming through CSS variables.",
  "audience": "React and Next.js teams using shadcn/ui with Tailwind v4",
  "prevents": [
    "Importing shadcn/ui as a runtime dependency instead of copying components into the repo",
    "Hardcoding hex colors or Tailwind palette classes instead of using semantic CSS-variable tokens",
    "Forking generated primitives by editing them in place instead of composing new components around them"
  ],
  "appliesTo": {
    "paths": [
      "/src/components/ui",
      "/src/components",
      "/src/app",
      "/app"
    ],
    "stacks": [
      "react",
      "nextjs",
      "tailwindcss",
      "typescript",
      "radix-ui"
    ],
    "packages": [
      "shadcn",
      "tailwindcss",
      "radix-ui",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/components/ui",
      "title": "Treat /components/ui as generated, composable code",
      "summary": "Add and update primitives through the CLI; compose around them rather than rewriting them.",
      "body": "Files under `components/ui` are owned by the shadcn registry workflow, not hand-authored from scratch.\n\n- Add or update a primitive with `npx shadcn@latest add <component>` instead of writing it by hand, so dependencies and registry metadata stay correct.\n- Before re-running `add`, review changes with the `--diff` and `--dry-run` flags so local customizations are not silently overwritten.\n- When you need new behavior, build a feature component in `components/` that imports the primitive; do not fork the primitive in place.\n- Keep the `cn` helper from `lib/utils` (`clsx` + `tailwind-merge`) as the only class-merging utility so variant overrides resolve predictably."
    },
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Theme only through semantic CSS variables",
      "summary": "Style with token classes like bg-background and text-primary, never raw hex or palette colors.",
      "body": "shadcn/ui themes via semantic CSS variables defined in your global stylesheet, and every color must flow through them.\n\n- Use semantic utility classes (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`) instead of `bg-white`, `text-zinc-900`, or hex values.\n- Define and adjust the palette by editing the `--background`, `--foreground`, `--primary`, and related CSS variables in your global CSS, not by sprinkling colors across components.\n- Provide both `:root` and `.dark` blocks so dark mode resolves from the same token names; never branch with `dark:bg-[#...]` hardcodes.\n- With Tailwind v4 leave `tailwind.config` blank in `components.json` and rely on the `@import` driven setup and `@theme` tokens.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "How shadcn/ui actually works in this repo",
      "summary": "Components are copied into the codebase via CLI and registries; nothing is imported from a UI package.",
      "body": "shadcn/ui is a code distribution system, not a component dependency, so the source of truth lives in our own files.\n\n- Running the CLI copies component source into `components/ui` and wires aliases from `components.json` (`components`, `ui`, `lib`, `utils`, `hooks`); there is no `@shadcn/ui` runtime import.\n- As of 2026 primitives sit on the unified `radix-ui` package (single import surface) styled with Tailwind v4 and `class-variance-authority` variants.\n- The `components.json` `style` is `new-york` and `baseColor` picks the token palette (`neutral`, `stone`, `zinc`, `mauve`, and similar); `cssVariables: true` is what enables semantic-token theming.\n- Treat the `cn` helper, the CSS-variable tokens, and the registry-managed primitives as the three pillars: edit tokens for theme, compose for features, re-run the CLI for upstream fixes."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "CLI v4, namespaced registries, and the MCP server",
      "summary": "Use the v4 CLI plus namespaced registries and the shadcn MCP server to add and discover components.",
      "body": "The shadcn CLI v4 plus registries are how we install and extend UI; learn the workflow before adding components.\n\n- Core commands: `init` (scaffolds and writes `components.json`), `add`, `search`, `view`, `build`, plus `info` and `docs` for inspecting installed components and reading their docs.\n- Namespaced registries let you install with `@registry/name` syntax; declare them in `components.json` under `registries`, for example `\"@acme\": \"https://acme.com/r/{name}.json\"`, and use header-based auth with env vars for private registries.\n- Pin private or pro registries to a tag or digest in the URL so installs are reproducible, and prefer kebab-case item names with accurate `registryDependencies`.\n- The shadcn MCP server (`npx shadcn@latest mcp init --client claude`) lets an agent search, preview, and add components across configured registries in natural language with zero extra config."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "shadcn-ui-review",
      "summary": "Pre-merge checklist for shadcn/ui changes covering theming, composition, and the CLI workflow.",
      "body": "---\nname: shadcn-ui-review\ndescription: Review a shadcn/ui change before merge. Verifies CSS-variable theming, component composition over forking, correct CLI and registry usage, and accessibility. Use when adding or editing components under components/ui or any UI built on shadcn primitives.\n---\n\n# shadcn/ui review\n\n- [ ] No `@shadcn/ui` or external UI-library runtime imports; primitives live in `components/ui` and were added via the CLI.\n- [ ] Colors use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`) with no hardcoded hex or raw palette classes.\n- [ ] Theme changes were made by editing CSS variables in global CSS, with matching `:root` and `.dark` blocks.\n- [ ] New behavior is composed in `components/` around primitives rather than forking the generated primitive.\n- [ ] Class merging goes through the `cn` helper so variant overrides resolve via `tailwind-merge`.\n- [ ] `components.json` is intact: Tailwind v4 `tailwind.config` blank, `cssVariables: true`, aliases unchanged.\n- [ ] Registry installs use correct namespaces and pinned versions; private registries authenticate via env-var headers.\n- [ ] Accessibility preserved: Radix primitive props, `aria-*`, focus states, and keyboard interaction are not stripped.\n- [ ] Dark mode and both color schemes verified visually for the changed components.\n",
      "skillTags": [
        "shadcn",
        "react",
        "tailwind",
        "theming",
        "ui-review"
      ]
    }
  ]
};
