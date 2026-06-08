import type { Pattern } from "../types.js";

export const supabaseRls: Pattern = {
  slug: "supabase-rls",
  version: "1.0.0",
  name: "Supabase + RLS",
  tagline:
    "Row Level Security done right: deny by default, user JWT only, and a clean migration workflow.",
  description:
    "Rules, memories, and a review skill for Supabase Postgres projects that take Row Level Security seriously. Pre-scoped to your supabase directory so your AI assistant enforces RLS, keeps the service role out of clients, and follows a disciplined migration flow.",
  category: "Backend",
  icon: "database",
  color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  installs: 0,
  updatedAt: "2026-06-09",
  changelog: [{ version: "1.0.0", date: "2026-06-09", note: "First release." }],
  metaTitle: "Supabase Row Level Security patterns for AI coding agents",
  metaDescription:
    "A ready-to-use Pathrule pattern for Supabase: RLS enabled by default, user JWT instead of the service role, a helper-function access model, and a migration review skill.",
  appliesTo: {
    paths: ["/supabase", "/supabase/migrations", "/supabase/functions"],
    stacks: ["supabase", "postgres"],
    packages: ["@supabase/supabase-js"],
  },
  pieces: [
    {
      kind: "rule",
      nodePath: "/supabase",
      title: "RLS enabled on every table, deny by default",
      summary: "No table ships without Row Level Security and explicit policies.",
      body: "Every table in a public-facing schema must have Row Level Security enabled. Start from deny by default and add narrow policies per operation (select, insert, update, delete). A migration that creates a table without enabling RLS and adding policies is incomplete and must not merge.",
      scopeType: "folder",
      priority: "high",
      enforcement: "strict",
    },
    {
      kind: "rule",
      nodePath: "/supabase",
      title: "User JWT only, never the service role in client paths",
      summary: "The service role key bypasses RLS and must stay server-side.",
      body: "Client code and edge functions that act on behalf of a user must use the user's JWT so RLS applies. The service role key bypasses RLS entirely and may only be used in trusted server-side jobs that intentionally need it, never shipped to a browser or inferred from a client request.",
      scopeType: "project",
      priority: "high",
      enforcement: "strict",
    },
    {
      kind: "memory",
      nodePath: "/supabase",
      title: "Access via a single has_access helper",
      summary: "Centralize the access check in one SQL function reused by policies.",
      body: "Express membership and ownership checks in one SECURITY DEFINER helper (for example has_workspace_access(user_id, workspace_id)) and reference it from RLS policies across tables. This keeps the access model in one place, makes policies readable, and avoids subtly different inline checks that drift apart over time.",
    },
    {
      kind: "memory",
      nodePath: "/supabase/migrations",
      title: "Migration workflow",
      summary: "Forward-only, reviewed SQL with RLS and types regenerated.",
      body: "Migrations are forward-only and timestamped. Each one is self-contained and idempotent where practical. After a schema change, enable RLS and add policies in the same migration, then regenerate TypeScript types. Never edit a migration that has already run in a shared environment; add a new one.",
    },
    {
      kind: "skill",
      nodePath: "/",
      title: "supabase-rls-review",
      summary: "Checklist for reviewing a Supabase schema or migration change.",
      body: "---\nname: supabase-rls-review\ndescription: Review a Supabase migration or schema change for RLS correctness and safety.\n---\n\n# Supabase RLS review\n\n- [ ] RLS is enabled on every new table\n- [ ] Policies exist per operation and deny by default\n- [ ] Policies use the shared access helper, not ad hoc inline checks\n- [ ] No service role key is reachable from client or per-request code\n- [ ] Indexes back the columns used in policy predicates\n- [ ] TypeScript types regenerated after the schema change\n- [ ] Migration is forward-only and does not edit an already-applied file\n",
      skillTags: ["supabase", "postgres", "security", "review"],
    },
  ],
};
