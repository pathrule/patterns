import type { Pattern } from "../types.js";

export const gitBranchingRebase: Pattern = {
  "slug": "git-branching-rebase",
  "version": "1.0.0",
  "name": "Git Branching, Rebase, and Merge Conflicts",
  "tagline": "Keep Git history integration reviewable, recoverable, conflict-aware, and free of accidental data loss.",
  "description": "Git conflicts are semantic integration decisions disguised as text edits. Rebasing or merging without understanding both sides can produce code that compiles while deleting a migration, duplicating a registration, or restoring behavior one branch intentionally removed. This pattern constrains history rewriting and conflict resolution while recording branch lifetime and integration-strategy decisions. It complements conventional commits by focusing on how divergent work is combined and recovered, not on commit-message syntax or automated release metadata.",
  "category": "Workflow",
  "icon": "git-merge",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Git rebase merge pattern for AI coding agents",
  "metaDescription": "Git branching, merge, rebase, conflict resolution, force-with-lease, recovery refs, generated files, migrations, tests, and integration policy. In production.",
  "problem": "AI agents often choose one conflict side mechanically, force-push over new remote work, rebase a shared branch, or resolve generated output without updating its source.",
  "audience": "Engineering teams integrating concurrent code, migrations, generated artifacts, releases, and long-running feature work",
  "prevents": [
    "Overwriting a teammate's remote commit during force push",
    "Dropping intent by accepting ours or theirs wholesale",
    "Rewriting history other people have based work on",
    "Committing a generated conflict fix that no source can reproduce"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/src",
      "/migrations"
    ],
    "stacks": [
      "git",
      "branching",
      "rebase",
      "merge-conflict",
      "workflow"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Rewrite only history you own",
      "summary": "Rebase and force-update private branches with a reviewed remote base; merge shared history unless owners coordinate a rewrite.",
      "body": "Rebase creates new commit identities. Rewriting a branch used by other people or automation disconnects their history and makes a normal push look like data loss.\n\n- Fetch the remote and inspect branch divergence before rebase, merge, reset, or force update.\n- Use rebase for local or explicitly private commits and communicate before rewriting a branch another person or deployment consumes.\n- When a rewritten branch must update remote, use a lease tied to the observed remote state rather than an unconditional force push.\n- Create or retain a recovery reference before complex history surgery and know how to find prior tips through reflog or the hosting platform.\n\nSee /src for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Resolve conflicts from both changes' intent",
      "summary": "Read base, ours, theirs, surrounding code, tests, and related files before composing the integrated result.",
      "body": "Conflict markers show overlapping text, not the complete semantic conflict. One side may depend on a schema, registration, API, or invariant changed elsewhere without a textual overlap.\n\n- Identify what each branch intended and which assumptions changed since the common base.\n- Resolve by composing behavior and deleting obsolete paths, not by mechanically choosing all of one side or concatenating both.\n- Search for related symbols, registrations, configuration, tests, and documentation that must agree with the resolution.\n- Run focused tests and inspect the staged diff without conflict markers, accidental debug code, duplicate imports, or unrelated formatting churn.\n\nSee /migrations for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/migrations",
      "title": "Ordered artifacts require domain-aware conflict policy",
      "summary": "Migrations, lockfiles, snapshots, and generated indexes are resolved through their source and ordering model, not as ordinary prose.",
      "body": "Some files encode a sequence or are derived from another source. A textual merge can look valid while creating duplicate migration order, inconsistent dependencies, or output that the generator immediately rewrites.\n\n- Preserve every independently shipped migration and create a new reconciliation migration when both branches changed the same schema assumption.\n- Regenerate lockfiles, code, snapshots, catalogs, and manifests from the merged authoritative sources using the pinned toolchain.\n- Do not renumber or edit an already applied migration merely to remove a filename conflict.\n- Review generated diffs for unexpected dependency, ordering, schema, or content loss instead of assuming regeneration is automatically correct.\n\nSee /src for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Branch lifetime determines integration strategy",
      "summary": "Keep short-lived changes near the target branch and give long-running work explicit synchronization, ownership, and release boundaries.",
      "body": "A branch that diverges for weeks accumulates conflicts in code and product assumptions. No Git command can make that integration cheap after the fact.\n\n- Split work into independently reviewable changes that can merge behind compatibility layers or feature controls.\n- Update from the target branch regularly while the branch is private and resolve conflicts near the change that introduced them.\n- Use merge commits where preserving a shared integration event matters and rebase where a private linear series improves review.\n- Delete merged branches after verifying the intended commit reached the target; branch names are collaboration handles, not durable release records.\n\nSee /src for the rule or workflow that puts this decision into practice."
    }
  ]
};
