import type { Pattern } from "../types.js";

export const nestjs: Pattern = {
  "slug": "nestjs",
  "version": "1.0.0",
  "name": "NestJS Production Architecture",
  "tagline": "Control provider scope, module ownership, validation, and transport-independent application logic.",
  "description": "NestJS gives large Node applications structure, but its dependency container can conceal expensive request-scoped graphs, circular module ownership, validation gaps, and business logic coupled to decorators or transport objects. This pattern constrains module boundaries and provider scope, records the roles of guards, pipes, interceptors, and filters, keeps application services transport-neutral, and adds a dependency-graph review procedure. It is distinct from Express and Hono API patterns because the central problem is Nest's container and metadata model, not raw middleware sequencing or a minimal router surface.",
  "category": "Framework",
  "icon": "panels-top-left",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "NestJS architecture pattern for AI agents",
  "metaDescription": "NestJS module ownership, provider scope, validation pipes, guards, interceptors, and transport-neutral services for production applications. In production.",
  "problem": "AI agents often mark providers request-scoped without measuring the graph, use forwardRef to hide circular ownership, validate only TypeScript types, or place business logic in controllers and guards.",
  "audience": "TypeScript teams operating modular NestJS HTTP, message, or scheduled-work applications",
  "prevents": [
    "Expanding one request-scoped provider into an expensive dependency subtree",
    "Masking cyclic module ownership with repeated forwardRef calls",
    "Trusting compile-time DTO types for untrusted runtime input",
    "Coupling domain services to HTTP decorators and response objects"
  ],
  "appliesTo": {
    "paths": [
      "/src/modules",
      "/src/common",
      "/src/application"
    ],
    "stacks": [
      "nestjs",
      "nodejs",
      "typescript",
      "dependency-injection",
      "api"
    ],
    "packages": [
      "@nestjs/core",
      "@nestjs/common"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/modules",
      "title": "Make each module the owner of one capability",
      "summary": "Export a narrow public provider surface and remove circular imports instead of normalizing them with container escape hatches.",
      "body": "A Nest module is an ownership boundary. When every module imports every other module, providers become globally reachable, initialization order becomes fragile, and tests must boot half the application to exercise one capability.\n\n- Group controllers, providers, and persistence adapters by capability, then export only the application service or token other modules are allowed to call.\n- Treat `forwardRef` as a design alarm. Extract the shared contract or move orchestration to a higher-level module instead of adding reciprocal imports.\n- Avoid global modules for feature behavior. Reserve global providers for truly universal infrastructure such as configuration, tracing, or a clock abstraction.\n- Test a feature module with its explicit imports and overrides so undeclared dependencies fail in isolation rather than appearing only in the full application boot.\n\nSee /src/application for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/common",
      "title": "Validate and transform every transport boundary",
      "summary": "Use explicit runtime schemas or DTO validation for HTTP, messages, configuration, and external payloads before application code runs.",
      "body": "TypeScript types disappear at runtime, and Nest decorators do not make untrusted JSON valid. Invalid shapes must be rejected or transformed at the boundary before they reach services that rely on invariants.\n\n- Enable a global validation pipe with an explicit allowlist and rejection policy; do not let unexpected properties flow into persistence or command objects.\n- Validate route parameters and query values as their intended scalar types instead of accepting strings and relying on implicit coercion deep in the service.\n- Apply the same runtime validation to queue messages, scheduled inputs, environment configuration, and webhook payloads, not only controller bodies.\n- Map validation failures to a stable public error shape while retaining structured internal details for diagnostics without exposing secrets or stack traces.\n\nSee /src/application for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/modules",
      "title": "Provider scope is a capacity decision",
      "summary": "Singleton is the default; request scope is reserved for state that cannot be passed explicitly and is measured across the dependency graph.",
      "body": "Changing one provider to request scope can pull every consumer above it into per-request instantiation. The cost is not visible at the decorator, so scope must be treated as a graph-wide capacity choice rather than a convenience for accessing request data.\n\n- Keep stateless services singleton and pass actor, tenant, locale, or correlation context as method arguments when doing so keeps ownership clear.\n- Use transient scope only when each injection site genuinely needs a separate stateful helper, and verify that lifecycle against retries and tests.\n- If request scope is unavoidable, inspect which upstream providers inherit it and measure allocation and latency under representative concurrency.\n- Do not store mutable per-request data on singleton providers. Use explicit context values or a bounded context mechanism with guaranteed cleanup.\n\nSee /src/common for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/common",
      "title": "Guards, pipes, interceptors, and filters have separate jobs",
      "summary": "Authorization, input conversion, cross-cutting execution, and exception translation stay in their intended Nest lifecycle stages.",
      "body": "Nest offers several extension points that can all run around a controller, but using them interchangeably makes execution order and test ownership impossible to reason about. Each stage should answer one kind of question.\n\n- Guards decide whether the resolved actor may enter the handler. They should not perform the business transition or silently reshape the request.\n- Pipes validate or transform an individual input before the handler. They do not fetch unrelated domain data or implement authorization policy.\n- Interceptors wrap execution for cross-cutting behavior such as timing, serialization, caching, or tracing; they must preserve errors and cancellation.\n- Exception filters translate known failures at the transport edge. They should not swallow unknown exceptions or turn every failure into a successful response envelope.\n\nSee /src/modules for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/application",
      "title": "Application services are independent of the active transport",
      "summary": "Commands and use cases accept plain typed inputs and return domain results, allowing HTTP, queues, and jobs to share behavior.",
      "body": "Nest decorators are convenient at controllers and consumers, but application logic coupled to `Request`, `Response`, acknowledgement objects, or transport exceptions cannot be reused safely and is difficult to retry.\n\n- Translate transport input into a command before invoking the application service, including actor and idempotency context where required.\n- Return a domain result or throw typed application failures. Let each adapter map those outcomes to HTTP status, message acknowledgement, or retry behavior.\n- Inject repository and external-service ports through tokens so tests replace them without booting real network clients.\n- Own the transaction around the complete use case and avoid holding it open while awaiting a slow remote dependency unless the consistency design explicitly requires it.\n\nSee /src/modules for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "audit-nest-dependency-graph",
      "summary": "Review Nest modules and provider scopes for cycles, hidden globals, request-scope expansion, and transport coupling.",
      "body": "---\nname: audit-nest-dependency-graph\ndescription: Audit a NestJS dependency graph after adding modules, providers, or a new transport adapter.\n---\n\n# Audit Nest Dependency Graph\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Draw module imports and exports for the changed capability; identify reciprocal edges, global feature providers, and exports that expose implementation details.\n- [ ] Trace every non-singleton provider upward through its consumers and estimate how many objects one request or message now creates.\n- [ ] Inspect guards, pipes, interceptors, and filters for responsibilities that belong to application services or another lifecycle stage.\n- [ ] Boot the feature module in isolation with test overrides and verify that every dependency is declared rather than inherited accidentally from the root app.\n- [ ] Call the same application service from a non-HTTP adapter or a plain unit test and remove any request, response, or transport exception dependency that appears.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "nestjs",
        "dependency-injection",
        "modules",
        "typescript",
        "architecture"
      ]
    }
  ]
};
