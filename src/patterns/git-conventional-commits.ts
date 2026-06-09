import type { Pattern } from "../types.js";

export const gitConventionalCommits: Pattern = {
  "slug": "git-conventional-commits",
  "version": "1.0.0",
  "name": "Git & Conventional Commits",
  "tagline": "Keep history readable and releases automatic with small commits and Conventional Commits.",
  "description": "A workflow bundle that standardizes how AI agents and humans commit, branch, and open pull requests. It enforces the Conventional Commits v1.0.0 spec, short-lived branches off main, and small reviewable PRs so changelogs and version bumps can be generated automatically.",
  "category": "Workflow",
  "icon": "git-commit-horizontal",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Git & Conventional Commits for AI coding agents",
  "metaDescription": "Teach AI coding agents to write Conventional Commits, keep branches short-lived, and ship small reviewable PRs so changelogs and semantic versions stay automatic.",
  "problem": "AI agents and humans write inconsistent commit messages and oversized PRs, breaking automated changelogs and making history impossible to review.",
  "audience": "Product teams on GitHub Flow or trunk-based development that automate releases from commit history.",
  "prevents": [
    "Vague commit subjects like 'fix stuff' that break automated changelogs",
    "Giant 1000-line PRs that nobody can review properly",
    "Rebasing already-pushed shared branches and forcing teammates to re-clone"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/.github",
      "/src"
    ],
    "stacks": [
      "git",
      "github",
      "conventional-commits",
      "ci-cd"
    ],
    "packages": [
      "@commitlint/cli",
      "@commitlint/config-conventional",
      "lefthook",
      "release-please"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Commit messages follow Conventional Commits v1.0.0",
      "summary": "Every commit subject uses a typed prefix and stays under 52 characters.",
      "body": "Format every commit as `<type>[optional scope][!]: <description>` per Conventional Commits v1.0.0 so release-please can derive versions and generate changelogs automatically.\n\n- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.\n- Subject in imperative mood, lowercase after the colon, no trailing period, at most 52 characters; wrap body at 72.\n- `feat` maps to a MINOR semver bump and `fix` to a PATCH; signal breaking changes with `!` after the type or a `BREAKING CHANGE:` footer for a MAJOR bump.\n- Add a scope in parentheses when it clarifies the area, for example `fix(auth): refresh token before expiry`.\n- This is enforced by commitlint in a lefthook `commit-msg` hook and repeated on the PR title since squash merge turns the PR title into the landed commit.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Short-lived branches, squash merge, no rebase of pushed branches",
      "summary": "Branch off main, squash merge PRs, never rebase commits already pushed to a shared branch.",
      "body": "Keep integration cheap and history linear by coupling short-lived branches with squash merge.\n\n- Cut branches from `main` and merge them back within a day or two; PRs stay under ~400 changed lines.\n- Squash merge every PR so it lands as a single Conventional Commit on `main`; the PR title becomes that commit and must pass commit linting.\n- Rebase your local branch onto `main` to stay current before opening a PR, but never rebase a branch others have already pulled.\n- One logical change per PR so reverts are a single `git revert` with no collateral damage.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/.github",
      "title": "Commit automation stack: commitlint + lefthook + release-please",
      "summary": "How local hooks, CI title checks, and release-please wire together for zero-manual changelogs.",
      "body": "Commit hygiene is enforced at three choke points: the local commit hook, the CI PR-title check, and the release pipeline.\n\n- `@commitlint/cli` with `@commitlint/config-conventional` validates messages via a `lefthook` `commit-msg` hook, so a bad message is rejected before it is committed.\n- Because we squash merge, the PR title becomes the final commit subject. A GitHub Actions workflow lints the PR title against the same rules using `amannn/action-semantic-pull-request`.\n- `release-please` watches commits on `main`, computes the semver bump from the highest type (`feat` = MINOR, `fix` = PATCH, `!` or `BREAKING CHANGE` = MAJOR), opens a release PR with a generated `CHANGELOG.md`, and cuts the GitHub Release on merge.\n- Keep `lefthook.yml` and `commitlint.config.ts` at the repo root; keep GitHub Actions workflows under `/.github/workflows`.\n- A `feat!: description` commit, or any commit with a `BREAKING CHANGE:` footer, triggers a MAJOR bump and requires explicit team acknowledgment before merge."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "git-conventional-commits-review",
      "summary": "Pre-commit and pre-PR checklist for clean commits and reviewable pull requests.",
      "body": "---\nname: git-conventional-commits-review\ndescription: Checklist to run before committing and before opening a PR so commits follow Conventional Commits v1.0.0, branches stay short-lived, and PRs are small and reviewable. Use when writing a commit, opening a pull request, or auditing git history hygiene.\n---\n\n# Git & Conventional Commits review\n\n## Commit message\n\n- [ ] Subject matches `<type>[scope][!]: <description>` using an allowed type (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`).\n- [ ] Subject is imperative mood, lowercase after the colon, no trailing period, and at most 52 characters.\n- [ ] Body (if present) explains the why, wraps at 72 characters, and references issues in the footer.\n- [ ] Breaking changes are flagged with `!` or a `BREAKING CHANGE:` footer so the MAJOR bump is computed correctly.\n\n## Branch and PR hygiene\n\n- [ ] Branch is short-lived and freshly rebased onto `main`; no rebase of commits already pushed to a shared branch.\n- [ ] PR is under ~400 changed lines, or has a clear note explaining why it is larger.\n- [ ] PR does one logical thing; unrelated changes are in separate branches.\n- [ ] PR title is itself a valid Conventional Commit, since squash merge turns it into the landed commit on `main`.\n\n## Automation\n\n- [ ] `commitlint` passes locally (lefthook `commit-msg` hook ran without error).\n- [ ] PR-title lint check is green in CI.\n- [ ] If a `BREAKING CHANGE` or `feat!` is included, the team has explicitly acknowledged the MAJOR semver bump.\n",
      "skillTags": [
        "git",
        "conventional-commits",
        "code-review",
        "ci-cd",
        "release"
      ]
    }
  ]
};
