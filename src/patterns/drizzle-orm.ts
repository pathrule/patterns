import type { Pattern } from "../types.js";

export const drizzleOrm: Pattern = {
  "slug": "drizzle-orm",
  "version": "1.0.0",
  "name": "Drizzle ORM",
  "tagline": "Keep your TypeScript schema, migrations, and typed queries honest with Drizzle.",
  "description": "Guardrails for teams using Drizzle ORM as their type-safe SQL layer. It keeps the TypeScript schema as the single source of truth, enforces a generate-then-migrate workflow with drizzle-kit, and steers queries toward inferred types, relations v2, and safe transactions. Use it to stop schema drift and silent N+1 patterns before they ship.",
  "category": "Backend",
  "icon": "table-2",
  "color": "bg-lime-500/10 text-lime-600 dark:bg-lime-400/15 dark:text-lime-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Drizzle ORM pattern for AI coding agents | Pathrule",
  "metaDescription": "A Pathrule pattern that teaches AI coding agents the correct 2026 Drizzle ORM workflow: TypeScript schema source of truth, drizzle-kit migrations, typed queries, relations, and transactions.",
  "problem": "AI agents drift Drizzle schemas out of sync with the database and write untyped, N+1-prone queries.",
  "audience": "Backend and full-stack teams running Drizzle ORM on Postgres, MySQL, or SQLite.",
  "prevents": [
    "Editing the database directly instead of regenerating migrations from the schema",
    "Hand-writing column types instead of inferring them with $inferSelect and $inferInsert",
    "Issuing per-row queries in loops instead of using relations or a single batched query"
  ],
  "appliesTo": {
    "paths": [
      "/src/db",
      "/src/db/schema",
      "/drizzle"
    ],
    "stacks": [
      "typescript",
      "node",
      "postgres",
      "mysql",
      "sqlite"
    ],
    "packages": [
      "drizzle-orm",
      "drizzle-kit"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/db/schema",
      "title": "Schema is the single source of truth",
      "summary": "Change tables in the TypeScript schema, never in the live database.",
      "body": "Treat the Drizzle TypeScript schema as the only place a table shape is defined.\n\n- Edit column and table definitions in `src/db/schema`, then run `drizzle-kit generate` to produce the SQL migration.\n- Never alter columns directly in the database or hand-edit a generated migration's SQL after it is committed.\n- Export inferred types with `typeof users.$inferSelect` and `typeof users.$inferInsert` instead of redeclaring row shapes by hand.\n- Define foreign keys, indexes, and constraints in the schema so `drizzle-kit` can diff and version them.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/drizzle",
      "title": "Generate then migrate, never push to production",
      "summary": "Commit generated SQL migrations and apply them with drizzle-kit migrate.",
      "body": "Use the `generate` + `migrate` workflow for anything that touches a shared or production database.\n\n- Run `drizzle-kit generate` and commit the resulting file in `drizzle/` alongside the schema change in the same PR.\n- Apply migrations with `drizzle-kit migrate` (or `migrate()` at deploy time), and reserve `drizzle-kit push` for throwaway local prototyping only.\n- Hand-write the reverse SQL for destructive changes (dropping or retyping a column) and test it on staging first.\n- Add a CI check that fails when a schema diff exists with no matching migration file, so drift cannot ship.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Drizzle versions and config baseline (2026)",
      "summary": "Current package versions, dialect-based config, and the relations v2 shape.",
      "body": "Pin to the current Drizzle line and use the dialect-based config introduced in the v1 betas.\n\n- Runtime is `drizzle-orm` and the CLI is `drizzle-kit`; the stable line is the 0.4x releases with v1.0.0 in beta as of mid-2026, so confirm the exact pinned version in `package.json` before relying on v1-only APIs.\n- `drizzle.config.ts` uses `dialect` (`\"postgresql\"`, `\"mysql\"`, or `\"sqlite\"`) plus `schema` and `out` paths; the older `driver` key is gone in the v1 config.\n- Relations v2 centralizes relations: define them once with `defineRelations` in a dedicated file and pass that object to `drizzle()` instead of attaching `relations()` per table.\n- Keep one shared `db` client instance per process; pass it (or a `tx`) into functions rather than constructing new connections per call."
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Querying patterns: relations, transactions, prepared statements",
      "summary": "Use the relational query API, atomic transactions, and prepared statements.",
      "body": "Prefer Drizzle's higher-level query APIs over hand-rolled joins and per-row loops.\n\n- Load nested data with `db.query.users.findMany({ with: { posts: true } })` so related rows come back in one round trip instead of an N+1 loop.\n- Wrap multi-statement writes in `db.transaction(async (tx) => { ... })` and use only `tx` inside; throwing rolls everything back, and nested calls become savepoints.\n- For hot paths, build a prepared statement once with `.prepare()` and bind values via `sql.placeholder('name')`, then call `.execute({ name })`.\n- Reach for the `sql` template tag for expressions Drizzle has no builder for, and keep user input as parameters rather than interpolated strings."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "drizzle-orm-review",
      "summary": "Checklist to review a Drizzle schema change, migration, and queries before merge.",
      "body": "---\nname: drizzle-orm-review\ndescription: Review a Drizzle ORM change before merge - schema source of truth, drizzle-kit migration hygiene, inferred types, relations, and safe transactions.\n---\n\n# Drizzle ORM review\n\n- [ ] Schema change lives in `src/db/schema` and the database was not edited directly.\n- [ ] A `drizzle-kit generate` migration is committed in `drizzle/` for this schema diff.\n- [ ] `drizzle-kit push` is not used against any shared or production database.\n- [ ] Destructive changes (drop or retype a column) have tested reverse SQL and a staging plan.\n- [ ] Row types come from `$inferSelect` / `$inferInsert`, not hand-written interfaces.\n- [ ] `drizzle.config.ts` sets `dialect`, `schema`, and `out` (no legacy `driver` key).\n- [ ] Relations use `defineRelations` (relations v2) in one place, not per-table `relations()`.\n- [ ] Nested reads use the relational query API or a single join, not per-row loops.\n- [ ] Multi-statement writes run inside `db.transaction` and use only `tx` internally.\n- [ ] Hot-path queries use `.prepare()` with `sql.placeholder` and user input stays parameterized.\n",
      "skillTags": [
        "drizzle",
        "orm",
        "typescript",
        "migrations",
        "sql",
        "code-review"
      ]
    }
  ]
};
