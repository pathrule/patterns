import type { Pattern } from "../types.js";

export const apacheAirflow: Pattern = {
  "slug": "apache-airflow",
  "version": "1.0.0",
  "name": "Apache Airflow Data Workflows",
  "tagline": "Design Airflow DAGs around data intervals, idempotent tasks, backfills, retries, and observable datasets.",
  "description": "Airflow schedules task instances for logical data intervals, not arbitrary scripts at wall-clock time. Jobs become unreliable when they read today's date at runtime, pass large payloads through orchestration metadata, mix side effects across retries, or backfill into the same unpartitioned destination. This pattern constrains interval-driven and idempotent tasks, records DAG parsing and data-passing decisions, and provides separate backfill and incident-triage procedures. It differs from general background queues because Airflow owns dependency graphs, historical intervals, task state, reruns, and data-pipeline orchestration rather than low-latency work distribution.",
  "category": "Backend",
  "icon": "chart-no-axes-gantt",
  "color": "bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Apache Airflow pattern for AI coding agents",
  "metaDescription": "Apache Airflow data intervals, idempotent tasks, retries, backfills, DAG parsing, metadata exchange, pools, sensors, and incident triage. In production.",
  "problem": "AI agents often use the current clock instead of the logical interval, perform network discovery while parsing DAG files, or retry a task that appends duplicate output.",
  "audience": "Data teams operating scheduled batch pipelines, dependencies, backfills, and dataset-driven workflows",
  "prevents": [
    "Writing the wrong partition during a delayed or historical run",
    "Slowing every scheduler parse with network or database calls",
    "Duplicating output after task retry or manual clear",
    "Overloading a shared warehouse through unconstrained parallel backfill"
  ],
  "appliesTo": {
    "paths": [
      "/dags",
      "/src/tasks",
      "/tests/dags"
    ],
    "stacks": [
      "apache-airflow",
      "python",
      "data-pipeline",
      "orchestration",
      "etl"
    ],
    "packages": [
      "apache-airflow"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/tasks",
      "title": "Derive every read and write from the logical data interval",
      "summary": "Use the scheduler-provided interval and run identity for partitions, queries, output keys, and observability.",
      "body": "A task may run late, retry tomorrow, or backfill last year. Reading the process clock makes the same task instance operate on different data depending on when infrastructure executes it.\n\n- Accept interval start, interval end, logical date, and run identity as explicit task inputs rather than calling the current date for partition choice.\n- Query sources with closed or half-open boundaries that prevent overlap and gaps across adjacent intervals.\n- Write to a deterministic partition or operation key derived from the logical interval and transformation version.\n- Include DAG, task, run, map, attempt, and interval identity in logs and data-quality evidence so reruns remain attributable.\n\nSee /dags for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/tasks",
      "title": "Make every task safe to retry and clear",
      "summary": "Separate outputs by logical identity, commit atomically, and move external effects behind idempotent keys.",
      "body": "Airflow retries and operators can clear task instances manually. A task that appends blindly or sends an unkeyed notification produces duplicates even though orchestration is behaving correctly.\n\n- Stage output for the task instance and publish it through an atomic replace, partition overwrite, merge, or committed manifest.\n- Use stable idempotency keys for remote APIs, notifications, and messages and record their outcomes outside transient worker memory.\n- Do not mark orchestration success until output completeness and required quality checks are durable.\n- Define cleanup for failed staging data without deleting a prior successful interval or another concurrent run.\n\nSee /tests/dags for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/dags",
      "title": "DAG parsing is pure, fast configuration",
      "summary": "Construct task graphs without fetching production data, making network calls, or performing expensive dynamic discovery in module import.",
      "body": "Schedulers repeatedly parse DAG files. Top-level database queries, cloud listing, secrets calls, or large computation slow the control plane and can make a temporary dependency outage hide the entire workflow.\n\n- Keep top-level code limited to imports, constants, lightweight configuration, and deterministic graph construction.\n- Move source discovery and data-dependent branching into tasks or approved dynamic mapping based on bounded task output.\n- Load secrets at task execution unless graph construction genuinely needs a non-secret configuration value.\n- Test that importing the DAG module performs no external I/O and remains within the scheduler's parsing budget.\n\nSee /tests/dags for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/dags",
      "title": "Airflow metadata carries references, not datasets",
      "summary": "Pass small serializable control values and store real data in an external system with versioned locations.",
      "body": "Orchestration metadata is optimized for task coordination, not large tables, files, or model objects. Passing bulk data through it burdens the metadata database and web interface.\n\n- Return object locations, partition identifiers, row counts, checksums, schema versions, and quality summaries from tasks.\n- Store datasets in the warehouse, object store, or database appropriate to their format and retention.\n- Keep control payloads bounded and free of secrets or large personal records because metadata is widely visible to operators.\n- Make downstream tasks verify the referenced object's identity and completeness rather than trusting a path string alone.\n\nSee /src/tasks for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "plan-airflow-backfill",
      "summary": "Bound, stage, observe, pause, and reconcile historical Airflow intervals without overwhelming shared dependencies.",
      "body": "---\nname: plan-airflow-backfill\ndescription: Plan and execute an Airflow backfill after logic repair, late data, or a new destination.\n---\n\n# Plan Airflow Backfill\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Define the exact DAG version, interval range, expected partitions, source retention, destination behavior, and prior successful state.\n2. Estimate per-interval reads, writes, connections, memory, and external calls, then cap parallelism through pools and batch windows.\n3. Run a small representative interval set, compare row counts, checksums, quality rules, and downstream visibility, and prove rerun idempotency.\n4. Expand in bounded batches while watching scheduler, workers, metadata database, source, destination, and downstream freshness.\n5. Reconcile every intended interval and output, record gaps or exceptions, and remove temporary concurrency or routing changes after completion.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "airflow",
        "backfill",
        "data-pipeline",
        "capacity",
        "operations"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "triage-airflow-failure",
      "summary": "Classify Airflow failures across scheduling, dependencies, workers, code, data, retries, and downstream quality.",
      "body": "---\nname: triage-airflow-failure\ndescription: Triage a failed, missing, delayed, or repeatedly retried Airflow task or DAG run.\n---\n\n# Triage Airflow Failure\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Identify DAG, task, run, interval, map index, attempt, worker, queue, and code version before reading a generic stack trace.\n- [ ] Separate not-scheduled, queued, worker-start, execution, timeout, infrastructure, dependency, data-quality, and publish failures.\n- [ ] Inspect upstream task state, pools, concurrency, sensors, external dependencies, and metadata health before rerunning the task.\n- [ ] Decide whether the failure is transient and idempotent, permanently invalid, or requires code or data repair; do not clear state as the first diagnostic action.\n- [ ] After repair, rerun the smallest safe interval, verify output and downstream state, then document the signal that would detect recurrence earlier.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "airflow",
        "incident",
        "debugging",
        "scheduler",
        "data-quality"
      ]
    }
  ]
};
