import type { Pattern } from "../types.js";

export const goApi: Pattern = {
  "slug": "go-api",
  "version": "1.0.0",
  "name": "Go API (Gin / Echo)",
  "tagline": "Build idiomatic Go HTTP services with honest errors, context propagation, and validated input.",
  "description": "An opinionated baseline for HTTP APIs in Go with Gin or Echo. It leans into what makes Go services reliable: errors are values you handle and wrap rather than swallow, context flows through every call for cancellation and deadlines, and request bodies are bound and validated before they reach business logic. It also keeps the layering clean so handlers stay thin and the database, not the framework, owns the data. Go's draw for cloud-native and high-performance backends is exactly this kind of boring reliability.",
  "category": "Backend",
  "icon": "hexagon",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Go API (Gin / Echo) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for Go HTTP APIs on Gin or Echo: error values handled and wrapped, context propagation for cancellation, struct-tag request validation, and clean handler/service/repository layering, tuned for AI coding agents.",
  "problem": "AI agents writing Go ignore returned errors, drop the request context, bind request bodies without validating, and pile database calls into handlers.",
  "audience": "Backend teams building HTTP services in Go with Gin or Echo",
  "prevents": [
    "Ignoring or discarding returned error values instead of handling them",
    "Failing to thread context.Context for cancellation and deadlines",
    "Binding a request body without validating it before use",
    "Putting database queries and business logic directly in HTTP handlers"
  ],
  "appliesTo": {
    "paths": [
      "/internal",
      "/cmd",
      "/internal/handler"
    ],
    "stacks": [
      "go",
      "gin",
      "echo"
    ],
    "packages": [
      "github.com/gin-gonic/gin",
      "github.com/labstack/echo",
      "github.com/go-playground/validator"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/internal",
      "title": "Handle every error; wrap with context, never discard",
      "summary": "Check every returned error and either handle it or return it wrapped with %w; never assign an error to _ or ignore it.",
      "body": "In Go an error is a return value, not an exception. Ignoring it does not make the failure go away; it makes it invisible until it corrupts something downstream.\n\n- Check every returned `error`. Do not assign it to `_` or leave it unchecked. If a function can fail, the caller decides what to do with the failure.\n- Add context when you propagate: `fmt.Errorf(\"loading user %d: %w\", id, err)`. The `%w` verb wraps the cause so callers can still `errors.Is` / `errors.As` it, while the message gains a breadcrumb trail.\n- Handle an error once. Either log it or return it, not both at every layer; double-logging the same failure makes logs unreadable. Log at the boundary (the handler) and return wrapped below.\n- Reserve `panic` for truly unrecoverable programmer errors, not for normal control flow. A web handler should turn an error into an HTTP status, not panic.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/internal",
      "title": "Propagate context.Context for cancellation and deadlines",
      "summary": "Pass the request's context as the first argument through every call that does I/O; never store it in a struct or ignore it.",
      "body": "The request `context.Context` carries cancellation, deadlines, and request-scoped values. Dropping it means a client that disconnected still pays for work nobody will read.\n\n- Take `ctx context.Context` as the first parameter of any function that does I/O (database, HTTP, RPC) and pass it down the call chain. Get it from `c.Request.Context()` (Gin) or `c.Request().Context()` (Echo) at the handler.\n- Pass `ctx` into every database and outbound HTTP call (`db.QueryContext(ctx, ...)`, `http.NewRequestWithContext(ctx, ...)`) so a cancelled or timed-out request actually stops the downstream work.\n- Do not store a `Context` in a struct field, and do not pass `context.Background()` deep in a request path; thread the real request context through.\n- Use `context.WithTimeout` to bound slow downstream calls, and always `defer cancel()` to release the timer.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/internal/handler",
      "title": "Bind and validate request input at the handler boundary",
      "summary": "Bind the body to a typed struct and validate it with struct tags before any business logic; return 400 on bind/validation failure.",
      "body": "A bound struct is not a validated struct. Binding fills the fields; validation decides whether the values are acceptable. Skipping validation ships untrusted input straight into your logic.\n\n- Bind the request body to a typed request struct (`c.ShouldBindJSON(&req)` in Gin, `c.Bind(&req)` in Echo), and use a separate struct for input than for your domain/DB model.\n- Validate with struct tags (`binding:\"required,email\"` via go-playground/validator, which both Gin and Echo integrate). Validate every externally-supplied field: required, format, length, range.\n- Return `400 Bad Request` with a clear, structured error when binding or validation fails, before any business logic runs. Do not let a zero-value or malformed field reach a service or query.\n- Keep validation rules on the request struct, not scattered through the handler body, so the contract is declared in one place and visible in the type.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/internal",
      "title": "Project layout: thin handlers over services over repositories",
      "summary": "Standard Go service layout with handlers, services, and repositories under /internal; handlers do HTTP, services do logic, repositories do data.",
      "body": "We keep a Go API layered so the HTTP framework stays at the edge and the core logic does not depend on Gin or Echo.\n\n- Layout: `cmd/<app>/main.go` is the entrypoint (wiring, config, server start); business code lives under `internal/` so it cannot be imported by other modules. Group by `internal/handler` (HTTP), `internal/service` (business logic), `internal/repository` (data access), `internal/model` (domain types).\n- Handlers are thin: parse and validate the request, call a service, map the result or error to an HTTP response. No SQL or business rules in the handler.\n- Services hold business logic and depend on repository interfaces, not concrete database types. Define the interface in the consumer package so the service is testable with a fake.\n- Wire dependencies explicitly in `main` (constructor injection); avoid global singletons for the DB handle or config. Order middleware deliberately (recovery, logger, CORS, auth, then routes).\n- Pick the framework by team fit: Gin (most popular, large middleware ecosystem) or Echo (idiomatic error returns, built-in OpenAPI-friendly tooling). The layering above is identical either way.\n\nSee /internal for the error-handling and context rules and /internal/handler for the input-validation rule."
    },
    {
      "kind": "memory",
      "nodePath": "/internal",
      "title": "Concurrency and resource discipline",
      "summary": "Bound goroutines, propagate context to them, guard shared state, and close every resource with defer.",
      "body": "Go makes concurrency easy to start and easy to leak. A little discipline keeps it reliable.\n\n- Do not spawn an unbounded number of goroutines per request. A goroutine started in a handler that outlives the request, with no context and no bound, is a leak; pass `ctx` to it and cap concurrency with a worker pool or `errgroup`.\n- Use `errgroup.WithContext` to run parallel sub-tasks for a request: it propagates cancellation and collects the first error, instead of hand-rolling `WaitGroup` + channels.\n- Guard shared mutable state with a mutex or confine it to one goroutine via channels; run tests and CI with `-race` to catch data races before production.\n- Close every resource you open with `defer` (rows, response bodies, files) right after the error check, so an early return cannot leak it.\n\nSee /internal for the project-layout memory and the error/context rules."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "go-api-review",
      "summary": "Pre-merge checklist for a Go HTTP handler or service: errors, context, validation, layering, and concurrency.",
      "body": "---\nname: go-api-review\ndescription: Review checklist for Go HTTP API changes on Gin or Echo. Run before merging any handler, service, or repository change.\n---\n\n# Go API review\n\n- [ ] Every returned error is checked; propagated errors are wrapped with `%w` and context; nothing assigned to `_`.\n- [ ] An error is handled once (logged at the boundary OR returned below), not double-logged at every layer.\n- [ ] `context.Context` is the first arg on I/O functions and threaded into every DB/HTTP call; no `Context` stored in structs.\n- [ ] Slow downstream calls are bounded with `context.WithTimeout` + `defer cancel()`.\n- [ ] Request body bound to a typed input struct (separate from the domain model) and validated with struct tags before logic.\n- [ ] Bind/validation failure returns `400` with a structured error before any business logic runs.\n- [ ] Handlers are thin (parse, call service, map response); SQL and business rules live in service/repository under `internal/`.\n- [ ] Services depend on repository interfaces, not concrete DB types; dependencies wired in `main`, no globals.\n- [ ] No unbounded/leaking goroutines; parallel work uses `errgroup.WithContext`; shared state guarded; CI runs `-race`.\n- [ ] Resources (rows, bodies, files) closed with `defer` right after the error check.\n",
      "skillTags": [
        "go",
        "gin",
        "echo",
        "api",
        "concurrency",
        "api-review"
      ]
    }
  ]
};
