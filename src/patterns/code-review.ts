import type { Pattern } from "../types.js";

export const codeReview: Pattern = {
  "slug": "code-review",
  "version": "1.0.0",
  "name": "Code Review",
  "tagline": "Ship small pull requests that reviewers can approve fast with confidence.",
  "description": "A workflow bundle that keeps code review focused on correctness, security, and maintainability instead of style nits. It encodes small-PR discipline, an author self-check before requesting review, structured reviewer feedback, and a fast turnaround norm so changes merge in hours, not days.",
  "category": "Workflow",
  "icon": "git-pull-request",
  "color": "bg-green-500/10 text-green-600 dark:bg-green-400/15 dark:text-green-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Code Review pattern for AI coding agents | Pathrule",
  "metaDescription": "A Pathrule workflow pattern that teaches AI coding agents to ship small PRs, self-check before review, give specific feedback, and keep turnaround fast.",
  "problem": "Pull requests pile up because they are too large, mix unrelated changes, and trigger slow rounds of vague review feedback.",
  "audience": "Engineering teams using PR-based GitHub or GitLab workflows with human and AI reviewers",
  "prevents": [
    "Oversized PRs that mix refactors, features, and formatting in one review",
    "Style and lint nits crowding out correctness and security feedback",
    "Reviews stalling for days because turnaround has no agreed norm"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/src",
      "/.github"
    ],
    "stacks": [
      "github",
      "gitlab",
      "git",
      "ci"
    ],
    "packages": [
      "eslint",
      "prettier",
      "husky"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Keep pull requests small and single-purpose",
      "summary": "Cap PR scope so reviewers can finish in one sitting.",
      "body": "Each PR should do one thing and stay reviewable in a single focused pass.\n\n- Target under ~400 changed lines of meaningful diff; split larger work into stacked PRs that build on each other.\n- Never mix a refactor, a feature, and reformatting in the same PR; separate them so each diff has one clear intent.\n- Exclude generated files, lockfile churn, and bulk renames from logic PRs, or call them out explicitly in the description.\n- If a change cannot be split, add a `## Why this is large` section to the PR body so the reviewer knows it is intentional.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Review for correctness and security; delegate style to automation",
      "summary": "Human and AI review focuses on logic and risk, not formatting.",
      "body": "Reserve reviewer attention for what tools cannot catch: correctness, security, and long-term maintainability.\n\n- Let formatters and linters (Prettier, ESLint) own style; never block a merge on a style nit that automation should enforce.\n- Verify external input is validated and escaped at trust boundaries to prevent injection, XSS, and path-traversal.\n- Confirm error and edge paths are handled and that no secrets, tokens, or credentials are committed.\n- Use `nit:` for optional polish and `issue:` for blocking concerns so authors know what must change before merge.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/.github",
      "title": "PR descriptions state the what, why, and how to test",
      "summary": "A reviewable PR must have enough context that a reviewer can test and approve without asking the author.",
      "body": "A PR that lands without context becomes permanent archaeology. Require every PR to carry a useful description.\n\n- The title is a single imperative sentence summarising the change; it should also be a valid Conventional Commit subject if the team uses squash merge.\n- The body must explain the motivation (the 'why'), a short description of the approach, and a testing section listing how to verify the change manually or via CI.\n- Link the associated issue or ticket so the decision trail is traceable.\n- Screenshots or screen recordings are required for any UI change so reviewers do not have to check out the branch.",
      "scopeType": "project",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Structured feedback labels and turnaround norms",
      "summary": "Label every review comment by intent and respond within one business day.",
      "body": "Two things keep review healthy: clear comment intent and fast response time. Both are non-obvious and worth encoding.\n\n- Prefix each comment with its kind: `issue:` (blocking), `suggestion:` (non-blocking improvement), `question:` (needs clarification), `nit:` (trivial preference), or `praise:` (call out good work). This follows Conventional Comments labelling.\n- Critique the code path, not the person; propose an alternative rather than just flagging a problem.\n- Respond to a review request within one business day. If only minor comments remain, approve with 'LGTM, nits aside' rather than blocking another full round.\n- When a PR is too large to review promptly, ask the author to split it rather than letting it sit without feedback."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "code-review-review",
      "summary": "Author self-check to run before requesting review on any PR.",
      "body": "---\nname: code-review-review\ndescription: Author self-review checklist to run before requesting review on a pull request. Confirms scope, description, correctness, security, and tests so the first reviewer pass is fast and unblocked.\n---\n\n# Code review self-check\n\n## Scope and description\n\n- [ ] The PR does one thing; unrelated refactors and reformatting are in separate PRs.\n- [ ] Diff is roughly under 400 meaningful lines, or a `## Why this is large` note explains why not.\n- [ ] Title is a single imperative sentence; body states the motivation, approach, and how to verify.\n- [ ] Issue or ticket is linked.\n- [ ] UI changes include a screenshot or recording.\n\n## Correctness\n\n- [ ] The code does what the description claims, and I have run it or the tests locally.\n- [ ] Edge cases and error paths are handled, not just the happy path.\n- [ ] No leftover debug logs, commented-out code, or TODOs without a tracking link.\n\n## Security\n\n- [ ] External input is validated and escaped at trust boundaries (injection, XSS, path traversal).\n- [ ] No secrets, tokens, or credentials are committed; config comes from env or a secret store.\n- [ ] Authorization checks gate any new endpoint, mutation, or data access.\n\n## Tests and automation\n\n- [ ] New behavior has tests; changed behavior has updated tests.\n- [ ] Linters and formatters pass so no style nits reach the reviewer.\n- [ ] CI is green before I request review.\n",
      "skillTags": [
        "code-review",
        "workflow",
        "pull-request",
        "checklist",
        "self-review"
      ]
    }
  ]
};
