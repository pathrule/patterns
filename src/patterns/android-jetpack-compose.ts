import type { Pattern } from "../types.js";

export const androidJetpackCompose: Pattern = {
  "slug": "android-jetpack-compose",
  "version": "1.0.0",
  "name": "Android with Jetpack Compose",
  "tagline": "Model Android UI state, effects, navigation, persistence, and background work across real lifecycles.",
  "description": "Jetpack Compose redraws from state while Android can recreate activities, stop collectors, kill the process, or resume a task after configuration and navigation changes, so correct code must distinguish composition lifetime from screen and process lifetime. This pattern constrains immutable UI state and effect ownership, records ViewModel, persistence, navigation, and coroutine decisions, and adds a lifecycle-focused review for screens and background transitions. It differs from Flutter and Expo patterns by focusing on Android lifecycle owners, saved state, coroutines, WorkManager, Compose effect APIs, and Gradle-driven native application structure.",
  "category": "Framework",
  "icon": "smartphone-charging",
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
  "metaTitle": "Jetpack Compose pattern for AI coding agents",
  "metaDescription": "Jetpack Compose state, effects, ViewModels, lifecycle-aware collection, navigation, persistence, and background work for Android applications. In production.",
  "problem": "AI agents often launch work during recomposition, store durable state only with remember, collect flows beyond the visible lifecycle, or pass whole mutable objects through navigation routes.",
  "audience": "Android teams building Kotlin applications with Jetpack Compose, coroutines, and architecture components",
  "prevents": [
    "Repeating network or analytics work during recomposition",
    "Losing user progress after process recreation",
    "Collecting a hot flow while the screen is stopped",
    "Passing mutable domain objects through navigation arguments"
  ],
  "appliesTo": {
    "paths": [
      "/app/src/main/java",
      "/app/src/main/res",
      "/app/src/test"
    ],
    "stacks": [
      "android",
      "jetpack-compose",
      "kotlin",
      "coroutines",
      "viewmodel"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app/src/main/java",
      "title": "Render immutable state and emit events upward",
      "summary": "Composable screens receive immutable state and callbacks, while ViewModels own transitions and expose a single observable UI state.",
      "body": "Recomposition can happen at any time and in any order allowed by the runtime. A composable that mutates shared objects while rendering or reaches into repositories directly makes repeated execution produce new side effects.\n\n- Expose one immutable screen state from the ViewModel and derive display-only values with stable calculations rather than maintaining parallel booleans that can contradict each other.\n- Pass state down and events up. Keep navigation, repository calls, and domain transitions behind event handlers owned by the screen or ViewModel.\n- Use stable keys for lazy lists and do not mutate collection instances in place; replace state with a new value so Compose can observe the transition.\n- Hoist reusable component state to the lowest common owner, but keep transient visual details local when no other component or process needs them.\n\nSee /app/src/test for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app/src/main/java",
      "title": "Launch effects only through lifecycle-aware APIs",
      "summary": "Tie suspend work, listeners, and flow collection to explicit Compose and Android lifecycles instead of starting them during rendering.",
      "body": "A composable body is not a lifecycle callback. Starting a coroutine, registering a listener, or sending analytics directly during composition repeats work whenever the function is recomposed.\n\n- Use `LaunchedEffect` with keys that describe when work must restart, and keep changing callbacks current without restarting long-lived work unnecessarily.\n- Register disposable listeners in `DisposableEffect` and remove the exact listener in cleanup. Do not rely on activity destruction to clean a screen-level resource.\n- Collect flows with lifecycle-aware collection so stopped screens do not continue expensive work or mutate invisible UI state.\n- Use `rememberCoroutineScope` only for jobs triggered by UI events and expected to end with the current composition; durable work belongs in a ViewModel or WorkManager.\n\nSee /app/src/main/java for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/app/src/main/java",
      "title": "remember, saved state, and persistence solve different lifetimes",
      "summary": "Choose state storage by whether it must survive recomposition, configuration change, process recreation, or application restart.",
      "body": "Android has several independent loss boundaries. Treating `remember` as persistence works in a preview and fails when the device rotates, the process is reclaimed, or the user returns after hours.\n\n- Use `remember` for state that only needs to survive recomposition inside the current composition instance.\n- Use saveable state for small UI values that can be represented in a bundle and should return after recreation; do not place large objects or active resources there.\n- Keep screen state and asynchronous work in a ViewModel so configuration changes do not restart the operation.\n- Persist durable user or domain data in a database or other repository. Saved state is a reconstruction hint, not a replacement for durable storage.\n\nSee /app/src/test for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/app/src/main/java",
      "title": "Navigation carries stable identifiers, not object graphs",
      "summary": "Pass route identifiers and compact arguments, then load authoritative state from the destination's repository or ViewModel.",
      "body": "Passing serialized mutable objects through navigation duplicates data, exceeds platform limits, and delivers stale state when the destination finally renders. A route should describe identity and intent rather than transport a database snapshot.\n\n- Define typed route arguments for stable identifiers and small values needed to construct the destination.\n- Load the current entity in the destination ViewModel and handle missing or unauthorized identifiers as normal navigation outcomes.\n- Return results through an explicit saved-state or shared-owner contract when a prior destination must react, rather than mutating an object both screens reference.\n- Keep deep links on the same route parsing and authorization path as in-app navigation so an external URI cannot bypass validation.\n\nSee /app/src/main/java for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/app/src/main/java",
      "title": "Durable background work belongs to WorkManager",
      "summary": "Use WorkManager for deferrable work that must survive process death; use foreground or in-process work only for their actual lifetime guarantees.",
      "body": "A coroutine launched from an activity or ViewModel ends when its owner is cleared or the process disappears. That is correct for UI work but incorrect for a required upload, synchronization, or retry that must eventually complete.\n\n- Schedule deferrable guaranteed work with constraints and an idempotent worker whose input is a stable identifier, not a large object snapshot.\n- Use unique work and an explicit replacement or keep policy when repeated user actions refer to the same logical operation.\n- Report progress through durable state the UI can observe after recreation instead of holding a callback to the original screen.\n- Use a foreground service only when the user-visible ongoing task and platform policy require it; it is not a generic escape hatch for unlimited background execution.\n\nSee /app/src/test for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-compose-lifecycles",
      "summary": "Exercise recomposition, navigation, configuration, process recreation, and background transitions for a Compose feature.",
      "body": "---\nname: review-compose-lifecycles\ndescription: Review a Jetpack Compose feature after changes to state, effects, navigation, or background work.\n---\n\n# Review Compose Lifecycles\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Enable recomposition diagnostics and verify rendering does not start network calls, analytics, listeners, or mutations more than the intended number of times.\n- [ ] Navigate away and back while effects and collectors are active; confirm cleanup occurs and state ownership matches the screen lifecycle.\n- [ ] Recreate the activity and restore from saved state, then simulate process recreation and verify durable data reloads from the repository.\n- [ ] Open the destination through both in-app navigation and a deep link with valid, missing, stale, and unauthorized identifiers.\n- [ ] Interrupt each background operation, relaunch the app, and prove WorkManager or the chosen owner resumes idempotently without duplicating external effects.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "android",
        "compose",
        "lifecycle",
        "kotlin",
        "review"
      ]
    }
  ]
};
