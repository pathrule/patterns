import type { Pattern } from "../types.js";

export const swiftui: Pattern = {
  "slug": "swiftui",
  "version": "1.0.0",
  "name": "SwiftUI",
  "tagline": "Build SwiftUI apps that compile under Swift 6 strict concurrency and keep state in one owner.",
  "description": "The modern Apple stack is narrow and opinionated: SwiftUI for views, the @Observable macro for state, SwiftData for persistence, NavigationStack for routing, and a compiler that now rejects data races instead of letting them crash at runtime. Assistants keep generating the previous generation of that stack, which either fails to build under Swift 6 or compiles into a view that reloads on every keystroke. This bundle fixes the state ownership, concurrency isolation, view body discipline, and SwiftData context rules that decide whether an app stays responsive.",
  "category": "Framework",
  "icon": "apple",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "SwiftUI and SwiftData pattern for AI agents",
  "metaDescription": "SwiftUI pattern for AI coding agents: Observable state with MainActor, Swift 6 strict concurrency, SwiftData contexts, and view bodies that stay cheap.",
  "problem": "AI agents write SwiftUI with ObservableObject and published properties, do work inside view bodies, and cross actor boundaries in ways Swift 6 strict concurrency rejects.",
  "audience": "iOS and macOS teams on Swift 6 with SwiftUI and SwiftData",
  "prevents": [
    "Generating ObservableObject and published wrappers where the Observable macro is the current API",
    "Doing network or formatting work inside a view body so it reruns on every render",
    "Passing a SwiftData model between actors instead of its persistent identifier",
    "Silencing a concurrency error with unchecked Sendable instead of fixing the isolation"
  ],
  "appliesTo": {
    "paths": [
      "/App",
      "/Features",
      "/Models"
    ],
    "stacks": [
      "swift",
      "swiftui",
      "swiftdata",
      "ios",
      "concurrency"
    ],
    "packages": [
      "swift-collections",
      "swift-async-algorithms"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/Features",
      "title": "One owner per piece of state, expressed with the Observable macro",
      "summary": "View-local state uses State, shared state uses an Observable class on the MainActor, and no new code uses ObservableObject or published wrappers.",
      "body": "SwiftUI redraws based on what a view actually reads. The Observation framework tracks that per property, which is why the old protocol-plus-wrapper approach is both more code and slower.\n\n- Mark shared state classes with `@Observable` and annotate them `@MainActor`. Views read their properties directly; there is no `@Published`, no `objectWillChange`, and no `@StateObject`.\n- Own the instance where its lifetime belongs: `@State private var model = Model()` in the view that creates it, `@Environment` for something app-wide, and a plain `let` for a model passed in. Never create an observable model in a computed property or in `body`.\n- Use `@Bindable` when a child needs two-way access to an observable's property, and `@Binding` for value types owned by a parent.\n- Keep `@State` for genuinely view-local values (a text field's draft, a sheet flag). If two views need it, it belongs to a model, not to a parent's binding chain.\n- Do not mirror the same value in two owners and sync them in `onChange`. Derive it with a computed property instead.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/App",
      "title": "Satisfy Swift 6 isolation instead of silencing it",
      "summary": "UI types stay on the MainActor, shared mutable state lives in an actor, values crossing boundaries are Sendable, and unchecked Sendable is not a fix.",
      "body": "Swift 6 turns data races into compile errors. Every warning it raises is a race the old code had and nobody noticed.\n\n- Annotate UI-facing types `@MainActor` (views already are) and let the compiler push background work outward, rather than sprinkling `DispatchQueue.main.async` at the call sites.\n- Put shared mutable state in an `actor` and reach it with `await`. A class with a lock that you promise is safe is exactly what `@unchecked Sendable` hides; use it only for a type you have genuinely audited, and write down why.\n- Make types that cross a boundary `Sendable`. Prefer value types and immutable stored properties, since that makes conformance automatic.\n- Prefer structured concurrency: `async let` and `TaskGroup` for parallel work, `.task` for view-scoped work. An unstructured `Task { }` inherits no cancellation and no isolation guarantees, so reserve it for genuine fire-and-forget and store the handle if it must be cancellable.\n- Never block a thread waiting for async work (no semaphores around `Task`), and never call a synchronous API that blocks on the main actor.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/Features",
      "title": "Keep view bodies cheap and identities stable",
      "summary": "A body only describes UI: no I/O, no formatting work, no sorting; lists use stable ids and async work runs in task with cancellation.",
      "body": "`body` can be evaluated many times per second. Anything expensive in it is multiplied by every render, and unstable identity throws away the view state SwiftUI was preserving.\n\n- Do no work in `body` beyond reading state and composing views. Precompute derived collections, formatted strings, and date math in the model (a computed property on an `@Observable` type is fine, a network call is not).\n- Start async work with `.task { }` (or `.task(id:)` when it should restart on a value change), never `onAppear` plus an unstructured `Task`. `.task` is cancelled automatically when the view goes away, which is what prevents the classic \"update after dismiss\" crash.\n- Give `ForEach` a genuinely stable identity: an `Identifiable` model or an explicit `id:` keyed to a real identifier. Using an array index reuses the wrong state when the collection reorders.\n- Extract subviews so state changes redraw the smallest region that changed, and pass the narrowest data a subview needs rather than the whole model.\n- Watch the modifier order (`frame` before `background`, `padding` before `border`), because in SwiftUI order is semantics, not style.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/Models",
      "title": "Respect SwiftData context boundaries",
      "summary": "The UI reads through the main context, writes off the main thread go through a background context or ModelActor, and identifiers cross boundaries instead of models.",
      "body": "SwiftData models are not `Sendable`. A model object belongs to the context that fetched it, and moving one across an isolation boundary is the source of the crashes people blame on SwiftData being immature.\n\n- Configure one `ModelContainer` at the app entry and inject it with `.modelContainer(...)`. Views fetch with `@Query` and mutate through `@Environment(\\.modelContext)`.\n- Do bulk or long-running work in a background context (a `ModelActor`, or a context created on the actor doing the work) and save there. Do not hand a fetched model to a `Task` on another actor.\n- Pass a `PersistentIdentifier` across boundaries and re-fetch on the other side. That is the only safe way to refer to the same row from another context.\n- Keep `@Query` predicates and sort descriptors in the query itself so the store does the filtering. Fetching everything and filtering in Swift defeats the index and loads the whole table.\n- Model relationships explicitly with `@Relationship`, choose the delete rule deliberately, and mark unique constraints; SwiftData will not guess your integrity rules.\n\nSee /App for the concurrency rule this depends on.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/Features",
      "title": "Navigation is data: NavigationStack with a typed path",
      "summary": "Routing state is an array of values a model owns, so deep links, restoration, and programmatic pops are the same mechanism.",
      "body": "`NavigationStack` replaced the deprecated `NavigationView`, and the point of the replacement is that navigation became state you can inspect.\n\n- Drive the stack with `NavigationStack(path: $router.path)` where `path` is an array of route values, and register destinations with `navigationDestination(for:)`. Pushing is appending; popping is removing; going home is emptying the array.\n- Make the route type a small `Hashable` enum or a value struct, not a view. A route carries an id, not a rendered screen.\n- Own the path in an `@Observable` router when more than one screen needs to navigate, and keep it `@MainActor` like the rest of the UI state.\n- Deep links and state restoration become a decode into that array, which is why this design is worth it: one code path for a tap, a notification, and a universal link.\n- Use `NavigationSplitView` for multi-column layouts on iPad and Mac rather than reimplementing a sidebar, and let it collapse on compact widths.\n\nSee /Features for the state ownership rule the router follows."
    },
    {
      "kind": "memory",
      "nodePath": "/App",
      "title": "Dependencies, previews, and tests without a hidden singleton",
      "summary": "Inject services through the environment or initialisers so previews and Swift Testing runs get fakes instead of the network.",
      "body": "The main reason SwiftUI code becomes untestable is a view or model that reaches for a shared singleton. Injecting instead costs nothing and pays for itself in previews.\n\n- Define a protocol for anything that leaves the process (network, keychain, notifications, analytics), inject it into the observable model, and default to the live implementation at the app entry.\n- Expose app-wide dependencies through a custom `EnvironmentKey` (or `@Entry`) so a view subtree can be re-pointed at a fake. Reading a global `.shared` inside a view makes every preview a live request.\n- Give each screen a `#Preview` with a fake model in a fixed state, including the loading and error states. A preview that only shows the happy path is the reason nobody notices the empty state is broken.\n- Write tests with Swift Testing (`@Test`, `#expect`, `@Suite`) for new code, and keep XCTest for UI tests and existing suites. Both can coexist in a project.\n- Test the model, not the view body: given a fake service, assert the state the view will render. Snapshot or UI tests cover layout, not logic.\n\nSee /Features for state ownership and /Models for the SwiftData boundary these fakes stand in for."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "swiftui-concurrency-review",
      "summary": "Pre-merge checklist for SwiftUI changes under Swift 6 strict concurrency and SwiftData.",
      "body": "---\nname: swiftui-concurrency-review\ndescription: Review checklist for SwiftUI code under Swift 6 strict concurrency: state ownership, actor isolation, view body cost, SwiftData context boundaries, and navigation state. Run before merging.\n---\n\n# SwiftUI review\n\n## State\n- [ ] Shared state is an `@Observable` `@MainActor` class; no new `ObservableObject` or `@Published`.\n- [ ] Each value has exactly one owner; no mirrored copies synced in `onChange`.\n- [ ] Models are not constructed inside `body` or a computed view property.\n\n## Concurrency\n- [ ] No new `@unchecked Sendable`; shared mutable state is in an actor.\n- [ ] Async work uses `.task` (or `.task(id:)`) and is cancellable; no detached `Task` for view work.\n- [ ] Nothing blocks a thread waiting on async work; no semaphores around `Task`.\n- [ ] The build is clean under strict concurrency, with no suppressed warnings.\n\n## Views\n- [ ] `body` does no I/O, formatting, or sorting.\n- [ ] `ForEach` uses a stable identifier, not an array index.\n- [ ] Subviews are extracted so a change redraws the smallest region.\n\n## SwiftData\n- [ ] Models never cross an isolation boundary; `PersistentIdentifier` does.\n- [ ] Bulk writes run in a background context or `ModelActor`.\n- [ ] `@Query` filters and sorts in the query, not in Swift.\n\n## Navigation\n- [ ] Routing is a typed path array owned by a model; no `NavigationView`.\n- [ ] Deep link and restoration go through the same path decode.\n",
      "skillTags": [
        "swift",
        "swiftui",
        "concurrency",
        "swiftdata",
        "code-review"
      ]
    }
  ]
};
