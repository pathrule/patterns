import type { Pattern } from "../types.js";

export const promptVersioningManagement: Pattern = {
  "slug": "prompt-versioning-management",
  "version": "1.0.0",
  "name": "Prompt Versioning and Management",
  "tagline": "Ship prompts as immutable, reviewable artifacts with typed inputs, eval evidence, rollout, and rollback.",
  "description": "Production prompts are executable behavior, not anonymous strings hidden in handlers or provider dashboards. This bundle gives each prompt an immutable version, typed variables, model and tool contract, ownership, change history, evaluation evidence, staged release, and rollback path. Unlike LLM Evaluations and Testing, it governs the prompt artifact and its deployment lifecycle; evals are one required input to that lifecycle.",
  "category": "AI",
  "icon": "git-branch",
  "color": "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Prompt versioning and release pattern for agents",
  "metaDescription": "Immutable prompt versions, typed variables, model and tool contracts, eval approval, staged rollout, cache identity, rollback, and production traceability.",
  "problem": "Agents edit prompt text in place, forget coupled tools and output schemas, and cannot identify or restore the exact behavior that produced a bad generation.",
  "audience": "Teams operating LLM features whose prompts, tools, models, schemas, or policies change independently of application releases",
  "prevents": [
    "A production output with no identifiable prompt and configuration version",
    "Prompt edits breaking variables, tools, parsers, caches, or fallback models",
    "Rollback restoring text while leaving incompatible model or tool settings active"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai/prompts",
      "/src/ai/runtime",
      "/tests/evals"
    ],
    "stacks": [
      "llm",
      "prompts",
      "evals",
      "ai-operations"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai/prompts",
      "title": "Published prompt versions are immutable complete artifacts",
      "summary": "One version captures messages, typed variables, model intent, tools, output contract, safety policy, defaults, ownership, and provenance.",
      "body": "A prompt is more than its instruction text. Publish an immutable artifact that includes ordered messages or template sections, typed variable definitions, required and optional inputs, model or capability intent, sampling and length settings, tool definitions, output schema, safety and data-handling policy, owner, source revision, and change reason. Never edit a version after it has produced traffic.\n\n- Validate unknown, missing, empty, oversized, and incorrectly typed variables before provider submission.\n- Escape or delimit untrusted values according to the prompt's threat model rather than interpolating raw content casually.\n- Give semantically identical artifacts one stable content identity and semantically different artifacts distinct versions.\n- Store provider-managed prompt ids as deployment references, not as the only source of the reviewed artifact.\n\nVerification: Reconstruct an old request from its recorded artifact and inputs; confirm it resolves the same messages, tools, schema, and configuration without consulting mutable latest state.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ai/runtime",
      "title": "Every generation pins an approved release version",
      "summary": "Runtime resolves a named release to one immutable prompt artifact and records that version through evaluation, rollout, observation, and rollback.",
      "body": "Never let production traffic follow an unversioned latest prompt. A release record points to one immutable prompt version, compatible model and fallback policy, tool implementation versions, output parser, evaluation result, approver, rollout allocation, start time, and rollback target. Runtime resolves the release once per generation and records the chosen identity.\n\n- Gate promotion on the required offline evals, contract tests, safety checks, and representative manual review.\n- Roll out by a stable assignment key when comparison or canary traffic requires consistent user experience.\n- Keep a known-good release immediately restorable without rebuilding or editing the artifact.\n- Stop or roll back on predefined quality, safety, latency, error, and cost signals rather than waiting for anecdotal reports.\n\nVerification: Promote, canary, retry, fail over, and roll back a version while traffic is active; confirm every generation maps to exactly one complete approved release.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/prompts",
      "title": "Prompt compatibility includes callers, tools, and outputs",
      "summary": "A text edit can change input assumptions, tool selection, structured output, moderation, localization, caching, or downstream business behavior.",
      "body": "Treat prompt compatibility as an interface contract. Identify application callers and their variable shapes, the tool names and argument schemas the model may invoke, output formats and parsers, fallback models, safety filters, localization variants, retrieval context, and downstream effects. A change is breaking when any consumer must change or when the same input can now trigger a materially different side effect.\n\nVersion tool and output contracts explicitly and test prompt-model combinations that production can select. Use migration or dual-read paths when old sessions, cached inputs, queued jobs, or persisted tool calls outlive a release. See /src/ai/runtime for release pinning and /tests/evals for behavioral evidence."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/runtime",
      "title": "Prompt identity participates in cache and trace identity",
      "summary": "Semantic caches, response reuse, traces, costs, feedback, and incidents include the immutable prompt release and relevant runtime configuration.",
      "body": "A cache entry created under one prompt can be wrong under the next even when user input is identical. Include the prompt artifact or release identity, model and material settings, tool and output schema versions, retrieval corpus version, safety policy version, and normalized input contract in cache identity according to the feature's semantics.\n\nAttach the same identities to traces, token and cost records, user feedback, evaluation samples, incident cases, and support views. Preserve privacy by logging references and approved hashes rather than raw sensitive prompt content. This makes regressions attributable and rollback measurable. See the LLM Observability and Tracing pattern for telemetry boundaries."
    },
    {
      "kind": "skill",
      "nodePath": "/src/ai/prompts",
      "title": "publish-prompt-version",
      "summary": "Create, validate, evaluate, approve, and stage an immutable prompt artifact with complete compatibility and rollback evidence.",
      "body": "---\nname: publish-prompt-version\ndescription: Publish an immutable prompt version with contract, evaluation, approval, rollout, and rollback evidence.\n---\n\n# Publish Prompt Version\n\n1. Diff messages, variables, model intent, settings, tools, output schema, safety policy, retrieval inputs, owner, and affected callers against the active version.\n2. Classify compatibility and update contract tests, persisted-session handling, caches, parsers, tool implementations, and fallbacks where required.\n3. Run the required representative, adversarial, safety, deterministic, cost, latency, and model-compatibility evaluations; retain dataset and rubric versions.\n4. Create the immutable artifact and release record with reviewer, change reason, rollout key, monitoring thresholds, and known-good rollback target.\n5. Canary the version, compare predefined signals, promote or roll back, and link production evidence to the exact release.\n\nDo not publish from an editable draft or a passing average that hides a critical regression slice.",
      "skillTags": [
        "prompts",
        "versioning",
        "evals",
        "release"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/src/ai/runtime",
      "title": "rollback-prompt-release",
      "summary": "Contain a prompt regression, restore a complete known-good release, and preserve evidence for diagnosis and corrected rollout.",
      "body": "---\nname: rollback-prompt-release\ndescription: Roll back a prompt release as a complete runtime artifact while preserving incident evidence.\n---\n\n# Roll Back Prompt Release\n\n1. Freeze the affected release ids, assignment keys, time window, models, tools, schemas, retrieval versions, safety policy, metrics, feedback, and representative failing traces.\n2. Stop further promotion and route new generations to the recorded known-good release without editing either artifact.\n3. Confirm caches, queued jobs, persisted sessions, fallbacks, and retries cannot continue selecting the bad or an incompatible mixed configuration.\n4. Verify quality, safety, error, latency, and cost signals recover, then classify affected outputs and any downstream side effects.\n5. Add the failure to eval and contract coverage, create a new corrected version, and use the normal staged release path.\n\nRollback is complete only when every generation can be attributed and mixed-version behavior is excluded.",
      "skillTags": [
        "prompts",
        "rollback",
        "incident-response",
        "ai-operations"
      ]
    }
  ]
};
