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
      "body": "Each PR should do one thing and stay reviewable in a single focused pass.\n\n- Target under ~400 changed lines of meaningful diff; split larger work into stacked PRs that build on each other.\n- Never mix a refactor, a feature, and reformatting in the same PR — separate them so each diff has one intent.\n- Exclude generated files, lockfile churn, and bulk renames from logic PRs, or call them out explicitly in the description.\n- If a change cannot be split, write a `## Why this is large` note so the reviewer knows it is intentional.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Review for correctness and security, automate style",
      "summary": "Human review focuses on logic and risk, not formatting.",
      "body": "Reserve reviewer attention for what tools cannot catch: correctness, security, and long-term maintainability.\n\n- Let formatters and linters (`prettier`, `eslint`) own style; never leave a style nit that automation should enforce.\n- Verify external input is validated and escaped at trust boundaries to block injection, XSS, and path-traversal classes.\n- Confirm error and edge paths are handled and that no secrets, tokens, or credentials are committed.\n- Use `nit:` for optional polish and `issue:` for blocking concerns so authors can tell what must change before merge.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Fast turnaround keeps reviews unblocking",
      "summary": "Respond within one business day; optimize response time, not total time.",
      "body": "What slows teams down is reviewer response time, not total review duration, so we keep the first response fast.\n\n- Respond to a review request within one business day; if mid-focus, do it at the next natural break, ideally same day.\n- For distributed teams, aim feedback inside the author's working hours so a late reply does not cost a full day across regions.\n- If a PR is solid and only minor comments remain, approve with `LGTM, nits aside` instead of blocking another round.\n- When a PR is too large to review promptly, ask the author to split it rather than letting it sit."
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Give specific, kind, conventional feedback",
      "summary": "Label comments by intent and critique the code, not the author.",
      "body": "Structured comments make intent obvious and keep review collegial, following the Conventional Comments labels.\n\n- Prefix each comment with its kind: `issue:`, `suggestion:`, `question:`, `nit:`, or `praise:` so the author knows what is blocking.\n- Be specific: point at the line and the concrete risk, and propose an alternative rather than just flagging a problem.\n- Critique the code path, not the person; reserve `nit:` for trivial preference and never let nits block a merge.\n- Note positives with `praise:` too, so reviews reinforce good patterns and not only defects."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "code-review-review",
      "summary": "Author self-check to run before requesting review on any PR.",
      "body": "---\nname: code-review-review\ndescription: Author self-review checklist to run before requesting review on a pull request. Confirms scope, description, correctness, security, and tests so the first reviewer pass is fast.\n---\n\n# Code review self-check\n\n## Scope and description\n\n- [ ] The PR does one thing; unrelated refactors and reformatting are in separate PRs.\n- [ ] Diff is roughly under 400 meaningful lines, or a `## Why this is large` note explains why not.\n- [ ] Title and description state the what and the why, and link the issue or ticket.\n\n## Correctness\n\n- [ ] The code does what the description claims, and I have run it or the tests locally.\n- [ ] Edge cases and error paths are handled, not just the happy path.\n- [ ] No leftover debug logs, commented-out code, or TODOs without a tracking link.\n\n## Security\n\n- [ ] External input is validated and escaped at trust boundaries (injection, XSS, path traversal).\n- [ ] No secrets, tokens, or credentials are committed; config comes from env or a secret store.\n- [ ] Authz checks gate any new endpoint, mutation, or data access.\n\n## Tests and automation\n\n- [ ] New behavior has tests; changed behavior has updated tests.\n- [ ] Linters and formatters pass, so no style nits reach the reviewer.\n- [ ] CI is green before I hit request review.\n",
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
