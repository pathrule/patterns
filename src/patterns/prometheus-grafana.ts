import type { Pattern } from "../types.js";

export const prometheusGrafana: Pattern = {
  "slug": "prometheus-grafana",
  "version": "1.0.0",
  "name": "Prometheus and Grafana Operations",
  "tagline": "Operate metrics with bounded cardinality, durable rules, actionable alerts, and trustworthy dashboards.",
  "description": "Prometheus reliability depends on label cardinality, scrape and query cost, series churn, retention, rule evaluation, and alert semantics, while Grafana can hide expensive queries and ambiguous units behind a polished dashboard. This pattern constrains metric labels and alert evidence, records histogram, recording-rule, and dashboard ownership, and supplies separate metric-review and alert-validation procedures. It deepens the general observability pattern with concrete PromQL, time-series cardinality, scrape, rule, and visualization operations rather than traces and logs.",
  "category": "Infra",
  "icon": "chart-column-increasing",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Prometheus Grafana pattern for AI agents",
  "metaDescription": "Prometheus metric design, label cardinality, histograms, recording rules, PromQL, alerts, Grafana dashboards, retention, and validation. In production.",
  "problem": "AI agents often put user IDs or URLs in labels, average precomputed percentiles, alert on one noisy sample, or build dashboards with queries that scan raw high-cardinality series repeatedly.",
  "audience": "Platform and service teams operating Prometheus-compatible metrics and Grafana dashboards",
  "prevents": [
    "Exhausting memory through unbounded label values",
    "Computing invalid latency aggregates from client-side quantiles",
    "Paging on transient noise without user impact",
    "Showing rates, totals, and units that change with dashboard interval"
  ],
  "appliesTo": {
    "paths": [
      "/observability/metrics",
      "/observability/rules",
      "/observability/dashboards"
    ],
    "stacks": [
      "prometheus",
      "grafana",
      "promql",
      "metrics",
      "observability"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/observability/metrics",
      "title": "Keep metric labels finite and operational",
      "summary": "Use bounded dimensions that support aggregation and diagnosis; never encode user, request, payload, or raw path identity in labels.",
      "body": "Every unique label set creates a time series with memory, storage, and query cost. An unbounded user ID, URL, exception message, or queue item can grow without a fixed ceiling.\n\n- Allowlist labels from stable service, operation, status class, region, version, and other bounded dimensions tied to an operational question.\n- Normalize route templates instead of raw paths and classify failures instead of labeling full exception text.\n- Put high-cardinality identities in sampled traces or structured logs with privacy controls, not in metric labels.\n- Measure active series, churn, samples, scrape size, and top label combinations before and after every new dimension.\n\nSee /observability/rules for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/observability/rules",
      "title": "Alerts express sustained user-impacting conditions",
      "summary": "Combine symptom, duration, scope, and routing metadata with a runbook instead of paging on raw resource noise.",
      "body": "A threshold crossed for one scrape is often noise, while a slow-burning failure can hide under a single average. Alerts should describe an actionable service condition and survive missing data intentionally.\n\n- Start from error, latency, availability, freshness, saturation, or correctness symptoms that an owner can act on.\n- Use an evaluation window and persistence period that match the failure dynamics and data resolution.\n- Define how absent, stale, reset, and partial metrics affect the expression; missing series must not silently look healthy.\n- Attach owner, severity, service, environment, summary, and runbook labels or annotations and test the route before relying on the page.\n\nSee /observability/dashboards for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/observability/metrics",
      "title": "Histograms preserve aggregatable latency distributions",
      "summary": "Choose buckets from service objectives and observed shape, then calculate rates and quantiles from bucket counters.",
      "body": "Client-side quantiles cannot be averaged across instances or longer windows. Histograms retain cumulative bucket counts that can be aggregated when boundaries are consistent.\n\n- Choose bucket boundaries around user-visible objectives and meaningful tail regions rather than copying a generic sequence without observing the service.\n- Use identical boundaries for series that must aggregate and keep the number of buckets compatible with cardinality and scrape cost.\n- Calculate rates before histogram quantiles over the selected window and group by only the dimensions needed for the question.\n- Measure count and sum alongside tail estimates and preserve units in metric names and dashboard labels.\n\nSee /observability/dashboards for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/observability/rules",
      "title": "Recording rules are a reviewed query API",
      "summary": "Precompute stable expensive aggregations with explicit names, units, labels, ownership, and tests.",
      "body": "Dashboards and alerts that each repeat a complex raw query create cost and semantic drift. A recording rule can centralize the computation but becomes a public derived metric that must be versioned carefully.\n\n- Create recording rules for frequently reused rates, service-level indicators, and expensive aggregations after confirming their label and window semantics.\n- Name the rule to expose level, metric, operation, and aggregation convention without embedding an arbitrary dashboard range.\n- Drop labels that no longer carry meaning after aggregation and retain only dimensions downstream users are allowed to split.\n- Test rules against fixture series with counter resets, missing targets, multiple instances, and zero traffic before alerts and dashboards depend on them.\n\nSee /observability/dashboards for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/observability/dashboards",
      "title": "Dashboards preserve query meaning across time ranges",
      "summary": "Use rates and intervals that adapt correctly, show units and scope, and provide drill paths from service symptoms to evidence.",
      "body": "A dashboard can look plausible while changing meaning when the time range or resolution changes. Fixed rate windows, raw counters, and unlabeled aggregates create false comparisons.\n\n- Use range-aware rate intervals large enough for scrape cadence and keep query windows visible in panel descriptions where interpretation depends on them.\n- Label units, aggregation, scope, and missing-data behavior; do not mix seconds and milliseconds or totals and per-second rates on one axis without clarity.\n- Lead with service health and objectives, then provide traffic, errors, latency, saturation, deployment, and dependency drilldowns.\n- Link to related traces, logs, runbooks, deployments, and owner context using bounded identifiers instead of copying high-cardinality data into metrics.\n\nSee /observability/rules for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-prometheus-metric",
      "summary": "Review a metric family for semantics, type, units, cardinality, lifecycle, aggregation, cost, and privacy before rollout.",
      "body": "---\nname: review-prometheus-metric\ndescription: Review a new or changed Prometheus metric and its Grafana use.\n---\n\n# Review Prometheus Metric\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] State the operational question, metric type, unit, event or observation point, and which component owns emission.\n- [ ] Enumerate every label and its maximum values, churn, attacker control, privacy class, and aggregation meaning.\n- [ ] Calculate projected series and sample volume across replicas, environments, status values, buckets, and deployment overlap.\n- [ ] Test counter reset, missing target, no traffic, duplicate scrape, restart, and mixed-version behavior in recording and dashboard queries.\n- [ ] Deploy to a small scope, inspect actual series and query cost, then remove experimental labels and panels that do not answer a real question.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "prometheus",
        "metrics",
        "cardinality",
        "review",
        "grafana"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "validate-prometheus-alert",
      "summary": "Backtest, fire, route, silence, and recover an alert with real metric edge cases and an executable runbook.",
      "body": "---\nname: validate-prometheus-alert\ndescription: Validate a Prometheus alert and Grafana evidence before it pages an owner.\n---\n\n# Validate Prometheus Alert\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Evaluate the expression over representative history with incidents, deployments, quiet periods, missing targets, counter resets, and seasonal load.\n2. Force the condition in a test environment and confirm pending duration, firing labels, annotations, grouping, routing, inhibition, and notification delivery.\n3. Open the linked dashboard and runbook from the notification and verify they identify scope, user impact, likely causes, and safe first actions.\n4. Resolve the condition and confirm recovery timing, state retention, and notification behavior without flapping.\n5. Record expected false-positive and false-negative tradeoffs, owner, review date, and the exact signal that would justify retuning.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "prometheus",
        "alerting",
        "promql",
        "runbook",
        "testing"
      ]
    }
  ]
};
