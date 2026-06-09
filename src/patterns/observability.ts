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
      "title": "Log structured JSON carrying trace and span ids",
      "summary": "Every log line is structured and correlated to its active span.",
      "body": "Emit structured JSON through one logger and let OpenTelemetry inject the active trace context, so any log line jumps straight to its trace.\n\n- Never use `console.log` or `print` for application logging; route everything through a single structured logger (`pino`, `winston`, `structlog`) wired to the OTel logs bridge.\n- Include `trace_id` and `span_id` on every record from the active span context, plus `service.name` and a severity that maps to the OTel `SeverityNumber`.\n- Attach business identifiers (`user.id`, `order.id`, `request.id`) as discrete fields, never by string-concatenating them into the message.\n- Do not log secrets, tokens, or full PII; redact at the logger, not at the call site.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Keep metric attributes low-cardinality",
      "summary": "Never attach unbounded ids to metric attributes.",
      "body": "Metric attributes form the cardinality of a time series, so only attach bounded, enumerable values.\n\n- Allowed attributes are bounded sets: `http.route` (the templated path, not the raw URL), `http.response.status_code`, `service.name`, region, and environment.\n- Never attach user ids, session ids, request ids, raw URLs, or error messages as metric attributes; carry those on spans and logs instead.\n- Follow stable OpenTelemetry semantic conventions for attribute names (`http.request.method`, `http.route`) so cross-service dashboards and SLO queries work without per-team mapping.\n- Drop or aggregate unwanted attributes at the source with SDK Views, or in the Collector, before they are ever exported.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/observability",
      "title": "OpenTelemetry SDK setup: OTLP export, signals, and propagation",
      "summary": "Initialize one SDK that exports traces, metrics, and logs over OTLP.",
      "body": "OpenTelemetry is the default instrumentation layer in 2026, with traces, metrics, and logs all stable and shipped over the OTLP wire protocol. Continuous profiling is the fourth signal, in release-candidate status.\n\n- Initialize the SDK once at process start, before any other import, so auto-instrumentation can patch libraries; in Node use `@opentelemetry/sdk-node` with `getNodeAutoInstrumentations()`.\n- Export all three signals over OTLP (gRPC `4317` or HTTP `4318`) to a local OpenTelemetry Collector, not directly to a vendor; the Collector handles batching, retries, and re-routing.\n- Set `service.name`, `service.version`, and `deployment.environment` as Resource attributes so every signal is attributable.\n- Use the W3C `traceparent` propagator (the default) so trace context flows across HTTP, gRPC, and message queues; do not hand-roll correlation headers.\n- LLM and agent calls have a `gen_ai` semantic-convention group (still experimental) covering `gen_ai.request.model` and token-usage attributes; use it for AI pipelines rather than inventing attribute names.",
      "skillTags": []
    },
    {
      "kind": "memory",
      "nodePath": "/deploy",
      "title": "SLOs and multi-window burn-rate alerts",
      "summary": "Alert on error-budget burn rate, page only on user impact.",
      "body": "Define SLOs on user-facing symptoms (availability, latency) and alert on how fast you burn the error budget, not on raw resource thresholds. This is the Google SRE multi-window, multi-burn-rate approach.\n\n- Pick SLIs that reflect user experience: success ratio of requests and a latency percentile (for example p95 under 300ms); set a realistic objective like 99.9% over 30 days.\n- Page when burn rate is greater than 14.4 over a 1-hour window (about 2% of a 30-day budget consumed in an hour) and the short window confirms it is still burning now.\n- Open a ticket (no page) when burn rate is greater than 6 over a 6-hour window, and surface slow burns (greater than 1 over 3 days) in weekly review.\n- Each alert pairs a long detection window with a short confirmation window so resolved incidents stop paging; instrument RED metrics (Rate, Errors, Duration) for request services and USE (Utilization, Saturation, Errors) for resources to power these SLIs.\n- Every page must be actionable and link to a runbook; if an alert cannot be acted on, it is a dashboard, not a page.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "observability-review",
      "summary": "Pre-merge checklist for new or changed instrumentation, logging, and alerts.",
      "body": "---\nname: observability-review\ndescription: Review checklist for service observability covering structured correlated logs, OpenTelemetry trace and metric instrumentation, OTLP export, low-cardinality metrics, and SLO burn-rate alerts. Run before merging any telemetry, logging, or alerting change.\n---\n\n# Observability review\n\n- [ ] All application logs go through one structured logger emitting JSON; no `console.log`/`print` for app logging.\n- [ ] Every log record carries `trace_id`, `span_id`, `service.name`, and a mapped OTel severity from the active span context.\n- [ ] Secrets, tokens, and PII are redacted at the logger; business identifiers are discrete fields, not embedded in the message string.\n- [ ] The OpenTelemetry SDK is initialized once before other imports, with `service.name`, `service.version`, and `deployment.environment` set on the Resource.\n- [ ] Traces, metrics, and logs export over OTLP to a Collector, not directly to a vendor backend.\n- [ ] W3C `traceparent` propagation is used across HTTP, gRPC, and queues; no hand-rolled correlation headers.\n- [ ] Metric attributes are low-cardinality and follow semantic conventions (`http.route`, `http.request.method`); no user ids, request ids, or raw URLs as attributes.\n- [ ] High-cardinality attributes are dropped or aggregated via SDK Views or the Collector before export.\n- [ ] New alerts are tied to an SLO and fire on multi-window burn rate (page at >14.4 / 1h, ticket at >6 / 6h), not raw CPU or error counts.\n- [ ] Every paging alert is actionable and links to a runbook; non-actionable signals are dashboards, not pages.\n",
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
