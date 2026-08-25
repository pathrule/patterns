import type { Pattern } from "../types.js";

export const apacheSpark: Pattern = {
  "slug": "apache-spark",
  "version": "1.0.0",
  "name": "Apache Spark Data Processing",
  "tagline": "Control Spark partitioning, shuffles, skew, schemas, retries, and output commits at data scale.",
  "description": "Spark jobs fail at scale when small development inputs hide shuffles, skewed keys, tiny files, driver collection, unstable schemas, or non-idempotent writes that retries duplicate. This pattern constrains driver-bound operations and output identity, records partition and join strategy decisions, and provides a repeatable physical-plan and skew review for production datasets. It differs from Pandas by focusing on distributed execution, stage boundaries, partition movement, executor memory, and retry-safe commits rather than local DataFrame mutation semantics.",
  "category": "Backend",
  "icon": "chart-network",
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
  "metaTitle": "Apache Spark pattern for AI coding agents",
  "metaDescription": "Apache Spark schemas, partitioning, shuffle control, skew handling, join strategy, small-file management, retries, and physical-plan reviews. In production.",
  "problem": "AI agents often collect data to the driver, repartition blindly, broadcast an input that no longer fits, or write append-only output from a retried job without stable run identity.",
  "audience": "Data engineering teams operating batch or streaming Spark workloads on shared clusters",
  "prevents": [
    "Crashing the driver by collecting production-scale data",
    "Creating a single hot partition from a skewed key",
    "Producing thousands of tiny output files",
    "Duplicating output when a stage or job retries"
  ],
  "appliesTo": {
    "paths": [
      "/jobs",
      "/schemas",
      "/tests/data"
    ],
    "stacks": [
      "apache-spark",
      "pyspark",
      "data-engineering",
      "distributed-computing",
      "etl"
    ],
    "packages": [
      "pyspark"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/jobs",
      "title": "Keep production data distributed",
      "summary": "Never collect or convert an unbounded dataset on the driver; inspect samples and aggregates through bounded operations.",
      "body": "The driver coordinates work and has a finite heap. A call that materializes all rows there can pass on development input and terminate the application when production volume arrives.\n\n- Use distributed writes and aggregations for full results, and apply an explicit limit before collecting diagnostic samples.\n- Do not convert a Spark DataFrame to a local DataFrame unless a proven row and byte bound fits the driver with headroom.\n- Broadcast only when the relation's serialized size and expected growth are measured against executor memory; remove forced hints when the assumption is no longer durable.\n- Keep large lookup data in a distributed relation and let the physical plan choose or enforce a measured join strategy instead of building a driver-side map.\n\nSee /schemas for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/jobs",
      "title": "Make writes retry-safe and partition-bounded",
      "summary": "Write under stable run identity, stage into isolated locations, and commit complete outputs without duplicate or partial visibility.",
      "body": "Spark can retry tasks and whole jobs, while object stores and external sinks have different atomicity. A side effect performed per partition without an idempotency contract can be repeated after failure.\n\n- Define the logical output key from source interval, partition values, and transformation version so rerunning the same work replaces or returns the same result.\n- Stage output away from the published location and expose it only after completeness checks and commit metadata succeed.\n- Avoid uncoordinated external API or database writes inside row functions; use a sink with idempotent keys, batching, retry limits, and reconciliation.\n- Control output partition count from downstream file-size and parallel-read needs; do not coalesce everything to one file or emit one tiny file per task by default.\n\nSee /tests/data for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/jobs",
      "title": "Partition count follows data volume and the next expensive boundary",
      "summary": "Size partitions from bytes, skew, cluster parallelism, and downstream file goals instead of copying one static number.",
      "body": "Partitioning is a workload decision. Too few partitions underuse the cluster and create oversized tasks; too many spend time scheduling and create tiny files. A good count can change after a filter or shuffle.\n\n- Inspect input split sizes and post-filter volume before the first wide transformation rather than assuming source file count describes useful work.\n- Repartition on the key required by an upcoming join or aggregation only when reducing skew or avoiding repeated shuffles justifies the movement.\n- Use coalescing for a measured reduction after data shrinks, and verify it does not collapse a skewed partition into a new bottleneck.\n- Record task duration, input bytes, shuffle bytes, spill, and output file distribution so future volume growth has a baseline.\n\nSee /schemas for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/jobs",
      "title": "Skew is a data property with an explicit mitigation",
      "summary": "Identify hot keys and choose filtering, pre-aggregation, salting, or split processing based on their business meaning.",
      "body": "One partition holding a dominant key can keep an entire stage running after every other executor is idle. Adding executors does not split that key unless the data or operation changes.\n\n- Measure key-frequency distribution and task-duration spread on representative data; averages conceal the tail that controls stage completion.\n- Filter or process exceptional sentinel keys separately when they represent unknown or global data with different business semantics.\n- Pre-aggregate before a join when many rows can collapse at the same grain, reducing both shuffle volume and hot-key multiplication.\n- Use deterministic salting only with a plan to recombine results correctly, and document which keys require it so the workaround does not become invisible schema behavior.\n\nSee /tests/data for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-spark-physical-plan",
      "summary": "Inspect a Spark plan and stage evidence for scans, shuffles, joins, skew, spills, partitions, and retry-safe output.",
      "body": "---\nname: review-spark-physical-plan\ndescription: Review an Apache Spark job before increasing its data volume or cluster schedule.\n---\n\n# Review Spark Physical Plan\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Capture the logical and physical plan with representative parameters and identify every exchange, sort, broadcast, Python boundary, and repeated scan.\n- [ ] Compare estimated and observed relation sizes where available, then confirm join strategy assumptions under the largest expected dimension and hottest key.\n- [ ] Review stage task distributions for duration, input, shuffle, spill, garbage collection, and failed attempts rather than only total job time.\n- [ ] Inspect output file count and size distribution and prove the chosen partition layout matches downstream reads and object-store behavior.\n- [ ] Kill or retry the job during write and rerun the same interval; verify no duplicate side effects or partial published output remains.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "spark",
        "pyspark",
        "physical-plan",
        "shuffle",
        "performance"
      ]
    }
  ]
};
