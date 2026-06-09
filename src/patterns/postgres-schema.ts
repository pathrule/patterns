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
      "title": "Migrations are forward-only, no down steps",
      "summary": "Never author down/rollback migrations; recover by shipping a new forward migration.",
      "body": "Every migration moves the schema forward only. There are no `down` or rollback steps in this codebase.\n\n- Do not write a `down`, `rollback`, or reverse step in any migration. A migration that has touched production data cannot be cleanly reversed, and a `down` that drops a column destroys data the previous app version may still need.\n- Recover from a bad migration by shipping a new forward migration that corrects the state, not by reverting.\n- Keep each migration small and single-purpose so a follow-up fix is easy to reason about.\n- Migrations are immutable once merged. Never edit a migration file that has already run anywhere; add a new one.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/db/migrations",
      "title": "DDL on populated tables must be lock-safe",
      "summary": "Use CONCURRENTLY, lock_timeout, and NOT VALID so DDL never takes a long ACCESS EXCLUSIVE lock on a hot table.",
      "body": "DDL against a table that already holds production rows must acquire only weak, short locks, so a deploy never blocks live traffic behind an `ACCESS EXCLUSIVE` lock.\n\n- Build and drop indexes with `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY`. These take only a `SHARE UPDATE EXCLUSIVE` lock but cannot run inside a transaction block, so the migration tool must run that statement outside any wrapping transaction.\n- Set `SET lock_timeout = '5s'` (or similar) before DDL on a populated table. A statement that cannot get its lock then fails fast instead of queuing every subsequent query behind it.\n- Add foreign keys and `CHECK` constraints as `NOT VALID` first, then run `VALIDATE CONSTRAINT` in a separate statement. The `NOT VALID` step takes a brief strong lock to add the catalog entry; `VALIDATE` scans the table under a weaker `SHARE UPDATE EXCLUSIVE` lock that allows concurrent reads and writes.\n- Add a unique constraint without a long lock by running `CREATE UNIQUE INDEX CONCURRENTLY`, then `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE USING INDEX <name>`.\n- If a `CREATE INDEX CONCURRENTLY` fails, it leaves an `INVALID` index behind; drop it (`DROP INDEX CONCURRENTLY`) before retrying.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/db/migrations",
      "title": "Evolve columns with expand-contract, never in place",
      "summary": "Rename and retype across multiple deploys so old and new app versions both keep working.",
      "body": "Schema changes that affect existing data run as separate expand, backfill, and contract migrations so every deployed app version stays compatible during a rolling deploy.\n\n- Never `RENAME` or `ALTER ... TYPE` a column in a single step while the old app version is still running. Add the new column, dual-write from the app, backfill, switch reads to the new column, then drop the old column in a later deploy.\n- Add new columns as nullable or with a NON-volatile constant `DEFAULT`. PostgreSQL stores a constant default in catalog metadata (`pg_attribute.attmissingval`) so the `ALTER TABLE` is instant with no table rewrite. A VOLATILE default (such as `clock_timestamp()`), a stored generated column, or an identity column DOES force a full rewrite under a strong lock; avoid those on large populated tables.\n- Backfill large tables in bounded batches (for example a few thousand rows per statement), each batch in its own transaction, not one giant `UPDATE` that holds locks and bloats WAL.\n- Apply `NOT NULL` on a backfilled column safely: add a `CHECK (col IS NOT NULL) NOT VALID`, `VALIDATE` it, then `SET NOT NULL` (which can use the validated check to skip a scan), instead of `SET NOT NULL` directly on a large table.\n- Drop the old column or table only after every running app version has stopped reading and writing it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/db",
      "title": "Default column types for new tables (PostgreSQL 18)",
      "summary": "The canonical type and key choices for new PostgreSQL 18 tables and why.",
      "body": "Pick the same correct types on every new table so the schema stays consistent and bug-free on PostgreSQL 18.\n\n- Primary keys: `bigint GENERATED ALWAYS AS IDENTITY` for internal rows, or `uuid DEFAULT uuidv7()` (native function added in PG 18) when ids are exposed externally or generated client-side. UUIDv7 is time-ordered so it indexes far better than random UUIDv4. Never use `serial`/`bigserial` (they leave the sequence ownership and grants in a surprising state and are effectively legacy).\n- Timestamps: always `timestamptz`, never `timestamp` (without time zone). `timestamptz` records a single absolute moment; `timestamp` silently drops the offset and causes timezone bugs. Default audit columns to `now()`.\n- Strings: use `text`. `text` and `varchar(n)` share identical storage and performance in PostgreSQL; `varchar(n)` only adds a length check. Enforce a real maximum with a `CHECK` constraint when the limit is a genuine business rule, not a guess.\n- Money and exact decimals: `numeric`, never `float`/`double precision` (binary floats cannot represent decimal cents exactly). Use `boolean` for flags and `jsonb` (not `json`) for semi-structured data, since `jsonb` is indexable and `json` only stores reparsed text.\n\nSee /db/migrations for the lock-safe and expand-contract rules that govern how these tables are changed after creation."
    },
    {
      "kind": "memory",
      "nodePath": "/db",
      "title": "Index and constraint design checklist",
      "summary": "Where indexes and constraints belong, and how to add unique/FK safely.",
      "body": "Model integrity at the database, and index for the queries that actually run.\n\n- Index every foreign key column on the CHILD side. PostgreSQL does NOT create that index automatically, and without it a delete or update of a parent row scans the whole child table to check references, which is the classic cause of mysteriously slow parent deletes and `ON DELETE CASCADE` operations.\n- Use partial indexes (for example `WHERE deleted_at IS NULL`) and expression indexes when queries only filter a subset or a computed value, instead of indexing the whole column. Smaller indexes mean less write amplification and a higher chance the planner uses them.\n- Enforce business rules with `NOT NULL`, `UNIQUE`, `CHECK`, and foreign keys in the schema rather than trusting application code; the database is the only layer every writer goes through.\n- Avoid redundant indexes: a B-tree on `(a, b)` already serves queries filtering on `a` alone, so a separate index on `(a)` is usually wasted write cost.\n- For low-cardinality columns the planner will ignore the index, so do not add one just because a column is in a WHERE clause.\n\nSee /db/migrations for how to add these indexes and constraints concurrently without locking production."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "postgres-schema-review",
      "summary": "Pre-merge checklist for any PostgreSQL schema change or migration.",
      "body": "---\nname: postgres-schema-review\ndescription: Review a PostgreSQL schema change or migration before merge. Use when adding or altering tables, columns, indexes, or constraints, or when writing a migration file, to confirm correct types, sound integrity, and lock-safe forward-only DDL on PostgreSQL 18.\n---\n\n# PostgreSQL schema and migration review\n\n## Types and keys\n\n- [ ] Primary key is `bigint GENERATED ALWAYS AS IDENTITY` or `uuid DEFAULT uuidv7()`, not `serial`/`bigserial`.\n- [ ] All point-in-time columns are `timestamptz`, not `timestamp`.\n- [ ] Strings use `text` (length enforced via `CHECK` only when a real limit exists); money/decimals use `numeric`; structured data uses `jsonb`, not `json`.\n\n## Integrity and indexes\n\n- [ ] `NOT NULL`, `UNIQUE`, `CHECK`, and foreign keys express the real business rules at the database level.\n- [ ] Every foreign key column has a covering index on the child side.\n- [ ] Partial or expression indexes are used where queries filter a subset, instead of broad full-column indexes; no redundant indexes were added.\n\n## Forward-only\n\n- [ ] Migration has no `down`/rollback step.\n- [ ] No already-merged migration file was edited; this is a new file.\n\n## Lock-safe DDL\n\n- [ ] `lock_timeout` is set before DDL on any populated table.\n- [ ] Indexes are built/dropped `CONCURRENTLY`, and that statement runs outside a transaction block.\n- [ ] New foreign keys and check constraints are added `NOT VALID`, then `VALIDATE`d in a separate statement.\n- [ ] New columns are nullable or use a NON-volatile constant `DEFAULT` so no table rewrite is triggered (no volatile default, identity, or stored generated column added to a large table).\n- [ ] A unique constraint is added via `CREATE UNIQUE INDEX CONCURRENTLY` + `ADD CONSTRAINT ... USING INDEX`.\n\n## Expand-contract\n\n- [ ] Renames and type changes are split into expand, backfill, and contract deploys; nothing is renamed/retyped in place.\n- [ ] Backfills run in bounded batches, each in its own transaction.\n- [ ] `NOT NULL` on a backfilled column is applied via a validated `CHECK`, not a direct `SET NOT NULL` scan on a large table.\n- [ ] Old columns or tables are dropped only after no running app version uses them.\n",
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
