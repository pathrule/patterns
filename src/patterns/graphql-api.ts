import type { Pattern } from "../types.js";

export const graphqlApi: Pattern = {
  "slug": "graphql-api",
  "version": "1.0.0",
  "name": "GraphQL API",
  "tagline": "Ship a GraphQL API that batches its queries, authorizes per field, and cannot be walked by a stranger.",
  "description": "A GraphQL endpoint fails in ways REST does not: one nested query becomes hundreds of database round trips, a resolver deep in the graph returns data the caller was never allowed to see, and a public schema hands an attacker a map of your domain. This bundle covers the four defences that matter (batched loading, per-resolver authorization, cost and operation limits, and disciplined schema evolution) and the conventions that keep a schema usable as it grows. Where rest-api-design covers HTTP semantics, this covers the graph.",
  "category": "Backend",
  "icon": "share-2",
  "color": "bg-pink-500/10 text-pink-600 dark:bg-pink-400/15 dark:text-pink-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "GraphQL API pattern for AI coding agents",
  "metaDescription": "GraphQL pattern for AI coding agents: batch resolvers with DataLoader, authorize per field, cap query depth and cost, and evolve schemas without breakage.",
  "problem": "AI agents write resolvers that query per parent object, authorize only at the entry point, ship introspection and unbounded queries to production, and change field nullability without noticing it breaks clients.",
  "audience": "Backend teams running a GraphQL API for web, mobile, or federated services",
  "prevents": [
    "Resolving a list field with one database query per parent object",
    "Authorizing only the top-level query while nested resolvers return anything",
    "Leaving introspection and unbounded query depth open on a public endpoint",
    "Making a nullable field non-null, or renaming one, and breaking live clients"
  ],
  "appliesTo": {
    "paths": [
      "/src/graphql",
      "/src/graphql/resolvers",
      "/src/server"
    ],
    "stacks": [
      "graphql",
      "typescript",
      "node",
      "apollo",
      "api"
    ],
    "packages": [
      "graphql",
      "dataloader",
      "@apollo/server",
      "graphql-yoga"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/graphql/resolvers",
      "title": "Batch every relation through a per-request loader",
      "summary": "A resolver never queries per parent object: relations go through a DataLoader created per request, and lists are fetched in one round trip.",
      "body": "The N+1 problem is structural in GraphQL, not accidental: the engine calls a field resolver once per parent, so a list of 100 posts calls the author resolver 100 times.\n\n- Put every by-id or by-foreign-key lookup behind a loader that batches keys collected during one tick and returns them in key order. Resolvers ask the loader; they never touch the database directly.\n- Create loaders per request, in the context factory. A loader shared across requests is a cache that leaks one user's data into another user's response.\n- Batch functions must return results in the same order as the keys they were given, with a null or an error placeholder for misses. Returning a filtered list silently misaligns every field.\n- Loaders solve fan-out, not projection: a batched query that selects every column of a wide table is still slow. Select the fields the query actually asked for where your data layer supports it.\n- Watch mutations too. A mutation that returns a payload triggering the same resolvers needs the loader primed or cleared, or it will serve the pre-mutation value.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/graphql",
      "title": "Authorize inside the resolver that returns the data",
      "summary": "Every field that exposes protected data checks the caller against that specific object; entry-point checks do not protect the graph.",
      "body": "In a graph, the same object is reachable through many paths. An authorization check on the top-level query protects exactly one of them.\n\n- Check permission where the data is produced: the field resolver (or the service it calls) verifies that the caller may see this object, not merely that they are logged in.\n- Never trust an id from the query as proof of access. `node(id:)`, a nested relation, and a mutation input are all attacker-controlled.\n- Put the authenticated identity in the request context and pass it down explicitly. A resolver that reads a global or re-parses the token is a resolver that will be called from a path you did not audit.\n- Return an authorization failure as a typed error with a stable code, and be deliberate about whether a forbidden field nulls out or fails the whole query, since nullability decides that.\n- Field-level directives or a policy layer are fine as a mechanism, but the guarantee must be enforced server-side per object, not in a client-selected shape.\n\nSee the web-security pattern for the deny-by-default posture this applies inside the graph.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/server",
      "title": "Cap what a single operation can cost",
      "summary": "Production disables introspection, prefers persisted operations, and rejects queries over a depth, complexity, and time budget.",
      "body": "A GraphQL endpoint accepts arbitrary programs. Without limits, one request can traverse a recursive relation until the process dies.\n\n- Reject queries past a maximum depth, and score complexity per field (higher for list fields, which multiply) with a rejection budget. Depth stops recursion; complexity stops wide, expensive selections.\n- Prefer persisted (allow-listed) operations for first-party clients: the server executes only known operation hashes, which removes both arbitrary queries and most of the introspection attack surface, and shrinks request payloads.\n- Disable introspection and field suggestions on public production endpoints. Treat this as defence in depth, not a substitute for authorization; a determined attacker can still probe.\n- Set a server-side execution timeout and a request size limit, disable or bound query batching, and rate-limit by identity rather than by IP alone.\n- Return errors that do not leak internals: a stable code and a safe message, with stack traces and database errors logged server-side only.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/graphql",
      "title": "Evolve the schema additively and be intentional about nullability",
      "summary": "Add fields, never repurpose them: no renames or type changes on a live schema, deprecate before removal, and treat non-null as a promise.",
      "body": "GraphQL has no versioned URLs, so the schema itself is the compatibility contract. Every breaking change is a breaking change for clients you cannot see.\n\n- Additive changes are safe: new types, new optional arguments, new nullable fields. Renaming a field, removing one, changing its type, or making a nullable field non-null are all breaking.\n- Mark the old field `@deprecated(reason: \"...\")` with a migration note, keep it working, and remove it only after usage tracking shows nobody asks for it.\n- Choose nullability deliberately: a non-null field that fails propagates the null upward and can wipe out a whole response branch. Non-null for things that genuinely always exist (ids, timestamps); nullable for anything that can fail independently.\n- Model expected failures in the schema (a result union or a payload with `errors`) rather than throwing for business outcomes. Reserve GraphQL errors for genuine faults.\n- Run a schema diff in CI against the deployed schema and fail the build on a breaking change unless it is explicitly approved.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/graphql",
      "title": "Schema conventions that survive growth",
      "summary": "Design the graph around client use cases with cursor-paginated connections and mutation payload types, not as a mirror of database tables.",
      "body": "A schema that mirrors your tables ages badly: every storage change becomes a client change, and every list becomes an unbounded read.\n\n- Model the domain the client asks about. Fields exist because a screen needs them, not because a column exists. Keep storage details (join tables, denormalised columns) out of the graph.\n- Paginate every list that can grow, with cursor-based connections (`edges`, `node`, `pageInfo`) and a maximum page size enforced server-side. An unpaginated list field is a future incident.\n- Give each mutation a single input object and a payload type that returns the affected entities plus a typed error field. That shape stays compatible as the mutation grows.\n- Name for the domain and stay consistent: verbs for mutations (`publishPost`), nouns for types, and no abbreviations that only the backend team knows. Enums for closed sets, so clients get exhaustiveness.\n- If you federate, draw subgraph boundaries along ownership, keep entity keys stable, and let one service own each entity's canonical fields. A shared type that two teams both write is where federation goes wrong.\n\nSee /src/graphql/resolvers for the batching rule and /src/server for the limits that protect these lists."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "graphql-schema-review",
      "summary": "Checklist for any change that adds a type, field, resolver, or mutation to a GraphQL API.",
      "body": "---\nname: graphql-schema-review\ndescription: GraphQL review checklist covering resolver batching, per-object authorization, operation cost limits, and backward-compatible schema evolution. Run before merging a schema or resolver change.\n---\n\n# GraphQL review\n\n## Resolvers\n- [ ] Every relation resolves through a per-request loader; no query per parent.\n- [ ] Batch functions return results in key order with placeholders for misses.\n- [ ] Loaders are created per request, never shared across requests.\n- [ ] Mutation payloads do not serve stale loader values.\n\n## Authorization\n- [ ] The resolver that returns protected data checks the caller against that object.\n- [ ] No id from the query is treated as proof of access.\n- [ ] Identity comes from the request context, not a global.\n\n## Cost and exposure\n- [ ] Depth and complexity limits still reject the worst query this change enables.\n- [ ] New list fields are paginated with a server-enforced maximum page size.\n- [ ] Introspection stays off in production; persisted operations cover new client queries.\n- [ ] Errors expose a code and a safe message only.\n\n## Compatibility\n- [ ] The change is additive; nothing renamed, removed, or retyped.\n- [ ] Nullability is deliberate, and non-null fields genuinely cannot fail alone.\n- [ ] Anything being retired is `@deprecated` with a reason, not deleted.\n- [ ] The CI schema diff passes.\n",
      "skillTags": [
        "graphql",
        "api-design",
        "code-review",
        "security",
        "performance"
      ]
    }
  ]
};
