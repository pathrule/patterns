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
      "summary": "Playwright locators must follow the role-first hierarchy; CSS and XPath selectors are a last resort.",
      "body": "End-to-end tests must locate elements the way a user or screen reader does so they survive markup and styling refactors.\n\n- Reach for `page.getByRole('button', { name: 'Submit' })` first; it is Playwright's recommended locator and doubles as an accessibility check.\n- Fall back in order to `getByLabel`, `getByPlaceholder`, `getByText`, then `getByTestId` only when no semantic handle exists.\n- Do not select by CSS class, tag chain, or XPath; these break on every redesign.\n- Add `data-testid` to the interactive element itself, not a wrapper, when a test id is genuinely needed.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Assert observable behavior, not implementation details",
      "summary": "Unit and component tests must verify rendered output and public contracts, never internal state or spy call counts.",
      "body": "Tests that assert on implementation details break on every refactor while missing real regressions.\n\n- Assert on rendered DOM, return values, and emitted events; query with `@testing-library` role and label helpers.\n- Do not assert on component internal state, private methods, or mock call counts when an observable effect exists to verify instead.\n- Prefer `await screen.findByRole(...)` and `userEvent` interactions over manually reaching into component instances.\n- Reserve mocks for true external boundaries (network, timers, randomness); never mock the unit under test.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/e2e",
      "title": "Use auto-retrying assertions; ban fixed-time waits",
      "summary": "Fixed sleeps and waitForTimeout make tests flaky and slow; Playwright's web-first assertions retry automatically.",
      "body": "Flakiness almost always traces back to tests that use fixed delays instead of waiting for a condition to be true.\n\n- Use `expect(locator).toBeVisible()`, `toHaveText()`, `toBeEnabled()`, and similar web-first assertions; they auto-retry until the timeout with no sleep needed.\n- Do not use `page.waitForTimeout(ms)` or `sleep`/`setTimeout` calls in test code; they set an arbitrary floor that is either too short (flaky) or too long (slow).\n- Use `page.waitForResponse()` or `waitForURL()` to gate on network or navigation events rather than sleeping after an action.\n- Set a `timeout` on the assertion itself when a specific operation is known to be slow rather than adding a blanket sleep before it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Two-layer test stack: Vitest units, Playwright e2e",
      "summary": "Vitest owns fast unit and component tests; Playwright owns real-browser end-to-end flows. Keep layers separate.",
      "body": "We run two distinct layers so each test sits at the right altitude. Do not drive full app flows from Vitest or unit-test pure logic through Playwright.\n\n- Unit and component tests live in `/src` next to source or in a `/tests` mirror, run under Vitest with `environment: 'jsdom'` (or `happy-dom`) and `@testing-library/react`.\n- End-to-end tests live in `/e2e`, run under `@playwright/test` against a real browser via the `webServer` config entry that boots the app before the suite.\n- Vitest Browser Mode (stable since Vitest 3) is appropriate for component tests that need real DOM fidelity without a full browser context; use it instead of jsdom when CSS layout or focus management matters.\n- Coverage uses the `v8` provider via `@vitest/coverage-v8`; set `coverage.include` explicitly since `coverage.all` was removed in Vitest 3.\n\nSee /e2e for Playwright selector and wait rules, and /src for the behavior-testing rule."
    },
    {
      "kind": "memory",
      "nodePath": "/e2e",
      "title": "Playwright CI config: parallel, retries, traces, sharding",
      "summary": "How the e2e suite is wired for stable and debuggable CI runs.",
      "body": "Our `playwright.config.ts` is tuned so CI failures are reproducible and the suite scales. Match these settings when adding projects or CI jobs.\n\n- `fullyParallel: true`, workers left to Playwright's default locally, `retries: process.env.CI ? 2 : 0`.\n- `trace: 'on-first-retry'` ships a full trace (network timeline, DOM snapshots, action log) for the first retry without slowing down green runs.\n- `webServer` boots the app with `reuseExistingServer: !process.env.CI` so local runs reuse a running dev server and CI always starts clean.\n- For large suites, split across runners with `--shard=1/4` etc. and merge blob reports with `npx playwright merge-reports` for one combined HTML report.\n- Before editing a flaky test, open its trace with `npx playwright show-trace trace.zip` to see the exact failure frame; do not guess."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "testing-vitest-playwright-review",
      "summary": "Pre-merge checklist for Vitest unit tests and Playwright end-to-end tests.",
      "body": "---\nname: testing-vitest-playwright-review\ndescription: Review checklist for any change that adds or edits Vitest unit/component tests or Playwright e2e tests. Confirms tests assert behavior, use stable role-based selectors, avoid fixed-time waits, and run reliably in CI.\n---\n\n# Testing (Vitest + Playwright) review\n\n## Coverage and placement\n\n- [ ] New logic and components have Vitest tests; new user flows have a Playwright e2e test.\n- [ ] Vitest tests live in `/src` or `/tests`; Playwright tests live in `/e2e`. Neither layer is used at the wrong altitude.\n\n## Vitest (unit / component)\n\n- [ ] Assertions target observable output (rendered DOM, return values, events), not internal state or private methods.\n- [ ] Component queries use `@testing-library` role and label helpers with `userEvent`; no raw container traversal.\n- [ ] Mocks are limited to real boundaries (network, timers, randomness); the unit under test is never mocked.\n- [ ] `coverage.include` is set and coverage does not regress; provider is `v8`.\n\n## Playwright (e2e)\n\n- [ ] Locators follow the hierarchy: `getByRole` first, then label/placeholder/text, `getByTestId` last, no raw CSS or XPath.\n- [ ] Assertions use web-first matchers (`toBeVisible`, `toHaveText`, `toBeEnabled`); no `waitForTimeout` or fixed-sleep calls.\n- [ ] Async navigation/network waits use `waitForURL` or `waitForResponse`, not a sleep after an action.\n- [ ] Tests are isolated: one browser context per test, no shared mutable state, no order dependence.\n\n## CI configuration\n\n- [ ] Playwright config has `trace: 'on-first-retry'`, `retries: 2` in CI, `fullyParallel: true`, and a `webServer` entry.\n- [ ] CI runs both suites and uploads Playwright trace artifacts on failure.\n- [ ] Large suites use `--shard` across runners and merge blob reports.\n",
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
