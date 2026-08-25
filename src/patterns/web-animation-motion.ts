import type { Pattern } from "../types.js";

export const webAnimationMotion: Pattern = {
  "slug": "web-animation-motion",
  "version": "1.0.0",
  "name": "Web Animation and Motion",
  "tagline": "Use motion to explain state change while keeping interaction interruptible, accessible, and fast.",
  "description": "Web motion can preserve context and communicate hierarchy, but it also introduces lifecycle, accessibility, performance, and testing obligations. This bundle defines reduced-motion parity, interruptible ownership, compositor-aware implementation, and progressive enhancement across CSS, the Web Animations API, and view transitions. Unlike Web Accessibility, it focuses on motion behavior while treating reduced motion as a first-class functional mode.",
  "category": "Frontend",
  "icon": "move",
  "color": "bg-pink-500/10 text-pink-600 dark:bg-pink-400/15 dark:text-pink-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Web animation and motion pattern for AI agents",
  "metaDescription": "Reduced-motion parity, interruptible animation ownership, transform-first performance, layout measurement discipline, view transitions, and deterministic tests.",
  "problem": "Agents add decorative movement without reduced-motion behavior, leave stale animations running after state changes, and animate layout properties that cause jank or incorrect final state.",
  "audience": "Frontend teams building animated components, gestures, route transitions, expanding layouts, notifications, and stateful interactions",
  "prevents": [
    "Reduced-motion users losing essential state or feedback",
    "Rapid interaction creating overlapping animations and stale end states",
    "Per-frame layout reads and writes degrading responsiveness"
  ],
  "appliesTo": {
    "paths": [
      "/src/components",
      "/src/styles",
      "/tests/ui"
    ],
    "stacks": [
      "css",
      "web-animations-api",
      "view-transitions",
      "accessibility"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/styles",
      "title": "Reduced motion preserves meaning and completion",
      "summary": "The prefers-reduced-motion mode removes or replaces non-essential movement while keeping state, focus, timing, and task completion understandable.",
      "body": "Reduced motion is not a global zero-duration switch that can skip event ordering, unmount content before focus moves, or remove feedback. Define the purpose of each animation and provide a reduced mode that preserves the same final state and essential information with no large-scale panning, zooming, parallax, or prolonged motion. A short dissolve, instant change, or static cue may replace movement.\n\n- Read the user preference through CSS and any animation runtime, and respond when it changes.\n- Keep loading, success, error, progress, drag, and navigation outcomes perceivable without motion alone.\n- Do not gate cleanup or business state solely on animationend, transitionend, or a fixed duration.\n- Test focus order, screen-reader announcements, and pointer or keyboard completion in both modes.\n\nVerification: Enable reduced motion before load and during interaction; confirm every task reaches the same state with clear feedback and no stranded focus.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "The current state owns and can interrupt its animation",
      "summary": "Components cancel, reverse, replace, or finish prior motion deliberately so rapid input cannot leave stale styles, callbacks, focus, or DOM state.",
      "body": "Animation is a projection of application state, not an independent queue of delayed mutations. Keep one owner for each animated property and tie animation lifetime to the component state and lifecycle. When input reverses, navigation changes, or the component unmounts, cancel or retarget the active animation and invalidate stale completion callbacks.\n\n- Define interruption behavior for repeated clicks, hover-to-press transitions, drag cancellation, route replacement, and concurrent state updates.\n- Set the canonical final styles from state rather than depending on retained animation fill.\n- Clean up Web Animations API objects, observers, timers, requestAnimationFrame work, and library timelines on replacement and unmount.\n- Move focus and accessibility announcements according to logical state, not visual delay.\n\nVerification: Hammer each control, reverse halfway, navigate away, toggle reduced motion, and remount; confirm no orphan animation, stale callback, or incorrect final style remains.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Transforms and opacity are the default animation vocabulary",
      "summary": "Movement and reveal prefer transform and opacity, while layout animation measures deliberately and batches reads before writes.",
      "body": "Animating transform and opacity usually avoids repeated layout and gives the browser more opportunity to composite efficiently. Do not promote every element permanently or add will-change broadly; layer creation also consumes memory and can reduce quality. Apply hints shortly before justified motion and remove them after completion.\n\nWhen width, height, position, or content reflow must appear animated, measure stable before and after states, batch DOM reads before writes, and animate a visual transform or carefully bounded property without reading layout every frame. Preserve hit targets and final document flow. Profile on representative devices instead of assuming a smooth desktop recording proves responsiveness. See /tests/ui for reduced-motion and interruption cases."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Choose the smallest browser motion primitive that owns the lifecycle",
      "summary": "CSS handles simple state transitions, Web Animations adds imperative playback, and view transitions progressively enhance state or navigation changes.",
      "body": "Use CSS transitions or keyframes when style state and lifecycle are simple. Use the Web Animations API when code needs playback control, cancellation, reversal, timing inspection, or dynamic keyframes. Use view transitions when the browser can capture related before and after states across a view or navigation, but treat support and participation as progressive enhancement. A library is justified when it solves composition, gestures, orchestration, or framework lifecycle consistently.\n\nDo not mix several owners over the same property or let a library bypass reduced-motion policy. Feature-detect optional APIs and keep the state change correct when animation is unavailable, skipped, interrupted, or times out. Test final DOM and accessibility behavior rather than pixel timing alone."
    }
  ]
};
