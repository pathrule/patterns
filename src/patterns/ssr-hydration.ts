import type { Pattern } from "../types.js";

export const ssrHydration: Pattern = {
  "slug": "ssr-hydration",
  "version": "1.0.0",
  "name": "SSR Hydration and Server-Client Consistency",
  "tagline": "Keep server HTML, initial client state, identifiers, and browser-only behavior deterministic.",
  "description": "Hydration attaches behavior to server-produced HTML under the assumption that the first client render describes the same tree. Time, randomness, environment branches, browser storage, locale, invalid markup, or different data snapshots break that assumption. This pattern constrains deterministic render inputs and stable identity, records browser-only and data-handoff boundaries, and provides a DOM and state comparison workflow across server and client. It complements framework-specific SSR patterns by describing the cross-framework invariant; routing and caching stay with Next.js, Nuxt, SvelteKit, or another renderer.",
  "category": "Frontend",
  "icon": "panel-top",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "SSR hydration pattern for AI coding agents",
  "metaDescription": "SSR hydration determinism, stable IDs, serialized data, browser-only state, valid HTML, streaming boundaries, and mismatch investigation. In production.",
  "problem": "AI agents often read window or storage during render, generate random IDs, refetch different data before hydration, or suppress mismatch warnings without repairing the divergent state.",
  "audience": "Frontend teams operating server-rendered React, Vue, Svelte, or other hydrated web applications",
  "prevents": [
    "Attaching state and listeners to the wrong server-rendered node",
    "Flashing different authenticated or personalized content on first paint",
    "Duplicating data requests before the serialized snapshot hydrates",
    "Hiding a genuine mismatch with a suppression flag"
  ],
  "appliesTo": {
    "paths": [
      "/src/server",
      "/src/client",
      "/tests/ssr"
    ],
    "stacks": [
      "ssr",
      "hydration",
      "frontend",
      "react",
      "vue"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/server",
      "title": "Render from deterministic, serializable inputs",
      "summary": "Use one request snapshot for server HTML and first client render, excluding time, randomness, browser globals, and mutable process state.",
      "body": "Hydration fails when the client computes different initial content before it has attached to the server tree. The server snapshot must be transferable and sufficient to reproduce the same visible structure.\n\n- Capture time, experiment assignment, locale, auth-visible state, and fetched data once per request and serialize only the values the client needs.\n- Do not call random generators or process-global counters during component render; derive stable identity from data or a framework-supported deterministic ID mechanism.\n- Create request-scoped stores and caches on the server so one request cannot reuse personalized state from another.\n- Escape serialized data for its HTML embedding context and reject non-serializable class instances, functions, handles, or cyclic objects at the boundary.\n\nSee /src/client for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/client",
      "title": "Introduce browser-only state after hydration",
      "summary": "Render a stable server-compatible fallback first, then read storage, viewport, media, DOM, and device APIs in an effect or client-only boundary.",
      "body": "The browser has state the server cannot observe, but branching on it during the first render changes text or structure before hydration. That includes theme, connectivity, media queries, extensions, and persisted client preferences.\n\n- Use a deterministic initial value agreed with the server and update it after mount when browser-only state becomes available.\n- For layout-dependent content, preserve a stable container or skeleton so the post-hydration update does not create avoidable layout shift.\n- Do not use a broad client-only wrapper to hide server-capable content; isolate only the smallest subtree that genuinely requires browser APIs.\n- Treat mismatch suppression as a narrow acknowledgement for inherently unstable text, not a fix for ownership, data, identity, or markup errors.\n\nSee /tests/ssr for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/server",
      "title": "The hydration payload is a versioned public contract",
      "summary": "Serialize the minimum initial state with schema identity and consume it before starting duplicate client fetches.",
      "body": "Server and client bundles can overlap during deployment, and a browser can hydrate HTML produced by an instance on a neighboring version. An unversioned arbitrary object is fragile across that window.\n\n- Define the payload fields and schema version explicitly and keep additive compatibility through the maximum mixed-deployment and cached-HTML window.\n- Embed only data already authorized for the rendered user and route; serialized state is visible page source, not a private server channel.\n- Initialize the client cache or store from the payload before automatic fetching begins so the same resource is not requested and replaced immediately.\n- Remove payload elements after consumption where appropriate and avoid retaining duplicate large data in both DOM text and multiple client stores.\n\nSee /src/client for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/server",
      "title": "Valid HTML is part of the component contract",
      "summary": "Keep server markup legal and structurally stable because browser parser correction occurs before the framework hydrates it.",
      "body": "Browsers repair invalid nesting while parsing the server response. The DOM the framework receives can therefore differ from the string the server emitted even though both server and client component code appear identical.\n\n- Use semantic elements with legal parent and child relationships and do not nest interactive controls inside other interactive controls.\n- Render table, list, form, and paragraph structures according to HTML parsing rules rather than relying on the browser's repair behavior.\n- Keep conditional wrappers stable between server and client so keys and sibling positions retain the same meaning.\n- Inspect the parsed DOM in a browser when a mismatch survives data checks; comparing server strings alone misses parser-inserted or rearranged nodes.\n\nSee /tests/ssr for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/client",
      "title": "Streaming boundaries have independent failure and reveal behavior",
      "summary": "Design each streamed boundary with a stable fallback, error path, data owner, and ordering relationship to the hydration payload.",
      "body": "Streaming can deliver and hydrate portions of the page at different times. A boundary that reads mutable shared state or depends on a sibling's side effect can behave differently according to reveal order.\n\n- Give each boundary the data and serialized state it needs without relying on another boundary hydrating first.\n- Make fallbacks structurally compatible with the final content where possible and avoid duplicate interactive identifiers across pending and revealed trees.\n- Handle server failure before flush, failure after partial flush, and client hydration failure as separate observable outcomes.\n- Keep critical metadata and primary content outside unnecessarily delayed boundaries when crawlers and first interaction depend on them.\n\nSee /src/server for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "investigate-hydration-mismatch",
      "summary": "Compare server inputs, emitted HTML, parsed DOM, client inputs, and first render to isolate an SSR mismatch.",
      "body": "---\nname: investigate-hydration-mismatch\ndescription: Investigate a hydration warning, stale first paint, or server-client DOM replacement.\n---\n\n# Investigate Hydration Mismatch\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Reproduce without extensions and with a fixed clock, locale, timezone, random seed, authentication state, route, and backend snapshot.\n2. Capture the server's request-scoped inputs and hydration payload, then compare them with the values available before the client's first render.\n3. Inspect emitted HTML and the browser-parsed DOM for invalid nesting, inserted elements, changed attributes, or unstable identifiers.\n4. Disable branches selectively for time, randomness, browser APIs, storage, media queries, and immediate refetch to identify the first divergent subtree.\n5. Repair the ownership or serialization boundary, remove unnecessary suppression, and add a server-render plus real-browser hydration regression test for the case.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "ssr",
        "hydration",
        "debugging",
        "frontend",
        "testing"
      ]
    }
  ]
};
