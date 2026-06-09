import type { Pattern } from "../types.js";

export const webAccessibility: Pattern = {
  "slug": "web-accessibility",
  "version": "1.0.0",
  "name": "Web Accessibility",
  "tagline": "Ship interfaces that work for keyboard, screen reader, and low-vision users by default.",
  "description": "A WCAG 2.2 AA pattern for frontend teams that keeps accessibility correct without slowing delivery. It enforces a semantic-HTML-first approach, reserves ARIA for genuine custom widgets, and ships a review checklist so every component is keyboard operable, properly labeled, and visibly focusable before merge.",
  "category": "Frontend",
  "icon": "accessibility",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Web Accessibility pattern for AI coding agents (WCAG 2.2)",
  "metaDescription": "Teach your AI coding agent WCAG 2.2 AA: semantic HTML first, ARIA only when needed, keyboard support, visible focus, and a per-component review checklist.",
  "problem": "Agents reach for ARIA and div soup instead of native elements, shipping components that fail keyboard, focus, and screen-reader users.",
  "audience": "Frontend and product teams building React, Next.js, or component-library UIs to WCAG 2.2 AA.",
  "prevents": [
    "Clickable <div> and <span> that keyboard and screen-reader users cannot operate",
    "Redundant or wrong ARIA that creates more errors than it fixes",
    "Form inputs with no programmatic label and controls with invisible focus rings"
  ],
  "appliesTo": {
    "paths": [
      "/src/components",
      "/app",
      "/src"
    ],
    "stacks": [
      "react",
      "nextjs",
      "typescript",
      "tailwind",
      "html"
    ],
    "packages": [
      "eslint-plugin-jsx-a11y",
      "@axe-core/react",
      "axe-core",
      "@testing-library/react"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Native HTML before ARIA",
      "summary": "Use the semantically correct native element first; add ARIA only for behavior native HTML cannot express.",
      "body": "Reach for the native element that already carries the role, state, and keyboard behavior you need before adding any ARIA. The WebAIM Million 2026 report found home pages that use ARIA average 59.1 detectable errors versus 42 on pages without it, and 82.7% of pages now use ARIA, so misused ARIA is a leading cause of real failures. ARIA changes how assistive tech reports an element but adds zero behavior, so treat it as a last resort.\n\n- Use `<button>` for actions and `<a href>` for navigation. Never attach `onClick` to a `<div>` or `<span>` to fake a control.\n- Use `<label>`, `<fieldset>`/`<legend>`, `<nav>`, `<main>`, `<header>`, and `<footer>` instead of a generic `<div>` plus a `role`.\n- Reserve ARIA for custom widgets with no native equivalent (`role=\"dialog\"`, `role=\"tablist\"`, `aria-live`), and never restate a native role redundantly such as `<button role=\"button\">` or `<nav role=\"navigation\">`.\n- If you do build a control from non-interactive elements with ARIA, you must add `tabindex=\"0\"` plus the matching keydown handlers (Enter/Space for buttons, arrow keys for composite widgets), because ARIA alone leaves it keyboard-dead.\n- Do not put interactive elements inside other interactive elements (a `<button>` inside an `<a>`), and do not apply `role` values that conflict with the element's implicit role.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Keyboard operability and visible focus",
      "summary": "Every interactive element must be reachable, operable by keyboard, and show a clear focus indicator.",
      "body": "All functionality must work with the keyboard alone, and the focused element must always be visibly distinguishable and not hidden behind sticky chrome. This covers WCAG 2.2 AA criteria 2.1.1 Keyboard, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, and 2.5.8 Target Size (Minimum).\n\n- Never remove the focus outline with `outline: none` unless you replace it with an equally visible indicator at 3:1 contrast against adjacent colors. Prefer `:focus-visible` so the ring shows for keyboard users without flashing on every mouse click.\n- Keep a logical DOM order so tab order matches reading order; avoid positive `tabindex` values, and use `tabindex=\"-1\"` only for programmatic focus targets.\n- Manage focus deliberately: move focus into a dialog on open and restore it to the trigger on close, trap focus inside modal dialogs, and move focus to the new view (or a heading) on client-side route changes so it is never lost.\n- Ensure a focused element is at least partially visible when sticky headers, sticky footers, or non-modal popovers are present (2.4.11). Use `scroll-margin` so programmatic scrolling does not park focus under fixed chrome.\n- Provide a single-pointer, non-drag alternative for any drag-and-drop interaction (2.5.7), and give pointer targets at least 24x24 CSS pixels, or adequate spacing under the 24px spacing exception (2.5.8).",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Text alternatives and accessible names",
      "summary": "Every image needs correct alt text, and every control needs a non-visual accessible name.",
      "body": "Missing alternative text and empty or ambiguous links and buttons are consistently among the most common failures in the WebAIM Million each year, and they break screen-reader users completely. Every non-text element that conveys meaning needs a text equivalent, and every control needs a name that makes sense without seeing the screen.\n\n- Informative images require descriptive `alt` text; purely decorative images must use `alt=\"\"` (empty, not missing) so screen readers skip them. Never use the filename as alt text.\n- Icon-only buttons and links must have an accessible name via visually hidden text, `aria-label`, or `aria-labelledby`; a bare `<button><svg/></button>` is announced as just \"button\".\n- Mark decorative inline SVGs and icon fonts with `aria-hidden=\"true\"` and `focusable=\"false\"` so they are not announced; give meaningful SVGs a `<title>` or `role=\"img\"` plus a label.\n- Link text must make sense out of context: avoid \"click here\" and \"read more\"; if the visible text is generic, supply the full name with `aria-label` or visually hidden text.\n- Do not rely on color alone to convey state or meaning (1.4.1); pair color with text, an icon, or a pattern.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Accessible forms: labels, errors, and grouping",
      "summary": "How we wire labels, required state, and error messaging so every field is programmatically understandable.",
      "body": "Every input needs a programmatic label and a clear path from field to error. Placeholder text is not a label, disappears on input, and usually fails contrast, so it never substitutes for `<label>`.\n\n- Associate labels explicitly with `<label htmlFor={id}>` matching the input `id`, or wrap the input inside the `<label>`. Generate stable ids with React's `useId()` so server and client markup match.\n- Mark required fields with the native `required` attribute and surface validation errors with `aria-invalid=\"true\"` plus `aria-describedby` pointing at the id of the error text node.\n- Group related controls (radio sets, address blocks, checkbox groups) in a `<fieldset>` with a `<legend>`; the legend becomes the group name screen readers announce.\n- Announce async or inline validation with an `aria-live=\"polite\"` region, keep error text adjacent and specific (\"Enter a valid email\"), and move focus to the first invalid field on a failed submit.\n- Per WCAG 2.2, do not force users to re-enter information they already gave in the same flow (3.3.7 Redundant Entry), and do not require cognitive tests like solving a puzzle to authenticate (3.3.8 Accessible Authentication); allow paste and password managers."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Accessibility tooling and CI gates",
      "summary": "The lint, dev-time, and test stack we use to catch a11y regressions before merge, and its known limits.",
      "body": "Automated tooling catches only about a third to 40% of accessibility issues, so we run it in CI as a floor and pair it with manual keyboard and screen-reader passes. The target is WCAG 2.2 AA.\n\n- `eslint-plugin-jsx-a11y` runs in lint and blocks the build on errors such as clickable non-interactive elements, missing `alt`, and label-less controls. It is static-analysis only and cannot see runtime DOM or computed contrast.\n- For component tests, use `vitest-axe` (the maintained Vitest matcher; the older `jest-axe` is fine on Jest projects) and assert zero axe violations. Note axe color-contrast rules do not run under jsdom/happy-dom, so contrast must be checked elsewhere.\n- For end-to-end coverage, run `@axe-core/playwright` against real rendered pages in Playwright; this is where contrast and full-DOM rules actually execute.\n- Color contrast must meet 4.5:1 for normal text and 3:1 for large text and for UI components and focus indicators; verify it in design tokens once, not ad hoc per component.\n- Automation never replaces manual testing: tab through every flow and verify with a real screen reader (NVDA, VoiceOver, or JAWS). The WebAIM Million 2026 found 95.9% of top pages still fail WCAG, almost all on issues tooling already flags, so the gate only works if the build actually fails on it."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "web-accessibility-review",
      "summary": "Per-component WCAG 2.2 AA review checklist to run before merging any UI change.",
      "body": "---\nname: web-accessibility-review\ndescription: Run this checklist before merging any new or changed UI component to verify WCAG 2.2 AA. Covers semantic HTML, keyboard operability, focus, names and alt text, contrast, forms, and screen-reader output.\n---\n\n# Web accessibility review\n\nRun every item against the component you changed. Anything unchecked blocks merge.\n\n## Semantics and ARIA\n- [ ] Every interactive element uses a native control (`<button>`, `<a href>`, `<input>`); no `onClick` on `<div>`/`<span>`.\n- [ ] ARIA appears only where native HTML cannot express the role or state, with no redundant or conflicting roles and no interactive-in-interactive nesting.\n- [ ] Any ARIA widget built from non-interactive elements has `tabindex=\"0\"` and matching keydown handlers.\n\n## Keyboard and focus\n- [ ] All functionality is reachable and operable with the keyboard alone; tab order follows reading order.\n- [ ] Focus is always visible (no bare `outline: none`) and meets 3:1 contrast against adjacent colors; `:focus-visible` used where appropriate.\n- [ ] Focus is moved into dialogs on open, restored to the trigger on close, trapped in modals, and moved on route changes; never lost or unintentionally trapped.\n- [ ] A focused element stays at least partially visible under sticky headers/footers and popovers (2.4.11).\n\n## Names, text, and color\n- [ ] Images have meaningful `alt`, or `alt=\"\"` when decorative; icon-only buttons and links have an accessible name.\n- [ ] Decorative SVGs/icons are `aria-hidden=\"true\"`; link text makes sense out of context (no bare \"click here\").\n- [ ] Meaning is never conveyed by color alone; text contrast is at least 4.5:1 (3:1 for large text and UI components).\n\n## Forms\n- [ ] Every field has an associated `<label>` (placeholder is not a label); required uses `required`; errors use `aria-invalid` + `aria-describedby`.\n- [ ] Related controls are grouped with `<fieldset>`/`<legend>`; focus moves to the first invalid field on submit failure.\n\n## Targets and verification\n- [ ] Pointer targets are at least 24x24 CSS px (or pass the spacing exception); drag interactions have a single-pointer alternative.\n- [ ] Verified with `eslint-plugin-jsx-a11y`, a `vitest-axe`/`@axe-core/playwright` run, and at least one manual screen-reader pass.\n",
      "skillTags": [
        "accessibility",
        "a11y",
        "wcag",
        "frontend",
        "review"
      ]
    }
  ]
};
