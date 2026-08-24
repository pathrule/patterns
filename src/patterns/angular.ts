import type { Pattern } from "../types.js";

export const angular: Pattern = {
  "slug": "angular",
  "version": "1.0.0",
  "name": "Angular",
  "tagline": "Write signal-first, zoneless Angular with standalone components and no manual subscriptions.",
  "description": "Modern Angular looks almost nothing like the Angular most training data remembers. On the current line, standalone components are the default and NgModule is gone from new code, signals are the primary reactive primitive, and zoneless change detection is the default for new apps rather than an experiment. This bundle keeps an assistant on that surface: signals and computed for state, the built-in control flow blocks with a required track, inject() and functional interceptors, and resource-based data loading instead of hand-rolled subscription bookkeeping.",
  "category": "Framework",
  "icon": "shield",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Angular signals pattern for AI coding agents",
  "metaDescription": "Angular pattern for AI coding agents: signals and computed state, standalone components, zoneless change detection, and the built-in control flow blocks.",
  "problem": "AI agents write Angular the way it looked five years ago: NgModule declarations, constructor injection, manual subscribe calls with no teardown, and ngIf and ngFor in templates.",
  "audience": "Frontend teams on the current Angular line, migrating off NgModule and RxJS-only state",
  "prevents": [
    "Generating NgModule boilerplate for components that should be standalone",
    "Calling subscribe in a component with no teardown, leaking on every navigation",
    "Assuming Zone.js will notice a change, which never happens in a zoneless app",
    "Rendering a list with no track expression and re-creating every DOM node"
  ],
  "appliesTo": {
    "paths": [
      "/src/app",
      "/src/app/core"
    ],
    "stacks": [
      "angular",
      "typescript",
      "signals",
      "rxjs",
      "spa"
    ],
    "packages": [
      "@angular/core",
      "@angular/router",
      "@angular/common",
      "rxjs"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Hold component state in signals, not in fields updated by subscribe",
      "summary": "Use signal, computed, and linkedSignal for state, derive instead of recompute, and convert streams with toSignal rather than subscribing by hand.",
      "body": "Signals are Angular's reactive primitive now, and they are what makes zoneless change detection precise. A component that stores state in plain fields and updates them from a subscription is invisible to that machinery.\n\n- Declare mutable state with `signal()`, derived state with `computed()`, and inputs with the `input()` / `model()` signal APIs. Never recompute a derived value in a lifecycle hook.\n- Convert an observable at the edge with `toSignal()` instead of subscribing in the component. If you must subscribe (a side effect, not a value), pipe through `takeUntilDestroyed()` so teardown is automatic.\n- Do not write to a signal inside a `computed()`. Use `effect()` only for genuine side effects (analytics, DOM APIs, storage), never to sync one signal into another; that is what `computed` and `linkedSignal` are for.\n- Read signals as function calls in the template (`count()`), and keep the reads shallow: a template that calls a method which loops is a re-render cost on every check.\n- Keep RxJS for what it is genuinely good at (event streams, debouncing, cancellation) and let signals hold the state those streams produce.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Standalone components only, with lazy routes",
      "summary": "No new NgModule: components, directives, and pipes are standalone, dependencies are declared in imports, and routes lazy-load components.",
      "body": "Standalone is the default in current Angular, and mixed-mode projects pay the cost of both worlds. New code declares its own dependencies.\n\n- Write components, directives, and pipes as standalone and list what a template uses in that component's `imports`. Do not create an NgModule for new code, and do not import a barrel module that pulls in half the app.\n- Bootstrap with `bootstrapApplication` and configure the app through `ApplicationConfig` providers (`provideRouter`, `provideHttpClient`, `provideAnimationsAsync`), not through module metadata.\n- Lazy-load at the route with `loadComponent` (or `loadChildren` pointing at a route array). A route that imports its component eagerly puts it in the initial bundle.\n- Prefer `providedIn: 'root'` services so they tree-shake, and scope a provider to a route or component only when you genuinely need a separate instance.\n- When migrating, move leaves first: convert a component to standalone, delete it from the module's declarations, and repeat. `ng generate @angular/core:standalone` does most of the mechanical work.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Write zoneless-safe code",
      "summary": "Never rely on Zone.js to notice a change: state changes go through signals, and manual detectChanges or markForCheck calls are a smell.",
      "body": "New Angular apps run without Zone.js, so the framework no longer patches timers, promises, and event handlers to guess when something changed. Code that assumed it did will render stale UI.\n\n- Route every state change through a signal (or an explicitly `markForCheck`-ed OnPush component). Mutating a plain field inside a `setTimeout`, a promise callback, or a third-party library callback updates nothing on screen in a zoneless app.\n- Assume `OnPush` semantics everywhere and stop reaching for `ChangeDetectorRef.detectChanges()` to force a paint. If a value needs to be visible, it needs to be a signal.\n- Do not depend on `NgZone.onMicrotaskEmpty`, `whenStable`, or zone-based stability for logic. For tests, use `await fixture.whenStable()` with the modern harness rather than `fakeAsync` tick tricks.\n- Third-party callbacks (charts, maps, web components, WebSocket clients) are the usual breakage point: set a signal inside the callback and let the framework do the rest.\n- Keep it enabled deliberately: `provideZonelessChangeDetection()` on versions where it is opt-in, and no `zone.js` import creeping back into polyfills.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/app",
      "title": "Use the built-in control flow with a real track expression",
      "summary": "Templates use the block syntax, every loop tracks a stable identity, and templates never call functions that compute.",
      "body": "The block control flow (`@if`, `@for`, `@switch`, `@defer`) is the current template surface. It is not sugar over the old directives: it ships less runtime and behaves better under signal-driven rendering.\n\n- Use `@if` / `@else if`, `@for` with a mandatory `track`, and `@switch`. Do not add `NgIf`, `NgFor`, or `NgSwitch` to a new component's imports.\n- `track` must be a stable identity (`track item.id`), not `$index`, unless the list is genuinely positional. Tracking by index re-creates DOM and destroys focus and animation state when the list reorders.\n- Use `@empty` for the empty state rather than a second `@if` over the same collection.\n- Defer expensive, below-the-fold subtrees with `@defer (on viewport)` and give them a `@placeholder`. This is the cheapest real win on initial load.\n- Never call a function or getter that filters, sorts, or maps in a template. Compute it once in a `computed()`; a template expression can run on every change detection pass.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/app/core",
      "title": "Injection and the functional APIs that replaced classes",
      "summary": "inject() in field initializers, functional guards, resolvers, and interceptors, and DI tokens for configuration instead of ambient imports.",
      "body": "Angular's DI surface moved from class-based to functional, and the class-based variants are either deprecated or legacy. New code should not reintroduce them.\n\n- Use `inject()` in a field initializer instead of constructor parameters. It composes into helper functions, works in functional guards and interceptors, and keeps subclass constructors free of super-call plumbing.\n- Guards and resolvers are plain functions (`CanActivateFn`, `ResolveFn`). The class-based `CanActivate` interface is deprecated: a guard is a function that injects what it needs and returns a boolean, a redirect, or an observable of one.\n- HTTP interceptors are functions registered with `provideHttpClient(withInterceptors([...]))`. Use them for auth headers, correlation ids, and retry policy, and keep them small and ordered deliberately.\n- Pass configuration through an `InjectionToken` provided at bootstrap rather than importing a config object. It keeps the app testable and lets an environment override one value without a rebuild.\n- Prefer `providedIn: 'root'` for stateless services. A service that holds state should hold it in signals so consumers get change detection for free.\n\nSee /src/app for the signal and zoneless rules these APIs assume."
    },
    {
      "kind": "memory",
      "nodePath": "/src/app/core",
      "title": "Loading data with resources instead of subscription bookkeeping",
      "summary": "Signal-based resource APIs give you value, status, and error in one place, with request cancellation, so components stop tracking loading flags by hand.",
      "body": "Most Angular data code is the same three fields written by hand: value, loading, error. The signal-based resource APIs replace that, and they cancel in-flight requests when their inputs change.\n\n- Fetch with `httpResource()` for a plain HTTP read, or `resource()` when the loader wraps something else (an SDK, several calls, a reshaped payload). Both expose signals for the value and the request status, so the template reads them directly.\n- Make the request reactive by deriving it from signals: when the id signal changes, the resource reloads and the previous request is cancelled. That is the part hand-rolled subscriptions almost always get wrong.\n- Render status from the resource itself rather than a separate `isLoading` signal you keep in sync. Two sources of truth for one request is how spinners get stuck.\n- Keep mutations explicit: a POST or PATCH is an action that calls `HttpClient` and then reloads or updates the resource. Do not model a write as a resource.\n- For anything that needs a cache across components, put the resource in a `providedIn: 'root'` service and expose read-only signals. Reach for a full state library only when you have real cross-cutting state, not to store one list.\n\nSee /src/app for the state rule; the tanstack-query pattern covers the same problem for React if you share a monorepo."
    }
  ]
};
