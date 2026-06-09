import type { Pattern } from "../types.js";

export const observability: Pattern = {
  "slug": "observability",
  "version": "1.0.0",
  "name": "Observability",
  "tagline": "Emit correlated logs, metrics, and traces that make incidents debuggable.",
  "description": "A ready-to-use bundle of rules, memories, and a review checklist for instrumenting services with OpenTelemetry. It encodes 2026 best practices: OTLP-first telemetry, structured JSON logs carrying trace and span ids, low-cardinality metrics, and SLO burn-rate alerts so your agent stops generating print-statement debugging and noisy page-on-everything alerting.",
  "category": "Infra",
  "icon": "activity",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Observability pattern for AI coding agents",
  "metaDescription": "Teach your AI coding agent to instrument services with OpenTelemetry: structured logs with trace ids, low-cardinality metrics, OTLP export, SLOs, and burn-rate alerts.",
  "problem": "AI agents reach for ad-hoc console logs and unbounded custom metrics, producing telemetry that cannot be correlated across signals and alerts that page on noise instead of user impact.",
  "audience": "Backend and platform teams running production services who own their on-call and SLOs",
  "prevents": [
    "Plain-text or console logs with no trace_id, so a log line can never be tied back to the request that produced it",
    "High-cardinality metric attributes (user ids, raw URLs, request ids) that explode storage cost and degrade queries",
    "Threshold alerts on raw CPU or error counts that page constantly without reflecting actual user impact"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/src",
      "/src/observability",
      "/src/instrumentation",
      "/deploy"
    ],
    "stacks": [
      "opentelemetry",
      "otlp",
      "node",
      "typescript",
      "prometheus",
      "slo"
    ],
    "packages": [
      "@opentelemetry/api",
      "@opentelemetry/sdk-node",
      "@opentelemetry/auto-instrumentations-node",
      "@opentelemetry/exporter-trace-otlp-http",
      "pino"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Log structured JSON correlated to the active trace",
      "summary": "Every log line is structured and carries the active trace and span ids.",
      "body": "Emit structured JSON through one logger and stamp every record with the active trace context, so any log line can jump straight to its trace.\n\n- Never use `console.log` or `print` for application logging. Route everything through a single structured logger (`pino`, `winston`, `structlog`).\n- Put `trace_id` and `span_id` on every record from the active span context, plus `service.name` and a severity that maps to the OTel `SeverityNumber`. In a request handler, read the current span with `trace.getActiveSpan()?.spanContext()` and attach the ids; do not parse them out of the message string later.\n- Attach business identifiers (`user.id`, `order.id`, `request.id`) as discrete fields, never by concatenating them into the message text.\n- Do not log secrets, tokens, or full PII. Redact at the logger (a serializer / formatter), not at each call site, so one missed call site cannot leak.\n- Stack note: the OpenTelemetry JS logs SDK (`@opentelemetry/sdk-logs`) is still experimental as of 2026. Until it stabilizes for your runtime, the reliable correlated-logs setup is to log JSON to stdout with the trace ids injected (pino's `mixin`, or an OTel log hook), then collect with the Collector's `filelog` receiver. Do not block correlated logging on the SDK reaching stable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Keep metric attributes low-cardinality",
      "summary": "Never attach unbounded ids to metric attributes.",
      "body": "Metric attributes define the cardinality of a time series (one series per unique attribute combination), so only attach bounded, enumerable values.\n\n- Allowed attributes are bounded sets: `http.route` (the templated path like `/users/{id}`, never the raw URL), `http.response.status_code`, `service.name`, region, and environment.\n- Never attach user ids, session ids, request ids, raw URLs, raw error messages, or timestamps as metric attributes. Those belong on spans and logs, where high cardinality is fine.\n- Use the stable OpenTelemetry HTTP semantic conventions for attribute names (`http.request.method`, `http.route`, `http.response.status_code`) so cross-service dashboards and SLO queries work without per-team mapping.\n- When an instrumentation library or a third party feeds an unbounded attribute you cannot fix at the call site, drop or rewrite it with an SDK View, or in the Collector, before it is ever exported. Catching it at the source is cheaper than paying for the cardinality and querying around it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/observability",
      "title": "OpenTelemetry SDK setup: OTLP export, signal status, propagation",
      "summary": "Initialize one SDK, export over OTLP to a Collector, and know which signals are actually stable.",
      "body": "OpenTelemetry is the default instrumentation layer in 2026. OTLP is stable for traces, metrics, and logs. Profiles is the emerging fourth signal and entered public Alpha (GA targeted for Q3 2026) - treat it as not production-ready yet.\n\nSetup decisions:\n- Initialize the SDK once at process start, before any other import, so auto-instrumentation can patch libraries. In Node use `@opentelemetry/sdk-node` with `getNodeAutoInstrumentations()`, loaded via `--require ./instrumentation.js` (or `--import` for ESM) so it runs before app code.\n- Export over OTLP (gRPC `4317` or HTTP `4318`) to a local OpenTelemetry Collector, not directly to a vendor. The Collector owns batching, retries, redaction, and re-routing, so you can switch backends without redeploying services.\n- Set `service.name`, `service.version`, and `deployment.environment.name` as Resource attributes so every signal is attributable.\n- Use the W3C `traceparent` propagator (the default) so trace context flows across HTTP, gRPC, and message queues. Do not hand-roll correlation headers.\n\nSignal-stability caveat (matters for this stack): spec-level stability is not SDK-level stability. In OpenTelemetry JS the traces and metrics SDKs are stable, but the logs SDK is still experimental as of 2026 (logs are stable in Java, .NET, C++, PHP; beta/dev elsewhere). For Node, prefer structured stdout JSON collected by the Collector `filelog` receiver over the experimental logs SDK until it stabilizes for your runtime.\n\nGenAI / agent calls: the `gen_ai` semantic conventions now have stable client spans (`gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.response.finish_reasons`); agent and tool conventions (`gen_ai.agent.*`, `gen_ai.tool.*`) are still experimental. Use these names for AI pipelines instead of inventing attributes.\n\nSee /src for the logging and metric-cardinality rules these signals must satisfy, and /deploy for how SLOs consume this telemetry.",
      "skillTags": []
    },
    {
      "kind": "memory",
      "nodePath": "/deploy",
      "title": "SLOs and multi-window multi-burn-rate alerts",
      "summary": "Alert on error-budget burn rate with a long detection plus short confirmation window; page only on user impact.",
      "body": "Define SLOs on user-facing symptoms (availability, latency) and alert on how fast you burn the error budget, not on raw resource thresholds. This is the Google SRE multi-window, multi-burn-rate (MWMBR) approach.\n\n- Pick SLIs that reflect user experience: success ratio of requests and a latency percentile (for example p95 under 300ms). Set a realistic objective like 99.9% over a rolling 30 days.\n- Each alert pairs a long detection window with a short confirmation window, and both conditions must be true to fire - the short window stops a recovered incident from continuing to page.\n- Page (CriticalFast): burn rate > 14.4 over a 1-hour window, confirmed by a 5-minute short window. At 14.4x you consume about 2% of a 30-day budget in one hour.\n- Ticket, no page (CriticalMedium): burn rate > 6 over a 6-hour window, confirmed by a 30-minute short window.\n- Slow burn: surface burn rate > 1 over roughly 3 days in weekly review rather than alerting.\n- Power these SLIs with RED metrics (Rate, Errors, Duration) for request services and USE (Utilization, Saturation, Errors) for resources.\n- Every page must be actionable and link to a runbook. If an alert cannot be acted on, it is a dashboard, not a page.\n\nSee /src/observability for the OTel metrics these SLIs are computed from.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "observability-review",
      "summary": "Pre-merge checklist for new or changed instrumentation, logging, and alerts.",
      "body": "---\nname: observability-review\ndescription: Review checklist for service observability covering structured correlated logs, OpenTelemetry trace and metric instrumentation, OTLP export, low-cardinality metrics, and SLO burn-rate alerts. Run before merging any telemetry, logging, or alerting change.\n---\n\n# Observability review\n\n## Logging\n- [ ] All application logs go through one structured logger emitting JSON; no `console.log` / `print` for app logging.\n- [ ] Every log record carries `trace_id`, `span_id`, `service.name`, and a mapped OTel severity from the active span context.\n- [ ] Secrets, tokens, and PII are redacted at the logger; business identifiers are discrete fields, not embedded in the message string.\n- [ ] If on Node/JS, logs are emitted as stdout JSON collected by the Collector (filelog receiver), not relying on the still-experimental OTel JS logs SDK.\n\n## Instrumentation and export\n- [ ] The OpenTelemetry SDK is initialized once before any other import (Node: `--require`/`--import`), with `service.name`, `service.version`, and `deployment.environment.name` on the Resource.\n- [ ] Traces and metrics export over OTLP to a Collector, not directly to a vendor backend.\n- [ ] W3C `traceparent` propagation is used across HTTP, gRPC, and queues; no hand-rolled correlation headers.\n- [ ] GenAI calls use `gen_ai` semantic conventions (stable client-span attributes) rather than invented attribute names.\n\n## Metrics cardinality\n- [ ] Metric attributes are low-cardinality and follow HTTP semantic conventions (`http.route`, `http.request.method`, `http.response.status_code`); no user ids, request ids, or raw URLs as attributes.\n- [ ] Any unbounded attribute from a library is dropped or rewritten via an SDK View or the Collector before export.\n\n## Alerting\n- [ ] New alerts are tied to an SLO and fire on multi-window burn rate (page at > 14.4 / 1h confirmed by 5m; ticket at > 6 / 6h confirmed by 30m), not raw CPU or error counts.\n- [ ] Every paging alert is actionable and links to a runbook; non-actionable signals are dashboards, not pages.\n",
      "skillTags": [
        "opentelemetry",
        "observability",
        "logging",
        "metrics",
        "slo"
      ]
    }
  ]
};
