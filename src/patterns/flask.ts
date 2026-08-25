import type { Pattern } from "../types.js";

export const flask: Pattern = {
  "slug": "flask",
  "version": "1.0.0",
  "name": "Flask Production Applications",
  "tagline": "Keep Flask application state, request context, extensions, and deployment boundaries explicit.",
  "description": "Flask's small surface makes it easy to start and equally easy to hide global state, bind extensions too early, perform work outside an active context, or ship the development server as if it were an application server. This pattern places factory and extension decisions in the application package, constrains request-context usage in service code, and records how configuration and error translation cross blueprint boundaries. It differs from Django's batteries-included conventions and FastAPI's typed asynchronous surface by focusing on Flask factories, contexts, WSGI deployment, and deliberately assembled extensions.",
  "category": "Framework",
  "icon": "beaker",
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
  "metaTitle": "Flask production pattern for AI coding agents",
  "metaDescription": "Flask app factories, extension binding, request-context limits, configuration, and WSGI deployment boundaries for reliable Python services. In production.",
  "problem": "AI agents often create a module-global Flask app, import it from every service, access request globals in background work, or run the development server in production.",
  "audience": "Python teams building Flask APIs and web applications with blueprints and database extensions",
  "prevents": [
    "Creating circular imports around a global application object",
    "Using request or session proxies outside their active context",
    "Binding extensions before test configuration is available",
    "Deploying the debug server behind a public endpoint"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/app/services",
      "/tests"
    ],
    "stacks": [
      "flask",
      "python",
      "wsgi",
      "sqlalchemy",
      "web"
    ],
    "packages": [
      "flask"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Construct Flask through an application factory",
      "summary": "Create configuration, extensions, blueprints, and handlers in a factory so tests and workers can build isolated app instances.",
      "body": "A module-global application freezes configuration at import time and turns imports into initialization order. A factory makes the instance boundary explicit and lets each process or test create the application it actually needs.\n\n- Create the Flask object inside `create_app`, load configuration before binding extensions, then register blueprints and error handlers in a stable order.\n- Instantiate extension objects without an app at module scope and bind them with `init_app`; this keeps models importable without constructing the server.\n- Pass environment-specific configuration into the factory instead of mutating global config after modules have already read it.\n- Keep CLI commands and background-worker bootstraps dependent on the factory so they use the same extension setup without importing a running web process.\n\nSee /tests for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app/services",
      "title": "Do not let request context leak into service code",
      "summary": "Pass identity and input explicitly into services; reserve request, session, and g proxies for the HTTP adapter layer.",
      "body": "Flask's context-local proxies look like globals but only resolve while the relevant context is active. A service that reads them directly becomes unusable in a job, CLI command, test, or deferred callback.\n\n- Resolve the authenticated actor, locale, and request data in the route or decorator, then pass typed values to the service function.\n- Do not capture `request`, `session`, or `g` in a closure that outlives the response. Copy only the specific immutable value the later task needs.\n- Open database sessions and transactions around service work with explicit cleanup; do not rely on a request teardown hook for code that also runs outside HTTP.\n- Use an explicit application context only for framework integration during CLI or worker boot, not as a blanket fix for hidden request dependencies.\n\nSee /app for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Blueprints partition transport ownership, not domain ownership",
      "summary": "Use blueprints for route, template, and handler composition while keeping reusable business behavior in services.",
      "body": "A blueprint is a registration unit for Flask surfaces. Treating it as a complete business module often causes models and services to import the blueprint object, creating circular dependencies and preventing the same behavior from being called elsewhere.\n\n- Keep route functions, request schemas, response formatting, and blueprint-local error mapping inside the blueprint package.\n- Move business transitions and repository calls to services that do not import Flask request or response objects.\n- Register shared error translation at the application level and blueprint-specific errors only where their representation genuinely differs.\n- Use URL prefixes and blueprint names as public routing decisions; changing them should not move or rename the domain code they adapt.\n\nSee /app/services for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "The development server is a local feedback tool",
      "summary": "Production serves the factory through a supervised WSGI server with bounded workers, timeouts, and trusted proxy configuration.",
      "body": "Flask's built-in server optimizes for reload and debugging, not process supervision, worker management, slow-client defense, or graceful restarts. Production topology belongs outside the application while remaining documented beside it.\n\n- Serve the factory through a production WSGI server and size workers from measured CPU, memory, blocking I/O, and database-pool capacity rather than a copied formula.\n- Disable the interactive debugger and never expose a debug PIN path to a network, even behind authentication.\n- If a reverse proxy supplies forwarding headers, apply proxy middleware with the exact trusted hop counts instead of accepting arbitrary public headers.\n- Keep health checks cheap and independent from a full dependency transaction; readiness can test critical connectivity without turning every probe into load.\n\nSee /app for the rule or workflow that puts this decision into practice."
    }
  ]
};
