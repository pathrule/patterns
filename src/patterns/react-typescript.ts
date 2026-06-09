import type { Pattern } from "../types.js";

export const reactTypescript: Pattern = {
  "slug": "react-typescript",
  "version": "1.0.0",
  "name": "React + TypeScript",
  "tagline": "Pragmatic React and TypeScript conventions: typed props, accessible UI, and predictable hooks.",
  "description": "Rules, memories, and a review skill for React codebases written in TypeScript. Pre-scoped to your source and component directories so your AI assistant writes typed, accessible, and predictable components.",
  "category": "Frontend",
  "icon": "component",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "React and TypeScript patterns for AI coding agents",
  "metaDescription": "A ready-to-use Pathrule pattern for React with TypeScript: typed props without any, accessible interactive elements, hook discipline, and a component review skill.",
  "problem": "React and TypeScript components drift into any-typed props, inaccessible controls, and effect-driven data fetching.",
  "audience": "frontend teams writing React in TypeScript",
  "prevents": [
    "Untyped or any-typed props and event handlers",
    "div-with-onClick controls that fail keyboard and screen-reader users",
    "Fetching data inside effects instead of a real data layer"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/src/components",
      "/app",
      "/components"
    ],
    "stacks": [
      "react",
      "typescript"
    ],
    "packages": [
      "react"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Do not sync derived state or fetch data inside effects",
      "summary": "Compute derived values during render and fetch via a data layer; effects are only for external-system sync.",
      "body": "Effects synchronize a component with an external system (DOM nodes, browser APIs, third-party widgets, subscriptions). They are not for deriving state from props/state or for fetching data. The official `eslint-plugin-react-hooks` recommended preset flags `set-state-in-effect` for this reason.\n\nDo not:\n\n- Mirror props/state into state with an effect plus `setState`. Compute it during render: `const visible = items.filter(i => i.active)`. Wrap only genuinely expensive work in `useMemo`.\n- Reset state on a prop change with an effect. Pass a `key` so React remounts the subtree with fresh state: `<Profile userId={userId} key={userId} />`.\n- Run logic that should happen because of a user action inside an effect. Put it in the event handler, which knows what the user actually did.\n- Fetch data in a bare effect. This causes duplicate requests, loading flicker on every navigation, and StrictMode double-fetch in dev. Use a data layer (TanStack Query, RTK Query, the framework's server data layer / Server Components, or the `use()` hook with a cached promise).\n\nIf you keep an effect, it must subscribe to something outside React and return a cleanup function. Prefer `useSyncExternalStore` for external stores.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Interactive elements must be accessible",
      "summary": "Use native semantics, accessible names, visible focus, and full keyboard operability.",
      "body": "A `div` or `span` with an `onClick` is not a button. It is unreachable by keyboard, invisible to screen readers, and a real defect for affected users.\n\n- Reach for native `button`, `a`, `label`, `input`, `select` before any custom control. A `button` gives you focus, Enter/Space activation, and the correct role for free.\n- Every control has an accessible name (visible text, `aria-label`, or an associated `<label htmlFor>`), a visible `:focus-visible` state, and full keyboard operability.\n- Associate inputs with labels using `useId()` for the `id`/`htmlFor` pair so ids stay stable and hydration-safe.\n- Images that convey meaning have `alt`; decorative images have `alt=\"\"`. Never use color as the only signal.\n- If you must build a custom widget, follow the matching ARIA Authoring Practices pattern (role, states, key handling) in full rather than partially.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "How we type component props",
      "summary": "Explicit prop types, no any, discriminated unions for variant components, import type under verbatimModuleSyntax.",
      "body": "Conventions for typing components in this codebase.\n\n- Type props with an explicit `type` or `interface` on a plain function component. We do not use `React.FC`: it adds an implicit `children` even for components that take none and complicates generics.\n- No `any`. When a shape is truly unknown use `unknown` and narrow. Type event handlers precisely (`React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`).\n- Derive types from a single source of truth (Zod schema, generated API types, a const object with `as const`) instead of restating shapes that can drift apart.\n- For components with mutually exclusive modes, model props as a discriminated union on a literal discriminant rather than a bag of optional props. Example: `{ status: 'error'; message: string; onRetry: () => void } | { status: 'success'; message: string }`. This makes invalid prop combinations a compile error instead of a runtime check.\n- Under `verbatimModuleSyntax: true` (our tsconfig), type-only imports must use `import type { Props } from './x'`. Mixing a value and a type in one statement without the modifier is an error; the lint autofix handles most of it."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "React Compiler handles memoization for new code",
      "summary": "Don't hand-write useMemo/useCallback/React.memo in new components; never strip existing manual memoization.",
      "body": "React Compiler 1.0 (stable, Oct 2025) auto-memoizes components and hooks at build time. This changes how we optimize here.\n\n- New code: write components without `useMemo`, `useCallback`, or `React.memo`. The compiler inserts memoization where it helps. Reaching for these manually is usually noise and can fight the compiler.\n- Keep `useMemo` only for a measured expensive computation, or where a stable reference is semantically required (e.g. a value passed to a non-React API or a dependency array the compiler cannot see through, such as some third-party hooks).\n- Do not delete existing manual memoization to \"modernize\" a file. The compiler's `preserve-manual-memoization` rule expects it left in place; removing it can change behavior. Migrate deliberately, not opportunistically.\n- The compiler relies on the Rules of React. Run the `eslint-plugin-react-hooks` recommended (or recommended-latest) preset; its rules (`rules-of-hooks`, `exhaustive-deps`, `set-state-in-effect`, `purity`, `refs`) are how the compiler surfaces violations. Code that breaks these rules silently opts out of optimization.\n- Performance work starts with the React DevTools profiler, not with sprinkling memo hooks."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Component structure and state placement",
      "summary": "Small single-responsibility components; colocate state, lift only when shared; split presentational from data access.",
      "body": "How we structure components so the tree stays predictable.\n\n- One responsibility per component. When a component grows a second job (fetching + layout + a modal), split it.\n- Colocate state with the component that owns it. Lift state up only when two siblings genuinely need the same value; do not hoist to a parent or context \"just in case\".\n- Separate presentational components (props in, JSX out) from components that do data access or own significant state. Presentational components are trivial to test and reuse.\n- Use lazy `useState` initialization for expensive initial values: `useState(() => readFromStorage())`, not `useState(readFromStorage())`, so the work runs once instead of every render.\n- Custom hooks encapsulate reusable stateful logic and are named `useX`. Keep them focused; a hook that returns ten unrelated things is a refactor signal.\n- Name files and exports consistently (one component per file, file name matches the export) so navigation is mechanical."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "react-component-review",
      "summary": "Checklist for reviewing a new or changed React + TypeScript component.",
      "body": "---\nname: react-component-review\ndescription: Review a React + TypeScript component for prop types, accessibility, hook correctness, and effect/memoization discipline before merge.\n---\n\n# React component review\n\nRun this before approving a new or changed component.\n\n## Types\n- [ ] Props are explicitly typed; no `any` (use `unknown` + narrowing if truly unknown)\n- [ ] Variant/mode components use a discriminated union, not a pile of optional props\n- [ ] Types derive from a single source of truth (schema / generated API types), not restated shapes\n- [ ] Type-only imports use `import type` (verbatimModuleSyntax)\n\n## Effects and state\n- [ ] No effect that only computes derived state from props/state (compute during render)\n- [ ] No effect resetting state on a prop change (use a `key` instead)\n- [ ] No data fetching in a bare effect (use the data layer / Server Components / `use()`)\n- [ ] Any remaining effect syncs an external system and has a cleanup function\n- [ ] Hooks are called unconditionally at the top level; dependency arrays are honest\n\n## Memoization\n- [ ] No reflexive `useMemo`/`useCallback`/`React.memo` in new code (compiler handles it)\n- [ ] Existing manual memoization left intact, not stripped\n- [ ] `eslint-plugin-react-hooks` (recommended preset) passes with no disables\n\n## Accessibility\n- [ ] Interactive elements use native semantics (`button`, `a`, `input`, `label`)\n- [ ] Every control has an accessible name, visible focus, and keyboard operability\n- [ ] Inputs are associated to labels via a stable `useId`\n- [ ] Images have correct `alt`; color is not the only signal\n\n## Structure\n- [ ] One clear responsibility; reasonable size\n- [ ] State colocated, lifted only when genuinely shared\n- [ ] Expensive initial state uses lazy `useState(() => ...)`\n",
      "skillTags": [
        "react",
        "typescript",
        "accessibility",
        "hooks",
        "review"
      ]
    }
  ]
};
