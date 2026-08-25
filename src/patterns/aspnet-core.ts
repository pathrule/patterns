import type { Pattern } from "../types.js";

export const aspnetCore: Pattern = {
  "slug": "aspnet-core",
  "version": "1.0.0",
  "name": "ASP.NET Core",
  "tagline": "Build ASP.NET Core services with ordered middleware, validated options, safe lifetimes, and clear boundaries.",
  "description": "ASP.NET Core makes HTTP APIs concise, but correctness still depends on middleware order, dependency-injection lifetimes, configuration validation, cancellation, error contracts, and data boundaries. This bundle covers Minimal APIs and controllers without forcing one architecture, and aligns runtime behavior with focused tests. Unlike Spring Boot, it follows the .NET hosting, middleware, options, DI, and Entity Framework Core conventions.",
  "category": "Framework",
  "icon": "code-xml",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "ASP.NET Core service pattern for AI agents",
  "metaDescription": "Middleware ordering, validated options, DI lifetime safety, Minimal API and controller boundaries, cancellation, Problem Details, EF Core migrations, and tests.",
  "problem": "Agents register services with unsafe lifetimes, place middleware in the wrong order, discover invalid production options after startup, or mix HTTP, business, and EF Core work in one handler.",
  "audience": ".NET teams building HTTP APIs, web applications, background services, and data-backed systems with ASP.NET Core",
  "prevents": [
    "Authorization, CORS, error, or endpoint behavior changing because middleware order drifted",
    "Scoped services such as DbContext being captured by singleton or conventional middleware instances",
    "Production requests reaching features whose required options were never validated"
  ],
  "appliesTo": {
    "paths": [
      "/src/Web",
      "/src/Application",
      "/src/Infrastructure",
      "/tests"
    ],
    "stacks": [
      "aspnet-core",
      "dotnet",
      "csharp",
      "entity-framework-core"
    ],
    "packages": [
      "Microsoft.AspNetCore.OpenApi",
      "Microsoft.EntityFrameworkCore"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/Web",
      "title": "Middleware order is an explicit security and behavior contract",
      "summary": "Exception handling, forwarding, HTTPS, static files, routing, CORS, authentication, authorization, rate limits, endpoints, and fallbacks are ordered deliberately.",
      "body": "ASP.NET Core middleware runs in registration order on the request path and unwinds in reverse on the response path, so ordering changes behavior. Keep the production pipeline readable in one composition root or clearly ordered extensions, and document why middleware that depends on routing, identity, endpoint metadata, or response handling sits where it does. Do not rely on template defaults after adding custom requirements.\n\n- Place authentication before authorization and position CORS, forwarded headers, exception handling, rate limiting, static files, and endpoint-aware middleware according to their data dependencies.\n- Avoid terminal middleware before endpoints unless it intentionally owns the remaining path.\n- Keep development-only diagnostics out of production and produce safe errors through the approved handler.\n- Add integration tests for protected endpoints, preflight requests, forwarded scheme, errors, static files, and unknown routes.\n\nVerification: Trace representative requests through the actual configured pipeline and confirm each middleware sees the context and endpoint metadata it requires.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/Infrastructure",
      "title": "Options bind to typed contracts and validate at startup",
      "summary": "Required configuration is grouped in typed options with constraints, dependency checks, safe defaults, and eager validation before traffic or jobs begin.",
      "body": "Scattered IConfiguration string lookups hide missing values, parse failures, security assumptions, and override behavior until a deep request executes. Bind each owned configuration section to a typed options class, validate required fields, ranges, formats, cross-field invariants, and referenced resources, and fail startup with actionable non-secret messages for configuration that must be valid for the deployment.\n\n- Keep secret values in approved external inputs and prevent option logging, validation errors, or diagnostics from printing them.\n- Use named options only when variants have clear owners and consumers; avoid a global settings bag.\n- Decide which options may reload safely and which require immutable startup state or coordinated restart.\n- Test representative production sources and precedence, including absent, malformed, conflicting, and environment-specific values.\n\nVerification: Boot the application with each required value missing or invalid and confirm failure happens before the listener or background consumer becomes ready.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/Infrastructure",
      "title": "Dependency lifetimes match ownership and concurrency",
      "summary": "Singleton, scoped, and transient registrations reflect state ownership, thread safety, disposal, and request or operation boundaries without captive dependencies.",
      "body": "The container cannot make a stateful service thread-safe or extend a disposed scope correctly. Use singleton only for thread-safe state that truly spans the application, scoped for one request or explicit operation scope, and transient for lightweight independent instances. Never capture a scoped dependency in a singleton, hosted service, or conventional middleware constructor.\n\n- Resolve scoped services inside an explicit scope for background work and dispose the scope after the operation.\n- Inject scoped dependencies into middleware Invoke or InvokeAsync, or use factory-based middleware when constructor injection needs request scope.\n- Treat DbContext as an operation-scoped unit of work and avoid concurrent use across tasks.\n- Enable scope and build validation in development and tests, then add concurrency and disposal tests for custom factories.\n\nVerification: Start the real container, execute concurrent requests and background iterations, and confirm no captive dependency, cross-request state, concurrent context use, or disposal leak appears.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/Web",
      "title": "Minimal APIs and controllers are HTTP adapters",
      "summary": "Choose the endpoint style from binding and extensibility needs, but keep validation, authorization, application flow, and response contracts explicit in both.",
      "body": "Minimal APIs provide a concise route-handler model and controllers provide established conventions and extensibility. Neither choice justifies placing persistence queries, transactions, provider calls, or domain branching directly in an HTTP adapter. Bind and validate request contracts, derive identity and tenant from server context, authorize the action, call one application operation, and map typed outcomes to stable responses.\n\nUse route groups, endpoint filters, conventions, or controller filters only for concerns whose ordering and scope remain obvious. Keep persistence entities out of public serialization and generate OpenAPI from the same contracts tested by clients. See /src/Application for the use-case boundary and /tests for focused adapter tests."
    },
    {
      "kind": "memory",
      "nodePath": "/src/Application",
      "title": "Cancellation and async flow reach every owned dependency",
      "summary": "Request cancellation propagates through application services, EF Core, HTTP calls, queues, and long-running work without hiding failures or abandoning unsafe effects.",
      "body": "ASP.NET Core exposes request cancellation, but it only saves resources when every owned asynchronous boundary accepts and observes the CancellationToken. Pass it through application operations, EF Core queries and saves, HTTP client calls, stream copies, locks, delays, and queue or workflow submission where cancellation is safe. Avoid Task.Run around ordinary async I/O and never use async void for request work.\n\nDefine the commit point after which client disconnect cannot cancel a durable required effect, and use an outbox or background workflow for work that must survive the request. Distinguish cancellation from timeout and unexpected failure in telemetry without returning internal detail. Test cancellation before and after the commit point. See /src/Infrastructure for lifetime and resource cleanup."
    },
    {
      "kind": "memory",
      "nodePath": "/src/Web",
      "title": "Problem Details is the public error contract",
      "summary": "Expected failures map to stable types, statuses, codes, field errors, and correlation references while unexpected exceptions stay internal.",
      "body": "Clients need a predictable error shape, not exception class names or environment-dependent text. Use Problem Details or an equivalent consistent contract with stable type or code, HTTP status, safe title, optional field-level validation errors, and a correlation reference. Map domain conflicts, missing resources, authorization denials, rate limits, and dependency failures through one reviewed policy.\n\nDo not expose stack traces, SQL, connection details, provider payloads, secrets, or existence information that authorization intends to hide. Log unexpected exceptions once at the authoritative boundary with trace correlation and return a generic public result. Keep status and retry semantics consistent across Minimal APIs and controllers. See /tests for contract coverage."
    },
    {
      "kind": "memory",
      "nodePath": "/src/Infrastructure",
      "title": "EF Core migrations are reviewed deployment artifacts",
      "summary": "Schema changes, generated migrations, rollout order, data backfill, compatibility window, locks, and rollback are designed with application deployment.",
      "body": "A generated EF Core migration is a starting artifact, not proof that a production database change is safe. Review operations, provider-specific SQL, defaults, indexes, constraints, data size, lock behavior, transaction limits, and reversibility. Separate large backfills from schema deployment and keep old and new application versions compatible during the rollout window.\n\nGenerate migrations from the intended model and verify no unrelated drift appears. Apply them through one controlled deployment identity rather than every web instance racing at startup. Test on production-like data volume, record migration history evidence, and use roll-forward recovery when rollback would lose accepted data. See /src/Application for behavior compatibility and /tests for integration coverage."
    },
    {
      "kind": "skill",
      "nodePath": "/tests",
      "title": "review-aspnet-core-service",
      "summary": "Review an ASP.NET Core service across hosting, middleware, endpoints, DI, options, cancellation, EF Core, errors, security, and test scope.",
      "body": "---\nname: review-aspnet-core-service\ndescription: Review an ASP.NET Core service for runtime ordering, lifetime safety, validated contracts, and deployment behavior.\n---\n\n# Review ASP.NET Core Service\n\n1. Trace application startup, configuration sources, typed options validation, service registrations, hosted services, middleware order, endpoint mapping, readiness, and shutdown.\n2. Follow representative public and protected requests through binding, validation, identity, tenant, authorization, application operation, DbContext transaction, external effects, cancellation, and Problem Details.\n3. Inspect singleton, scoped, transient, middleware, HttpClient, DbContext, stream, and background-work ownership for concurrency, captive dependencies, disposal, and retry behavior.\n4. Review EF Core model changes and migrations for drift, locks, backfill, compatibility, deployment ordering, failure recovery, and production-like evidence.\n5. Run focused unit and adapter tests plus real-container integration cases for pipeline ordering, configuration failure, authorization, errors, cancellation, concurrency, and database behavior.\n\nRecord failed boundaries and rerun the smallest test that proves each correction before completing the review.",
      "skillTags": [
        "aspnet-core",
        "dotnet",
        "csharp",
        "review"
      ]
    }
  ]
};
