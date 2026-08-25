import type { Pattern } from "../types.js";

export const documentationEngineering: Pattern = {
  "slug": "documentation-engineering",
  "version": "1.0.0",
  "name": "Documentation Engineering",
  "tagline": "Treat operational and developer documentation as owned, testable interfaces that change with the system.",
  "description": "Documentation engineering keeps knowledge useful by assigning each page a user task, content type, owner, source of truth, validation method, and review trigger. This bundle separates tutorials, how-to guides, reference, and explanation while linking docs to executable evidence and code changes. Unlike Code Review, it governs the maintained knowledge interface rather than the review of implementation changes.",
  "category": "Workflow",
  "icon": "book-marked",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Documentation engineering for AI coding agents",
  "metaDescription": "Owned tutorials, how-to guides, reference, and explanation with executable examples, source links, change triggers, validation, and stale-content removal.",
  "problem": "Agents write one page for several audiences, copy facts from code without a source link, and update implementation while commands, examples, and runbooks silently decay.",
  "audience": "Teams maintaining developer guides, operational runbooks, API references, and architectural explanation",
  "prevents": [
    "Pages mixing learning, task, reference, and explanation goals",
    "Examples and commands that are never executed in CI",
    "Documentation with no owner, review trigger, or removal path"
  ],
  "appliesTo": {
    "paths": [
      "/docs",
      "/src",
      "/tests"
    ],
    "stacks": [
      "documentation",
      "developer-experience",
      "runbooks",
      "docs-as-code"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/docs",
      "title": "Change documentation with the interface it describes",
      "summary": "A code or configuration change updates every affected guide, reference, example, runbook, and generated artifact in the same review.",
      "body": "A code or configuration change updates every affected guide, reference, example, runbook, and generated artifact in the same review. Deferring docs creates a period where the official path instructs users or operators to run behavior the system no longer supports. Enforce this boundary in /docs so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Name documentation paths in ownership and change templates for public APIs, commands, configuration, operations, and deprecations.\n- Link hand-written claims to source code, schema, tests, or an authoritative external source so reviewers can verify them.\n- Execute commands, snippets, links, and example projects in automation where practical; clearly mark outcomes that require manual evidence.\n- Delete or redirect obsolete pages instead of leaving several apparently current answers.\n\nVerification: Change a documented command, configuration key, response field, and runbook step in fixtures; confirm ownership and automated checks identify every affected page.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/docs",
      "title": "Each page serves one documentation need",
      "summary": "Tutorials support learning, how-to guides complete a task, reference describes the system, and explanation builds understanding; mixing them hides the answer each reader needs.",
      "body": "Tutorials support learning, how-to guides complete a task, reference describes the system, and explanation builds understanding; mixing them hides the answer each reader needs. Choose the primary need before writing and structure navigation so readers can move between the four types without repeating the same content.\n\nKeep tutorials safe and staged rather than exhaustive. Make how-to guides goal-oriented with prerequisites and verification. Generate reference from source where possible and reserve explanation for tradeoffs, rationale, and boundaries. Keep the decision explicit at /docs; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src for source-of-truth links and /tests for executable examples. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/tests",
      "title": "Examples are compatibility contracts",
      "summary": "Users copy examples more often than prose, so a compiling but unexecuted snippet can still encode unsafe, incomplete, or obsolete behavior.",
      "body": "Users copy examples more often than prose, so a compiling but unexecuted snippet can still encode unsafe, incomplete, or obsolete behavior. Store substantial examples as tested fixtures or small projects and import their rendered form into docs when tooling permits.\n\nRun examples against supported versions and validate their observable result, not just syntax. Include failure handling, cleanup, authentication, and production constraints that a copied happy path needs. Retire examples with the interface they teach and keep versioned docs only where users still operate that version. Keep the decision explicit at /tests; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /docs for reader context and the release management pattern for versioned change. That related boundary consumes this decision and carries the evidence that proves it still holds."
    }
  ]
};
