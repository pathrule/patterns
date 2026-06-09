import type { Pattern } from "../types.js";

export const reactTypescript: Pattern = {
  slug: "react-typescript",
  version: "1.0.0",
  name: "React + TypeScript",
  tagline:
    "Pragmatic React and TypeScript conventions: typed props, accessible UI, and predictable hooks.",
  description:
    "Rules, memories, and a review skill for React codebases written in TypeScript. Pre-scoped to your source and component directories so your AI assistant writes typed, accessible, and predictable components.",
  category: "Frontend",
  icon: "component",
  color: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  installs: 0,
  updatedAt: "2026-06-09",
  changelog: [{ version: "1.0.0", date: "2026-06-09", note: "First release." }],
  metaTitle: "React and TypeScript patterns for AI coding agents",
  metaDescription:
    "A ready-to-use Pathrule pattern for React with TypeScript: typed props without any, accessible interactive elements, hook discipline, and a component review skill.",
  problem:
    "React and TypeScript components drift into any-typed props, inaccessible controls, and effect-driven data fetching.",
  audience: "frontend teams writing React in TypeScript",
  prevents: [
    "Untyped or any-typed props and event handlers",
    "div-with-onClick controls that fail keyboard and screen-reader users",
    "Fetching data inside effects instead of a real data layer",
  ],
  appliesTo: {
    paths: ["/src", "/src/components", "/app", "/components"],
    stacks: ["react", "typescript"],
    packages: ["react"],
  },
  pieces: [
    {
      kind: "rule",
      nodePath: "/src/components",
      title: "Type props explicitly, no any",
      summary: "Every component has an explicit props type and avoids any.",
      body: "Every component has an explicit props type and avoids `any`.\n\n- Prefer `unknown` with narrowing when a type is genuinely unknown.\n- Type event handlers and refs precisely.\n- Derive types from a single source of truth (schemas, API types) rather than restating shapes that can drift.",
      scopeType: "folder",
      priority: "medium",
      enforcement: "advisory",
    },
    {
      kind: "rule",
      nodePath: "/src/components",
      title: "Interactive elements must be accessible",
      summary: "Use real semantics, labels, and keyboard support.",
      body: "Use real semantics before reaching for a `div` with handlers.\n\n- Prefer native `button`, `a`, `label`, `input`.\n- Every control has an accessible name, a visible focus state, and full keyboard operability.\n- Images have `alt` text, and color is never the only signal.",
      scopeType: "folder",
      priority: "high",
      enforcement: "advisory",
    },
    {
      kind: "memory",
      nodePath: "/src",
      title: "Component structure conventions",
      summary: "Small, focused components; colocate state and lift only when shared.",
      body: "Keep components small and focused on one responsibility.\n\n- Colocate state with the component that owns it; lift only when genuinely shared.\n- Separate presentational components from data access.\n- Name files and exports consistently so the tree is predictable to navigate.",
    },
    {
      kind: "memory",
      nodePath: "/src",
      title: "Hooks discipline and data fetching",
      summary: "Follow the rules of hooks; fetch with a real data layer, not raw effects.",
      body: "Call hooks unconditionally at the top level with honest dependency arrays.\n\n- Avoid effects for data fetching; use a data-fetching library or the framework's server data layer.\n- Custom hooks encapsulate reusable logic.\n- Return stable references where identity matters.",
    },
    {
      kind: "skill",
      nodePath: "/",
      title: "react-component-review",
      summary: "Checklist for reviewing a new or changed React component.",
      body: "---\nname: react-component-review\ndescription: Review a React + TypeScript component for types, accessibility, and hook correctness.\n---\n\n# React component review\n\n- [ ] Props are explicitly typed; no any\n- [ ] Interactive elements use native semantics, labels, and keyboard support\n- [ ] Hooks are called unconditionally with honest dependency arrays\n- [ ] No data fetching inside raw effects\n- [ ] Component has one clear responsibility and reasonable size\n- [ ] State lives at the right level (colocated, lifted only when shared)\n- [ ] No needless re-renders from unstable inline props or callbacks\n",
      skillTags: ["react", "typescript", "accessibility", "review"],
    },
  ],
};
