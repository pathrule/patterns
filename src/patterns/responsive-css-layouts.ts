import type { Pattern } from "../types.js";

export const responsiveCssLayouts: Pattern = {
  "slug": "responsive-css-layouts",
  "version": "1.0.0",
  "name": "Responsive CSS Layouts",
  "tagline": "Build intrinsic layouts that survive narrow containers, long content, zoom, and localization.",
  "description": "Responsive failures increasingly happen inside components rather than at a few viewport breakpoints: grid tracks refuse to shrink, flex children overflow, long translated content expands controls, and browser zoom exposes assumptions hidden at a designer's canvas width. This pattern constrains intrinsic sizing and overflow behavior, records when container queries beat viewport queries, and provides a repeatable layout stress test across content, input, and accessibility conditions. It complements Tailwind by defining the CSS behavior utilities must express, and it differs from accessibility guidance by concentrating on layout mechanics rather than semantic and interaction requirements.",
  "category": "Frontend",
  "icon": "monitor-smartphone",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Responsive CSS pattern for AI coding agents",
  "metaDescription": "Responsive CSS grid, flexbox, intrinsic sizing, container queries, overflow, zoom, and long-content checks for resilient component layouts. In production.",
  "problem": "AI agents often add more breakpoints instead of fixing intrinsic sizing, hide overflow that contains essential content, or size components from the viewport even when their actual container is narrow.",
  "audience": "Frontend teams building reusable interfaces across dashboards, marketing pages, embedded panels, and localized products",
  "prevents": [
    "Grid and flex children forcing horizontal page overflow",
    "Components responding to viewport width instead of available container space",
    "Translated labels escaping fixed-height controls",
    "Zoom and large text collapsing actions or clipping content"
  ],
  "appliesTo": {
    "paths": [
      "/src/components",
      "/src/styles"
    ],
    "stacks": [
      "css",
      "responsive-design",
      "grid",
      "flexbox",
      "container-queries"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/styles",
      "title": "Fix intrinsic sizing before adding a breakpoint",
      "summary": "Allow grid and flex tracks to shrink, wrap content deliberately, and reserve clipping for genuinely decorative overflow.",
      "body": "Many responsive bugs come from a minimum content size the layout cannot shrink below. Adding a media query can move the failure without fixing the track, child, or unbreakable content that caused it.\n\n- Use shrinkable grid tracks such as `minmax(0, 1fr)` where content must not establish the column minimum, and set the relevant flex child minimum to zero.\n- Give long identifiers, URLs, and user-generated text an explicit wrapping or truncation policy with an accessible way to reveal the full value.\n- Do not apply `overflow: hidden` to a large ancestor merely to remove a scrollbar; find the specific overflowing child and preserve focus outlines, menus, and sticky behavior.\n- Prefer logical properties and content-driven block size so localization, writing direction, and text scaling do not collide with fixed pixel assumptions.\n\nSee /src/components for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Make the component respond to its container",
      "summary": "Use container queries when a component can appear in panels of different widths, and keep viewport queries for page-level composition.",
      "body": "A reusable card can be narrow on a wide monitor because it sits beside a sidebar or inside a split pane. Viewport breakpoints cannot describe that local constraint and cause the same component to render incorrectly in different placements.\n\n- Establish a named or local query container at the component boundary whose available inline size determines the layout.\n- Switch internal arrangement at the smallest content-driven threshold that preserves readability and controls, not at a device category copied from another page.\n- Use viewport media queries for global shell changes such as primary navigation or page columns, and container queries for the internals of reusable modules.\n- Provide a non-query base layout that remains usable when containment is absent or the component is rendered in email, print, test, or constrained embedded contexts.\n\nSee /src/styles for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/styles",
      "title": "Responsive states follow content pressure, not named devices",
      "summary": "Choose thresholds from the point where real content stops fitting, and keep the number of layout states as small as the interaction permits.",
      "body": "Labels such as mobile, tablet, and desktop hide the actual condition a layout responds to. A translated toolbar, browser sidebar, split window, or zoomed page can reach the same content pressure at very different viewport widths.\n\n- Start with the narrowest complete layout and add space-enhanced arrangements only when the content itself demonstrates room for them.\n- Test shortest and longest supported labels, realistic numbers, validation messages, and missing optional content before selecting a threshold.\n- Allow controls to wrap, stack, or move into an intentional overflow menu instead of reducing hit targets or font size to preserve one row.\n- Keep DOM order aligned with reading and focus order across states; CSS visual reordering must not create an interaction sequence that differs from the screen.\n\nSee /src/components for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "stress-test-responsive-layout",
      "summary": "Test a component against narrow containers, long content, zoom, writing direction, input modes, and dynamic UI states.",
      "body": "---\nname: stress-test-responsive-layout\ndescription: Stress-test a responsive component before publishing it to a shared interface or design system.\n---\n\n# Stress Test Responsive Layout\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Render the component in progressively narrower containers independent of viewport size and record the first content collision, overflow, or unreachable action.\n- [ ] Replace labels, numbers, names, URLs, and error messages with realistic longest-case content and repeat with missing and empty states.\n- [ ] Test browser zoom and increased text size without shrinking the viewport manually; confirm content reflows and focus remains visible.\n- [ ] Switch writing direction and exercise keyboard, touch, and pointer interactions across every responsive state and overflow mechanism.\n- [ ] Open menus, dialogs, tooltips, validation, loading, and selected states near container edges; verify overlays are not clipped by a layout fix.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "css",
        "responsive-design",
        "layout",
        "accessibility",
        "testing"
      ]
    }
  ]
};
