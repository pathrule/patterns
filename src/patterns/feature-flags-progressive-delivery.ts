import type { Pattern } from "../types.js";

export const featureFlagsProgressiveDelivery: Pattern = {
  "slug": "feature-flags-progressive-delivery",
  "version": "1.0.0",
  "name": "Feature Flags and Progressive Delivery",
  "tagline": "Separate deployment from exposure with typed flags, deterministic targeting, rollback, and retirement.",
  "description": "Feature flags and progressive delivery let teams change exposure without rebuilding an artifact, but they also create a runtime control plane that can drift from code. This bundle defines typed evaluation, stable targeting context, safe defaults, cohort rollout, telemetry, rollback, and flag retirement. Unlike Vercel Deploy, it governs product exposure across deployment platforms rather than one hosting and release surface.",
  "category": "Workflow",
  "icon": "flag-triangle-right",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Feature flags pattern for AI coding agents",
  "metaDescription": "Typed flag evaluation, stable targeting context, safe defaults, cohort rollouts, instant rollback, telemetry, ownership, and flag retirement controls.",
  "problem": "Agents add boolean checks without owners or expiry, evaluate with unstable context, choose permissive defaults, and leave both code paths alive long after rollout.",
  "audience": "Teams using feature flags for staged release, experiments, operational control, or entitlements",
  "prevents": [
    "Different services evaluating the same flag with different context",
    "Provider outage enabling an unsafe or unreleased path",
    "Expired flags and dead branches accumulating permanently"
  ],
  "appliesTo": {
    "paths": [
      "/src/flags",
      "/src/features",
      "/.github/workflows"
    ],
    "stacks": [
      "feature-flags",
      "progressive-delivery",
      "openfeature",
      "release"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/flags",
      "title": "Evaluate flags through one typed boundary",
      "summary": "Every flag has a declared type, stable key, owner, purpose, safe default, lifecycle, and evaluation adapter.",
      "body": "Every flag has a declared type, stable key, owner, purpose, safe default, lifecycle, and evaluation adapter. Scattered provider calls and string keys produce inconsistent defaults, missing context, and behavior that cannot be found or retired reliably. Enforce this boundary in /src/flags so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Expose typed application functions instead of raw SDK calls or provider flag keys in feature code.\n- Validate returned values and fall back to the declared safe default on missing, malformed, timeout, or provider error states.\n- Emit evaluation reason, variant, provider, context class, and flag version without logging sensitive targeting attributes.\n- Keep authorization and durable entitlement decisions outside feature flags unless a separate authoritative policy enforces them.\n\nVerification: Disable the provider and return missing, malformed, and wrong-type values; confirm every caller receives the same safe behavior and telemetry reason.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/features",
      "title": "Roll out by stable subjects with a measured rollback",
      "summary": "Cohorts use server-derived stable targeting keys and each rollout step has success, failure, pause, and rollback signals.",
      "body": "Cohorts use server-derived stable targeting keys and each rollout step has success, failure, pause, and rollback signals. Random or mutable client attributes move users between variants and can hide regressions by changing the population during measurement. Enforce this boundary in /src/features so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Choose the subject that owns the experience, such as user, account, device, or request, and keep it stable for the rollout's duration.\n- Start with internal or low-risk cohorts, then expand only after a defined observation window meets product and reliability guardrails.\n- Compare treatment and control on user outcomes, errors, latency, support, and data integrity, not only flag evaluation counts.\n- Make kill-switch behavior fast, permissioned, audited, and tested before exposure begins.\n\nVerification: Replay the same subjects across devices and services, simulate provider failure and regression signals, and confirm assignment stability plus immediate safe rollback.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/flags",
      "title": "Targeting context is a data contract",
      "summary": "Evaluation context can include identity, tenant, locale, environment, or device data, so inconsistent naming and precedence change who receives a feature.",
      "body": "Evaluation context can include identity, tenant, locale, environment, or device data, so inconsistent naming and precedence change who receives a feature. Define allowed fields, types, sources, sensitivity, and merge precedence centrally.\n\nDerive authoritative fields on the server and pass only the minimum attributes required by targeting rules. Use one canonical targeting key for deterministic allocation and never repurpose it mid-rollout. Version context changes that can alter cohorts and test them against recorded evaluation fixtures. Keep the decision explicit at /src/flags; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/features for product behavior and the progressive rollout skill for cohort decisions. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/features",
      "title": "Every flag has a removal state",
      "summary": "A flag is temporary control-plane state unless it represents a long-lived operational setting with explicit ownership.",
      "body": "A flag is temporary control-plane state unless it represents a long-lived operational setting with explicit ownership. Record creation reason, owner, expected decision date, cleanup condition, and code locations when the flag is introduced.\n\nAfter full rollout, remove the losing branch, provider configuration, telemetry, tests, and compatibility code in one tracked cleanup. After rollback, remove the failed branch or open a new experiment with a new hypothesis rather than leaving ambiguity. Review permanent operational flags separately for access, audit, defaults, and disaster behavior. Keep the decision explicit at /src/features; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/flags for registry metadata and /.github/workflows for cleanup enforcement. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "run-progressive-rollout",
      "summary": "Run a feature rollout through readiness, stable cohorts, guardrail checks, pause, rollback, and flag retirement.",
      "body": "---\nname: run-progressive-rollout\ndescription: Run a feature rollout through readiness, stable cohorts, guardrail checks, pause, rollback, and flag retirement.\n---\n\n# Run Progressive Rollout\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Confirm the flag owner, safe default, targeting subject, treatment and control behavior, telemetry, support plan, and tested kill switch.\n2. Define cohort steps, observation windows, success metrics, reliability and safety guardrails, and the authority to pause or roll back.\n3. Expose internal and low-risk cohorts first, verify stable assignment and data quality, then expand one step at a time with recorded decisions.\n4. Choose ship or rollback, remove the unused branch and flag configuration, and verify no stale evaluation or targeting data remains.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "feature-flags",
        "progressive-delivery",
        "rollout",
        "release"
      ]
    }
  ]
};
