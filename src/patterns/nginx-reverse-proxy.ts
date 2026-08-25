import type { Pattern } from "../types.js";

export const nginxReverseProxy: Pattern = {
  "slug": "nginx-reverse-proxy",
  "version": "1.0.0",
  "name": "Nginx and Reverse Proxy Operations",
  "tagline": "Operate Nginx with explicit upstream, header, timeout, buffering, reload, and trust contracts.",
  "description": "Nginx sits at a trust and backpressure boundary where a small directive can change client identity, request size, streaming latency, retry behavior, cacheability, or whether an upstream sees the original protocol and host. This pattern constrains forwarded headers, request and upstream limits, and safe retries; it records streaming and connection behavior and provides a configuration test and reload workflow. It differs from CDN caching and application API patterns by focusing on the reverse proxy's own connection pools, buffering, header normalization, upstream health, and zero-downtime configuration lifecycle.",
  "category": "Infra",
  "icon": "between-horizontal-start",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Nginx reverse proxy pattern for AI agents",
  "metaDescription": "Nginx upstream routing, forwarded headers, timeouts, buffering, body limits, retries, WebSockets, config tests, and graceful reload operations. In production.",
  "problem": "AI agents often copy proxy snippets that trust spoofed forwarding headers, buffer a streaming endpoint, retry non-idempotent requests, or reload invalid configuration into production.",
  "audience": "Platform teams operating Nginx in front of APIs, web applications, streaming endpoints, or internal services",
  "prevents": [
    "Passing attacker-controlled client identity to the application",
    "Buffering server-sent or streamed responses until they appear broken",
    "Retrying a state-changing request against another upstream",
    "Applying an invalid or partially rendered configuration"
  ],
  "appliesTo": {
    "paths": [
      "/deploy/nginx",
      "/ops/runbooks",
      "/tests/proxy"
    ],
    "stacks": [
      "nginx",
      "reverse-proxy",
      "http",
      "load-balancing",
      "infra"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/deploy/nginx",
      "title": "Rebuild forwarding headers from trusted connection data",
      "summary": "Overwrite public forwarding headers and append only verified proxy hops so applications can reason about origin and client identity.",
      "body": "Headers such as Forwarded and X-Forwarded-For arrive from untrusted clients unless the edge proxy replaces them. Passing them through unchanged lets callers spoof scheme, host, or client address.\n\n- Set the upstream Host and public scheme from approved server configuration or trusted connection variables instead of accepting arbitrary client forwarding values.\n- Replace or construct the first forwarding hop at the public edge, then append only inside a documented trusted proxy chain.\n- Configure real-client address processing with explicit trusted proxy networks; never trust every source merely because Nginx is behind another network layer.\n- Test direct, edge, and internal ingress paths and confirm the application derives the same canonical origin and an attributable client chain.\n\nSee /tests/proxy for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy/nginx",
      "title": "Set body, header, timeout, and connection limits by route",
      "summary": "Bound client input and upstream waiting according to endpoint behavior instead of using one permissive global timeout.",
      "body": "Proxy defaults and copied global values rarely match uploads, ordinary APIs, health checks, or long-lived streams. Overly small limits break valid traffic, while overly large ones tie up memory and connections under abuse or dependency failure.\n\n- Set request-body limits for the endpoint and reject oversized uploads before proxying where possible; align the application and storage limits with the same contract.\n- Separate connect, header, read, and send timeouts so a failed dial is not treated like a legitimate long-lived response.\n- Apply request and response header limits that support required cookies and tracing without allowing unbounded metadata.\n- Size upstream keep-alive connections and worker limits against application capacity and file descriptors; the proxy must not create more concurrency than the service can drain.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy/nginx",
      "title": "Retry only operations proven safe to repeat",
      "summary": "Limit upstream retries by method and failure phase, and preserve a request identity when application-level idempotency is required.",
      "body": "A proxy can fail over after an upstream timeout or connection error, but it may not know whether the first service already committed a state change. Blind retry turns one client action into two effects.\n\n- Allow automatic retry for idempotent reads only under explicitly chosen failure conditions and attempt limits.\n- Do not retry a state-changing request unless the application contract uses an idempotency key and the body can be replayed safely.\n- Distinguish failure before a connection or request write from failure after the upstream may have processed it; ambiguous outcomes need reconciliation, not optimistic success.\n- Expose upstream address, status, response time, and retry count in structured access logs without recording secrets or full sensitive payloads.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/deploy/nginx",
      "title": "Buffering is an endpoint-level latency decision",
      "summary": "Keep buffering for ordinary responses, disable or tune it for streams, and verify memory and disk behavior under slow clients.",
      "body": "Nginx buffering protects upstreams from slow clients and improves throughput for ordinary responses, but it can delay server-sent events, incremental rendering, and other streaming protocols until enough data accumulates.\n\n- Classify endpoints as buffered request-response, large upload, download, server-sent stream, or upgraded connection and configure each location deliberately.\n- For streaming responses, disable response buffering where required and ensure the upstream emits flushable chunks and anti-buffering headers understood by the deployment.\n- For large request bodies, decide whether Nginx should spool before contacting the application or stream directly, accounting for retry and temporary-disk behavior.\n- Load-test with slow clients because disabling buffering can transfer connection and backpressure cost from the proxy to the application.\n\nSee /tests/proxy for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/deploy/nginx",
      "title": "A WebSocket upgrade is a hop-by-hop contract",
      "summary": "Forward upgrade intent explicitly, use a long-lived read policy, and make application-level reconnect and liveness visible.",
      "body": "Connection and Upgrade headers are hop-by-hop and are not forwarded like ordinary end-to-end headers. A successful HTTP route can therefore fail only when the client attempts a protocol upgrade.\n\n- Set the upstream HTTP version and forward Upgrade and Connection values through a controlled mapping rather than copying arbitrary client connection tokens.\n- Choose idle timeout and liveness behavior from the application's heartbeat contract so healthy quiet sessions are not closed unexpectedly.\n- Preserve authentication and origin validation at the application handshake; the proxy upgrade does not make the browser connection trusted.\n- Expose active upgraded connections, close codes where observable, upstream resets, and reconnect rates so connection churn is not hidden inside generic 5xx metrics.\n\nSee /ops/runbooks for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "validate-nginx-change",
      "summary": "Render, syntax-test, probe, reload, and observe an Nginx change with a defined rollback before traffic depends on it.",
      "body": "---\nname: validate-nginx-change\ndescription: Validate an Nginx routing, header, timeout, TLS, buffering, or upstream change.\n---\n\n# Validate Nginx Change\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Render the exact production configuration with secrets redacted, inspect included files, and run the Nginx configuration test in the target image or host environment.\n- [ ] Probe ordinary, malformed, oversized, streaming, upgraded, and upstream-failure requests through the same ingress path clients use.\n- [ ] Record active connections and baseline error and latency signals, then perform a graceful reload rather than terminating workers with live traffic.\n- [ ] Verify new workers accepted the configuration and old workers drain; watch upstream status, retry count, connection errors, and response latency.\n- [ ] If any acceptance signal regresses, restore the prior rendered configuration, test it, reload again, and preserve the failed config and evidence for diagnosis.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "nginx",
        "reverse-proxy",
        "configuration",
        "reload",
        "operations"
      ]
    }
  ]
};
