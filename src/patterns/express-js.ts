import type { Pattern } from "../types.js";

export const expressJs: Pattern = {
  "slug": "express-js",
  "version": "1.0.0",
  "name": "Express.js Production APIs",
  "tagline": "Make middleware order, proxy trust, asynchronous failures, and shutdown behavior explicit.",
  "description": "Express remains simple by design, which means production correctness lives in composition decisions the framework does not make for you: middleware order, error propagation, proxy trust, request limits, and process shutdown. This bundle constrains the HTTP pipeline, centralizes error translation, records deployment topology, separates request validation from domain logic, and supplies an operational review for releases. It is narrower than the REST API design pattern and deeper than the Hono pattern on Express-specific middleware semantics, `trust proxy`, streaming responses, and Node process lifecycle.",
  "category": "Framework",
  "icon": "router",
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
  "metaTitle": "Express.js API pattern for AI coding agents",
  "metaDescription": "Express.js middleware order, async error handling, proxy trust, request limits, and graceful shutdown for production Node API services. In production.",
  "problem": "AI agents often append middleware wherever convenient, trust forwarded headers unconditionally, send multiple responses after async failures, or terminate a process while requests are still active.",
  "audience": "Node.js teams operating Express APIs behind load balancers, gateways, or container platforms",
  "prevents": [
    "Registering error middleware before routes it must catch",
    "Deriving client identity from spoofable forwarded headers",
    "Continuing a handler after a response has been sent",
    "Dropping in-flight requests during deployment"
  ],
  "appliesTo": {
    "paths": [
      "/src/http",
      "/src/middleware",
      "/src/domain"
    ],
    "stacks": [
      "express",
      "nodejs",
      "typescript",
      "http",
      "api"
    ],
    "packages": [
      "express"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/http",
      "title": "Build the middleware pipeline in one visible order",
      "summary": "Register request context, security, parsing, routes, not-found handling, and error translation in a single composition module.",
      "body": "Express behavior is order-dependent. A middleware mounted after a route cannot protect or observe that route, and an error handler mounted too early never sees failures from later handlers.\n\n- Create one application composition module that registers correlation context and security headers before body parsing, authentication before protected routes, and error middleware last.\n- Set body size limits per content type and route. Do not accept framework defaults for uploads or JSON bodies that can consume process memory before validation runs.\n- Keep a final not-found handler after all routers, then mount the four-argument error handler after that. Do not mix 404 generation into domain controllers.\n- Test ordering with a representative protected route, malformed body, unknown route, and thrown error so a refactor cannot silently move a boundary.\n\nSee /src/middleware for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/http",
      "title": "Treat forwarded headers as trusted input only from known proxies",
      "summary": "Configure the exact proxy topology before using protocol, hostname, or client IP derived from forwarded headers.",
      "body": "Express can derive `req.ip`, `req.protocol`, and secure-cookie behavior from forwarding headers, but those headers are attacker-controlled unless every direct connection arrives through a proxy you trust.\n\n- Configure `trust proxy` to the known hop count, subnet, or verification function for the deployment topology; do not enable a blanket boolean without proving the direct path is unreachable.\n- Ensure the last trusted proxy overwrites incoming forwarding headers instead of appending attacker-supplied values it received from the public internet.\n- Use the derived client IP for diagnostics and abuse controls only after this topology is tested from every ingress path, including health checks and internal calls.\n- Keep canonical host and public origin in configuration for redirects and absolute URLs rather than reconstructing security-sensitive destinations from request headers.\n\nSee /src/http for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/http",
      "title": "Finish each request exactly once",
      "summary": "Return after sending a response, propagate asynchronous failures, and centralize status mapping so handlers cannot double-write headers.",
      "body": "A handler that sends a response and continues can trigger side effects twice or throw after headers are committed. Asynchronous failures must reach one error boundary instead of producing unhandled rejections or partial responses.\n\n- Return the response or return immediately after `res.send`, `res.json`, `res.end`, or a redirect. Do not let execution fall through into another write or mutation.\n- Use promise-aware handlers and ensure every rejected operation reaches `next` or the framework error path. Never start an unawaited promise that can reject after the request completes.\n- Translate known domain errors to HTTP in one error middleware. Controllers should throw typed failures, not duplicate status-code tables across routes.\n- When headers are already sent, delegate to Express's final handling path instead of attempting a second JSON error response on a streaming or partially written request.\n\nSee /src/domain for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/domain",
      "title": "Controllers adapt HTTP while services own business transitions",
      "summary": "Keep request and response objects at the transport edge so domain code can be retried, tested, and reused without Express.",
      "body": "Express makes it convenient to place everything in a route callback, but that couples validation, authorization, persistence, and response formatting to one mutable request object. The separation worth preserving is transport adaptation versus domain transition.\n\n- Parse and validate params, query, headers, and body at the controller boundary, then pass a typed command into a service.\n- Perform authorization on the resolved resource and actor, not merely on a route name. A service should receive enough identity context to enforce the invariant again.\n- Return domain values or typed failures from services. Controllers choose status codes and response envelopes without teaching the domain about Express.\n- Open transactions in the service layer around the complete state transition; do not hold them open while streaming a response or calling an unrelated remote service.\n\nSee /src/http for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/http",
      "title": "Graceful shutdown is part of request correctness",
      "summary": "Stop accepting new work, drain active connections, and bound shutdown before the platform removes the process.",
      "body": "A container signal is not permission to exit immediately. Express sits on a Node HTTP server whose active requests and keep-alive sockets must be given time to finish, while background intake must stop before dependencies are closed.\n\n- Handle the platform termination signal once and mark the instance unready before beginning shutdown so new traffic is routed elsewhere.\n- Close the HTTP server to stop accepting new connections, track active work, and wait for ordinary requests to finish within a configured deadline.\n- Stop queue consumers and schedulers before closing database or cache pools; otherwise an in-flight job can begin after its dependency has disappeared.\n- Force termination only after the deadline and record which resources remained active. A silent forced exit hides the capacity or cancellation bug that caused it.\n\nSee /src/http for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-express-production-boundaries",
      "summary": "Exercise Express pipeline order, forwarded-header trust, error translation, and process draining before deployment.",
      "body": "---\nname: review-express-production-boundaries\ndescription: Review an Express service after route, middleware, ingress, or lifecycle changes.\n---\n\n# Review Express Production Boundaries\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Enumerate middleware in execution order for one public, one protected, and one failing route; verify every intended boundary runs.\n- [ ] Send oversized and malformed bodies for each parser and confirm rejection occurs before allocation-heavy business logic.\n- [ ] Probe forwarded host, protocol, and client IP headers through both trusted ingress and a direct connection; confirm untrusted values are ignored.\n- [ ] Force a rejected asynchronous operation before and after headers are sent and verify exactly one error path records the failure.\n- [ ] Start a slow request, trigger termination, and prove readiness drops, new intake stops, active work drains, and the deadline is observable.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "express",
        "nodejs",
        "middleware",
        "http",
        "operations"
      ]
    }
  ]
};
