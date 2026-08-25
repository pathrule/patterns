import type { Pattern } from "../types.js";

export const sqlQueryPerformance: Pattern = {
  "slug": "sql-query-performance",
  "version": "1.0.0",
  "name": "SQL Query Performance and Indexing",
  "tagline": "Tune SQL from measured plans, realistic data, deliberate indexes, and bounded result shapes.",
  "description": "SQL performance failures rarely come from one slow keyword. They emerge from data distribution, join cardinality, predicates the optimizer cannot use, indexes that do not match access paths, and application code that asks the database to return far more than the user needs. This pattern constrains plan-first tuning, index ownership, pagination, and application query budgets; it also records how statistics and representative datasets shape decisions and provides a repeatable regression workflow. It complements the PostgreSQL schema pattern without repeating migration design, and it stays portable across relational engines by focusing on plans, query shapes, selectivity, and measured workload behavior.",
  "category": "Backend",
  "icon": "chart-spline",
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
  "metaTitle": "SQL query performance pattern for AI agents",
  "metaDescription": "SQL execution plans, index design, join cardinality, pagination, query budgets, and regression evidence for production relational databases. In production.",
  "problem": "AI agents often add an index without reading the plan, optimize against tiny fixtures, wrap indexed columns in functions, or paginate with offsets that grow slower on every page.",
  "audience": "Backend and data teams operating latency-sensitive queries on relational databases",
  "prevents": [
    "Adding redundant indexes that slow writes without improving the target plan",
    "Tuning against development data with unrealistic cardinality",
    "Making predicates unsargable through casts or functions",
    "Shipping unbounded list queries and deep offset pagination"
  ],
  "appliesTo": {
    "paths": [
      "/db/queries",
      "/db/migrations",
      "/src/repositories"
    ],
    "stacks": [
      "sql",
      "query-performance",
      "indexing",
      "relational-database",
      "backend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/db/queries",
      "title": "Read the execution plan before changing the query",
      "summary": "Capture estimated and observed row counts, access paths, joins, sorts, and spills before selecting a tuning action.",
      "body": "A slow query is evidence about the optimizer's chosen plan under a particular dataset and parameter set. Rewriting syntax or adding an index without that evidence can improve one case while making the dominant workload worse.\n\n- Capture the plan with representative bind values and, where safe, actual execution metrics; do not infer cost from the SQL text alone.\n- Compare estimated rows with observed rows at each major node. Large divergence points to statistics, correlation, or parameter-distribution problems before it points to missing hardware.\n- Identify the first expensive expansion, repeated inner scan, sort, or spill rather than blaming the final node that merely accumulates upstream cost.\n- Save the before plan, runtime, returned row count, and dataset assumptions with the change so a later regression can compare the same evidence.\n\nSee /db/migrations for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/db/migrations",
      "title": "Create indexes for proven access paths",
      "summary": "Match leading columns, predicates, ordering, and covering needs to real queries while accounting for write and storage cost.",
      "body": "Every index is a second data structure maintained on writes. An index that only resembles a WHERE clause may be unused because its leading columns, selectivity, expression, collation, or ordering do not match the plan.\n\n- Design from the complete access path: equality filters first where appropriate, then range or ordering needs, and include projected columns only when measured lookup avoidance justifies it.\n- Use partial or filtered indexes when a stable predicate selects the operational subset, and make the query express the same predicate the optimizer can prove.\n- Remove duplicate and prefix-redundant indexes only after checking constraints, foreign-key behavior, and less frequent workload paths that may rely on them.\n- Estimate added write amplification, build duration, lock behavior, storage, and rollback before applying the index to a large production table.\n\nSee /db/queries for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/repositories",
      "title": "Bound every interactive query",
      "summary": "Select only required columns, impose a deterministic limit, and use keyset pagination for result sets that can grow.",
      "body": "Application query shape is part of database capacity. Returning entire rows or using deep offsets transfers avoidable data, consumes memory, and forces the database to revisit or discard work the interface never displays.\n\n- Project the fields the caller uses instead of selecting whole records that include blobs, wide JSON, or sensitive columns.\n- Require a deterministic ORDER BY with a unique tie-breaker and a maximum page size at the repository boundary.\n- Use a cursor built from the ordered key tuple for growing lists; do not use unbounded OFFSET as the primary pagination strategy.\n- Avoid query-per-row loading by batching known relations or using a measured join, but do not create one giant fan-out query whose repeated rows dwarf the useful payload.\n\nSee /db/queries for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/db/queries",
      "title": "Representative cardinality matters more than fixture convenience",
      "summary": "Performance tests preserve skew, null rates, hot tenants, relationship fan-out, and parameter distributions that influence the optimizer.",
      "body": "A query plan chosen for ten uniform fixture rows says little about a production table with millions of rows, one dominant tenant, sparse values, or highly correlated columns. The optimizer responds to distribution, not just schema.\n\n- Build anonymized or synthetic datasets that preserve row counts, value frequency, null fraction, relationship fan-out, and the heaviest authorized tenant.\n- Test common, worst credible, and boundary parameter values because a plan that is excellent for one selectivity can be poor for another.\n- Refresh or analyze statistics through the engine's supported workflow after representative loads and major distribution changes.\n- Keep performance fixtures separate from functional fixtures so developers can run fast correctness tests without erasing the dataset needed for plan work.\n\nSee /src/repositories for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/repositories",
      "title": "Query budgets belong to user-visible operations",
      "summary": "Track total database calls, rows, bytes, and latency for one request or job rather than judging each statement in isolation.",
      "body": "Ten individually fast statements can still create a slow endpoint, and one low-latency query can return enough data to exhaust application memory. The useful budget follows the product operation across repository calls.\n\n- Record normalized query identity and duration under the request or job trace without logging secrets or raw personal values.\n- Set expectations for total query count, result rows, and database time on hot flows, then alert on trend or regression rather than one copied threshold.\n- Separate time waiting for a pool connection from time executing SQL so capacity exhaustion is not misdiagnosed as a bad plan.\n- Review background and export workloads too; they often evade interactive latency alerts while consuming the same connection and I/O capacity.\n\nSee /db/queries for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "investigate-sql-regression",
      "summary": "Reproduce a SQL slowdown, compare plans and cardinality, test one change, and preserve rollback evidence.",
      "body": "---\nname: investigate-sql-regression\ndescription: Investigate a production SQL performance regression without guessing from query text.\n---\n\n# Investigate Sql Regression\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Identify the normalized query, affected operation, parameter distribution, database wait, and the first deployment or data change correlated with the slowdown.\n2. Reproduce against representative statistics and data volume, then capture plans for a common value and the worst credible value.\n3. Compare estimated and observed rows, access paths, join order, sorts, spills, locks, and time waiting for a connection.\n4. Apply one query, index, statistics, or data-shape change and rerun the same evidence set, including write cost and concurrent load.\n5. Define rollback for the selected change and store before-and-after plans, timings, row counts, and assumptions beside the migration or query.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "sql",
        "performance",
        "execution-plan",
        "indexing",
        "debugging"
      ]
    }
  ]
};
