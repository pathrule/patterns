import type { Pattern } from "../types.js";

export const githubActionsCicd: Pattern = {
  "slug": "github-actions-cicd",
  "version": "1.0.0",
  "name": "GitHub Actions CI/CD",
  "tagline": "Build hardened, fast, OIDC-deployed GitHub Actions pipelines that AI agents keep secure by default.",
  "description": "A bundle of rules, memories, and a review skill that lock GitHub Actions workflows to least-privilege tokens, SHA-pinned actions, and keyless OIDC deploys. It encodes the current 2026 stack (checkout@v6, setup-node@v6, cache@v5) so coding agents stop reintroducing long-lived secrets and over-broad permissions. Use it to keep CI fast with caching and matrix builds while staying audit-clean.",
  "category": "Infra",
  "icon": "workflow",
  "color": "bg-slate-500/10 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "GitHub Actions CI/CD pattern for AI coding agents",
  "metaDescription": "Keep AI coding agents shipping secure, fast GitHub Actions pipelines: least-privilege tokens, SHA-pinned actions, OIDC deploys, caching, and matrix builds for 2026.",
  "problem": "AI agents and busy teams keep shipping GitHub Actions workflows with write-all tokens, mutable action tags, and long-lived cloud secrets that fail security review.",
  "audience": "Platform and application teams running GitHub Actions CI/CD who let AI agents edit workflow files",
  "prevents": [
    "Workflows running with the default read/write GITHUB_TOKEN instead of explicit least privilege",
    "Pinning third-party actions to mutable tags like @v4 instead of an immutable commit SHA",
    "Storing long-lived cloud access keys as repo secrets instead of deploying with OIDC"
  ],
  "appliesTo": {
    "paths": [
      "/.github/workflows"
    ],
    "stacks": [
      "github-actions",
      "ci-cd",
      "oidc",
      "node"
    ],
    "packages": [
      "actions/checkout",
      "actions/setup-node",
      "actions/cache",
      "aws-actions/configure-aws-credentials"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Least-privilege GITHUB_TOKEN by default",
      "summary": "Default-deny permissions, grant the minimum per job.",
      "body": "Every workflow must set explicit `permissions` instead of relying on the default read/write `GITHUB_TOKEN`.\n\n- Set `permissions: {}` (or `contents: read`) at the workflow top level as a default-deny baseline.\n- Grant scopes only on the individual jobs that need them, e.g. `packages: write` on the publish job only.\n- Add `id-token: write` strictly on jobs that request an OIDC token, never workflow-wide.\n- Set a `concurrency` group with `cancel-in-progress: true` so stale runs cannot push or deploy.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Pin every action to a full commit SHA",
      "summary": "No mutable tags; pin third-party actions to an immutable SHA.",
      "body": "Reference every `uses:` action by a full-length 40-character commit SHA, with the human-readable version in a trailing comment.\n\n- Write `uses: actions/checkout@<sha> # v6.0.0`, not `actions/checkout@v6` or `@main`.\n- Pinning a mutable tag lets an upstream maintainer or attacker swap code under your runner with write access.\n- First-party `actions/*` may pin to the major tag only if org policy allows it; all third-party and marketplace actions must be SHA-pinned.\n- Keep pins current with Dependabot (`dependabot.yml` with `package-ecosystem: github-actions`) or `pin-github-action` so you get patched SHAs, not stale ones.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Cloud deploys authenticate via OIDC, not stored static keys",
      "summary": "Federate to a short-lived cloud role; never store long-lived access keys as repo secrets.",
      "body": "A long-lived cloud key stored as a CI secret is the highest-value, lowest-rotation credential most teams hold. Federate instead so the credential is minted per run and expires on its own.\n\n- Grant the deploy job `permissions: id-token: write` and exchange the GitHub OIDC JWT for a cloud role. For AWS use `aws-actions/configure-aws-credentials` with `role-to-assume` and no `aws-access-key-id`/`aws-secret-access-key`. GCP and Azure have equivalent workload-identity federation actions.\n- Lock the IAM trust policy to `repo:org/name` and constrain on `ref` or `environment` claims so only the intended branch or protected environment can assume the role.\n- Bind the deploy job to a protected GitHub Environment with required reviewers; environment secrets are exposed only to that job.\n- Note the immutable `sub` subject-claim rollout for new repositories (June 18 2026); pin trust conditions to claims that survive it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/.github/workflows",
      "title": "Current GitHub Actions stack and caching defaults (2026)",
      "summary": "Pinned action versions and the caching approach we use.",
      "body": "These are the current stable building blocks for our pipelines as of mid-2026; do not downgrade them when editing workflows.\n\n- Core actions: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/cache@v5` (cache runs on Node 24 and needs runner >= 2.327.1).\n- Prefer the built-in cache of `setup-node` (`cache: 'npm'`) over a manual `actions/cache` step for dependency restore.\n- Reserve standalone `actions/cache` for build outputs (Turbo, Next, Playwright browsers) keyed on a lockfile hash with a partial `restore-keys` fallback.\n- Test across versions with a matrix, e.g. `strategy.matrix.node: [20, 22, 24]`, and gate merges on the matrix job.\n- Avoid `pull_request_target` with untrusted inputs in `run:` steps; an attacker can inject arbitrary shell commands via a PR title or body.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "github-actions-cicd-review",
      "summary": "Checklist to review a GitHub Actions workflow before merge.",
      "body": "---\nname: github-actions-cicd-review\ndescription: Review checklist for GitHub Actions CI/CD workflows covering least-privilege tokens, SHA-pinned actions, OIDC deploys, caching, and matrix builds. Use when creating or editing any file under .github/workflows.\n---\n\n# GitHub Actions CI/CD review\n\n- [ ] Workflow declares a top-level `permissions:` block that is default-deny (`{}` or `contents: read`).\n- [ ] Write scopes (`packages`, `contents`, `id-token`, etc.) are granted per job, not workflow-wide.\n- [ ] Every `uses:` references a full 40-char commit SHA with a `# vX.Y.Z` comment; no `@main` or floating tags.\n- [ ] Dependabot or `pin-github-action` is configured to keep action SHAs current.\n- [ ] Action versions are current: `checkout@v6`, `setup-node@v6`, `cache@v5` or newer.\n- [ ] Dependency caching is enabled (`setup-node` `cache: 'npm'` or a lockfile-keyed `actions/cache`).\n- [ ] Build matrix covers the supported runtime versions and merge protection requires the matrix job.\n- [ ] Cloud deploys use OIDC (`id-token: write` + `role-to-assume`), with no long-lived keys in repo secrets.\n- [ ] OIDC trust policy / `sub` claim is scoped to this repo and branch or environment.\n- [ ] Deploy jobs target a protected GitHub Environment with required reviewers.\n- [ ] A `concurrency` group with `cancel-in-progress: true` prevents overlapping deploy runs.\n- [ ] `pull_request_target` triggers with untrusted-input `run:` steps are absent or carefully sandboxed.\n",
      "skillTags": [
        "github-actions",
        "ci-cd",
        "security",
        "oidc",
        "review"
      ]
    }
  ]
};
