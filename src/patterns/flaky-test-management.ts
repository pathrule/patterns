import type { Pattern } from "../types.js";

export const flakyTestManagement: Pattern = {
  "slug": "flaky-test-management",
  "version": "1.0.0",
  "name": "Flaky Test Management",
  "tagline": "Detect, quarantine, diagnose, own, and eliminate nondeterministic tests without normalizing retries.",
  "description": "A flaky test has at least two outcomes for the same intended inputs because time, order, shared state, concurrency, network, environment, randomness, or the product itself is nondeterministic. This pattern constrains retry interpretation, records quarantine and evidence ownership, and supplies separate flake-triage and repair-verification procedures. It complements the Vitest and Playwright pattern by focusing on organizational and diagnostic handling after tests exist, independent of the specific test runner.",
  "category": "Workflow",
  "icon": "test-tube-diagonal",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Flaky test management pattern for AI agents",
  "metaDescription": "Flaky-test detection, retry evidence, quarantine policy, ownership, order and timing diagnosis, deterministic repair, and confidence verification.",
  "problem": "AI agents often add retries until CI turns green, increase timeouts without identifying the missing condition, or delete an intermittent test that is exposing a real product race.",
  "audience": "Engineering teams maintaining CI suites whose intermittent failures slow or undermine releases",
  "prevents": [
    "Counting a retry pass as a clean test result",
    "Leaving quarantined tests without owner or repair deadline",
    "Masking a product race as test-only instability",
    "Declaring a low-frequency flake repaired after one passing run"
  ],
  "appliesTo": {
    "paths": [
      "/tests",
      "/.github/workflows",
      "/docs/testing"
    ],
    "stacks": [
      "flaky-tests",
      "testing",
      "ci-cd",
      "debugging",
      "quality"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Retries collect evidence but never erase failure",
      "summary": "Record first-attempt failure, retry count, final outcome, seed, order, worker, shard, timing, and artifacts as a flaky result.",
      "body": "Retries can keep a pipeline moving while hiding reliability loss. A pass on retry proves nondeterminism or changed conditions, not correctness of the first execution.\n\n- Mark the test and job as flaky or unstable when any attempt fails, even if a later attempt passes.\n- Preserve logs, screenshots, traces, video, network evidence, seed, test order, worker, shard, platform, and timing from the first failure.\n- Use a small bounded retry count only where the team accepts the release tradeoff; do not apply unlimited or suite-wide retries silently.\n- Track first-attempt pass rate and flake frequency by stable test identity so chronic failures cannot disappear in aggregate green status.\n\nSee /docs/testing for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/testing",
      "title": "Quarantine is a visible temporary risk decision",
      "summary": "Move a test out of the blocking lane only with an owner, reason, evidence link, scope, and expiry or repair target.",
      "body": "A quarantined test no longer protects the main release path. Without explicit ownership and visibility, quarantine becomes deletion with extra syntax.\n\n- Keep the test running in a non-blocking lane when possible so frequency and artifacts continue to accumulate.\n- Record whether the suspected risk is test-only or product behavior and what coverage is temporarily missing.\n- Assign an owner and review or expiry date and surface overdue quarantine in the same engineering workflow as other release risks.\n- Restore blocking status only after the causal repair passes confidence verification under the triggering conditions.\n\nSee /tests for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/docs/testing",
      "title": "Flake classes guide the first experiment",
      "summary": "Classify timing, order, state, concurrency, network, resource, randomness, environment, and product races before changing assertions.",
      "body": "Different flake classes require different evidence. Increasing a timeout cannot repair state leakage, and clearing shared storage cannot repair an event-order race.\n\n- Timing flakes wait for elapsed time instead of observable state; replace sleeps with bounded condition or event synchronization.\n- Order and state flakes depend on prior tests, shared accounts, caches, files, ports, databases, or globals; randomize order and isolate ownership.\n- Concurrency and product races require controlled interleaving and event evidence; do not weaken assertions until the product invariant is understood.\n- Environment and resource flakes correlate with runner, shard, CPU, memory, clock, browser, network, or dependency saturation and need those dimensions captured.\n\nSee /.github/workflows for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "triage-flaky-test",
      "summary": "Capture the failure, estimate frequency, classify nondeterminism, choose quarantine, and assign one falsifiable experiment.",
      "body": "---\nname: triage-flaky-test\ndescription: Triage a test that passes and fails across repeated or CI executions.\n---\n\n# Triage Flaky Test\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Preserve the first failing artifacts and identify stable test, revision, environment, shard, worker, seed, order, timing, and dependency state.\n- [ ] Repeat under the same conditions enough to estimate frequency, then vary one dimension such as order, worker count, load, clock, or network.\n- [ ] Classify the dominant flake mechanism and decide whether the intermittent behavior is in the product, test, fixture, environment, or dependency.\n- [ ] Quarantine only when release risk requires it and attach owner, reason, missing coverage, evidence, and review deadline.\n- [ ] State one hypothesis with a predicted result and implement the smallest diagnostic probe before changing waits, retries, or assertions.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "flaky-tests",
        "triage",
        "debugging",
        "ci",
        "evidence"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-flake-repair",
      "summary": "Run the triggering conditions at sufficient repetition and concurrency, then remove retries and quarantine with preserved evidence.",
      "body": "---\nname: verify-flake-repair\ndescription: Verify that a flaky-test repair removed the causal nondeterminism rather than lowering observation probability.\n---\n\n# Verify Flake Repair\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Reproduce the old failure on the prior code with the captured seed, order, state, timing, load, and environment or document why exact replay is impossible.\n2. Apply the targeted synchronization, isolation, ownership, or product fix without weakening the asserted behavior.\n3. Run focused repetitions and parallel or shuffled suites at a volume justified by the prior flake frequency and release risk.\n4. Run the ordinary full CI matrix without retry assistance and monitor first-attempt results after merge.\n5. Remove quarantine and temporary diagnostics, retain a stable regression signal, and document the cause and confidence evidence.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "flaky-tests",
        "verification",
        "determinism",
        "testing",
        "ci"
      ]
    }
  ]
};
