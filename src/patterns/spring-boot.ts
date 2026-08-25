import type { Pattern } from "../types.js";

export const springBoot: Pattern = {
  "slug": "spring-boot",
  "version": "1.0.0",
  "name": "Spring Boot",
  "tagline": "Keep controllers thin, configuration typed, transactions explicit, and tests aligned with application slices.",
  "description": "Spring Boot applications stay maintainable when package boundaries, configuration binding, validation, transactions, exception handling, and tests follow the framework's runtime model. This bundle defines thin web adapters, service-owned transactions, validated ConfigurationProperties, dependency direction, and focused test slices. Unlike Django, it captures current Spring Boot and Java conventions rather than Python and Django architecture.",
  "category": "Framework",
  "icon": "coffee",
  "color": "bg-green-500/10 text-green-600 dark:bg-green-400/15 dark:text-green-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Spring Boot pattern for AI coding agents",
  "metaDescription": "Thin controllers, validated ConfigurationProperties, service transactions, exception mapping, dependency boundaries, and focused Spring Boot application tests.",
  "problem": "Agents put business logic and transactions in controllers, scatter Value injection, expose persistence entities directly, or use full-context tests for every behavior.",
  "audience": "Java and Kotlin teams building HTTP services and data applications with Spring Boot",
  "prevents": [
    "Controllers owning business transactions and persistence logic",
    "Invalid configuration discovered only after traffic reaches a feature",
    "Full application contexts hiding missing focused tests and slow feedback"
  ],
  "appliesTo": {
    "paths": [
      "/src/main/java",
      "/src/main/resources",
      "/src/test/java"
    ],
    "stacks": [
      "spring-boot",
      "spring",
      "java",
      "kotlin"
    ],
    "packages": [
      "spring-boot-starter-web",
      "spring-boot-starter-validation"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/main/java",
      "title": "Keep web adapters thin and validate at the boundary",
      "summary": "Controllers translate HTTP, validate request contracts, call one application service, and map the result without owning business flow.",
      "body": "Controllers translate HTTP, validate request contracts, call one application service, and map the result without owning business flow. Business rules in controllers are duplicated across jobs, messaging, tests, and later transports, while persistence entities exposed directly leak lazy state and internal fields. Enforce this boundary in /src/main/java so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Use request and response DTOs with Jakarta validation constraints and map them explicitly to application commands and results.\n- Keep authentication-derived identity, tenant, and authorization context server-owned instead of accepting them from request fields.\n- Centralize expected exception-to-response mapping with stable public error codes and no stack or internal class leakage.\n- Return persistence entities only through deliberate read models that control fields, serialization, and fetch behavior.\n\nVerification: Test invalid input, unauthorized tenant fields, domain conflicts, missing resources, and unexpected failures through the web slice; confirm no business write begins before validation.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/main/java",
      "title": "Put transaction boundaries on application services",
      "summary": "A service method owns one business transaction and separates database commit from asynchronous or remote effects.",
      "body": "A service method owns one business transaction and separates database commit from asynchronous or remote effects. Transactions spread across controllers, private helper assumptions, remote calls, and async work create long locks, partial effects, and rollback expectations the runtime cannot honor. Enforce this boundary in /src/main/java so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Start the transaction at a public application-service operation that expresses one business command.\n- Keep network calls and slow external work outside open database transactions; use an outbox or durable job when an effect must follow commit.\n- Define read-only and isolation needs deliberately for queries whose correctness depends on concurrent changes.\n- Make idempotency and retry behavior explicit for commands that can be invoked again after timeouts.\n\nVerification: Inject failure before commit, after commit, during outbox publication, and on duplicate command delivery; verify database and external effects converge exactly once.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/main/resources",
      "title": "Configuration is a validated typed contract",
      "summary": "Scattered string-based property reads hide required values, accepted ranges, grouping, and override behavior until a deep code path runs.",
      "body": "Scattered string-based property reads hide required values, accepted ranges, grouping, and override behavior until a deep code path runs. Bind each configuration namespace to a typed ConfigurationProperties object and validate required values and constraints during startup.\n\nKeep safe defaults close to the type and secrets in external providers or environment inputs rather than committed resources. Document override sources and avoid relying on incidental property precedence for security-sensitive behavior. Test representative production configuration and fail startup with an actionable field-level message when the contract is invalid. Keep the decision explicit at /src/main/resources; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/test/java for configuration fixtures and the secrets pattern for credential handling. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/main/java",
      "title": "Package boundaries follow use cases and dependency direction",
      "summary": "A single controllers, services, and repositories layout becomes a shared bucket where every feature can reach every implementation detail.",
      "body": "A single controllers, services, and repositories layout becomes a shared bucket where every feature can reach every implementation detail. Group cohesive domain or feature code and keep web, persistence, messaging, and provider adapters pointing toward application and domain contracts.\n\nExpose intentional interfaces between features instead of importing another feature's repository or entity. Keep framework annotations at adapter and wiring boundaries where practical so domain decisions can be tested without a container. Place the application entry point above the packages it should scan and make additional scanning explicit. Keep the decision explicit at /src/main/java; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/test/java for boundary tests and /src/main/resources for module configuration. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/test/java",
      "title": "Choose the smallest Spring test that proves the behavior",
      "summary": "A full application context is valuable for wiring and end-to-end behavior, but it is slow and can hide that a unit or focused slice lacks an explicit dependency.",
      "body": "A full application context is valuable for wiring and end-to-end behavior, but it is slow and can hide that a unit or focused slice lacks an explicit dependency. Use plain unit tests for domain logic, focused web or data slices for adapter contracts, and SpringBootTest only when Boot wiring, externalized configuration, or the real application context is the subject.\n\nKeep slice-specific configuration local and avoid importing the entire application through a convenient test helper. Remember that a transactional test using a real server port does not share the server thread's transaction and rollback behavior. Use production-like database and dependency integrations for behavior an embedded substitute cannot represent. Keep the decision explicit at /src/test/java; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/main/java for the transaction boundary and the Spring Boot review skill for test selection. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-spring-boot-service",
      "summary": "Review a Spring Boot service for web contracts, validation, transactions, configuration, dependency direction, and test scope.",
      "body": "---\nname: review-spring-boot-service\ndescription: Review a Spring Boot service for web contracts, validation, transactions, configuration, dependency direction, and test scope.\n---\n\n# Review Spring Boot Service\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Trace representative requests from DTO validation and authorization through application service, transaction, persistence, external effects, exception mapping, and response models.\n2. Inspect ConfigurationProperties binding, startup validation, override sources, secret handling, profile behavior, and production configuration fixtures.\n3. Review package dependencies for feature leakage, direct repository access across boundaries, framework types in domain decisions, and implicit component scanning.\n4. Map domain, web, data, configuration, wiring, and integration risks to the smallest useful tests, then run duplicate, rollback, concurrency, and real-server cases where behavior differs.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "spring-boot",
        "java",
        "architecture",
        "review"
      ]
    }
  ]
};
