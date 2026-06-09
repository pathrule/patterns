import type { Pattern } from "../types.js";

export const testingVitestPlaywright: Pattern = {
  "slug": "testing-vitest-playwright",
  "version": "1.0.0",
  "name": "Testing (Vitest + Playwright)",
  "tagline": "Unit test behavior with Vitest, drive real user flows with Playwright, and keep both green in CI.",
  "description": "A layered testing setup that splits fast unit and component tests in Vitest from end-to-end browser tests in Playwright. It pushes assertions toward observable behavior and role-based selectors so tests survive refactors, and it wires both suites into CI with coverage, retries, and trace artifacts.",
  "category": "Workflow",
  "icon": "flask-conical",
  "color": "bg-lime-500/10 text-lime-600 dark:bg-lime-400/15 dark:text-lime-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Testing (Vitest + Playwright) pattern for AI coding agents",
  "metaDescription": "A Pathrule pattern that teaches AI coding agents to write Vitest unit tests and Playwright e2e tests the right way: behavior over implementation, stable role-based selectors, and green CI.",
  "problem": "AI-generated tests often assert on implementation details and brittle CSS selectors, so they break on every refactor while missing real user-facing regressions.",
  "audience": "Frontend and full-stack teams running Vitest for units and Playwright for end-to-end on a TypeScript codebase.",
  "prevents": [
    "Brittle e2e tests pinned to CSS classes or DOM structure instead of accessible roles",
    "Unit tests that assert on internal state, private methods, or call counts instead of observable output",
    "Flaky CI runs with no traces, no retries, and no parallelism or sharding"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/tests",
      "/e2e"
    ],
    "stacks": [
      "typescript",
      "vitest",
      "playwright",
      "react",
      "vite"
    ],
    "packages": [
      "vitest",
      "@vitest/coverage-v8",
      "@playwright/test",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "jsdom"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/e2e",
      "title": "Select by role and accessible name, not CSS",
      "summary": "Playwright locators must follow the role-first hierarchy; CSS and XPath are last resort.",
      "body": "End-to-end tests must locate elements the way a user or screen reader does, so they survive markup and styling refactors.\n\n- Reach for `getByRole(name)` first; it is Playwright's recommended locator and doubles as an accessibility check.\n- Fall back in order to `getByLabel`, `getByPlaceholder`, `getByText`, then `getByTestId` only when no semantic handle exists.\n- Do not select by CSS class, tag chains, or XPath; these break on every redesign.\n- Add `data-testid` to the element, not a wrapper, when a test id is genuinely needed.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Test observable behavior, not implementation",
      "summary": "Assert on rendered output and public contracts, never on internal state or private methods.",
      "body": "Unit and component tests must verify what a user or caller observes, so they catch regressions without breaking on internal refactors.\n\n- Assert on rendered DOM, returned values, and emitted events; query with `@testing-library` role and label helpers.\n- Do not assert on component internal state, private methods, or spy call counts when an observable effect exists.\n- Prefer `await screen.findByRole(...)` and `userEvent` interactions over reaching into instances.\n- Reserve mocks for true boundaries (network, time, randomness); never mock the unit under test.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Two-layer test stack: Vitest units, Playwright e2e",
      "summary": "Vitest 4.1 owns fast unit/component tests; Playwright owns real-browser end-to-end flows.",
      "body": "We run two distinct layers so each test sits at the right altitude. Keep them separate; do not drive full app flows from Vitest or unit-test pure logic through Playwright.\n\n- Unit and component tests live in `/src` next to source or in `/tests`, run under Vitest 4.1 with `environment: 'jsdom'` (or `happy-dom`) and `@testing-library/react`.\n- End-to-end tests live in `/e2e`, run under `@playwright/test` against a real browser via the `webServer` config that boots the app.\n- Vitest 4 defaults coverage to `v8`; set `coverage.include` explicitly since `coverage.all` was removed in v4.\n- Heavy component-interaction tests can use Vitest Browser Mode (stable since v4) instead of jsdom when DOM fidelity matters.\n\nSee /e2e for the Playwright selector rule and /src for the behavior-testing rule.",
      "skillTags": []
    },
    {
      "kind": "memory",
      "nodePath": "/e2e",
      "title": "Playwright CI config: parallel, retries, traces, sharding",
      "summary": "How the e2e suite is wired for stable, debuggable CI runs.",
      "body": "Our `playwright.config.ts` is tuned so CI failures are reproducible and fast. Match these settings when adding projects or jobs.\n\n- `fullyParallel: true`, `workers` left to default locally and capped in CI, `retries: process.env.CI ? 2 : 0`.\n- `trace: 'on-first-retry'` so a failing test ships a full trace (network, DOM snapshots, timeline) without slowing green runs.\n- `webServer` boots the app with `reuseExistingServer: !process.env.CI` so local runs reuse a running dev server and CI always starts clean.\n- Large suites split across runners with `--shard=index/total`; merge the blob reports afterward for one HTML report.\n- Open the Trace Viewer (`npx playwright show-trace`) before editing any flaky test.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "testing-vitest-playwright-review",
      "summary": "Pre-merge checklist for Vitest unit tests and Playwright e2e tests.",
      "body": "---\nname: testing-vitest-playwright-review\ndescription: Review checklist for any change that adds or edits Vitest unit/component tests or Playwright e2e tests. Confirms tests assert behavior, use stable role-based selectors, and run reliably in CI.\n---\n\n# Testing (Vitest + Playwright) review\n\n- [ ] New logic and components have Vitest tests; new user flows have a Playwright e2e test.\n- [ ] Assertions target observable output (rendered DOM, return values, events), not internal state or private methods.\n- [ ] Component queries use `@testing-library` role/label helpers and `userEvent`, not container DOM traversal.\n- [ ] Playwright locators follow the hierarchy: `getByRole` first, then label/placeholder/text, `getByTestId` last, no raw CSS or XPath.\n- [ ] Mocks are limited to real boundaries (network, time, randomness); the unit under test is never mocked.\n- [ ] Async work is awaited via `findBy*` / web-first `expect` assertions, with no fixed `sleep`/`waitForTimeout` waits.\n- [ ] Vitest `coverage.include` is set and coverage does not regress; provider is `v8`.\n- [ ] Playwright config keeps `trace: 'on-first-retry'`, CI `retries: 2`, `fullyParallel`, and a `webServer` entry.\n- [ ] Tests are deterministic and isolated: one context per e2e test, no shared mutable fixtures, no order dependence.\n- [ ] CI runs both suites and uploads Playwright traces/reports as artifacts.\n",
      "skillTags": [
        "testing",
        "vitest",
        "playwright",
        "e2e",
        "ci",
        "review"
      ]
    }
  ]
};
