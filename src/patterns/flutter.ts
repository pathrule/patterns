import type { Pattern } from "../types.js";

export const flutter: Pattern = {
  "slug": "flutter",
  "version": "1.0.0",
  "name": "Flutter",
  "tagline": "Build Flutter apps that stay fast and leak-free with disciplined widgets and clear state boundaries.",
  "description": "A baseline for building maintainable Flutter apps in Dart 3. It keeps the widget tree cheap to rebuild with const constructors and small widgets, keeps business logic out of build(), disposes every controller and subscription so screens don't leak, and organizes state and navigation around Riverpod and go_router. These are the conventions that keep a Flutter codebase smooth at 60/120fps and readable as features pile up.",
  "category": "Framework",
  "icon": "smartphone",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Flutter pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for Flutter and Dart 3: const constructors and small widgets, logic out of build(), disposing controllers and subscriptions, plus Riverpod state and go_router navigation, tuned for AI coding agents.",
  "problem": "AI agents writing Flutter pile logic into build(), skip const, never dispose controllers, and scatter setState everywhere, producing janky, leaky, hard-to-test screens.",
  "audience": "Mobile teams building cross-platform apps with Flutter and Dart",
  "prevents": [
    "Running expensive work or business logic inside build()",
    "Leaking controllers, streams, and listeners by skipping dispose()",
    "Rebuilding whole subtrees because const constructors and keys are missing",
    "Spreading mutable state through setState instead of a state-management boundary"
  ],
  "appliesTo": {
    "paths": [
      "/lib",
      "/lib/features"
    ],
    "stacks": [
      "flutter",
      "dart"
    ],
    "packages": [
      "flutter_riverpod",
      "go_router"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/lib",
      "title": "Dispose every controller, stream, and listener",
      "summary": "Anything with a lifecycle - controllers, animation controllers, stream subscriptions, focus nodes, listeners - must be released in dispose(); leaks here are the most common Flutter bug.",
      "body": "Flutter does not garbage-collect your subscriptions. A controller or stream you create and forget keeps firing after the widget is gone - a leak, a memory climb, and often a `setState() called after dispose` crash.\n\n- For every `TextEditingController`, `AnimationController`, `ScrollController`, `FocusNode`, `StreamSubscription`, or `addListener` you create in a `StatefulWidget`, release it in `dispose()` (`controller.dispose()`, `subscription.cancel()`, `removeListener(...)`).\n- Create these in `initState` (or as late finals), not in `build()`; creating a controller in `build` makes a new one every frame and leaks all of them.\n- Guard async callbacks that touch state with a `mounted` check before `setState`, so a response that arrives after the widget is disposed does not crash.\n- Prefer Riverpod providers or `AutomaticKeepAlive`/hooks that manage disposal for you when the lifecycle is non-trivial; the rule is that nothing with a lifecycle is left un-released.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/lib",
      "title": "Keep build() pure and widgets small; use const",
      "summary": "build() only describes UI from current state - no I/O, no business logic, no allocation of long-lived objects; split large widgets and mark const subtrees const.",
      "body": "`build()` can run many times per second. Anything expensive or stateful inside it runs that often, which is where jank comes from.\n\n- `build()` is a pure function of the widget's inputs and state: read data and return widgets. Do not perform network calls, heavy computation, or side effects in it; move those to `initState`, an event handler, or a provider.\n- Mark widgets and subtrees `const` wherever the inputs are constant. A `const` widget is built once and skipped on rebuild, which is the cheapest performance win in Flutter and the one most often missed.\n- Split large `build` methods into small, focused widget classes rather than private `_buildX()` helper methods. Real widgets get their own rebuild boundary and can be `const`; helper methods rebuild with the whole parent.\n- Use `Key`s when reordering or conditionally swapping widgets of the same type so Flutter preserves state correctly instead of mismatching elements.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/lib",
      "title": "State management with Riverpod",
      "summary": "We manage app and screen state with Riverpod providers, keeping logic and async state out of widgets and making it testable.",
      "body": "We use Riverpod as the state-management boundary so business logic lives outside the widget tree and can be tested without pumping widgets.\n\n- Keep mutable and async state in providers, not in widget `setState`. `setState` is fine for purely local, ephemeral UI state (a toggled expansion, a hover); anything shared, fetched, or business-relevant belongs in a provider.\n- Use the provider type that fits: a plain provider for derived values, an async notifier for fetched state (it exposes loading/error/data so the UI renders all three), a notifier for mutable state with methods.\n- Read providers with `ref.watch` in `build` to rebuild on change, and `ref.read` in callbacks for one-off actions. Don't `watch` inside a callback or `read` something the UI must react to.\n- Keep providers small and composable; one provider per concern, composed via `ref.watch` of other providers, beats one giant app-state object.\n\nSee /lib for the feature-first structure and go_router navigation memories."
    },
    {
      "kind": "memory",
      "nodePath": "/lib",
      "title": "Feature-first project structure",
      "summary": "Organize lib/ by feature, each owning its UI, state, and data, rather than by technical layer across the whole app.",
      "body": "We organize `lib/` by feature, not by global technical layer, so a feature's code lives together and stays easy to find, change, and delete.\n\n- Structure: `lib/features/<feature>/` each containing its own `presentation/` (widgets/screens), `application/` or `providers/` (state), and `data/` (repositories/models). Shared building blocks live in `lib/core/` or `lib/shared/`.\n- Avoid the layer-first anti-pattern (`lib/widgets/`, `lib/models/`, `lib/services/` spanning every feature); it scatters one feature across the tree and makes ownership unclear.\n- Keep cross-feature dependencies explicit and one-directional through shared/core; a feature should not reach into another feature's internals.\n- Co-locate tests with the feature (or mirror the structure under `test/`) so behavior and its tests evolve together.\n\nSee /lib for the Riverpod state and go_router navigation memories."
    },
    {
      "kind": "memory",
      "nodePath": "/lib",
      "title": "Navigation with go_router",
      "summary": "Use go_router for declarative, URL-addressable routing with typed routes and centralized redirects, instead of imperative Navigator stacks.",
      "body": "We route with `go_router` so navigation is declarative, deep-linkable, and consistent across mobile and web.\n\n- Define routes declaratively in one `GoRouter` configuration with named or typed routes; navigate with `context.go(...)` / `context.push(...)` instead of building `Navigator.push(MaterialPageRoute(...))` ad hoc throughout the app.\n- Centralize auth and access logic in the router's `redirect`, returning the login route when unauthenticated, so guarding is in one place rather than checked in every screen.\n- Use typed/named routes and pass parameters through the route definition (path/query params) so deep links and state restoration work and route changes are refactor-safe.\n- Keep route definitions out of widgets; the router config is app-level configuration, and screens just request navigation.\n\nSee /lib for the feature-first structure and Riverpod state memories."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "flutter-screen-checklist",
      "summary": "Checklist for adding or changing a Flutter screen/feature: disposal, build purity, state, and navigation.",
      "body": "---\nname: flutter-screen-checklist\ndescription: Checklist for adding or changing a Flutter screen or feature. Run before merging any widget, provider, or route change.\n---\n\n# Flutter screen/feature checklist\n\n- [ ] Every controller, animation controller, stream subscription, focus node, and listener created is released in `dispose()`.\n- [ ] Controllers are created in `initState`/as fields, never in `build()`; async callbacks check `mounted` before `setState`.\n- [ ] `build()` is pure - no network, no heavy compute, no side effects; that work is in `initState`, handlers, or providers.\n- [ ] Constant subtrees are `const`; large builds are split into real widget classes, not `_buildX()` helpers.\n- [ ] `Key`s are set where same-type widgets are reordered or swapped so state is preserved.\n- [ ] Shared/async/business state is in Riverpod providers (loading/error/data handled); `setState` is only for local ephemeral UI.\n- [ ] `ref.watch` drives rebuilds in `build`; `ref.read` is used in callbacks.\n- [ ] Code lives under `lib/features/<feature>/` with presentation/state/data separated; shared code in core/shared.\n- [ ] Navigation goes through go_router (`context.go/push`, typed/named routes); auth handled in the router `redirect`.\n- [ ] `flutter analyze` is clean; widget/unit tests cover the new behavior.\n",
      "skillTags": [
        "flutter",
        "dart",
        "riverpod",
        "go-router",
        "mobile",
        "ui-review"
      ]
    }
  ]
};
