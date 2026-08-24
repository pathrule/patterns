import type { Pattern } from "../types.js";

export const multiTenancy: Pattern = {
  "slug": "multi-tenancy",
  "version": "1.0.0",
  "name": "Multi-Tenant SaaS",
  "tagline": "Make cross-tenant data leaks structurally impossible instead of relying on every query being careful.",
  "description": "In a multi-tenant product, one forgotten filter is a data breach. The teams that never leak do not write more careful queries; they make the unscoped query impossible to express, resolve the tenant from the authenticated session rather than from anything the client sends, and carry that context into jobs, caches, files, and logs. This bundle covers the isolation model decision, the four enforcement points where leaks actually happen, and the noisy-neighbour limits that keep one tenant from consuming the platform.",
  "category": "Backend",
  "icon": "building-2",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Multi-tenant SaaS pattern for AI coding agents",
  "metaDescription": "Multi-tenancy pattern for AI coding agents: enforce tenant scoping in the data layer, resolve tenants from the session, and namespace caches, files, and jobs.",
  "problem": "AI agents add a tenant filter to the queries they can see, read the tenant id from a header or subdomain the client controls, and forget it entirely in background jobs, cache keys, and file paths.",
  "audience": "SaaS teams running one shared deployment for many customer organisations",
  "prevents": [
    "Writing a query with no tenant predicate and returning another customer's rows",
    "Trusting a tenant id from a header, path, or JWT claim without checking membership",
    "Running a background job or migration that silently spans every tenant",
    "Caching a value under a key that two tenants share"
  ],
  "appliesTo": {
    "paths": [
      "/src/db",
      "/src/api",
      "/src/jobs",
      "/src/cache"
    ],
    "stacks": [
      "saas",
      "multi-tenancy",
      "postgres",
      "node",
      "backend"
    ],
    "packages": []
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Enforce tenant scoping below the application code",
      "summary": "The data layer refuses an unscoped query: row-level security, a mandatory tenant predicate in the repository, or both, and no raw client bypasses it.",
      "body": "Application-level filtering fails the same way every time: one new query, one new report, one raw SQL fix, and the filter is missing. The enforcement has to sit under the code that forgets.\n\n- Put the guarantee in the database where you can: row-level security policies keyed on a session variable (`SET LOCAL app.tenant_id`) mean a query with no predicate returns nothing rather than everything. Make sure the application role is not the table owner and cannot bypass RLS.\n- Where RLS is not available, funnel all access through a repository or query builder that requires a tenant id as an argument and appends the predicate itself. No module may construct a query object directly.\n- Every tenant-owned table carries the tenant id as a real column with an index and a foreign key, and composite uniqueness includes it (`unique (tenant_id, slug)`, never `unique (slug)`).\n- Ban the escape hatches in application paths: no raw connection, no admin client, no `SET ROLE`, no query builder with the scope disabled. If an internal tool genuinely needs cross-tenant reads, it gets its own service, its own credentials, and an audit log.\n- Write the leak test, not just the happy-path test: seed two tenants, run every endpoint as tenant A asking for tenant B's ids, and assert not-found. This is the only test that catches the next missing filter.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Derive the tenant from the session, never from client input",
      "summary": "Tenant identity comes from the authenticated principal and a verified membership check; a header, subdomain, or path segment is a hint at most.",
      "body": "A tenant id in a request is attacker-controlled. Treating it as authoritative is the fastest path to a horizontal privilege escalation.\n\n- Resolve the tenant from the authenticated session or token, then verify that this principal is a member of that tenant with the role the action requires. Membership is a lookup, not a claim you trust because it is signed by you.\n- If the URL or subdomain names a tenant, use it only to select which of the caller's memberships is active, and reject the request when the caller is not a member. Never let it introduce a tenant the session does not have.\n- Put the resolved tenant id in a request-scoped context that the data layer reads, and derive it exactly once per request. Passing it around as a parameter that any layer can override defeats the point.\n- For machine-to-machine access, scope the API key or token to one tenant at issue time so the credential itself cannot address another.\n- Impersonation and support access are separate, audited flows with their own permission, an explicit expiry, and a log entry naming the operator and the tenant.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/jobs",
      "title": "Carry tenant context into every asynchronous path",
      "summary": "Jobs, webhooks, exports, and scheduled work take an explicit tenant id and set the same scope the request path would; nothing defaults to all tenants.",
      "body": "Background work is where tenant scoping quietly disappears: there is no request, so there is no context, so the query runs unscoped.\n\n- Every job payload includes the tenant id, and the worker establishes the same scope as a request (set the session variable, build the scoped repository) before touching data.\n- A scheduled task that must run for all tenants iterates tenants explicitly and processes each in its own scoped unit of work. A single query across all tenants is a bug waiting to be a report emailed to the wrong customer.\n- Inbound webhooks resolve the tenant from the integration record the signature belongs to, not from a payload field. Verify the signature first, then map to the tenant.\n- Failures, retries, and dead letter records keep the tenant id so an operator can tell whose work failed without opening the payload.\n- Long-running exports and imports run under the tenant scope end to end, including the storage path they write to and the notification they send.\n\nSee /src/db for the enforcement layer these jobs must go through.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/cache",
      "title": "Namespace every derived artifact by tenant",
      "summary": "Cache keys, search indexes, object storage paths, exported files, and log fields all include the tenant id.",
      "body": "The database is usually the layer people protect. The leak happens in the cache, the search index, or a signed URL.\n\n- Prefix every cache key with the tenant id (`t:<tenantId>:...`) and build keys through one helper so no caller can forget. A memoised list keyed only by page number will serve the wrong customer's data.\n- Scope search: either an index per tenant or a mandatory tenant filter applied by the same wrapper that runs every query. A filter that the caller supplies is a filter that will be omitted.\n- Store files under a tenant-prefixed path, and make signed URLs short-lived and specific to the object. Never generate a signature for a prefix a tenant does not own.\n- Include the tenant id as a structured field on every log line, metric, and trace so operational data is filterable and an incident can be scoped to one customer.\n- Rate limits, quotas, and idempotency keys are per tenant too; a global key lets one tenant lock out another.\n\nSee /src/db for the data-layer rule and the redis-caching pattern for cache invalidation design.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Choosing the isolation model, and living with it",
      "summary": "Shared schema with a tenant column scales operationally, schema per tenant buys separation at migration cost, database per tenant is for compliance or a few large customers.",
      "body": "This decision shapes migrations, backups, onboarding, and cost for the life of the product. Make it explicitly, and expect to support a hybrid eventually.\n\n- Shared tables with a tenant id column is the default for volume: one migration, one connection pool, cheap onboarding. Isolation depends entirely on enforcement (RLS or a mandatory predicate), and noisy neighbours are a real operational concern.\n- Schema per tenant gives clearer separation and per-tenant restore, at the cost of running every migration N times and holding many more relations. It stops scaling somewhere in the hundreds to low thousands of tenants, depending on the engine.\n- Database (or cluster) per tenant is for regulated or very large customers: strongest isolation, per-tenant residency and restore, and by far the highest operational cost. Reserve it for the accounts that pay for it.\n- A hybrid is normal: shared tables for the long tail, dedicated databases for enterprise accounts. Keep the application code identical by resolving the connection and scope from the tenant record.\n- Whatever you choose, plan two lifecycle operations from day one: exporting all data for one tenant, and deleting it. Both are contractual obligations and both are painful to retrofit.\n\nSee /src/api for tenant resolution and the supabase-rls pattern for row-level security specifics on Postgres."
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Fairness: keeping one tenant from consuming the platform",
      "summary": "Per-tenant quotas, bounded page sizes, and separated work pools stop a single customer's load from becoming everyone's outage.",
      "body": "In a shared deployment, capacity is a shared resource. Without per-tenant limits, your worst-behaved customer sets everyone's latency.\n\n- Rate-limit and quota per tenant, not just globally, and return a clear error with a retry hint. Tie limits to the plan so the product and the platform agree on what is allowed.\n- Cap page sizes, export sizes, and query time server-side. An endpoint that lets a caller request 100000 rows is a denial of service you built.\n- Separate the work pools that matter: interactive requests, background jobs, and bulk imports should not share one queue or one connection pool. One tenant's million-row import should not delay another tenant's login.\n- Watch resource use per tenant (queries, storage, job time, tokens spent) both for capacity planning and because usage-based pricing needs it anyway.\n- Give large tenants an escape valve: dedicated workers, a separate database, or a shard. Plan for how a tenant moves between shapes before a customer forces the question.\n\nSee /src/jobs for the job scoping rule and the observability pattern for per-tenant metrics."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "tenant-isolation-review",
      "summary": "Pre-merge review for any change that reads or writes tenant-owned data, plus the cross-tenant test to run.",
      "body": "---\nname: tenant-isolation-review\ndescription: Review checklist for multi-tenant changes: data-layer scoping, tenant resolution, asynchronous context, and namespaced caches and files. Includes the cross-tenant leak test to run before merging.\n---\n\n# Tenant isolation review\n\n## Data access\n- [ ] Every new query goes through the scoped repository or is covered by an RLS policy.\n- [ ] No raw connection, admin client, or scope-disabled builder was introduced.\n- [ ] New tenant-owned tables have a tenant id column, an index, and tenant-inclusive unique constraints.\n- [ ] Joins cannot cross tenants (every joined table is scoped too).\n\n## Request path\n- [ ] The tenant comes from the session, with a membership and role check.\n- [ ] A tenant id in the URL, header, or body only selects among the caller's memberships.\n- [ ] The resolved tenant is set once, in request context, and read by the data layer.\n\n## Asynchronous work\n- [ ] Job payloads carry the tenant id and workers establish the scope before querying.\n- [ ] Scheduled cross-tenant work iterates tenants explicitly.\n- [ ] Webhooks resolve the tenant from the verified integration, not the payload.\n\n## Derived artifacts\n- [ ] Cache keys, search filters, storage paths, and signed URLs are tenant-prefixed.\n- [ ] Logs, metrics, and traces carry the tenant id.\n- [ ] Rate limits and idempotency keys are per tenant.\n\n## The test that matters\n1. Seed tenant A and tenant B with overlapping-looking data.\n2. Authenticate as a member of A only.\n3. Call every touched endpoint with B's ids (path, body, filters, cursors, exports).\n4. Assert not-found or forbidden, never a partial result, and never a 500 that reveals existence.\n5. Repeat for the job or webhook path if the change added one.\n",
      "skillTags": [
        "multi-tenancy",
        "saas",
        "security",
        "code-review",
        "data-isolation"
      ]
    }
  ]
};
