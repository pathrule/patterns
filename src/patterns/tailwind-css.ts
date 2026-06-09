import type { Pattern } from "../types.js";

export const tailwindCss: Pattern = {
  "slug": "tailwind-css",
  "version": "1.0.0",
  "name": "Tailwind CSS",
  "tagline": "Keep Tailwind v4 utility code clean, token-driven, and free of arbitrary-value sprawl.",
  "description": "A pattern bundle for teams building UIs with Tailwind CSS v4. It encodes the CSS-first workflow (configure in CSS with @theme, no tailwind.config.js), enforces design tokens over arbitrary values, and standardizes class ordering and conditional-class handling. Use it so AI agents and humans write Tailwind that matches your design system instead of one-off magic numbers.",
  "category": "Frontend",
  "icon": "wind",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Tailwind CSS rules for AI coding agents | Pathrule",
  "metaDescription": "Pathrule pattern for Tailwind CSS v4: CSS-first @theme tokens, no arbitrary-value sprawl, sorted classes, and a review skill so AI agents ship on-system UI.",
  "problem": "AI agents and rushed PRs fill Tailwind markup with arbitrary values and ad-hoc classes that drift from the design system and bloat the CSS bundle.",
  "audience": "Frontend and product teams building component-driven UIs with Tailwind CSS v4 and React or other JSX frameworks.",
  "prevents": [
    "Arbitrary values like w-[137px] or text-[#3b82f6] replacing real design tokens",
    "Resurrecting a tailwind.config.js when v4 expects CSS-first @theme configuration",
    "Dynamic class strings such as bg-${color}-500 that Tailwind cannot detect at build time"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/app",
      "/src/components",
      "/src/styles"
    ],
    "stacks": [
      "tailwind",
      "tailwind-v4",
      "react",
      "nextjs",
      "vite"
    ],
    "packages": [
      "tailwindcss",
      "@tailwindcss/vite",
      "prettier-plugin-tailwindcss",
      "tailwind-merge",
      "clsx",
      "class-variance-authority"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "No dynamic Tailwind class string interpolation",
      "summary": "Never assemble Tailwind class names from runtime template strings; they get purged.",
      "body": "Tailwind v4 scans source files as plain text and never parses them as code, so any class name assembled at runtime is invisible to the compiler and never generated. This is the single most common way Tailwind styling silently breaks in production.\n\n- Do not write `className={`bg-${status}-500`}` or `text-{{ error ? 'red' : 'green' }}-600`. The complete literal token (`bg-red-500`, `text-red-600`) must appear verbatim somewhere in source.\n- Map state to full, static class strings via a lookup object or `class-variance-authority` (cva): `const variants = { error: 'text-red-600', ok: 'text-green-600' }` then `className={variants[state]}`.\n- Partial classes split across `clsx`/`cn` arguments also fail when a single variant (for example `md:flex`) is built from fragments. Keep each complete utility, including its modifier, in one string.\n- If a class genuinely must be produced from data the scanner cannot see (server-driven values), safelist it in CSS with `@source inline(\"bg-red-{50,{100..900..100},950}\")` rather than interpolating it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Use design tokens, not arbitrary values",
      "summary": "Prefer theme-backed utilities over square-bracket arbitrary values.",
      "body": "Reach for a standard token-backed utility before an arbitrary value so markup stays inside the design system and the output CSS stays lean.\n\n- Replace one-offs like `w-[137px]`, `text-[#3b82f6]`, or `mt-[13px]` with token utilities (`w-32`, `text-primary`, `mt-3`).\n- If a value is genuinely reused, add it to `@theme` as a custom token (for example `--color-brand` or `--spacing-18`) instead of repeating the bracket form across files.\n- Arbitrary values are an escape hatch for true one-offs only; each distinct one emits its own hardcoded rule and bypasses the theme variable system, so a design token change will not reach them.\n- Note a known toolchain caveat (2026): some arbitrary values such as `aspect-[12/5]` have intermittently been dropped by the Turbopack-integrated compiler, which is one more reason to prefer real tokens.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/styles",
      "title": "Tailwind v4 is CSS-first via @theme (no tailwind.config.js)",
      "summary": "Configure tokens in CSS with @theme; do not scaffold a JS config file.",
      "body": "Tailwind CSS v4 moved configuration out of JavaScript into the stylesheet. Do not scaffold a `tailwind.config.js` for a fresh v4 project, and do not add a `content` array (v4 auto-detects template files).\n\n- Start the entry stylesheet with `@import \"tailwindcss\";` then declare design tokens in an `@theme { ... }` block (`--color-*`, `--font-*`, `--breakpoint-*`, `--spacing-*`).\n- Theme variables become both real CSS custom properties and generated utilities, so `--color-brand: #...;` yields `bg-brand`, `text-brand`, `border-brand`, and friends automatically.\n- Use `@theme` only for tokens that should generate utilities. For plain CSS variables that should NOT mint utilities (for example values you only read in custom CSS), define them under `:root` instead.\n- Multi-theme / runtime theme switching is done by overriding the generated CSS variables under `:root`, `.dark`, or `[data-theme=...]` at runtime; no rebuild is needed.\n- Add custom utilities with `@utility` and custom states with `@custom-variant` rather than a JS plugin.\n\nSee /src/components for the cva + tailwind-merge composition stack and the @apply/@reference footgun in scoped stylesheets."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Variant + merge stack: cva, clsx, tailwind-merge",
      "summary": "Standardize one cn helper and define variants at module scope.",
      "body": "Reusable components compose classes through one shared helper so conflicting utilities resolve predictably and caller overrides win.\n\n- Create `cn` once and import it everywhere: `export const cn = (...i: ClassValue[]) => twMerge(clsx(i))`. `clsx` handles conditional/falsy class logic; `twMerge` resolves Tailwind conflicts so the last conflicting utility wins (so `cn('px-2', 'px-4')` yields `px-4`, not both).\n- Order inside `cn` matters: base styles first, conditional/variant classes next, the caller's `className` prop last, so consumers can always override.\n- Declare `cva` variant maps at module scope, never inside render, to avoid recreating them every render. Keep one complete class string per variant value (see the dynamic-class rule in /src).\n- Let `prettier-plugin-tailwindcss` own class ordering so diffs and reviews stay focused on logic, not sort churn. Do not reorder classes by hand."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "@apply in scoped stylesheets needs @reference (and is a last resort)",
      "summary": "v4 @apply in SFC/module styles requires @reference; overusing it wrecks build times.",
      "body": "In Tailwind v4, `@apply` and theme functions only know about your utilities and tokens inside the main stylesheet that imported Tailwind. Any separately-compiled stylesheet (a Vue/Svelte SFC `<style>` block, a CSS module, or any file processed in isolation) must opt in with `@reference` first, or `@apply` silently does nothing.\n\n- At the top of such a block: `@reference \"../app.css\";` (point it at the stylesheet that runs `@import \"tailwindcss\"` plus your `@theme`). Without it, `@apply bg-brand` compiles to empty output.\n- Performance footgun: every `@reference` re-processes the full theme for that file. In monorepos with many component-level `@apply` usages this has blown startup times from seconds to minutes. Prefer plain utility classes in markup; if you only need bare CSS variables, reference them as `var(--color-brand)` directly rather than pulling in `@reference`.\n- Treat `@apply` as a last resort, mainly for styling markup you do not control (third-party widgets, `dangerouslySetInnerHTML` content). For your own components, compose utilities in JSX via the `cn` stack instead."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "tailwind-css-review",
      "summary": "Pre-merge checklist for Tailwind v4 utility, token, and config hygiene.",
      "body": "---\nname: tailwind-css-review\ndescription: Review Tailwind CSS v4 changes for token-driven styling, no arbitrary-value or dynamic-class sprawl, CSS-first config, correct @apply/@reference usage, and conflict-safe class merging before merging.\n---\n\n# Tailwind CSS review\n\n- [ ] No runtime-interpolated class strings (`bg-${x}-500`, `text-{{cond}}-600`); state mapped via cva or a literal lookup, or safelisted with `@source inline(...)`. Each complete utility (including modifiers like `md:`) lives in one string, not split across cn arguments.\n- [ ] No new arbitrary values (`w-[..]`, `text-[#..]`, `mt-[..px]`); reused values promoted to `@theme` tokens instead.\n- [ ] Configuration stays CSS-first: tokens in `@theme`, no `tailwind.config.js` reintroduced, no `content` array added.\n- [ ] `@theme` used only for tokens that should generate utilities; non-utility variables live under `:root`.\n- [ ] Any `@apply` in a scoped/SFC/module stylesheet has a matching `@reference` to the main stylesheet; `@apply` is not used where a plain utility class in markup would do.\n- [ ] Custom utilities use `@utility`; custom dark/state variants use `@custom-variant` (for example `@custom-variant dark (&:where(.dark, .dark *))`), not a JS plugin or `darkMode` config key.\n- [ ] Component classes merge through the shared `cn` helper so caller overrides win and conflicting utilities resolve.\n- [ ] cva variant maps defined at module scope, one full class string per variant value.\n- [ ] Classes sorted by `prettier-plugin-tailwindcss`; the diff has no manual reordering churn.\n- [ ] Responsive, dark, and state styling uses real modifiers (`md:`, `dark:`, `hover:`) rather than duplicated bespoke CSS.\n",
      "skillTags": [
        "tailwind",
        "css",
        "frontend",
        "design-tokens",
        "code-review"
      ]
    }
  ]
};
