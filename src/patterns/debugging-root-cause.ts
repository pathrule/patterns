import type { Pattern } from "../types.js";

export const debuggingRootCause: Pattern = {
  "slug": "debugging-root-cause",
  "version": "1.0.0",
  "name": "Debugging and Root Cause Analysis",
  "tagline": "Turn vague failures into reproducible evidence, competing hypotheses, controlled tests, and verified causes.",
  "description": "Debugging slows down when teams change several things at once, mistake correlation for cause, trust stale logs, or stop at the first local fix without explaining why the system entered the failing state. This pattern constrains evidence preservation, records hypothesis and reproduction decisions, and supplies separate rapid-triage and root-cause workflows for defects that cross code, data, timing, and environment boundaries. It differs from incident response by focusing on active defect diagnosis and causal proof; incident command, communications, and service restoration remain in the incident pattern.",
  "category": "Workflow",
  "icon": "bug",
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
  "metaTitle": "Debugging root cause pattern for AI agents",
  "metaDescription": "Debugging workflow for reproduction, evidence capture, hypothesis ranking, controlled experiments, causal proof, regression tests, and root-cause reports.",
  "problem": "AI agents often patch the line named by a stack trace, change multiple variables, or declare a race fixed because it did not reproduce once.",
  "audience": "Engineering teams diagnosing deterministic, intermittent, data-dependent, distributed, or performance defects",
  "prevents": [
    "Destroying the failing state before capturing evidence",
    "Confusing the first visible symptom with the initiating cause",
    "Accepting a non-reproduction as proof of repair",
    "Shipping a fix without a regression test or causal explanation"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/tests",
      "/docs/debugging"
    ],
    "stacks": [
      "debugging",
      "root-cause-analysis",
      "testing",
      "observability",
      "workflow"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Change one causal variable at a time",
      "summary": "Preserve a failing baseline, state a prediction, alter one variable, and compare the same evidence before combining fixes.",
      "body": "Debugging by accumulation produces a passing state without showing which change mattered. That makes rollback risky and leaves the underlying model of the failure unverified.\n\n- Capture the failing command, inputs, environment, code revision, seed, time window, and observable result before editing code or data.\n- State the hypothesis and its predicted evidence in advance, including what result would disprove it.\n- Change one code path, configuration value, dependency, data property, timing condition, or resource limit while holding the rest constant.\n- Repeat the same reproduction and compare structured evidence; revert ineffective probes so they do not contaminate the eventual fix.\n\nSee /tests for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/debugging",
      "title": "A symptom timeline narrows the causal search",
      "summary": "Order user action, request, state changes, dependency calls, logs, and failure by stable identifiers and clocks.",
      "body": "The first error message is often downstream of the initiating event. A timeline built from correlated evidence reveals which state changed first and which failures are consequences.\n\n- Start from the user-visible or externally observed failure and trace backward through request, job, event, and data identities.\n- Normalize timestamps and note clock uncertainty across machines; ordering by wall clock alone can invert distributed events.\n- Separate facts from interpretation and annotate missing evidence instead of filling gaps with a plausible narrative.\n- Compare a successful and failing timeline to find the earliest meaningful divergence rather than the largest later error.\n\nSee /src for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/docs/debugging",
      "title": "Root cause explains mechanism and necessary conditions",
      "summary": "A cause account names the defect, trigger, state transition, and missing defense, not merely the component that threw.",
      "body": "A useful root cause predicts when the bug will and will not happen. Naming a null value, timeout, race, or bad deployment without the mechanism does not guide a durable fix.\n\n- Describe the incorrect assumption or invariant violation and the exact path that allowed it to become observable.\n- List the triggering input, timing, load, version, or state conditions and distinguish necessary from incidental conditions.\n- Identify why existing types, validation, tests, monitoring, rollout, or recovery controls did not prevent or reveal the defect earlier.\n- Verify the explanation by reproducing the failure with the cause present and eliminating it with the targeted fix while keeping other conditions stable.\n\nSee /tests for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "triage-software-defect",
      "summary": "Stabilize a debugging session by capturing scope, evidence, reproduction, recent change, and ranked hypotheses.",
      "body": "---\nname: triage-software-defect\ndescription: Triage a newly reported software defect before broad code changes begin.\n---\n\n# Triage Software Defect\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Write one observable failure statement with expected behavior, actual behavior, affected users or data, frequency, and first known occurrence.\n- [ ] Capture logs, traces, screenshots, payload identity, database state, environment, versions, and exact commands without collecting unnecessary secrets or personal data.\n- [ ] Find the smallest reliable reproduction or a production evidence query when local reproduction is unsafe or impossible.\n- [ ] Compare recent code, configuration, dependency, schema, data, traffic, and infrastructure changes against the failure start time.\n- [ ] Rank a short hypothesis list by explanatory power and test cost, then choose the first experiment with a falsifiable predicted result.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "debugging",
        "triage",
        "reproduction",
        "evidence",
        "workflow"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "prove-root-cause-and-fix",
      "summary": "Demonstrate the causal mechanism, implement the narrow fix, and add evidence that fails before and passes after.",
      "body": "---\nname: prove-root-cause-and-fix\ndescription: Close a debugging investigation only after the root cause and repair are causally verified.\n---\n\n# Prove Root Cause And Fix\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Construct the minimal failing case and record the state transition or interleaving that violates the intended invariant.\n2. Run the case on the prior code and confirm the predicted failure using deterministic or statistically sufficient repetition.\n3. Apply the narrowest repair at the ownership boundary and rerun the identical case without weakening assertions or hiding the symptom.\n4. Add a regression test, invariant check, or observability signal that would fail on the old mechanism and remain stable under normal variation.\n5. Document cause, trigger, scope, fix, verification, rollout risk, rollback, and deliberately excluded adjacent problems.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "root-cause",
        "debugging",
        "regression",
        "testing",
        "verification"
      ]
    }
  ]
};
