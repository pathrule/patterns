import type { Pattern } from "../types.js";

export const developerOnboarding: Pattern = {
  "slug": "developer-onboarding",
  "version": "1.0.0",
  "name": "Developer Onboarding",
  "tagline": "Turn a new contributor's first setup and change into a repeatable test of the engineering system.",
  "description": "Developer onboarding is an executable path from an unprepared machine to a verified first contribution. This bundle defines a canonical environment, prerequisite and access ownership, safe sample data, a staged first change, feedback collection, and maintenance checks. Unlike Documentation Engineering, it governs the end-to-end newcomer journey and uses completion evidence to expose friction across tooling, permissions, code, and review.",
  "category": "Workflow",
  "icon": "user-round-plus",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Developer onboarding pattern for AI agents",
  "metaDescription": "Canonical setup, owned prerequisites and access, safe sample data, first-change path, verification checkpoints, friction metrics, and maintenance review.",
  "problem": "Agents add another setup paragraph after each failure while hidden machine state, missing access, stale fixtures, and an unrealistic first task keep onboarding unreliable.",
  "audience": "Engineering teams bringing employees, contractors, open-source contributors, or cross-team developers into an existing codebase",
  "prevents": [
    "Setup succeeding only on a long-tenured developer's machine",
    "Newcomers blocked by unowned access and secret requests",
    "A first task that bypasses the real test, review, and delivery workflow"
  ],
  "appliesTo": {
    "paths": [
      "/.devcontainer",
      "/docs/onboarding",
      "/scripts/setup",
      "/examples"
    ],
    "stacks": [
      "onboarding",
      "developer-experience",
      "documentation",
      "tooling"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/scripts/setup",
      "title": "One unattended setup command proves the canonical environment",
      "summary": "The supported setup path is idempotent, non-secret, versioned, diagnosable, and verified on a clean machine in automation.",
      "body": "A checklist of manual fixes is not a reproducible environment. Provide one canonical setup entry point that checks supported operating systems and architecture, installs or verifies pinned tool versions, restores dependencies, creates local configuration from safe templates, prepares services and sample data, and runs a bounded health check. Re-running it must be safe.\n\n- Fail with the missing prerequisite, observed value, expected value, and exact recovery action.\n- Never download or print production secrets, personal credentials, or unreviewed remote scripts.\n- Keep optional heavy components behind named profiles while the default supports the first contribution.\n- Execute the same path on a clean runner or disposable development container on a schedule.\n\nVerification: Start from a clean supported image, run setup twice, remove each prerequisite, and interrupt midway; confirm recovery is deterministic and the health check proves readiness.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/docs/onboarding",
      "title": "The first change crosses the real contribution path",
      "summary": "A bounded starter change exercises local run, test, lint, data, review, CI, and delivery conventions without requiring hidden context.",
      "body": "An onboarding task that edits a typo proves almost nothing about the engineering system, while a production-critical feature is too risky and ambiguous. Maintain a small representative change with a clear expected outcome, owned test fixture, visible design boundary, review instructions, and rollback path. Rotate it when the product or architecture changes.\n\n- Include discovery of the relevant owner, local reproduction, implementation, focused tests, full required checks, and pull-request context.\n- State which generated files, migrations, flags, documentation, and screenshots apply to the change.\n- Avoid novelty work whose correct result has never been implemented or reviewed before.\n- Capture every undocumented dependency or permission discovered during completion as onboarding-system work.\n\nVerification: Have a maintainer complete the path from a clean environment using only public onboarding material; confirm no private message or remembered workaround is required.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/.devcontainer",
      "title": "The development container is a supported environment contract",
      "summary": "Container configuration pins the tools and services the project supports while local setup remains explicit about any permitted differences.",
      "body": "A development container can make toolchains reproducible, but only if it is maintained as a supported product rather than a stale sample. Keep its base image, features, extensions, forwarded ports, service dependencies, user permissions, caches, and post-create command versioned and reviewable. Do not embed credentials or assume host-only state.\n\nRun the same repository checks inside the container and document which workflows still require host capabilities. Update local and container setup together when a tool version or service changes. Test rebuild from no cache as well as ordinary reopen. See /scripts/setup for the canonical idempotent preparation and /docs/onboarding for the newcomer journey it must support."
    },
    {
      "kind": "memory",
      "nodePath": "/docs/onboarding",
      "title": "Prerequisites and access requests have named owners",
      "summary": "Every tool, account, group, repository, environment, dataset, and license names why it is needed, who approves it, and how to verify access.",
      "body": "New contributors should not discover permissions one failing command at a time. Inventory required and optional tools, identity groups, repositories, package registries, cloud environments, databases, feature systems, communication channels, and paid licenses. For each, state purpose, request path, approver or owner, expected lead time, least-privilege role, and a safe verification step.\n\nSeparate pre-start requests from access that should be granted only after training or task assignment. Never ask a newcomer to share a token in chat or copy another person's credentials. Keep alternatives for external contributors explicit. Track recurring delay by owner and system so onboarding friction leads to a service-level fix rather than more prose."
    },
    {
      "kind": "memory",
      "nodePath": "/examples",
      "title": "Sample data is safe, deterministic, and representative",
      "summary": "Seeded identities, tenants, permissions, edge cases, and integrations demonstrate real workflows without copied production data or secrets.",
      "body": "A blank database hides important behavior, while a production snapshot creates privacy, security, and drift risk. Build versioned synthetic fixtures that represent primary roles, tenant boundaries, common lifecycle states, permissions, billing states, time zones, and a small set of deliberate edge cases. Give fixtures stable identifiers and a fast reset path.\n\nMock or sandbox external integrations with clearly visible behavior and no production credentials. Keep fixture generation deterministic enough for tests while avoiding magic values known only to maintainers. Document login or identity flows without committing passwords that could work elsewhere. See /scripts/setup for seeding and /docs/onboarding for the scenarios a newcomer should exercise."
    },
    {
      "kind": "memory",
      "nodePath": "/docs/onboarding",
      "title": "Onboarding friction is product telemetry",
      "summary": "Time to readiness, first successful run, first reviewed change, repeated blockers, and documentation gaps reveal defects in the engineering platform.",
      "body": "Measure onboarding to improve the system, not rank newcomers. Capture milestone times and blocker categories with consent and minimal personal detail: access delay, machine or network issue, tool mismatch, setup failure, missing fixture, unclear architecture, test instability, review delay, and ownership ambiguity. Pair metrics with short qualitative feedback after the experience.\n\nSegment by supported environment and contributor type so averages do not hide structural gaps. Review repeated workarounds and private-message dependencies as defects with owners and deadlines. Publish improvements and close the loop with recent contributors. Do not use speed alone as a performance signal because prior context and task complexity vary substantially."
    },
    {
      "kind": "skill",
      "nodePath": "/docs/onboarding",
      "title": "verify-onboarding-path",
      "summary": "Run the newcomer journey on a clean environment and capture every hidden dependency, access gap, unclear decision, and irreproducible step.",
      "body": "---\nname: verify-onboarding-path\ndescription: Verify the complete developer onboarding journey from clean machine to reviewed first change.\n---\n\n# Verify Onboarding Path\n\n1. Choose a supported contributor profile and start from a clean machine or container with no repository cache, credentials, or remembered project state.\n2. Follow only the published prerequisite, access, setup, sample-data, run, debug, test, and contribution instructions; timestamp each checkpoint.\n3. Complete the maintained first-change exercise through local checks, pull-request context, CI, review feedback, and the documented delivery or cleanup step.\n4. Record every manual workaround, private question, stale command, ambiguous owner, missing permission, unsafe secret path, flaky check, and environment-specific assumption.\n5. File scoped fixes with owners, update the journey, and rerun from clean state until the evidence is reproducible.\n\nDo not coach the test participant around a defect without recording the defect first.",
      "skillTags": [
        "onboarding",
        "developer-experience",
        "verification",
        "documentation"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/scripts/setup",
      "title": "maintain-onboarding-system",
      "summary": "Update setup, access inventory, fixtures, first-change exercise, and verification evidence when the engineering system changes.",
      "body": "---\nname: maintain-onboarding-system\ndescription: Keep onboarding assets synchronized with changes to tools, architecture, access, data, and contribution workflow.\n---\n\n# Maintain Onboarding System\n\n1. Identify whether the change affects prerequisites, tool versions, container image, access, secrets, services, seed data, ports, commands, generated files, tests, CI, review, or delivery.\n2. Update the canonical setup and machine-readable configuration first, then revise the journey and first-change exercise to match the executable behavior.\n3. Remove superseded instructions and workarounds instead of layering another exception on top.\n4. Rebuild from a clean environment, run setup twice, restore sample data, complete the affected checkpoint, and record timing and output evidence.\n5. Notify the onboarding owner of new lead-time or permission dependencies and schedule a full journey verification when risk crosses several boundaries.\n\nA change is not complete while the supported newcomer path still describes the old system.",
      "skillTags": [
        "onboarding",
        "tooling",
        "maintenance",
        "developer-experience"
      ]
    }
  ]
};
