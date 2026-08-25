import type { Pattern } from "../types.js";

export const sqliteProduction: Pattern = {
  "slug": "sqlite-production",
  "version": "1.0.0",
  "name": "SQLite in Production",
  "tagline": "Operate SQLite with explicit transactions, WAL behavior, connection ownership, migrations, and backups.",
  "description": "SQLite is a transactional database embedded in a process, not a development-only toy, but its file locking, connection model, journal behavior, durability options, and migration constraints differ sharply from a client-server database. This pattern constrains transaction length, connection configuration, and migration safety while recording WAL checkpoint, backup, and deployment ownership decisions. It complements PostgreSQL and generic transaction patterns by focusing on a single database file, multiple process access, filesystem guarantees, and the operational consequences of SQLite's writer serialization.",
  "category": "Backend",
  "icon": "hard-drive",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "SQLite production pattern for AI coding agents",
  "metaDescription": "SQLite transactions, WAL checkpoints, busy handling, connection setup, migrations, integrity checks, backup, and single-file deployment ownership.",
  "problem": "AI agents often keep write transactions open across network calls, assume WAL permits unlimited concurrent writers, copy a live database file without a safe backup method, or open connections with inconsistent pragmas.",
  "audience": "Teams using SQLite in desktop, mobile, edge, embedded, or modest server workloads",
  "prevents": [
    "Holding the single writer lock during slow application work",
    "Allowing each connection to use different safety settings",
    "Shipping a migration that cannot recover from interruption",
    "Backing up only the main file while journal state is active"
  ],
  "appliesTo": {
    "paths": [
      "/src/db",
      "/migrations",
      "/ops/backups"
    ],
    "stacks": [
      "sqlite",
      "sql",
      "embedded-database",
      "wal",
      "backend"
    ],
    "packages": [
      "better-sqlite3"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Keep write transactions short and deterministic",
      "summary": "Compute and validate before BEGIN, perform only required database work inside, and never wait on remote I/O while holding the writer.",
      "body": "SQLite serializes writers. A transaction that waits on HTTP, user input, a queue, or slow computation blocks unrelated writes even when WAL mode allows readers to continue.\n\n- Load external inputs and perform remote calls before opening the write transaction, then revalidate database-dependent assumptions once inside.\n- Use one explicit transaction for the complete local invariant and commit or roll back on every path; do not scatter auto-committed statements across a multi-row transition.\n- Apply a bounded busy strategy and surface exhaustion as a retryable capacity failure instead of spinning indefinitely or returning a misleading generic error.\n- Measure transaction duration and lock waits in the application because query timing alone does not reveal time spent waiting for the writer.\n\nSee /src/db for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Initialize every connection with the same database contract",
      "summary": "Apply foreign keys, busy handling, journal expectations, and durability settings when a connection opens, then verify them.",
      "body": "SQLite settings can be connection-specific or database-persistent with nuanced behavior. Assuming one setup call configured every future connection leads to missing foreign-key enforcement or inconsistent contention handling.\n\n- Enable and verify foreign-key enforcement for every connection before executing application statements.\n- Centralize connection creation and apply the approved busy timeout, synchronous policy, and other required settings from one adapter.\n- Treat journal-mode changes as deployment operations and verify the effective mode; do not toggle modes per request or let two processes disagree about setup.\n- Reject database files on unsupported filesystems or sharing arrangements where required locking and durability guarantees are not reliable.\n\nSee /ops/backups for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/migrations",
      "title": "Make SQLite migrations resumable and verified",
      "summary": "Apply ordered schema changes with a recorded version, transaction strategy, compatibility check, and integrity evidence.",
      "body": "SQLite migrations often rebuild tables to change constraints or column behavior. An interrupted copy or rename sequence can leave a schema that looks present but has lost indexes, triggers, foreign keys, or data.\n\n- Record each migration exactly once and fail startup on an unknown or partially applied version instead of guessing the next schema.\n- Use a transaction where the operation supports it, and stage table rebuilds with explicit column mapping, row-count checks, index recreation, and foreign-key validation.\n- Back up or checkpoint according to the deployment contract before an irreversible migration, and define how the prior application version behaves with the new schema.\n- Run integrity and foreign-key checks after migration and before accepting normal writes; preserve failure details for recovery rather than continuing on a suspect file.\n\nSee /ops/backups for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "WAL improves reader concurrency, not writer concurrency",
      "summary": "Use WAL when its filesystem and workload fit, monitor checkpoint progress, and retain the single-writer capacity model.",
      "body": "Write-ahead logging lets readers continue while a writer appends, but commits still serialize and the WAL must eventually be checkpointed into the main database. A long reader can prevent checkpoint progress and allow the WAL to grow.\n\n- Choose WAL only where all participating processes share a supported local filesystem and use compatible SQLite implementations.\n- Monitor WAL size, checkpoint results, write latency, and long-running readers so growth is detected before disk pressure becomes an outage.\n- Schedule or trigger checkpoints through the database API with awareness of active readers; do not delete WAL or shared-memory files manually.\n- Scale write-heavy workloads by shortening and batching transactions first, then move to a client-server database when serialized writer capacity no longer fits.\n\nSee /ops/backups for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/backups",
      "title": "A SQLite backup is a consistent database snapshot",
      "summary": "Use the backup API or a coordinated snapshot procedure and restore-test the complete result instead of copying an active main file blindly.",
      "body": "The visible database file may not contain the newest committed pages while journaling is active. A filesystem copy taken without coordination can omit state or capture files from different moments.\n\n- Prefer the SQLite backup mechanism or a storage snapshot whose consistency guarantees cover the database and active journal state.\n- Record application version, schema version, database checksum, encryption context, and snapshot time with the backup artifact.\n- Restore into an isolated location, run integrity and foreign-key checks, then exercise critical reads and a controlled write before declaring the backup usable.\n- Protect backups as production data and ensure retention, encryption, and deletion policies cover copies outside the application's ordinary data directory.\n\nSee /migrations for the rule or workflow that puts this decision into practice."
    }
  ]
};
