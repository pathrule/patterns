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
      "summary": "Use the semantically correct native element first; add ARIA only for behavior HTML cannot express.",
      "body": "Reach for the native element that already has the role, state, and keyboard behavior you need before adding any ARIA. Per the 2026 WebAIM Million report, pages with ARIA average more detectable errors than pages without it, so ARIA is a last resort, not a default.\n\n- Use `<button>` for actions and `<a href>` for navigation. Never attach `onClick` to a `<div>` or `<span>` to fake a control.\n- Use `<label>`, `<fieldset>`/`<legend>`, `<nav>`, `<main>`, `<header>`, and `<footer>` instead of generic `<div>` plus `role`.\n- Reserve ARIA for custom widgets that have no native equivalent (`role=\"dialog\"`, `role=\"tablist\"`, `aria-live`), and never override a native role with a redundant one such as `<button role=\"button\">`.\n- Any ARIA control built from non-interactive elements must add `tabindex=\"0\"` plus keydown handlers, because ARIA declares semantics but adds zero keyboard behavior.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Keyboard operability and visible focus",
      "summary": "Every interactive element must be reachable, operable by keyboard, and show a clear focus indicator.",
      "body": "All functionality must work with the keyboard alone, and the focused element must always be visibly distinguishable. This covers WCAG 2.2 AA 2.1.1 Keyboard, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements, and 2.5.8 Target Size.\n\n- Never remove the focus outline with `outline: none` unless you replace it with an equally visible indicator at 3:1 contrast against adjacent colors.\n- Maintain a logical DOM/tab order and avoid positive `tabindex` values; use `tabindex=\"-1\"` only for programmatic focus targets.\n- Manage focus on route changes, dialog open/close, and dynamic content so focus is never lost or trapped unintentionally.\n- Provide a non-drag alternative for any drag-and-drop interaction, and give pointer targets at least 24x24 CSS pixels (44x44 for primary touch targets).",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Accessible forms: labels, errors, and grouping",
      "summary": "How we wire labels, required state, and error messaging so every field is programmatically understandable.",
      "body": "Every input needs a programmatic label and a clear path from field to error. Placeholder text is not a label and disappears on input, so it never substitutes for `<label>`.\n\n- Associate labels explicitly with `<label htmlFor={id}>` matching the input `id`, or wrap the input inside the `<label>`.\n- Mark required fields with the native `required` attribute and surface validation errors with `aria-invalid=\"true\"` plus `aria-describedby` pointing at the error text node.\n- Group related controls (radio sets, address blocks) in `<fieldset>` with a `<legend>`; use `aria-live=\"polite\"` for async/inline validation summaries.\n- Keep error text adjacent and specific (\"Enter a valid email\"), and move focus to the first invalid field on submit failure."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Accessibility tooling and CI gates",
      "summary": "The lint, dev-time, and test stack we use to catch a11y regressions before merge.",
      "body": "Automated checks catch roughly a third of accessibility issues, so we run them in CI and pair them with manual keyboard and screen-reader passes. The target is WCAG 2.2 AA.\n\n- `eslint-plugin-jsx-a11y` runs in lint and blocks the build on errors (clickable non-interactive elements, missing alt, label-less controls).\n- `@axe-core/react` logs violations to the console in development; `jest-axe` / `axe-core` assert no violations in component tests.\n- Color contrast must meet 4.5:1 for normal text and 3:1 for large text and UI/focus indicators; verify in design tokens, not per component.\n- Automation never replaces manual testing: tab through every flow and verify with a real screen reader (NVDA, VoiceOver, or JAWS), since simulators are unreliable."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "web-accessibility-review",
      "summary": "Per-component WCAG 2.2 AA review checklist to run before merging any UI change.",
      "body": "---\nname: web-accessibility-review\ndescription: Run this checklist before merging any new or changed UI component to verify WCAG 2.2 AA. Covers semantic HTML, keyboard operability, focus, labels, contrast, and screen-reader output.\n---\n\n# Web accessibility review\n\n- [ ] Every interactive element uses a native control (`<button>`, `<a href>`, `<input>`); no `onClick` on `<div>`/`<span>`.\n- [ ] ARIA is present only where native HTML cannot express the role or state, with no redundant or conflicting roles.\n- [ ] All functionality is reachable and operable with the keyboard alone; tab order follows reading order.\n- [ ] Focus is always visible (no bare `outline: none`) and meets 3:1 contrast against adjacent colors.\n- [ ] Focus is managed on dialog open/close and route changes, and is never trapped unintentionally.\n- [ ] Every form field has an associated `<label>`; errors use `aria-invalid` plus `aria-describedby`.\n- [ ] Images have meaningful `alt`, or `alt=\"\"` when decorative; icon-only buttons have an accessible name.\n- [ ] Text contrast is at least 4.5:1 (3:1 for large text and UI components).\n- [ ] Pointer targets are at least 24x24 CSS px and drag interactions have a single-pointer alternative.\n- [ ] Verified with `eslint-plugin-jsx-a11y`, an axe run, and one manual screen-reader pass.\n",
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
