import type { Pattern } from "../types.js";

export const elasticsearchOpensearch: Pattern = {
  "slug": "elasticsearch-opensearch",
  "version": "1.0.0",
  "name": "Elasticsearch and OpenSearch",
  "tagline": "Design mappings, analyzers, queries, shards, aliases, and reindexing around search behavior.",
  "description": "Search clusters become difficult to repair when dynamic mapping chooses the wrong type, analyzed and exact fields are confused, nested arrays lose relationship meaning, shard counts outgrow the data, or application code targets physical index names that cannot migrate. This pattern constrains explicit mappings, bounded queries, and safe writes; it records analysis, shard, and alias decisions and provides a zero-downtime reindex procedure. It differs from relational indexing and database-schema patterns because inverted indexes, analyzers, relevance scoring, nested documents, segment merges, and alias-based index replacement define the operational model.",
  "category": "Backend",
  "icon": "search",
  "color": "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/15 dark:text-yellow-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Elasticsearch OpenSearch pattern for AI agents",
  "metaDescription": "Elasticsearch and OpenSearch mappings, analyzers, nested data, query limits, shard sizing, aliases, bulk writes, and zero-downtime reindexing. In production.",
  "problem": "AI agents often rely on dynamic mappings, use analyzed text for exact filters, query nested objects as flat fields, or update an index mapping that actually requires a new index and reindex.",
  "audience": "Backend and search teams operating Elasticsearch or OpenSearch for product search, logs, or discovery",
  "prevents": [
    "Locking an incorrect inferred field type into a production index",
    "Returning false matches across different objects in an array",
    "Creating excessive shards and cluster metadata overhead",
    "Coupling applications to physical index versions during migration"
  ],
  "appliesTo": {
    "paths": [
      "/search/mappings",
      "/search/queries",
      "/ops/search"
    ],
    "stacks": [
      "elasticsearch",
      "opensearch",
      "search",
      "inverted-index",
      "backend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/search/mappings",
      "title": "Define mappings before indexing production data",
      "summary": "Declare field type, exact and analyzed variants, date formats, nested relationships, and dynamic behavior from the search contract.",
      "body": "The first document can choose a dynamic field type that later documents cannot use, and many mapping changes cannot be applied in place. Explicit mapping turns ingestion assumptions into reviewable schema.\n\n- Map identifiers, enums, and filter or aggregation fields as exact values; map human language as analyzed text with an intentional analyzer.\n- Use multi-fields when the same source value needs full-text relevance and exact sorting or aggregation, and name their roles consistently.\n- Map arrays of objects as nested when queries must preserve relationships within each object; ordinary object arrays flatten values and can create cross-object matches.\n- Reject or tightly control unexpected dynamic fields for untrusted or high-cardinality input so one malformed document cannot expand cluster mappings indefinitely.\n\nSee /search/queries for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/search/queries",
      "title": "Bound search work and result windows",
      "summary": "Limit clauses, fields, buckets, scripts, highlights, and pagination depth according to the product query contract.",
      "body": "A search request can be syntactically valid while consuming unbounded heap or CPU through deep pagination, broad wildcard expansion, large aggregations, or scripted work over many documents.\n\n- Search only fields relevant to the feature and apply filters in filter context when scoring is unnecessary.\n- Use cursor-style search-after pagination with a deterministic sort for deep traversal; keep offset windows small and product-bounded.\n- Set explicit aggregation sizes and control bucket growth, especially for user-selected high-cardinality fields.\n- Treat leading wildcards, regex, fuzzy expansion, scripts, and large highlights as privileged query features with validation, timeouts, and measured limits.\n\nSee /ops/search for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/search/queries",
      "title": "Keep indexing idempotent and externally versioned",
      "summary": "Use stable document identity and a source-of-truth version so retries and out-of-order events cannot resurrect stale search state.",
      "body": "Bulk ingestion, queues, and change streams can retry or deliver out of order. If each attempt creates a new document or an older event overwrites a newer one, the index diverges from the authoritative store.\n\n- Derive the search document ID from stable domain identity rather than generating a new value at indexing time.\n- Carry a monotonic source version or update sequence and reject stale writes where the indexing mechanism supports it.\n- Make delete and tombstone handling retryable so replay cannot recreate a document after the source removed it.\n- Inspect every bulk-item result and retry only failed items with bounded backoff; an accepted bulk request can contain individual failures.\n\nSee /search/mappings for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/search/mappings",
      "title": "Analysis is part of the query contract",
      "summary": "Version analyzers, normalizers, synonyms, and language behavior with the index because changing tokens usually requires reindexing.",
      "body": "Search behavior depends on how text becomes tokens at index time and query time. A synonym or analyzer change applied to only one side produces surprising matches, and existing indexed tokens do not rewrite themselves.\n\n- Choose analyzers from the content language and search experience, then inspect generated tokens for representative names, punctuation, identifiers, and mixed-language text.\n- Keep exact normalizers separate from full-text analyzers so sorting and filters do not inherit tokenization intended for relevance.\n- Version synonym and analysis configuration with the physical index definition and decide whether the change affects index time, search time, or both.\n- Evaluate relevance with a maintained query set and judgments before and after analysis changes rather than accepting anecdotal searches.\n\nSee /search/queries for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/search",
      "title": "Shard count follows recoverability and data scale",
      "summary": "Choose primary shards from expected index size, write throughput, query parallelism, and recovery behavior, then revise through a new index.",
      "body": "Shards are independent Lucene indexes with memory, file, merge, and cluster-state overhead. More shards do not automatically mean more performance, especially when every query fans out across many tiny shards.\n\n- Estimate retained bytes, ingest rate, node count, recovery window, and representative query fan-out before selecting the initial primary count.\n- Use rollover or time-based boundaries only when retention and query behavior need them; avoid creating tiny daily indexes by habit.\n- Monitor shard size, segment count, merge pressure, heap, disk watermarks, and recovery duration as data grows.\n- Change an unsuitable primary count by creating a new index and migrating through an alias instead of pretending an in-place setting can rewrite physical partitioning.\n\nSee /search/mappings for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/search",
      "title": "Applications address aliases, not physical index versions",
      "summary": "Use read and write aliases as the stable application contract so mappings and data can move behind them.",
      "body": "Physical index names encode a schema and migration generation. If application configuration points directly at them, every reindex becomes a synchronized deployment and rollback is harder.\n\n- Give each logical collection a stable read alias and, where supported by the design, a single explicit write target.\n- Create new physical indexes with versioned names and complete settings, mappings, and analysis before data movement begins.\n- Switch aliases atomically after validation so readers never observe a half-migrated index set.\n- Retain the previous index for a bounded rollback window and prevent accidental writes to it after the alias moves.\n\nSee /search/queries for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "reindex-search-without-downtime",
      "summary": "Create, backfill, verify, cut over, reconcile, and retire a search index through stable aliases.",
      "body": "---\nname: reindex-search-without-downtime\ndescription: Reindex Elasticsearch or OpenSearch after a mapping, analyzer, shard, or document-shape change.\n---\n\n# Reindex Search Without Downtime\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Create a versioned target index from committed settings, mappings, analysis, lifecycle, and alias configuration, then validate representative documents.\n2. Start a backfill from the authoritative source or prior index with stable IDs and source versions while live changes continue through a replayable path.\n3. Compare document counts, missing and extra IDs, field distributions, rejected items, query correctness, relevance judgments, and latency on the target.\n4. Pause or fence the final change window, replay outstanding updates, atomically switch aliases, and monitor errors, freshness, and resource use.\n5. Rollback the alias if acceptance fails; otherwise reconcile one final time, remove write access from the old index, and delete it only after the retention window.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "elasticsearch",
        "opensearch",
        "reindex",
        "aliases",
        "migration"
      ]
    }
  ]
};
