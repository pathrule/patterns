import type { Pattern } from "../types.js";

export const mongodbMongoose: Pattern = {
  "slug": "mongodb-mongoose",
  "version": "1.0.0",
  "name": "MongoDB + Mongoose",
  "tagline": "Model MongoDB documents around the queries you run, then keep those queries indexed and lean.",
  "description": "MongoDB punishes a schema copied from a relational design and rewards one built around access patterns. This bundle carries the decisions that actually determine whether a collection scales: embed or reference, which indexes exist and who creates them, why reads should come back as plain objects, and how to use transactions without turning every write into one. It also covers the connection lifecycle that breaks first in serverless, where a new pool per invocation exhausts the cluster.",
  "category": "Backend",
  "icon": "leaf",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "MongoDB and Mongoose pattern for AI agents",
  "metaDescription": "MongoDB pattern for AI coding agents: model documents for your queries, index what you filter, read with lean projections, and keep transactions short.",
  "problem": "AI agents translate a relational schema into collections, add a reference for every relationship, never declare an index, and hydrate full documents for read-only endpoints.",
  "audience": "Node and TypeScript teams running MongoDB with Mongoose",
  "prevents": [
    "Designing collections like normalized tables, then joining them with lookups on every read",
    "Growing an unbounded array inside a document until it approaches the size limit",
    "Relying on autoIndex in production instead of declaring and building indexes deliberately",
    "Opening a new connection pool per serverless invocation"
  ],
  "appliesTo": {
    "paths": [
      "/src/models",
      "/src/db"
    ],
    "stacks": [
      "mongodb",
      "mongoose",
      "node",
      "typescript",
      "nosql"
    ],
    "packages": [
      "mongoose",
      "mongodb"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/models",
      "title": "Declare an index for every query shape you ship",
      "summary": "Each filter, sort, and uniqueness requirement has a matching index declared in the schema and built deliberately, with autoIndex off in production.",
      "body": "MongoDB will happily scan a collection forever. The query works in development on a thousand documents and takes seconds on a million.\n\n- Every field combination you filter or sort on needs a compound index in the right order: equality fields first, then the sort field, then range fields. An index on the wrong order does not serve the query.\n- Declare indexes in the schema (or a migration) and turn `autoIndex` off in production. Automatic index builds on startup are a surprise write load on a live cluster, and on a large collection they block.\n- Back every uniqueness rule with a unique index. A Mongoose `unique: true` is only an index hint, and a validator alone loses the race between two concurrent writes.\n- Use partial or sparse indexes for fields present on a subset of documents, and TTL indexes for data that should expire, rather than a cron job that deletes rows.\n- Verify with `explain(\"executionStats\")` that a new query uses an index (`IXSCAN`, not `COLLSCAN`) and that the examined-to-returned ratio is near one. Do not add indexes by feel: each one costs write throughput and memory.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Read lean with projections, write with targeted operators",
      "summary": "Read-only queries use lean and a projection, updates use atomic operators instead of read-modify-write, and every list query is bounded.",
      "body": "Mongoose hydrates every result into a full document with getters, virtuals, and change tracking. For a read-only endpoint that is pure overhead.\n\n- Add `.lean()` to any query whose result is serialized and returned. It returns plain objects and is dramatically cheaper on large result sets. Keep hydration for paths that call document methods or save.\n- Project the fields you need (`.select(\"name email\")`). Returning whole documents is how a password hash or an internal flag reaches a client.\n- Update with atomic operators (`$set`, `$inc`, `$push` with `$slice`, `findOneAndUpdate`) rather than loading a document, mutating it, and saving. Read-modify-write loses concurrent updates.\n- Bound every list: a filter plus a limit, paginated by an indexed cursor field (`_id` or a timestamp) rather than a growing `skip`.\n- Never use `$where` or pass raw user input into a query object without validating its shape; an object where a string is expected turns into an operator injection.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/models",
      "title": "Embed or reference: decide from the read pattern",
      "summary": "Embed data read together with its parent and bounded in size; reference data that grows without limit, is shared, or is queried on its own.",
      "body": "This is the only schema decision that really matters in MongoDB, and it is a query decision, not a modelling-purity decision.\n\n- Embed when the child is always read with the parent, is bounded in count, and changes with it (an address on a user, line items on an order). One read, no join.\n- Reference when the set is unbounded (events, messages, audit entries), when it is shared by many parents, or when it is queried independently. Then the child collection carries the parent id and its own indexes.\n- Never let an array grow without bound inside a document. Documents have a hard size limit, and long arrays make every update rewrite the document and every index entry.\n- Duplicating a few fields for read speed (a denormalised author name next to a post) is normal here, as long as you decide who updates the copy and accept that it is eventually consistent.\n- `$lookup` exists but is not a join engine: on a hot path, prefer a shape that answers the query in one collection, or fetch by ids in a second query and join in memory.\n\nSee /src/models for the index rule and /src/db for the query rules that assume this shape."
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Transactions are the exception, single-document atomicity is the rule",
      "summary": "A write to one document is already atomic; multi-document transactions must stay short, be retried on transient errors, and never be the default path.",
      "body": "MongoDB supports multi-document ACID transactions, and reaching for them constantly is a sign the schema is fighting the database.\n\n- A single document update is atomic on its own, including nested fields and arrays. Shape the document so the invariant you care about lives in one document, and you need no transaction at all.\n- When you do need one (money moving between two accounts, a two-collection invariant), keep it tiny: no network calls, no user input waiting, ideally sub-second. The server aborts long-running transactions, and open transactions hold resources and block other writers.\n- Wrap transactions in retry logic for `TransientTransactionError` and `UnknownTransactionCommitResult`. A transaction that is not retried is a transaction that fails under load.\n- Transactions require a replica set (or sharded cluster). Code that assumes them will fail against a standalone development instance, so run a single-node replica set locally.\n- Set read and write concern deliberately: `majority` for anything you must not lose or read stale, weaker only where you have decided the trade-off.\n\nSee /src/models for the embedding decision that removes most transactions."
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Connection lifecycle, especially in serverless",
      "summary": "Connect once per process and cache the connection across invocations; pool size, not request count, is what the cluster sees.",
      "body": "The driver manages a connection pool. Most MongoDB outages in serverless apps are self-inflicted pool exhaustion.\n\n- Call `mongoose.connect` (or create the client) once per process, in a module that exports the promise, and await that promise in handlers. Never connect per request.\n- In serverless, cache the connection on `globalThis` so warm invocations reuse it, and keep `maxPoolSize` small (a handful of sockets per instance): concurrency there is the number of instances, not the number of requests. Never call `disconnect` at the end of a handler.\n- Set sensible timeouts (`serverSelectionTimeoutMS`, `socketTimeoutMS`) so a network problem fails fast instead of hanging every request behind a full pool.\n- Handle connection events for observability (`connected`, `error`, `disconnected`) and expose pool metrics; a rising checkout wait time is the earliest signal of trouble.\n- Register models once. Re-registering the same model name on hot reload throws, which is why the connection module and the model registry belong together.\n\nSee /src/db for the query rules that run on this pool, and the redis-caching pattern if reads need a cache in front."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "mongodb-query-review",
      "summary": "Checklist for any change that adds a collection, query, or index in a MongoDB service.",
      "body": "---\nname: mongodb-query-review\ndescription: MongoDB and Mongoose review checklist covering index coverage, lean reads, document growth, transaction scope, and connection reuse. Run before merging a schema or query change.\n---\n\n# MongoDB review\n\n## Indexes\n- [ ] Every new filter and sort is covered by an index, in equality, sort, range order.\n- [ ] `explain(\"executionStats\")` shows an index scan and a sane examined-to-returned ratio.\n- [ ] Uniqueness is enforced by a unique index, not only a validator.\n- [ ] `autoIndex` is off in production; the index is built deliberately.\n\n## Queries\n- [ ] Read-only queries use `.lean()` and a projection.\n- [ ] Updates use atomic operators, not read-modify-write.\n- [ ] Every list is bounded and paginated on an indexed cursor field.\n- [ ] No `$where`; user input cannot become an operator.\n\n## Document design\n- [ ] Embedded data is read with its parent and bounded in size.\n- [ ] No array can grow without limit.\n- [ ] Denormalised copies have a named owner that updates them.\n\n## Transactions and connections\n- [ ] The invariant genuinely spans documents; otherwise no transaction.\n- [ ] Transactions are short, contain no network calls, and retry on transient errors.\n- [ ] The connection is created once per process and reused across invocations.\n",
      "skillTags": [
        "mongodb",
        "mongoose",
        "indexes",
        "code-review",
        "performance"
      ]
    }
  ]
};
