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
      "title": "Use design tokens, not arbitrary values",
      "summary": "Prefer theme-backed utilities over square-bracket arbitrary values.",
      "body": "Reach for a standard utility before an arbitrary value so markup stays inside the design system.\n\n- Replace one-offs like `w-[137px]`, `text-[#3b82f6]`, or `mt-[13px]` with token utilities (`w-32`, `text-primary`, `mt-3`).\n- If a value is genuinely reused, add it to `@theme` as a custom token (for example `--color-brand` or `--spacing-18`) instead of repeating the bracket form.\n- Arbitrary values are an escape hatch for true one-offs only; each distinct one emits its own rule and bloats the output CSS.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "No dynamic class string interpolation",
      "summary": "Never build Tailwind class names from runtime template strings.",
      "body": "Tailwind scans source as plain text, so any class assembled at runtime is invisible to the compiler and gets purged.\n\n- Do not write `className={`bg-${status}-500`}` or concatenate fragments; the full literal class must appear in source.\n- Map state to complete class strings with `class-variance-authority` (cva) or an explicit lookup object, then merge with `cn`.\n- If a class truly must be generated, register it through `@source inline(...)` so the compiler keeps it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/styles",
      "title": "Tailwind v4 is CSS-first via @theme",
      "summary": "Configure tokens in CSS with @theme; there is no tailwind.config.js.",
      "body": "Tailwind CSS v4 moved configuration out of JavaScript into your stylesheet, so do not scaffold a `tailwind.config.js`.\n\n- Start the entry stylesheet with `@import \"tailwindcss\";` then declare tokens in an `@theme { ... }` block (`--color-*`, `--font-*`, `--breakpoint-*`, `--spacing-*`).\n- Theme variables become both real CSS custom properties and generated utilities, so `--color-brand` yields `bg-brand`, `text-brand`, and friends automatically.\n- Add custom utilities with `@utility` and custom selectors with `@custom-variant` (for example a class- or data-attribute-based `dark` variant) rather than a JS plugin or `darkMode` config key."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Variant + merge stack: cva, clsx, tailwind-merge",
      "summary": "Standardize a cn helper and define variants outside the component.",
      "body": "Reusable components compose classes through one shared helper so conflicting utilities resolve predictably.\n\n- Create `cn` once: `export const cn = (...i: ClassValue[]) => twMerge(clsx(i))`, then always merge through it so a later `className` prop wins over base styles.\n- Order matters inside `cn`: base styles first, conditional/variant classes next, caller overrides last.\n- Declare `cva` variant maps at module scope (not inside render) to avoid recreating them each render, and keep one full class string per variant value.\n- Let `prettier-plugin-tailwindcss` own class ordering so reviews stay focused on logic, not sort order."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "tailwind-css-review",
      "summary": "Pre-merge checklist for Tailwind v4 utility and token hygiene.",
      "body": "---\nname: tailwind-css-review\ndescription: Review Tailwind CSS v4 changes for token-driven styling, no arbitrary-value or dynamic-class sprawl, CSS-first config, and conflict-safe class merging before merging.\n---\n\n# Tailwind CSS review\n\n- [ ] No new arbitrary values (`w-[..]`, `text-[#..]`, `mt-[..px]`); reused values promoted to `@theme` tokens instead.\n- [ ] No runtime-interpolated class strings (`bg-${x}-500`); state mapped via cva or a literal lookup, or registered with `@source inline(...)`.\n- [ ] Configuration stays CSS-first: tokens live in `@theme`, no `tailwind.config.js` reintroduced.\n- [ ] Custom utilities use `@utility` and custom states use `@custom-variant` (including class/data-attribute `dark`), not JS plugins.\n- [ ] Component classes merged through the shared `cn` helper so caller overrides win and conflicts resolve.\n- [ ] cva variant maps defined at module scope, one full class string per variant value.\n- [ ] Classes are sorted by `prettier-plugin-tailwindcss` and the diff is free of manual reordering churn.\n- [ ] Responsive, dark, and state variants use real modifiers (`md:`, `dark:`, `hover:`) rather than duplicated bespoke CSS.\n",
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
