import type { Pattern } from "../types.js";

export const designSystemsStorybook: Pattern = {
  "slug": "design-systems-storybook",
  "version": "1.0.0",
  "name": "Design Systems with Storybook",
  "tagline": "Turn component contracts into documented states, interaction evidence, accessibility checks, and releases.",
  "description": "Design systems with Storybook need more than a gallery of ideal component states. This bundle defines component contracts, deterministic stories, interaction and accessibility tests, visual review, deprecation, and consumer-safe release procedures. Unlike shadcn/ui, it governs a team's evolving component system and evidence rather than the adoption and customization of one component collection.",
  "category": "Frontend",
  "icon": "library-big",
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
  "metaTitle": "Storybook design systems for AI coding agents",
  "metaDescription": "Deterministic component stories, interaction tests, accessibility checks, visual review, deprecation, and release governance for frontend design systems.",
  "problem": "Agents add one happy-path story, depend on application context implicitly, or change component behavior without testing interaction, accessibility, visual states, and consumers.",
  "audience": "Teams building shared frontend components and documenting them with Storybook",
  "prevents": [
    "Stories that only render inside the full application",
    "Interactive states documented but never asserted",
    "Breaking component changes released without deprecation or migration guidance"
  ],
  "appliesTo": {
    "paths": [
      "/.storybook",
      "/src/components",
      "/src/stories"
    ],
    "stacks": [
      "storybook",
      "design-system",
      "components",
      "frontend"
    ],
    "packages": [
      "storybook"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/stories",
      "title": "Stories must be deterministic component contracts",
      "summary": "Every supported component state renders from explicit args and controlled decorators without hidden application or network state.",
      "body": "Every supported component state renders from explicit args and controlled decorators without hidden application or network state. A story that relies on current time, random data, live services, global order, or an app singleton cannot serve as reliable documentation or test evidence. Enforce this boundary in /src/stories so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Cover default, variants, loading, empty, error, disabled, long content, localization, and permission states that consumers must handle.\n- Provide stable providers, data, viewport, locale, theme, and time through scoped decorators or parameters.\n- Keep stories close enough to the component contract that removed props and states fail during the same change.\n- Use semantic queries and user-visible outcomes in play functions rather than implementation selectors.\n\nVerification: Run stories in isolation, shuffled order, CI, both themes, and representative viewports; confirm network is mocked and repeated runs produce the same DOM and assertions.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "The component API owns behavior, not page conventions",
      "summary": "A shared component should encode reusable interaction, semantics, states, and tokens while leaving product-specific data fetching and workflow policy to its consumer.",
      "body": "A shared component should encode reusable interaction, semantics, states, and tokens while leaving product-specific data fetching and workflow policy to its consumer. Define controlled and uncontrolled behavior, events, focus, disabled and loading semantics, composition slots, and accessibility expectations in the public contract.\n\nKeep page-specific copy, permissions, analytics names, routing, and server calls outside the primitive. Use design tokens and documented variants rather than exposing arbitrary styling escape hatches by default. Deprecate APIs with warnings and migration examples before removal when consumers ship independently. Keep the decision explicit at /src/components; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/stories for executable states and the component release skill for compatibility. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-storybook-component",
      "summary": "Review a design-system component across states, interaction, accessibility, visuals, responsiveness, and API quality.",
      "body": "---\nname: review-storybook-component\ndescription: Review a design-system component across states, interaction, accessibility, visuals, responsiveness, and API quality.\n---\n\n# Review Storybook Component\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Inventory the public props, events, slots, ref and focus behavior, supported states, tokens, and known consumer constraints.\n2. Inspect deterministic stories for default, variants, edge content, async, error, disabled, locale, direction, theme, and viewport coverage.\n3. Run interaction and accessibility checks with keyboard and assistive semantics, then review visual diffs for intended token and layout changes.\n4. Classify API and visual changes as compatible, deprecated, or breaking; require migration notes and consumer evidence for non-compatible changes.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "storybook",
        "design-system",
        "accessibility",
        "review"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/src/components",
      "title": "release-design-system",
      "summary": "Release a design-system change with story evidence, consumer compatibility, migration guidance, and provenance.",
      "body": "---\nname: release-design-system\ndescription: Release a design-system change with story evidence, consumer compatibility, migration guidance, and provenance.\n---\n\n# Release Design System\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Freeze the candidate and generate the component, token, icon, and utility changes from the last released version.\n2. Run type, unit, story render, interaction, accessibility, visual, theme, locale, and representative consumer tests against the immutable candidate.\n3. Assign semantic version impact from the documented public API and visual contract, then write upgrade and deprecation guidance with before and after examples.\n4. Publish only after approval, record artifact provenance, verify a clean consumer install, and open tracked work for every announced deprecation removal.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "storybook",
        "design-system",
        "release",
        "components"
      ]
    }
  ]
};
