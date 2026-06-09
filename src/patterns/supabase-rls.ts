import type { Pattern } from "../types.js";

export const supabaseRls: Pattern = {
  "slug": "supabase-rls",
  "version": "1.0.0",
  "name": "Supabase + RLS",
  "tagline": "Row Level Security done right: deny by default, user JWT only, and a clean migration workflow.",
  "description": "Rules, memories, and a review skill for Supabase Postgres projects that take Row Level Security seriously. Pre-scoped to your supabase directory so your AI assistant enforces RLS, keeps the service role out of clients, and follows a disciplined migration flow.",
  "category": "Backend",
  "icon": "database",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Supabase Row Level Security patterns for AI coding agents",
  "metaDescription": "A ready-to-use Pathrule pattern for Supabase: RLS enabled by default, user JWT instead of the service role, a helper-function access model, and a migration review skill.",
  "problem": "Postgres tables ship without Row Level Security, or the service role key sneaks into client paths, leaving data open to anyone.",
  "audience": "teams building on Supabase Postgres with multi-tenant or per-user data",
  "prevents": [
    "Creating a table without RLS enabled and policies",
    "Using the service role key where the user's JWT belongs",
    "Ad hoc access checks that drift apart across tables"
  ],
  "appliesTo": {
    "paths": [
      "/supabase",
      "/supabase/migrations",
      "/supabase/functions"
    ],
    "stacks": [
      "supabase",
      "postgres"
    ],
    "packages": [
      "@supabase/supabase-js"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/supabase",
      "title": "RLS enabled on every table, deny by default",
      "summary": "No table ships without Row Level Security enabled and explicit per-operation policies.",
      "body": "Every user-facing table in the public schema must have Row Level Security enabled with a deny-by-default posture. A table with RLS disabled is readable and writable by any authenticated user.\n\n- Enable RLS in the same migration that creates the table: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY`. Never rely on the application layer to enforce access at the row level.\n- Start from no policies (which denies everything) and add the minimum set of policies per operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) that the feature actually requires. A catch-all `USING (true)` policy is equivalent to no RLS.\n- A migration that creates a table without enabling RLS and adding policies is incomplete and must not merge to a shared environment.\n- Internal or log tables used only by server-side jobs that run as the service role may skip per-user policies, but must still have RLS enabled and an explicit `USING` expression that allows only the service role, not a blanket bypass.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/supabase",
      "title": "Service role key stays server-side; never in client paths",
      "summary": "The service role key bypasses RLS entirely and must never appear in browser code, client environment variables, or per-request edge function logic acting on behalf of a user.",
      "body": "The Supabase service role key grants full unrestricted access to every row in every table, bypassing all RLS policies. Leaking it to a browser or a client-accessible path renders all RLS useless.\n\n- Never include the service role key in any environment variable exposed to the browser (for example `NEXT_PUBLIC_*` in Next.js, or any variable bundled by Vite/webpack for the client).\n- Edge functions that handle per-user requests must create their Supabase client with the user's JWT from the `Authorization` header, not the service role: `createClient(url, anonKey, { global: { headers: { Authorization: req.headers.get('Authorization') } } })`. This ensures RLS evaluates under the correct user identity.\n- Use the service role key only in trusted server-side contexts (scheduled functions, admin scripts, server-to-server calls) where bypassing RLS is the deliberate intent and the scope is understood.\n- Never derive or reconstruct the service role key from a client request, environment variable pattern, or any value accessible to end users.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/supabase/migrations",
      "title": "Index every column used in RLS policy predicates",
      "summary": "An unindexed column in a USING or WITH CHECK expression causes a full-table scan on every row-level check.",
      "body": "Postgres evaluates each RLS policy's `USING` and `WITH CHECK` expressions once per row that the query touches. An expression that references an unindexed column forces a sequential scan on every row access, not just on the query plan — the cost is invisible in `EXPLAIN` for the outer query but shows up as degraded performance under load.\n\n- Add a B-tree index on every column that appears in a `USING (...)` or `WITH CHECK (...)` expression, particularly `user_id`, `workspace_id`, `tenant_id`, and any other access-boundary column.\n- For policies that call `auth.uid()`, the `user_id` column they compare against must be indexed; the `auth.uid()` itself is a function call that Postgres inlines as a constant per statement, so it is not the bottleneck, but the column scan is.\n- If using a `SECURITY DEFINER` helper function (see the access-helper memory), index the columns inside that function's WHERE clause, not just the surface-level expression in the policy.\n- Run `EXPLAIN ANALYZE` on representative queries before and after adding RLS to confirm the policy predicates are not adding full-table sequential scans.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/supabase",
      "title": "Centralize access checks in a SECURITY DEFINER helper",
      "summary": "One SQL function that expresses membership or ownership, reused by all policies across tables.",
      "body": "Writing the same `EXISTS (SELECT 1 FROM memberships WHERE ...)` check inline in multiple policies creates drift: tables diverge, a bug fix in one policy misses others, and refactoring access logic means touching every policy.\n\n- Express membership and ownership in one `SECURITY DEFINER` function, for example:\n  ```sql\n  CREATE OR REPLACE FUNCTION has_workspace_access(p_workspace_id uuid)\n  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$\n    SELECT EXISTS (\n      SELECT 1 FROM workspace_members\n      WHERE workspace_id = p_workspace_id\n        AND user_id = auth.uid()\n    );\n  $$;\n  ```\n- Reference the helper in all relevant policies: `CREATE POLICY \"workspace read\" ON documents FOR SELECT USING (has_workspace_access(workspace_id))`.\n- `SECURITY DEFINER` runs the function as the function owner (typically `postgres`), which avoids RLS recursion if `workspace_members` itself is RLS-protected. Mark it `STABLE` so the planner can cache the result per statement.\n- Grant `EXECUTE` only to `authenticated` and `service_role`; do not grant to `anon` unless anonymous access is intentional."
    },
    {
      "kind": "memory",
      "nodePath": "/supabase",
      "title": "auth.uid(), auth.jwt(), and custom claims in policies",
      "summary": "How to use Supabase JWT claims in RLS expressions and how to attach custom claims via a hook without performance footguns.",
      "body": "Supabase injects the authenticated user's identity into the Postgres session so RLS policies can reference it without a subquery to `auth.users`.\n\n- `auth.uid()` returns the `sub` claim of the JWT as a `uuid`. Use it directly in policy `USING` expressions: `USING (user_id = auth.uid())`.\n- `auth.jwt()` returns the full decoded JWT as `jsonb`. Access top-level claims with `->>`: `auth.jwt() ->> 'role'`. For nested claims (for example `app_metadata`): `(auth.jwt() -> 'app_metadata') ->> 'plan'`.\n- Custom claims (roles, plan tier, org ID) are the recommended way to encode authorization context without an extra DB lookup per row. Add them via a Supabase Auth Hook (the `custom_access_token` hook in the Dashboard), which runs a Postgres function that appends claims to every JWT before it is issued.\n- Never call `SELECT ... FROM auth.users` inside a policy `USING` expression just to read a claim that is already in the JWT. It issues a subquery per row. Use `auth.jwt()` to read the claim from the already-present token instead.\n- When a custom claim must be refreshed (for example after a plan upgrade), call `supabase.auth.refreshSession()` on the client to force a new token with updated claims; old tokens keep the stale claims until they expire."
    },
    {
      "kind": "memory",
      "nodePath": "/supabase/migrations",
      "title": "Supabase migration workflow",
      "summary": "Forward-only timestamped SQL, RLS and policies in the same migration as the table, TypeScript types regenerated after each change.",
      "body": "Supabase migrations are plain SQL files managed by the Supabase CLI. The workflow keeps the database and generated types in sync.\n\n- Generate a new migration with `supabase migration new <description>`, which creates a timestamped file in `supabase/migrations/`. Write forward-only SQL; there are no down steps.\n- Enable RLS and add all required policies in the same migration file that creates the table. Never leave the table in a state where it exists but RLS is not yet enabled, even briefly across separate migrations.\n- After applying a migration that changes the schema, regenerate TypeScript types: `supabase gen types typescript --linked > src/types/supabase.ts` (or equivalent). Commit the updated types file in the same PR as the migration.\n- Apply locally with `supabase db reset` (for local dev) or `supabase db push` (for remote preview branches). Never edit a migration file that has already been applied to any shared environment; add a new migration instead.\n- For Supabase hosted projects, use branching (`supabase branches`) to develop and test schema changes on an isolated preview branch before merging to production."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "supabase-rls-review",
      "summary": "Checklist for reviewing a Supabase schema or migration change for RLS correctness, performance, and workflow safety.",
      "body": "---\nname: supabase-rls-review\ndescription: Review a Supabase migration or schema change for RLS correctness, JWT claim usage, access-helper design, policy-predicate indexing, and migration workflow safety.\n---\n\n# Supabase RLS review\n\n## RLS and policies\n- [ ] RLS is enabled on every new table in the same migration that creates it.\n- [ ] Policies exist per operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) and the default is deny (no `USING (true)` catch-all).\n- [ ] Policies use the shared `SECURITY DEFINER` access helper, not ad-hoc inline subqueries that would differ across tables.\n- [ ] Internal/job tables accessed only via the service role have explicit `USING` expressions limiting to the service role, not a blanket bypass.\n\n## Performance\n- [ ] Every column referenced in a `USING` or `WITH CHECK` expression (especially `user_id`, `workspace_id`, `tenant_id`) has a B-tree index.\n- [ ] No policy calls `SELECT ... FROM auth.users` per row to read a claim that is already available via `auth.jwt()`.\n\n## JWT and custom claims\n- [ ] Policies use `auth.uid()` for user identity and `auth.jwt()` for custom claims; no unnecessary subqueries to `auth.users`.\n- [ ] Custom claims added via the Auth Hook are documented and the client calls `refreshSession()` after claim-changing events (plan upgrade, role change).\n\n## Service role\n- [ ] No service role key appears in any browser-accessible environment variable or in edge function code acting on behalf of a user.\n- [ ] Edge functions acting on behalf of a user forward the `Authorization: Bearer <user_jwt>` header to the Supabase client, not the service role key.\n\n## Migration workflow\n- [ ] TypeScript types are regenerated and committed alongside the migration.\n- [ ] Migration is forward-only and no already-applied file was edited; a new file was added.\n",
      "skillTags": [
        "supabase",
        "postgres",
        "rls",
        "security",
        "review"
      ]
    }
  ]
};
