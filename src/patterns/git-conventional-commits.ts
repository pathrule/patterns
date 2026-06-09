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
      "summary": "Every commit subject uses a Conventional Commits type and stays under 50 characters.",
      "body": "Format every commit as `<type>[optional scope][!]: <description>` per Conventional Commits v1.0.0 so `release-please` can derive versions and changelogs.\n\n- Use only these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.\n- Keep the subject in imperative mood, lowercase after the colon, no trailing period, and at most 50 characters; wrap the body at 72.\n- A `feat` maps to a MINOR bump and a `fix` to a PATCH; signal breaking changes with a `!` after the type or a `BREAKING CHANGE:` footer for a MAJOR bump.\n- Add a scope in parentheses when it clarifies the area, for example `fix(auth): refresh token before expiry`.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Short-lived branches and small focused PRs",
      "summary": "Branch off main, keep PRs under ~400 lines, and never rebase pushed shared branches.",
      "body": "Work on short-lived branches cut from `main` and merge them back within a day or two to keep integration cheap.\n\n- Target under ~400 changed lines per PR; split larger work into stacked or sequential PRs.\n- One logical change per PR so reviews are fast and reverts are clean.\n- Rebase your local branch onto `main` to stay current, but never rebase a branch others have already pulled.\n- Use squash merge so each PR lands as a single Conventional Commit on `main`; the PR title becomes that commit and must pass commit linting.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Rebase vs merge decision guide",
      "summary": "When to rebase, when to merge, and the one rule you must never break.",
      "body": "Pick the integration strategy by branch lifecycle, not by habit.\n\n- Rebase private short-lived feature branches onto `main` before opening or updating a PR to keep a linear, bisectable history.\n- Use a true merge (no rebase) for long-lived branches like a release branch going back into `main`, preserving collaboration context.\n- The hard rule: never rebase commits already pushed to a shared branch, since rewriting public history forces teammates to force-pull or re-clone.\n- Prefer squash merge for PR landings so the merged result is one clean Conventional Commit regardless of messy intermediate commits.",
      "scopeType": "project"
    },
    {
      "kind": "memory",
      "nodePath": "/.github",
      "title": "Commit and release automation stack",
      "summary": "How commitlint, lefthook, and release-please wire together in CI.",
      "body": "Commit hygiene is enforced locally and in CI, then drives automated releases.\n\n- `@commitlint/cli` with `@commitlint/config-conventional` validates messages; run it from a `lefthook` `commit-msg` hook so bad messages never get committed.\n- Because we squash merge, the PR title becomes the commit, so lint PR titles in a GitHub Action against the same Conventional Commits rules.\n- `release-please` parses Conventional Commits on `main`, opens a release PR with the computed semver bump and generated `CHANGELOG.md`, and cuts the GitHub release on merge.\n- Keep `lefthook.yml` and the commitlint config at the repo root; keep the release-please and PR-title-lint workflows under `/.github/workflows`.",
      "scopeType": "project"
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "git-conventional-commits-review",
      "summary": "Pre-commit and pre-PR checklist for clean commits and reviewable pull requests.",
      "body": "---\nname: git-conventional-commits-review\ndescription: Checklist to run before committing and before opening a PR so commits follow Conventional Commits v1.0.0, branches stay short-lived, and PRs stay small and reviewable. Use when writing a commit, opening a pull request, or reviewing git history hygiene.\n---\n\n# Git & Conventional Commits review\n\n- [ ] Subject matches `<type>[scope][!]: <description>` using an allowed type (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`).\n- [ ] Subject is imperative mood, lowercase after the colon, no trailing period, and at most 50 characters.\n- [ ] Body (if present) explains the why, wraps at 72 characters, and references issues in the footer.\n- [ ] Breaking changes are flagged with `!` or a `BREAKING CHANGE:` footer so the MAJOR bump is correct.\n- [ ] The change is one logical unit; unrelated changes are split into separate commits or PRs.\n- [ ] Branch is short-lived and freshly rebased onto `main`, with no rebase of commits already pushed to a shared branch.\n- [ ] PR is under ~400 changed lines, or has a clear plan to split it.\n- [ ] PR title is itself a valid Conventional Commit, since squash merge turns it into the landed commit.\n- [ ] `commitlint` and the PR-title lint check pass locally and in CI before requesting review.\n",
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
