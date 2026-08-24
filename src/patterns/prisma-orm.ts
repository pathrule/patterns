import type { Pattern } from "../types.js";

export const prismaOrm: Pattern = {
  "slug": "prisma-orm",
  "version": "1.0.0",
  "name": "Prisma ORM",
  "tagline": "Use Prisma 7 as it actually ships: generated client, driver adapters, and one instance per process.",
  "description": "Prisma 7 broke the shape of the code every assistant memorised. The generator is now `prisma-client` with a required `output`, so `PrismaClient` is imported from your generated directory rather than from the package. Every connection goes through a driver adapter, the middleware API is gone in favour of client extensions, and automatic seeding on migrate was removed. This bundle encodes the current API plus the two things that hurt in production regardless of version: one client per process, and queries that select what they need.",
  "category": "Backend",
  "icon": "database-zap",
  "color": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Prisma ORM 7 pattern for AI coding agents",
  "metaDescription": "Prisma 7 pattern for AI coding agents: the prisma-client generator with output, driver adapters, client extensions, and a single client instance per process.",
  "problem": "AI agents still generate the Prisma 6 shape: the prisma-client-js generator, an import from the package root, no driver adapter, and a new PrismaClient per request or per hot reload.",
  "audience": "TypeScript teams running Prisma 7 against Postgres, MySQL, or SQLite",
  "prevents": [
    "Writing a prisma-client-js generator block that Prisma 7 no longer accepts",
    "Importing PrismaClient from @prisma/client instead of the generated output directory",
    "Instantiating a client per request and exhausting the database connection pool",
    "Using the removed middleware API instead of client extensions"
  ],
  "appliesTo": {
    "paths": [
      "/prisma",
      "/src/db",
      "/src/lib"
    ],
    "stacks": [
      "prisma",
      "typescript",
      "postgres",
      "node",
      "orm"
    ],
    "packages": [
      "prisma",
      "@prisma/client",
      "@prisma/adapter-pg"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/prisma",
      "title": "Use the prisma-client generator with an explicit output",
      "summary": "The schema declares `provider = \"prisma-client\"` and an `output` directory, and code imports the client from there, not from the package root.",
      "body": "Prisma 7 made the Rust-free client the default and changed how it is generated. The old block simply does not work, and the import path changed with it.\n\n- The generator block is `generator client { provider = \"prisma-client\" output = \"./generated/prisma\" }`. `output` is required; `prisma-client-js` and `engineType` are gone.\n- Import from the generated location (`import { PrismaClient } from \"./generated/prisma/client\"`), not from `@prisma/client`. Fix the import everywhere in the same change, because the old path resolves to something that will not run.\n- Decide whether the generated directory is committed or generated in CI, then be consistent: if it is gitignored, `prisma generate` must run in every build and before typecheck, since types now come from that folder.\n- Put configuration (schema path, migrations, seed command) in `prisma.config.ts` at the project root rather than in `package.json`, which is where Prisma 7 expects it.\n- Seeding is explicit now: run `prisma db seed` yourself, because migrations no longer trigger it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "One client per process, constructed with a driver adapter",
      "summary": "Export a single PrismaClient built on a driver adapter, cache it across hot reloads, and never construct one per request.",
      "body": "In Prisma 7 every database connection goes through a driver adapter, and the client owns a connection pool. Creating one per request or per module reload is how a small app exhausts a database.\n\n- Build the adapter for your database (`new PrismaPg({ connectionString })` for Postgres, the matching adapter for MySQL, SQLite, or a serverless driver) and pass it in: `new PrismaClient({ adapter })`.\n- Export one instance from a single module and import that everywhere. In development, cache it on `globalThis` so hot reload does not open a new pool on every file save.\n- In serverless or edge runtimes, keep the client in module scope so it is reused across invocations of the same instance, and put a pooler (PgBouncer, a platform pooler, or a serverless driver adapter) between the function and the database. Concurrency there is the number of instances, not the number of requests.\n- Do not call `$connect()` eagerly or `$disconnect()` per request; the client connects lazily and disconnecting per request defeats pooling. Disconnect only in scripts and tests that end.\n- Extend behaviour with client extensions (`$extends`) for logging, soft delete, computed fields, or row-level filters. The `$use` middleware API was removed.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Select explicitly, batch relations, and keep transactions short",
      "summary": "Every query names the fields it needs, related data is loaded with include or a batched query, and interactive transactions stay tiny.",
      "body": "Prisma makes over-fetching easy to write and hard to see: a model query returns every column, and a relation accessed in a loop is a query per row.\n\n- Use `select` (or a narrow `include`) on anything that leaves a request handler. A default query returns all scalar fields, which is how a token or a hashed password ends up in an API response.\n- Load relations in the query with `include` or `select`, not by iterating results and querying per item. When you truly need per-item work, fetch the set in one `findMany({ where: { id: { in: ids } } })` and key it in memory.\n- Wrap multi-write invariants in a transaction: `$transaction([...])` for independent writes, the interactive form only when a later write depends on an earlier read. Keep interactive transactions free of network calls and set a timeout; a long one holds locks and blocks other writers.\n- Paginate with cursor pagination on a stable indexed column for large or infinite lists; `skip` grows more expensive as the offset grows.\n- Only use `$queryRaw` with tagged-template parameters. `$queryRawUnsafe` with interpolated input is SQL injection, and `$executeRaw` bypasses every extension you rely on.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/prisma",
      "title": "Migration workflow and what Prisma 7 removed",
      "summary": "migrate dev locally, migrate deploy in CI, never edit an applied migration, and remember the CLI flags and middleware that no longer exist.",
      "body": "The migration model is unchanged, but several conveniences were removed in 7, and code or scripts that relied on them fail quietly.\n\n- Locally, change the schema and run `prisma migrate dev` to generate and apply a migration. In CI and production, run `prisma migrate deploy`, which only applies pending files and never generates or resets.\n- `prisma db push` is for prototyping against a scratch database. It does not create migration files, so never run it against an environment whose history matters.\n- Never edit a migration that has been applied anywhere shared. Add a new one, even for a typo.\n- Removed in 7 and worth knowing before you write a script: the `$use` middleware API (use `$extends`), the metrics preview feature, the `--skip-generate` and `--skip-seed` CLI flags, `--schema`/`--url` on `prisma db execute`, and automatic seeding as part of migrate.\n- Write destructive changes as multi-step: add the new column, deploy code that writes both, backfill, switch reads, then drop. A single migration that renames a column is a deploy-time outage.\n\nSee /src/db for the client and query rules, and the postgres-schema pattern for index and constraint design underneath Prisma."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "prisma-v7-upgrade",
      "summary": "Step-by-step upgrade from Prisma 6 to 7, in the order that keeps the build green.",
      "body": "---\nname: prisma-v7-upgrade\ndescription: Ordered procedure to move a codebase from Prisma 6 to Prisma 7: generator block, generated client import, driver adapters, middleware to extensions, and the removed CLI flags. Use when upgrading or when a Prisma 6 shape appears in a Prisma 7 project.\n---\n\n# Prisma 6 to 7 upgrade\n\nRun in order. Each step leaves the repo buildable.\n\n1. **Pin and read.** Upgrade `prisma` and `@prisma/client` together to the same 7.x version. Mismatched versions produce confusing type errors.\n2. **Switch the generator.** In `schema.prisma`, replace the client generator with:\n   `generator client { provider = \"prisma-client\" output = \"./generated/prisma\" }`\n   Remove `engineType`. Decide now whether `output` is committed or gitignored.\n3. **Regenerate.** Run `prisma generate` and confirm the directory appears where `output` points.\n4. **Fix imports.** Replace every `from \"@prisma/client\"` with the generated path (`./generated/prisma/client`, adjusted per file or via a path alias). Include types (`Prisma`, model types, enums), not just `PrismaClient`.\n5. **Add the driver adapter.** Install the adapter for your database, construct it from the connection string, and pass it to the client: `new PrismaClient({ adapter })`. Do this in the single module that exports the client.\n6. **Replace middleware.** Rewrite every `prisma.$use(...)` as a `$extends` client extension (query extension for interception, result extension for computed fields). There is no compatibility shim.\n7. **Move config.** Create `prisma.config.ts` for schema path, migrations, and the seed command, and delete the `prisma` block from `package.json`.\n8. **Fix scripts and CI.** Remove `--skip-generate` and `--skip-seed`, add an explicit `prisma db seed` step where seeding was implicit, and drop `--schema`/`--url` from any `prisma db execute` call.\n9. **Verify.** Typecheck, run the test suite against a real database, and check that `prisma migrate deploy` is still the production command.\n\n## Done when\n- [ ] No import from `@prisma/client` remains.\n- [ ] The client is constructed once, with an adapter.\n- [ ] No `$use` call remains anywhere.\n- [ ] CI generates the client before typecheck and seeds explicitly.\n",
      "skillTags": [
        "prisma",
        "typescript",
        "migration",
        "upgrade",
        "orm"
      ]
    }
  ]
};
