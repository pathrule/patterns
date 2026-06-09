import type { Pattern } from "../types.js";

export const postgresSchema: Pattern = {
  "slug": "postgres-schema",
  "version": "1.0.0",
  "name": "PostgreSQL Schema & Migrations",
  "tagline": "Design normalized PostgreSQL schemas and ship lock-safe, forward-only migrations.",
  "description": "A pattern bundle that teaches AI agents how to model PostgreSQL tables with correct types and constraints, and how to evolve them without downtime. It enforces forward-only, expand-contract migrations, concurrent index builds, and validated constraints so schema changes never lock production traffic. Tuned for PostgreSQL 18 with native UUIDv7 and identity columns.",
  "category": "Backend",
  "icon": "table-properties",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "PostgreSQL Schema & Migrations pattern for AI coding agents",
  "metaDescription": "Teach AI coding agents to design normalized PostgreSQL schemas with correct types and constraints, and ship lock-safe forward-only migrations on PostgreSQL 18.",
  "problem": "AI agents write migrations that rename columns in place, build indexes that lock the table, and pick types that cause silent data and timezone bugs.",
  "audience": "Backend and platform teams running PostgreSQL in production",
  "prevents": [
    "Blocking ACCESS EXCLUSIVE locks from rewriting tables or building indexes inline during deploys",
    "Destructive in-place column renames or retypes that break the previous app version mid-rollout",
    "Wrong column types like timestamp without time zone, varchar(n), or serial that cause timezone and overflow bugs"
  ],
  "appliesTo": {
    "paths": [
      "/db",
      "/db/migrations",
      "/src/db"
    ],
    "stacks": [
      "postgresql",
      "postgres-18",
      "sql",
      "migrations",
      "backend"
    ],
    "packages": [
      "pg",
      "drizzle-orm",
      "knex",
      "node-pg-migrate",
      "prisma"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/db/migrations",
      "title": "Migrations are forward-only and lock-safe",
      "summary": "Never write down migrations; never take ACCESS EXCLUSIVE locks on hot tables.",
      "body": "Every migration moves the schema forward and acquires only weak locks, so deploys never block live traffic.\n\n- Write forward-only migrations. Do not author `down`/rollback steps; recover by shipping a new forward migration.\n- Build and drop indexes with `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY`, which cannot run inside a transaction block.\n- Set `SET lock_timeout = '5s'` before any DDL on a populated table so a blocked statement fails fast instead of queueing all traffic behind an `ACCESS EXCLUSIVE` lock.\n- Add foreign keys and check constraints as `NOT VALID` first, then `VALIDATE CONSTRAINT` in a separate statement to avoid a full-table scan under a strong lock.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/db/migrations",
      "title": "Evolve columns with expand-contract, never in place",
      "summary": "Rename and retype across multiple deploys so old and new app versions both keep working.",
      "body": "Schema changes that affect existing data run as separate expand, backfill, and contract migrations so each deployed app version stays compatible.\n\n- Never `RENAME` or `ALTER ... TYPE` a column in a single step. Add the new column, dual-write from the app, backfill in batches, switch reads, then drop the old column in a later deploy.\n- Add new columns as nullable or with a constant `DEFAULT`; PostgreSQL stores constant defaults as metadata so no table rewrite occurs.\n- Backfill large tables in bounded batches (for example a few thousand rows per statement) inside their own transactions, not one giant `UPDATE`.\n- Drop the old structure only after every running app version has stopped reading or writing it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/db",
      "title": "Default column types for new tables",
      "summary": "The canonical type and key choices for PostgreSQL 18 tables.",
      "body": "Pick the same correct types on every new table so the schema stays consistent and bug-free on PostgreSQL 18.\n\n- Primary keys: `bigint GENERATED ALWAYS AS IDENTITY` for internal rows, or `uuid DEFAULT uuidv7()` (native in PG 18) when ids are exposed externally or generated client-side. Never use `serial`/`bigserial`.\n- Timestamps: always `timestamptz`, never `timestamp` (without time zone). Default audit columns to `now()`.\n- Strings: use `text`; there is no performance gain from `varchar(n)`. Enforce length only with a `CHECK` constraint when a real limit exists.\n- Money and exact decimals: `numeric`, never `float`/`double precision`. Use `boolean` for flags and `jsonb` (not `json`) for semi-structured data."
    },
    {
      "kind": "memory",
      "nodePath": "/db",
      "title": "Index and constraint design checklist",
      "summary": "Where indexes and constraints belong, and how to add unique safely.",
      "body": "Model integrity at the database, and index for the queries that actually run.\n\n- Index every foreign key column; PostgreSQL does not create that index automatically and unindexed FKs make parent deletes and joins slow.\n- Use partial indexes (`WHERE deleted_at IS NULL`) and expression indexes instead of indexing whole columns when queries filter on a subset.\n- Enforce business rules with `CHECK`, `NOT NULL`, `UNIQUE`, and foreign keys in the schema rather than trusting application code.\n- Add a unique constraint without a long lock by running `CREATE UNIQUE INDEX CONCURRENTLY` then `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE USING INDEX`."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "postgres-schema-review",
      "summary": "Pre-merge checklist for any PostgreSQL schema change or migration.",
      "body": "---\nname: postgres-schema-review\ndescription: Review a PostgreSQL schema change or migration before merge. Use when adding or altering tables, columns, indexes, or constraints, or when writing a migration file, to confirm correct types, sound integrity, and lock-safe forward-only DDL on PostgreSQL 18.\n---\n\n# PostgreSQL schema and migration review\n\n## Types and keys\n\n- [ ] Primary key is `bigint GENERATED ALWAYS AS IDENTITY` or `uuid DEFAULT uuidv7()`, not `serial`.\n- [ ] All point-in-time columns are `timestamptz`, not `timestamp`.\n- [ ] Strings use `text` (length enforced via `CHECK` only when a real limit exists); money/decimals use `numeric`; structured data uses `jsonb`.\n\n## Integrity and indexes\n\n- [ ] `NOT NULL`, `UNIQUE`, `CHECK`, and foreign keys express the real business rules at the database level.\n- [ ] Every foreign key column has a covering index.\n- [ ] Partial or expression indexes are used where queries filter a subset, instead of broad full-column indexes.\n\n## Lock-safe migration\n\n- [ ] Migration is forward-only with no `down` step.\n- [ ] `lock_timeout` is set before DDL on any populated table.\n- [ ] Indexes are built/dropped `CONCURRENTLY` and that statement is outside a transaction block.\n- [ ] New foreign keys and check constraints are added `NOT VALID`, then validated separately.\n- [ ] New columns are nullable or use a constant `DEFAULT` so no table rewrite is triggered.\n\n## Expand-contract\n\n- [ ] Renames and type changes are split into expand, backfill, and contract deploys.\n- [ ] Backfills run in bounded batches, each in its own transaction.\n- [ ] Old columns or tables are dropped only after no running app version uses them.\n",
      "skillTags": [
        "postgresql",
        "migrations",
        "schema",
        "review",
        "backend",
        "ddl"
      ]
    }
  ]
};
