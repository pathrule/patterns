import type { Pattern } from "../types.js";

export const vue3: Pattern = {
  "slug": "vue-3",
  "version": "1.0.0",
  "name": "Vue 3 Production Patterns",
  "tagline": "Keep Vue reactivity explicit, composables bounded, and server-rendered output deterministic.",
  "description": "Vue applications usually fail at production boundaries rather than at template syntax: destructured reactive values stop updating, watchers become hidden command buses, and server-rendered markup diverges from the browser on first paint. This pattern places reactivity constraints in component code, composable ownership decisions in the composables directory, Pinia store boundaries in the store layer, and a repeatable hydration review at the workspace root. It complements the Nuxt pattern without duplicating routing or deployment guidance, and it differs from React state guidance by focusing on refs, proxies, effect scopes, and Vue's dependency tracking model.",
  "category": "Framework",
  "icon": "panels-top-left",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Vue 3 production pattern for AI coding agents",
  "metaDescription": "Vue 3 reactivity, composable ownership, Pinia boundaries, and hydration checks that stop stale refs, watcher loops, and server-client drift. In production.",
  "problem": "AI agents often destructure reactive objects, use watchers for derived state, or read browser-only values during Vue SSR, producing stale UI and hydration warnings that appear far from the change.",
  "audience": "Vue teams shipping component libraries, SPAs, or server-rendered applications with TypeScript",
  "prevents": [
    "Losing reactivity by destructuring a reactive proxy",
    "Using watchers to synchronize values that should be computed",
    "Sharing mutable module state across server requests",
    "Hydrating markup that depends on browser-only data"
  ],
  "appliesTo": {
    "paths": [
      "/src/components",
      "/src/composables",
      "/src/stores"
    ],
    "stacks": [
      "vue",
      "vue3",
      "typescript",
      "pinia",
      "ssr"
    ],
    "packages": [
      "vue",
      "pinia"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Preserve ref identity across component boundaries",
      "summary": "Keep values reactive through props, composables, and templates instead of copying or destructuring proxies into stale locals.",
      "body": "Vue tracks access through refs and reactive proxies. Copying a property into a plain local severs that access path, so the template keeps rendering an old value even though the source object changed.\n\n- Use `toRef` or `toRefs` when a property must be passed independently; do not destructure a reactive object into plain variables and assume dependency tracking survives.\n- Treat props as readonly inputs. Emit an event or expose a model binding for changes instead of mutating nested prop state through a reference the parent also owns.\n- Use `computed` for derived values and keep the getter pure. A computed getter that writes another ref creates an order-dependent loop and hides the true owner of state.\n- Unwrap refs in templates, but keep `.value` explicit in TypeScript code so assignments and dependency reads remain visible during review.\n\nSee /src/composables for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Keep server and browser renders deterministic",
      "summary": "Render identical initial markup on server and client, then introduce browser-only state after mount behind an explicit boundary.",
      "body": "Hydration assumes the browser receives the same tree the server produced. Reading time, randomness, local storage, viewport size, or DOM state during setup makes the first client render disagree before Vue can attach listeners.\n\n- Do not call `Date.now`, `Math.random`, storage APIs, or layout measurement while producing SSR markup unless the value is serialized from the server and reused by the client.\n- Move DOM-dependent work to `onMounted` and render a stable placeholder before mount. The placeholder must preserve structure where layout shift matters.\n- Never keep request-specific mutable state in a module singleton on the server. Create stores and app state per request so one user's data cannot leak into another render.\n- Use stable keys that come from data identity. Generating keys during render changes node correspondence and can silently attach state to the wrong row.\n\nSee /src/stores for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/composables",
      "title": "A composable owns one lifecycle and one state boundary",
      "summary": "Composables expose a focused capability, register cleanup with their caller, and avoid becoming application-wide service locators.",
      "body": "A useful composable is not merely a function whose name starts with `use`. Its value is lifecycle ownership: it creates state, subscribes to an external source, and guarantees that the subscription ends with the component scope that requested it.\n\n- Register event listeners, observers, timers, and subscriptions inside the composable, then clean them with `onScopeDispose` so nested effect scopes are safe too.\n- Return readonly refs for state consumers should observe but not mutate. Expose named commands for transitions that require validation or side effects.\n- Accept refs or getters when an input can change. Normalize them at the edge rather than reading an initial value and freezing the composable to it.\n- Split network caching, domain state, and DOM integration into separate composables; one `useApp` object that exposes everything has no enforceable ownership boundary.\n\nSee /src/components for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/stores",
      "title": "Pinia stores hold shared domain state, not every remote response",
      "summary": "Reserve Pinia for cross-route domain state and explicit transitions; leave request caching with the data-fetching layer.",
      "body": "Pinia is most effective when it models durable client-side domain state such as the active workspace, a draft, or a multi-step workflow. Treating it as a second cache for every API response creates invalidation work and two competing sources of truth.\n\n- Keep store state serializable when SSR is enabled so the server snapshot can be transferred and hydrated without custom object behavior.\n- Define transitions as actions when they enforce invariants or combine writes. Components may update a simple local preference directly, but domain changes should have names.\n- Do not copy query results into a store merely to make them global. Share the query key and cache instead, then invalidate through the data-fetching layer.\n- Instantiate stores per server request and dispose test instances between cases; global reuse creates order-dependent tests and cross-request leaks.\n\nSee /src/components for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Watchers are integration tools, not derivation tools",
      "summary": "Use watchers for external effects and cancellation; use computed values for anything that can be expressed from reactive inputs.",
      "body": "A watcher is appropriate when a reactive change must cross Vue's boundary into an external system, such as updating a URL, starting a request, or writing storage. It is a poor substitute for a value that can be derived synchronously.\n\n- Prefer `computed` when the output is another value. It caches by dependency and cannot drift out of sync with its inputs.\n- When a watcher starts asynchronous work, register cleanup and abort the prior operation before issuing the next one so late responses cannot overwrite newer state.\n- Choose `watch` when the dependency list should be explicit and `watchEffect` only when automatic dependency discovery is genuinely clearer.\n- Avoid deep watchers over large objects. Watch the specific scalar or immutable reference that represents the change instead of traversing the whole graph.\n\nSee /src/composables for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-vue-reactivity-boundaries",
      "summary": "Audit a Vue change for lost ref identity, runaway effects, store duplication, and hydration drift before release.",
      "body": "---\nname: review-vue-reactivity-boundaries\ndescription: Review Vue component, composable, store, and SSR boundaries after a feature or refactor.\n---\n\n# Review Vue Reactivity Boundaries\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Trace each displayed value back to its ref, reactive proxy, computed getter, or serialized server input; flag every plain copy that can become stale.\n- [ ] List every watcher and confirm it crosses into an external side effect, cancels prior async work, and cannot be replaced by a computed value.\n- [ ] Inspect composables for listener, timer, observer, and subscription cleanup through the active effect scope.\n- [ ] Compare server and first-client inputs for time, randomness, storage, viewport, and request-specific state; render a deterministic placeholder where needed.\n- [ ] Run the changed flow through navigation and component teardown, then verify that Pinia and query caches have one owner for each piece of shared data.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "vue",
        "reactivity",
        "pinia",
        "ssr",
        "review"
      ]
    }
  ]
};
