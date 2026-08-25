import type { Pattern } from "../types.js";

export const unityGameDevelopment: Pattern = {
  "slug": "unity-game-development",
  "version": "1.0.0",
  "name": "Unity Game Development",
  "tagline": "Control frame-loop work, object lifetimes, physics timing, asset loading, and saved game state.",
  "description": "Unity scripts run inside engine-managed frame, physics, scene, serialization, and asset lifecycles, so ordinary application patterns such as per-frame allocation, hidden singleton state, and asynchronous scene mutation create stutter or nondeterministic behavior. This pattern constrains hot-loop allocation and physics changes, records component and scene ownership, separates runtime state from serialized configuration, and supplies a repeatable performance capture workflow. It opens a game-development segment the catalog does not cover and focuses on Unity's engine lifecycle rather than generic C# or application-service architecture.",
  "category": "Framework",
  "icon": "gamepad-2",
  "color": "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Unity game development pattern for AI agents",
  "metaDescription": "Unity frame loops, physics timing, component ownership, scene loading, asset lifetimes, pooling, and save-state boundaries for production games. In production.",
  "problem": "AI agents often allocate or search in Update, move physics bodies on the render clock, keep mutable state in ScriptableObjects, or let scene changes destroy an in-flight asynchronous operation.",
  "audience": "Unity teams shipping gameplay systems across desktop, mobile, console, or immersive targets",
  "prevents": [
    "Creating garbage and frame spikes in per-frame code",
    "Applying physics mutations at render-dependent timing",
    "Leaking mutable play-session state through shared assets",
    "Saving engine object references that cannot be restored"
  ],
  "appliesTo": {
    "paths": [
      "/Assets/Scripts",
      "/Assets/Scenes",
      "/Assets/Tests"
    ],
    "stacks": [
      "unity",
      "csharp",
      "game-development",
      "physics",
      "addressables"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/Assets/Scripts",
      "title": "Keep hot frame paths allocation-free and bounded",
      "summary": "Cache component references, avoid repeated scene searches, and move variable-cost work off every Update invocation.",
      "body": "A small allocation or hierarchy search multiplied by every object and every frame becomes visible as garbage collection or CPU spikes. Hot paths need explicit budgets and stable ownership.\n\n- Cache required components during initialization and inject cross-object references through serialized fields or a composition boundary; do not call hierarchy-wide find APIs inside `Update`.\n- Avoid LINQ, string formatting, closure creation, and temporary collections in per-frame code unless profiling proves the allocation is absent or acceptable.\n- Run work only when state changes where possible. For periodic checks, schedule or stagger them instead of polling every object on every frame.\n- Profile representative device builds, not only the editor, and capture main-thread time, allocations, rendering, and job activity around the exact gameplay event.\n\nSee /Assets/Tests for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/Assets/Scripts",
      "title": "Mutate physics on the physics clock",
      "summary": "Apply Rigidbody forces and physics movement in fixed-step code while reading input and presenting visuals at render cadence.",
      "body": "Rendering and physics advance on different clocks. Applying forces from a variable-rate update makes behavior depend on frame rate, while reading transient input only during a fixed step can miss events.\n\n- Sample player input at the render or input-system boundary, store intent, and consume that intent during the fixed physics step.\n- Move Rigidbody objects through physics APIs instead of writing Transform directly, which bypasses collision resolution and interpolation assumptions.\n- Use elapsed time appropriate to the active loop and do not multiply a physics force mode by time unless that mode's contract requires it.\n- Keep collision callbacks lightweight and defer expensive effects, object creation, and domain transitions to a controlled queue after the physics step.\n\nSee /Assets/Scripts for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/Assets/Scripts",
      "title": "MonoBehaviours adapt engine events to plain gameplay logic",
      "summary": "Keep engine callbacks thin and move testable rules into plain C# objects with explicit inputs and ownership.",
      "body": "MonoBehaviour is the bridge to Unity lifecycle and serialization, not the only place gameplay logic can live. Pure rules trapped inside callbacks require scene setup to test and accumulate hidden dependencies on active objects.\n\n- Use the component to translate engine callbacks, references, and time into explicit method calls on a gameplay object.\n- Keep plain gameplay objects free of scene searches and static global access so edit-mode tests can construct them with deterministic dependencies.\n- Own subscriptions in the same component that owns the subscriber and detach them when disabled or destroyed, matching the intended pause behavior.\n- Use interfaces or narrow references for services such as audio, spawning, saves, and analytics rather than a universal service locator reachable from every script.\n\nSee /Assets/Tests for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/Assets/Scripts",
      "title": "ScriptableObjects hold authored configuration, not live session state",
      "summary": "Treat shared assets as immutable configuration and create runtime state instances with explicit reset and save behavior.",
      "body": "ScriptableObjects are assets shared by every consumer and can retain changes unexpectedly in editor workflows. Using them as mutable global variables hides session boundaries and makes scene reloads or tests depend on prior execution.\n\n- Store designer-authored constants, curves, tables, and references in assets, then copy required values into a runtime state owner at session start.\n- Do not place player health, current inventory, active quest progress, or other per-session mutations directly on a shared asset.\n- When a runtime clone is intentional, create and destroy it through a clear owner and prevent callers from accidentally editing the source asset.\n- Serialize saved game data into stable domain identifiers and values; engine object references and scene instance IDs are not durable save formats.\n\nSee /Assets/Scenes for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "capture-unity-performance-regression",
      "summary": "Profile a reproducible gameplay segment and compare frame time, allocation, rendering, physics, and loading evidence.",
      "body": "---\nname: capture-unity-performance-regression\ndescription: Investigate a Unity performance regression on representative target hardware.\n---\n\n# Capture Unity Performance Regression\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Create a deterministic capture scene or replay that reaches the affected event with the same assets, entity counts, camera, and quality settings.\n2. Capture a development build on target hardware and mark the event so CPU, GPU, allocation, rendering, physics, and asset-loading timelines align.\n3. Identify the limiting frame and expand its call stacks or markers; separate steady-state cost from one-time warmup, compilation, or asset activation.\n4. Change one suspected source, repeat the same capture, and compare percentile frame times and allocation rather than a single editor observation.\n5. Keep the capture instructions and budget beside the system so later content growth can be measured against the same scenario.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "unity",
        "profiling",
        "performance",
        "frames",
        "regression"
      ]
    }
  ]
};
