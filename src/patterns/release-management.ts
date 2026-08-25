import type { Pattern } from "../types.js";

export const releaseManagement: Pattern = {
  "slug": "release-management",
  "version": "1.0.0",
  "name": "Release Management",
  "tagline": "Promote immutable artifacts with compatibility evidence, explicit approval, rollback, and release notes.",
  "description": "Release management turns a tested source revision into an immutable artifact that is promoted through environments with known compatibility and rollback behavior. This bundle defines artifact identity, provenance, database and API compatibility, approval, release notes, and reversible operations. Unlike Git Conventional Commits, it governs shipped artifacts and production change rather than commit message structure.",
  "category": "Workflow",
  "icon": "tags",
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
  "metaTitle": "Release management pattern for AI coding agents",
  "metaDescription": "Immutable release artifacts, compatibility gates, staged promotion, explicit approvals, rollback drills, provenance, and actionable release notes for teams.",
  "problem": "Agents rebuild between environments, bundle irreversible schema changes with code, or publish from commit history without proving compatibility, provenance, and rollback.",
  "audience": "Teams shipping services, applications, libraries, or infrastructure through controlled environments",
  "prevents": [
    "Production receiving different bytes than staging tested",
    "A release that cannot run with the previous schema or client",
    "Rollback discovered to be unsafe only after an incident"
  ],
  "appliesTo": {
    "paths": [
      "/.github/workflows",
      "/scripts",
      "/docs/releases"
    ],
    "stacks": [
      "release-management",
      "ci-cd",
      "semver",
      "deployment"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Build once and promote the same artifact",
      "summary": "A release has one immutable digest and provenance record that every environment verifies before promotion.",
      "body": "A release has one immutable digest and provenance record that every environment verifies before promotion. Rebuilding from the same commit can resolve different dependencies, tools, base images, or environment inputs, so staging and production are not equivalent. Enforce this boundary in /.github/workflows so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Build in a controlled job from an immutable source revision and pinned dependency, tool, and base-image inputs.\n- Attach artifact digest, source revision, builder identity, test evidence, and software bill of materials where applicable.\n- Promote by digest through environments and reject any artifact whose provenance or approval evidence does not match policy.\n- Keep environment configuration outside the artifact while validating its schema before startup.\n\nVerification: Compare artifact digests across test, staging, canary, and production; tamper with provenance or rebuild one stage and confirm promotion fails.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/scripts",
      "title": "Make compatibility and rollback explicit before release",
      "summary": "Database, API, event, client, and configuration changes declare the versions that can coexist during rollout and rollback.",
      "body": "Database, API, event, client, and configuration changes declare the versions that can coexist during rollout and rollback. A backward-incompatible migration or event change can make the previous application unable to start or process new data, turning rollback into further damage. Enforce this boundary in /scripts so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Use expand and contract sequencing for shared schemas and keep old readers and writers during the compatibility window.\n- Version external APIs and events when meaning or required fields change; test current and previous consumers against the candidate.\n- Separate destructive cleanup from the release that stops using old data or behavior.\n- Define forward-fix and rollback triggers, operator steps, data consequences, and the last safe decision point.\n\nVerification: Run the candidate beside the previous version against production-like schema and traffic, then execute the rollback rehearsal and verify stored data remains readable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/releases",
      "title": "A release identity names bytes and behavior",
      "summary": "A source tag alone cannot prove which artifact, dependency graph, migration set, configuration contract, or feature state reached an environment.",
      "body": "A source tag alone cannot prove which artifact, dependency graph, migration set, configuration contract, or feature state reached an environment. Create a release record that binds semantic version where used, source revision, artifact digest, provenance, migrations, compatibility window, approvals, and notes.\n\nTreat an already released version and artifact as immutable; corrections produce a new release. Use deployment records to show where and when the release is active without changing its identity. Link incidents, rollbacks, and follow-up fixes to the same release record for audit and learning. Keep the decision explicit at /docs/releases; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /.github/workflows for promotion evidence and /scripts for compatibility checks. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "prepare-release-candidate",
      "summary": "Prepare a release candidate with immutable artifacts, compatibility evidence, notes, approvals, and rollback readiness.",
      "body": "---\nname: prepare-release-candidate\ndescription: Prepare a release candidate with immutable artifacts, compatibility evidence, notes, approvals, and rollback readiness.\n---\n\n# Prepare Release Candidate\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Select the source revision and version, freeze scope, generate changelog and user-facing notes, and identify migrations or external contract changes.\n2. Build once, capture digest and provenance, run unit, integration, security, compatibility, and upgrade tests against production-like dependencies.\n3. Review rollout cohorts, feature flags, observability, support communication, approval owners, rollback triggers, and the last safe rollback point.\n4. Publish the candidate record without promoting it, then have an independent approver verify evidence and artifact identity.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "release",
        "ci-cd",
        "compatibility",
        "provenance"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/scripts",
      "title": "rehearse-release-rollback",
      "summary": "Rehearse rollback of a release candidate across application, schema, configuration, traffic, and queued work.",
      "body": "---\nname: rehearse-release-rollback\ndescription: Rehearse rollback of a release candidate across application, schema, configuration, traffic, and queued work.\n---\n\n# Rehearse Release Rollback\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Deploy the current release and representative data, traffic, jobs, clients, and external contract fixtures in a production-like environment.\n2. Promote the candidate through the real mechanism, exercise new and old paths, and capture the rollback trigger and decision timestamp.\n3. Roll back application and configuration while preserving safe migrations, then drain or replay queued work according to version compatibility.\n4. Verify user behavior, data integrity, previous-client compatibility, telemetry, and operator timing; record any condition that requires a forward fix instead.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "release",
        "rollback",
        "operations",
        "testing"
      ]
    }
  ]
};
