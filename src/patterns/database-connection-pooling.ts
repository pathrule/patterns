import type { Pattern } from "../types.js";

export const databaseConnectionPooling: Pattern = {
  "slug": "database-connection-pooling",
  "version": "1.0.0",
  "name": "Database Connections, Pooling, and Capacity",
  "tagline": "Budget database connections across replicas, workers, transactions, queues, and failure recovery.",
  "description": "Connection pools multiply across every application replica, worker process, background consumer, migration job, and deployment overlap, so a locally reasonable maximum can exhaust the database before traffic reaches application CPU limits. This pattern constrains pool budgets, acquisition deadlines, and connection cleanup; it records transaction-pooler and deployment behavior and provides a capacity and leak investigation procedure. It complements query performance and database transactions by focusing on admission and session resources before SQL execution begins.",
  "category": "Backend",
  "icon": "cable",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Database connection pool pattern for AI agents",
  "metaDescription": "Database pool sizing, acquisition timeouts, connection cleanup, deployment overlap, session state, transaction poolers, and leak diagnosis. In production.",
  "problem": "AI agents often set a pool maximum per process without multiplying replicas, hold connections during remote calls, or mistake pool wait time for slow SQL.",
  "audience": "Backend and platform teams operating relational databases behind autoscaled services and workers",
  "prevents": [
    "Exceeding database connection capacity during scale-out or rolling deploy",
    "Leaking checked-out connections on error and cancellation paths",
    "Holding a connection while waiting on unrelated remote I/O",
    "Using session features through a transaction pooler that cannot preserve them"
  ],
  "appliesTo": {
    "paths": [
      "/src/db",
      "/infra",
      "/ops/runbooks"
    ],
    "stacks": [
      "database",
      "connection-pool",
      "postgresql",
      "mysql",
      "backend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra",
      "title": "Budget pools from database capacity across the whole fleet",
      "summary": "Reserve administrative headroom, then divide safe connections among replicas, workers, jobs, migrations, and deployment overlap.",
      "body": "A pool maximum applies to one process or runtime instance. Autoscaling and rolling deployments multiply it, and background services often share the same database without appearing in the web-service configuration.\n\n- Inventory every process type that can connect, its maximum replicas or concurrency, number of pools, and whether old and new versions overlap during deployment.\n- Reserve capacity for administration, monitoring, maintenance, failover, and a degraded state rather than assigning the database maximum to application pools.\n- Set per-process pool limits from the fleet budget and dependency concurrency, then cap autoscaling where connection capacity is the hard limit.\n- Recalculate after adding workers, tenants with dedicated databases, read replicas, or new deployment environments; pool capacity is infrastructure design, not a library default.\n\nSee /src/db for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Bound connection acquisition and always release ownership",
      "summary": "Use an acquisition deadline, scope checkout to the smallest database operation, and release or discard connections on every outcome.",
      "body": "When the pool is exhausted, callers can wait indefinitely and consume request or job concurrency while the database sees no new statement. Error, timeout, and cancellation paths are where leaked ownership accumulates.\n\n- Set an acquisition timeout shorter than the caller's total deadline and return a capacity-specific failure with pool wait evidence.\n- Use structured transaction or connection helpers that release in a finalization path after success, rollback, error, and cancellation.\n- Do not keep a connection checked out while performing HTTP calls, user think time, queue waits, large file work, or computation that can occur outside the database boundary.\n- Discard connections the driver marks broken or whose session reset cannot be proven; returning a poisoned session to the pool spreads one failure across callers.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Reset session state before reuse",
      "summary": "Keep timezone, role, search path, temporary objects, variables, and transaction state from leaking between unrelated borrowers.",
      "body": "A pooled connection is a reused session. State set by one request can silently affect the next request unless it is transaction-local, explicitly reset, or prohibited by the pooling mode.\n\n- Prefer transaction-local settings for tenant, role, timeout, and tracing context so commit or rollback clears them automatically.\n- Never return a connection with an open or failed transaction; roll back and verify clean state in the connection wrapper.\n- Avoid temporary tables, prepared-statement assumptions, and session variables when a transaction pooler can route successive transactions to different server sessions.\n- Test two callers sequentially on one pool connection with different tenants, roles, timezones, and failures to prove state isolation.\n\nSee /infra for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Pool wait and query time are separate signals",
      "summary": "Measure acquisition, transaction, execution, result transfer, and release so capacity problems are not misdiagnosed as slow SQL.",
      "body": "An endpoint can spend most of its latency waiting for a connection while the eventual statement executes quickly. Looking only at database query duration hides the admission queue in the application.\n\n- Record pool size, idle, checked out, waiters, acquisition duration, timeouts, and connection errors per process and aggregate them across the fleet.\n- Trace acquisition as a separate span or phase from SQL execution and attach the logical operation without logging raw sensitive parameters.\n- Correlate wait growth with replica count, request concurrency, long transactions, database CPU and I/O, and deployment overlap.\n- Alert on sustained saturation and wait percentiles before every caller reaches its timeout and begins retrying simultaneously.\n\nSee /ops/runbooks for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/infra",
      "title": "External poolers change the session contract",
      "summary": "Choose session, transaction, or statement pooling from application behavior and validate driver features against that mode.",
      "body": "A transaction pooler improves multiplexing by assigning a server session only for a transaction, but application code cannot assume the same session handles later work. Some prepared statements, temporary objects, locks, and variables depend on that continuity.\n\n- Document the selected pooling mode and which session features are prohibited or require driver-specific configuration.\n- Keep each unit of consistency in one explicit transaction so a transaction pooler cannot split related statements across sessions.\n- Size application-side pools as concurrency queues even when an external pooler exists; removing all local bounds can overwhelm the pooler with clients.\n- Test failover, pooler restart, server connection recycling, and prepared-statement behavior under the exact driver and deployment configuration.\n\nSee /src/db for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "investigate-pool-exhaustion",
      "summary": "Separate fleet budget, pool wait, leaked ownership, long transactions, and database saturation in a connection incident.",
      "body": "---\nname: investigate-pool-exhaustion\ndescription: Investigate database connection exhaustion, acquisition timeouts, or sudden pool wait growth.\n---\n\n# Investigate Pool Exhaustion\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Capture fleet replica counts, deploy overlap, pool configuration, active and idle connections, waiters, database limits, and administrative headroom.\n2. Separate acquisition time from SQL execution and identify processes, endpoints, jobs, or tenants with the longest checked-out duration.\n3. Trace representative connection ownership through transaction, error, cancellation, streaming, and remote-call paths to find unreleased or unnecessarily held sessions.\n4. Reduce intake or concurrency before increasing pool size; confirm the database has CPU, memory, and lock capacity for any additional active work.\n5. Reproduce the dominant leak or saturation path, add a regression test and ownership evidence, then verify waits and timeouts recover across a rolling deployment.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "database",
        "pool",
        "capacity",
        "debugging",
        "operations"
      ]
    }
  ]
};
