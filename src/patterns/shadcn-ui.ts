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
      "title": "Treat /components/ui as registry-owned, composable code",
      "summary": "Add and update primitives through the shadcn CLI; compose around them instead of forking or hand-editing them.",
      "body": "Files under `components/ui` are owned by the shadcn registry workflow, not authored or rewritten by hand.\n\n- Add or update a primitive with `npx shadcn@latest add <component>` so registry dependencies, imports, and metadata stay correct. Do not write a primitive from scratch.\n- Before re-running `add` on an already-installed primitive, preview with `--dry-run` (shows what the registry will write) and `--diff` (compares against your local changes) so customizations are not silently overwritten.\n- When you need new behavior, build a feature component in `components/` that imports and wraps the primitive. Do not fork the primitive in place. Forked primitives drift from upstream a11y and security fixes and break future `add`/`migrate` runs.\n- Route every class merge through the `cn` helper in `lib/utils` (`clsx` + `tailwind-merge`). Concatenating class strings by hand defeats `tailwind-merge` conflict resolution and makes variant overrides resolve unpredictably.\n- Do not strip Radix primitive props, `aria-*` attributes, `data-*` state hooks, or focus/keyboard handlers when wrapping. Those carry the accessibility contract.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Theme only through semantic CSS-variable tokens",
      "summary": "Style with token classes like bg-background and text-primary; never raw hex, arbitrary values, or palette classes.",
      "body": "shadcn/ui themes via semantic CSS variables defined in your global stylesheet. Every color must flow through them.\n\n- Use semantic utility classes (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `text-muted-foreground`) instead of `bg-white`, `text-zinc-900`, `bg-[#fff]`, or arbitrary `dark:bg-[#...]` values.\n- Adjust the palette by editing the `--background`, `--foreground`, `--primary`, `--muted`, `--border`, and related variables in your global CSS, not by sprinkling colors across components.\n- Keep the `:root` and `.dark` blocks in sync so dark mode resolves from the same token names. A token defined in `:root` but missing in `.dark` (or vice versa) is the most common cause of broken dark mode.\n- With Tailwind v4, leave `tailwind.config` blank in `components.json` and rely on the CSS-first `@import`/`@theme` setup. Reintroducing a JS theme config alongside v4 CSS tokens produces two competing sources of truth.\n- Keep `cssVariables: true` in `components.json`. Setting it to `false` switches to utility-class theming and silently breaks the semantic-token model the rest of the codebase assumes.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "How shadcn/ui actually works in this repo",
      "summary": "Components are copied into our codebase via the CLI and registries; nothing is imported from a UI runtime package.",
      "body": "shadcn/ui is a code-distribution system, not a component dependency. The source of truth for every component lives in our own files.\n\n- Running the CLI copies component source into `components/ui` and resolves aliases from `components.json` (`components`, `ui`, `lib`, `utils`, `hooks`). There is no `@shadcn/ui` runtime import and no such package to add to `package.json`.\n- As of 2026 the `new-york` style imports primitives from the unified `radix-ui` package (single import surface, e.g. `import { Dialog as DialogPrimitive } from \"radix-ui\"`) instead of many `@radix-ui/react-*` packages. The legacy default style is deprecated; use `new-york`.\n- Variants are built with `class-variance-authority`; the `baseColor` in `components.json` (`neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist`, `taupe`) seeds the token palette, and `cssVariables: true` is what enables semantic-token theming.\n- The three pillars: edit CSS-variable tokens to change theme, compose feature components around primitives, and re-run the CLI to pull upstream fixes. Treat `cn`, the token set, and registry-managed primitives as immutable plumbing.\n\nSee also: `/src/components` for the CLI v4 + registry + MCP workflow, and `/src/app` for the Tailwind v4 CSS-first theming setup."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "CLI v4 workflow, namespaced registries, and the MCP server",
      "summary": "Use the v4 CLI commands, namespaced registries, and the shadcn MCP server to add, inspect, and discover components.",
      "body": "The shadcn CLI v4 (2026) plus registries are how we install and extend UI. Learn the workflow before adding components.\n\n- Core commands: `init` (scaffolds and writes `components.json`; supports `--template`, `--base` to pick Radix or Base UI, `--monorepo`), `add`, `search`, `view`, `build`, plus `info` (prints framework, Tailwind version, CSS-vars setting, aliases, and installed components) and `docs` (returns component docs, examples, and API directly from the CLI).\n- `info --json` is the canonical way to read this project's resolved config; prefer it over guessing paths or framework. The shadcn skill activates off the presence of `components.json`.\n- Namespaced registries install with `@namespace/name` syntax. Declare them in `components.json` under `registries`, e.g. `\"@acme\": \"https://registry.acme.com/{name}.json\"`; `{name}` is replaced at install time. For private registries, add `headers` with `${ENV_VAR}` expansion (e.g. `\"Authorization\": \"Bearer ${REGISTRY_TOKEN}\"`) and never commit the token.\n- Registries can ship whole design systems in one payload via `registry:base` (components + deps + CSS vars + fonts + config), and fonts are first-class via `registry:font`. Pin private/pro registry URLs to a tag or digest so installs are reproducible; use kebab-case item names with accurate `registryDependencies`.\n- The shadcn MCP server (`npx shadcn@latest mcp init --client claude`) reads `components.json` and lets an agent search, preview (`view`), and add components across configured registries from natural language. Manual config lives in `.mcp.json` (Claude Code), `.cursor/mcp.json`, or `.vscode/mcp.json`."
    },
    {
      "kind": "memory",
      "nodePath": "/src/app",
      "title": "Tailwind v4 CSS-first setup is the main shadcn footgun",
      "summary": "globals.css drives everything in v4: tw-animate-css, @custom-variant dark, @theme inline, and hsl()-wrapped tokens.",
      "body": "Tailwind v4 moved theming into CSS, and most shadcn breakage comes from getting `globals.css` wrong. The current setup:\n\n- `@import \"tailwindcss\";` then `@import \"tw-animate-css\";`. `tailwindcss-animate` (the v3 PostCSS plugin) is deprecated and replaced by `tw-animate-css`; new shadcn projects install it by default. If animations/transitions silently stop working, this import is usually missing or still pointing at the old plugin.\n- Dark mode is enabled with `@custom-variant dark (&:is(.dark *));` in `globals.css`, not via `darkMode` in a JS config. Without this line `dark:` variants resolve to nothing.\n- Map CSS variables to Tailwind tokens with `@theme inline { ... }` so utilities like `bg-background` exist. Color values are wrapped in `hsl()` (e.g. `--background: hsl(...)`) and referenced through the `@theme inline` block.\n- `tailwind.config` stays blank in `components.json`; there is no `tailwind.config.js`/`.ts` to edit for theme in v4. Do not recreate one to \"fix\" tokens, set them in CSS.\n- Define every token in both `:root` and `.dark`. A token present in one block but not the other is the top cause of half-broken dark mode.\n- When migrating an existing project's primitives to the unified Radix package, run `npx shadcn@latest migrate radix` (append a path like `src/components/custom` for non-standard directories) rather than rewriting imports by hand."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "shadcn-ui-review",
      "summary": "Pre-merge checklist for shadcn/ui changes: distribution model, theming, composition, CLI/registry usage, and a11y.",
      "body": "---\nname: shadcn-ui-review\ndescription: Review a shadcn/ui change before merge. Verifies the code-distribution model, CSS-variable theming, composition over forking, correct CLI v4 and registry usage, Tailwind v4 setup, and accessibility. Use when adding or editing components under components/ui or any UI built on shadcn primitives.\n---\n\n# shadcn/ui review\n\n## Distribution model\n- [ ] No `@shadcn/ui` or external UI-library runtime import; primitives live in `components/ui` and were added via `npx shadcn@latest add`.\n- [ ] `new-york` style; primitives import from the unified `radix-ui` package, not legacy `@radix-ui/react-*` (run `migrate radix` if mixed).\n\n## Theming\n- [ ] Colors use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`) with no hex, arbitrary `[#...]`, or raw palette classes.\n- [ ] Theme edits were made in CSS variables, with every token present in BOTH `:root` and `.dark`.\n- [ ] Tailwind v4: `globals.css` has `@import \"tw-animate-css\"`, `@custom-variant dark (&:is(.dark *))`, and `@theme inline` token mapping; `tailwind.config` blank in `components.json`; `cssVariables: true`.\n\n## Composition\n- [ ] New behavior is composed in `components/` around primitives, not by forking the generated primitive in place.\n- [ ] Class merging goes through the `cn` helper so `tailwind-merge` resolves conflicting variants.\n\n## CLI & registries\n- [ ] Re-runs of `add` were previewed with `--dry-run`/`--diff` so local customizations were not overwritten.\n- [ ] Registry installs use correct `@namespace/name`; private registries authenticate via `${ENV_VAR}` headers (no committed tokens) and pin a tag/digest.\n\n## Accessibility\n- [ ] Radix props, `aria-*`, `data-*` state, focus styles, and keyboard interaction are intact.\n- [ ] Both color schemes verified visually for the changed components.\n",
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
