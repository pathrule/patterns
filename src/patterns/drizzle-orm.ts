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
      "summary": "Change tables in the TypeScript schema, never in the live database; export inferred types, never hand-write row shapes.",
      "body": "Treat the Drizzle TypeScript schema as the only place a table shape is defined.\n\n- Edit column and table definitions in `src/db/schema`, then run `drizzle-kit generate` to produce the SQL migration.\n- Never alter columns directly in the database or hand-edit a generated migration's SQL after it is committed; both create a drift that silently breaks generated types.\n- Export inferred types with `typeof users.$inferSelect` and `typeof users.$inferInsert` instead of redeclaring row shapes by hand. Hand-written interfaces fall out of sync whenever a column is added or removed.\n- Define foreign keys, indexes, and constraints in the schema so `drizzle-kit` can diff and version them alongside column changes.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/drizzle",
      "title": "Generate then migrate; never push to a shared database",
      "summary": "Commit generated SQL migrations and apply them with drizzle-kit migrate; reserve push for throwaway local prototyping only.",
      "body": "Use the `generate` + `migrate` workflow for anything that touches a shared or production database.\n\n- Run `drizzle-kit generate` and commit the resulting file in `drizzle/` alongside the schema change in the same PR.\n- Apply migrations with `drizzle-kit migrate` (or the `migrate()` helper at deploy time). Reserve `drizzle-kit push` for local throwaway prototyping only; it overwrites the database schema without recording a migration file.\n- Hand-write the reverse SQL for destructive changes (dropping or retyping a column) and test it on a copy of the staging schema first.\n- Add a CI check that runs `drizzle-kit check` (or equivalent diff) and fails when the schema has a diff with no corresponding migration file, so drift cannot reach main.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Drizzle versions and config baseline (2026)",
      "summary": "Current package versions, dialect-based config, and shared db-client conventions.",
      "body": "Pin to the current Drizzle line and use the dialect-based config introduced in the 0.40+ releases.\n\n- Runtime is `drizzle-orm` and the CLI is `drizzle-kit`. The stable line as of mid-2026 is 0.4x; a v1.0.0 release is in progress — confirm the exact pinned version in `package.json` before relying on APIs documented only for v1.\n- `drizzle.config.ts` uses `dialect` (`\"postgresql\"`, `\"mysql\"`, or `\"sqlite\"`) plus `schema` and `out` paths; the older `driver` key is removed in the new config format.\n- Keep one shared `db` client instance per process. Pass the `db` (or a `tx`) into functions as a parameter rather than importing a singleton inside deeply nested modules, so transaction boundaries stay explicit.\n- For Postgres, create the client with `drizzle(pool, { schema })` where `pool` is a `node-postgres` Pool or `postgres` (postgres.js) instance. Passing the schema object enables the relational query API.\n\nSee /src/db for querying patterns and /src/db for relations v2 setup."
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Relations v2: defineRelations and the relational query API",
      "summary": "How to declare relations once with defineRelations, pass them to drizzle(), and use the with: {} query API without N+1 loops.",
      "body": "Relations v2, introduced in Drizzle 0.36+, moves relation declarations out of individual table files and into a centralized definition. Agents frequently write the old per-table `relations()` pattern or skip the relational API entirely and write N+1 loops.\n\n- Define all relations in a dedicated file (for example `src/db/relations.ts`) using `defineRelations` exported from `drizzle-orm`:\n  ```ts\n  import { defineRelations } from 'drizzle-orm';\n  import * as schema from './schema';\n\n  export const relations = defineRelations(schema, (r) => ({\n    users: {\n      posts: r.many.posts({ from: schema.users.id, to: schema.posts.authorId }),\n    },\n    posts: {\n      author: r.one.users({ from: schema.posts.authorId, to: schema.users.id }),\n    },\n  }));\n  ```\n- Pass the relations object to `drizzle()` alongside the schema: `const db = drizzle(pool, { schema, relations })`.\n- Query nested data with `db.query.users.findMany({ with: { posts: true } })`. This issues a single SQL query (a lateral join), not a loop of per-row queries. The old per-table `relations()` helper is still supported for compatibility but new code should use `defineRelations`.\n- For optional or filtered eager loads, pass `{ with: { posts: { where: eq(posts.published, true) } } }` rather than filtering in application code after loading all rows."
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Querying patterns: transactions and prepared statements",
      "summary": "Atomic transactions with savepoints and prepared statements for hot paths.",
      "body": "Prefer Drizzle's built-in abstractions for transactions and repeated queries over hand-rolled SQL.\n\n- Wrap multi-statement writes in `db.transaction(async (tx) => { ... })` and use only `tx` inside the callback. Throwing (or returning a rejected promise) rolls everything back automatically. Nested `db.transaction()` calls on the same `tx` become savepoints.\n- For hot paths, build a prepared statement once with `.prepare('name')` and bind values via `sql.placeholder('name')`, then call `.execute({ name: value })`. Prepared statements send only bind parameters on repeated calls and let Postgres skip re-planning.\n- Reach for the `sql` template tag for expressions Drizzle has no query builder for. Always pass user input as parameters in the template (`sql`SELECT * FROM users WHERE id = ${userId}``), never as interpolated string concatenation.\n- Avoid `db.execute(sql.raw(...))` with unsanitized strings; it bypasses Drizzle's parameter binding and introduces SQL injection."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "drizzle-orm-review",
      "summary": "Checklist to review a Drizzle schema change, migration, and queries before merge.",
      "body": "---\nname: drizzle-orm-review\ndescription: Review a Drizzle ORM change before merge. Use on schema modifications, drizzle-kit migrations, relation definitions, query patterns, and transaction logic.\n---\n\n# Drizzle ORM review\n\n## Schema and migrations\n- [ ] Schema change lives in `src/db/schema` and the database was not edited directly.\n- [ ] A `drizzle-kit generate` migration is committed in `drizzle/` for every schema diff.\n- [ ] `drizzle-kit push` is not used against any shared or production database.\n- [ ] Destructive changes (drop or retype a column) have tested reverse SQL and a staging plan.\n- [ ] Row types come from `$inferSelect` / `$inferInsert`, not hand-written interfaces.\n\n## Config and client\n- [ ] `drizzle.config.ts` sets `dialect`, `schema`, and `out`; no legacy `driver` key.\n- [ ] One shared `db` client instance per process; the `db` or `tx` is passed into functions, not re-imported from a singleton.\n\n## Relations and queries\n- [ ] Relations use `defineRelations` in a centralized file and are passed to `drizzle(pool, { schema, relations })`; no per-table `relations()` on new code.\n- [ ] Nested reads use `db.query.<table>.findMany({ with: { ... } })`, not per-row loops.\n- [ ] Multi-statement writes run inside `db.transaction` using only `tx` internally.\n- [ ] Hot-path queries use `.prepare()` with `sql.placeholder`; user input stays parameterized and `sql.raw` is not used with unsanitized input.\n",
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
