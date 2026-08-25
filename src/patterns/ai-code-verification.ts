import type { Pattern } from "../types.js";

export const aiCodeVerification: Pattern = {
  "slug": "ai-code-verification",
  "version": "1.0.0",
  "name": "AI-Generated Code Verification",
  "tagline": "Verify AI-authored changes through scope control, contracts, tests, security, runtime evidence, and rollback.",
  "description": "AI-generated code is frequently plausible and locally coherent while inventing APIs, missing repository conventions, weakening security, duplicating existing utilities, or changing behavior outside the requested scope. This pattern constrains unverified claims and scope expansion, records evidence and ownership decisions, and supplies separate pre-merge and runtime-verification procedures. It differs from LLM evals by verifying repository changes produced by an AI assistant; model-output scoring remains useful upstream but cannot replace build, test, and runtime evidence in the target system.",
  "category": "AI",
  "icon": "bot-message-square",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "AI-generated code verification for agents",
  "metaDescription": "AI-generated code review for scope, repository rules, API accuracy, tests, security, data, runtime behavior, regression evidence, and rollback. In production.",
  "problem": "AI agents often cite tests they did not run, introduce near-duplicate helpers, use stale APIs, or fix the visible symptom while violating a deeper data or authorization invariant.",
  "audience": "Engineering teams using coding agents for implementation, migration, refactoring, or automated pull requests",
  "prevents": [
    "Merging code that only appears to use a real API",
    "Accepting claimed verification without command evidence",
    "Missing an authorization or data-loss regression outside the happy path",
    "Shipping unrelated generated cleanup with the requested change"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/tests",
      "/docs/ai-review"
    ],
    "stacks": [
      "ai-generated-code",
      "code-review",
      "testing",
      "security",
      "verification"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Require evidence for every behavior and API claim",
      "summary": "Verify symbols against installed code or official sources and report only commands and flows actually executed.",
      "body": "Generated code can confidently import a removed symbol, assume a default, or describe a test result that was never produced. Plausibility is not repository evidence.\n\n- Resolve APIs, configuration keys, defaults, and version-sensitive behavior from the installed dependency, source, or current official documentation.\n- Run the narrowest relevant build, type, static, unit, integration, and runtime checks and preserve their exact outcome.\n- Do not claim an endpoint, UI, migration, or recovery flow works unless it was exercised or clearly label the unverified boundary.\n- Remove or rewrite uncertain behavior that cannot be verified instead of adding comments that repeat the guess.\n\nSee /tests for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Keep generated changes inside the authorized scope",
      "summary": "Inspect the final diff for unrelated rewrites, duplicated abstractions, weakened checks, destructive targets, and user-owned work.",
      "body": "A coding agent can broaden a small task into cleanup or architecture change that was never requested. Even individually reasonable edits increase review cost and hide regressions.\n\n- Map each changed file and behavior to the user request or a necessary implementation step and revert no protected user or team work.\n- Search for existing helpers, services, schemas, components, and conventions before adding a parallel implementation.\n- Treat permission, authorization, validation, migration, secret, external-effect, and destructive-command changes as high-risk scope that needs direct evidence.\n- Review generated dependency, lockfile, snapshot, schema, and build output separately from authored source and regenerate only through the repository toolchain.\n\nSee /docs/ai-review for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/ai-review",
      "title": "AI provenance changes review strategy, not accountability",
      "summary": "Use generated origin to focus on invented assumptions and broad consistency, while holding the same product owner responsible for the merged behavior.",
      "body": "AI code does not need a weaker or purely stylistic review. It needs extra attention to repository-wide assumptions the generator may not have seen, but the acceptance bar remains the system's ordinary correctness and safety contract.\n\n- Review at behavior and ownership boundaries before line polish: input, authorization, state, effects, failure, concurrency, privacy, and recovery.\n- Ask which repository rule, memory, existing implementation, source, or runtime evidence supports each non-obvious decision.\n- Use model or tool metadata for audit and improvement where policy permits, but do not treat it as a substitute for code ownership.\n- Assign a human or team owner who can operate, rollback, and maintain the generated change after the conversation that produced it is gone.\n\nSee /src for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/docs/ai-review",
      "title": "A verification report separates passed, failed, and untested",
      "summary": "Record command, scope, environment, result, and remaining risk without converting partial checks into a green narrative.",
      "body": "A report that says tests pass without naming the suite, or says production-ready after only compilation, prevents reviewers from judging evidence strength.\n\n- List each executed check with target, environment, exit outcome, and relevant artifact or observation.\n- List failures and how they were repaired, because repeated mistakes reveal risk areas that deserve review.\n- Name untested platforms, browsers, integrations, migrations, loads, credentials, and destructive or external flows explicitly.\n- Keep inference separate from observation and state what evidence would be needed to close each remaining uncertainty.\n\nSee /tests for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-ai-generated-change",
      "summary": "Review an AI-authored diff for intent, reuse, contracts, security, failure, tests, evidence, and operational ownership.",
      "body": "---\nname: review-ai-generated-change\ndescription: Review code produced wholly or partly by a coding agent before merge.\n---\n\n# Review Ai Generated Change\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Restate requested behavior and map every changed file, dependency, generated artifact, and external effect to that scope.\n2. Compare against repository instructions, nearby implementations, schemas, ownership boundaries, and installed dependency APIs before accepting new abstractions.\n3. Trace untrusted input through validation, authentication, authorization, persistence, output, logging, and cleanup, including error and cancellation paths.\n4. Run focused and broad checks proportional to risk and inspect whether tests would fail on the pre-change defect instead of merely covering the new code.\n5. Verify runtime behavior and rollback for the complete user flow, then write a report that separates evidence, inference, and untested boundaries.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "ai-code",
        "code-review",
        "security",
        "testing",
        "verification"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-generated-change-runtime",
      "summary": "Exercise the full generated behavior from entry point through state and dependencies to response, recovery, and rollback.",
      "body": "---\nname: verify-generated-change-runtime\ndescription: Verify an AI-generated feature or fix in the real application environment.\n---\n\n# Verify Generated Change Runtime\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Start from the user or system entry point and capture the baseline failure or expected pre-change limitation.\n2. Exercise valid, invalid, unauthorized, duplicate, concurrent, timeout, cancellation, dependency-failure, and recovery paths with representative data.\n3. Inspect API, database, queue, file, log, metric, and external-side-effect evidence so the visible result is tied to authoritative state.\n4. Restart, reload, navigate, retry, or redeploy according to the feature lifecycle and confirm state remains consistent.\n5. Execute rollback or disablement and verify migrated data and external effects remain supportable before declaring the change complete.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "ai-code",
        "runtime",
        "verification",
        "end-to-end",
        "rollback"
      ]
    }
  ]
};
