import type { Pattern } from "../types.js";

export const iamLeastPrivilege: Pattern = {
  "slug": "iam-least-privilege",
  "version": "1.0.0",
  "name": "IAM and Least Privilege",
  "tagline": "Keep human and workload access temporary, scoped, reviewable, and deny-first.",
  "description": "IAM and least privilege require an authorization model that keeps permissions narrow as infrastructure, teams, and workloads change. This bundle defines temporary identities, resource and condition scoping, privilege boundaries, review evidence, and emergency access. Unlike Secrets and Environment Management, it governs what an authenticated principal may do rather than how credential values are stored and rotated.",
  "category": "Security",
  "icon": "user-round-cog",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "IAM least privilege pattern for AI agents",
  "metaDescription": "Deny-first IAM policies, temporary workload roles, resource conditions, access reviews, and controlled break-glass paths for cloud infrastructure teams.",
  "problem": "Agents reach for broad managed policies, wildcard resources, and long-lived keys to make deployments work, then leave the temporary shortcut as permanent access.",
  "audience": "Platform and application teams managing cloud identities, automation roles, and cross-account access",
  "prevents": [
    "Wildcard actions and resources that outlive the task",
    "Long-lived workload credentials copied into deployment settings",
    "Emergency roles with no approval, expiry, or audit evidence"
  ],
  "appliesTo": {
    "paths": [
      "/infra/iam",
      "/terraform",
      "/.github/workflows"
    ],
    "stacks": [
      "iam",
      "least-privilege",
      "terraform",
      "cloud-security"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra/iam",
      "title": "Start policies from an explicit deny-first boundary",
      "summary": "IAM grants enumerate required actions, resources, and conditions instead of opening a service namespace.",
      "body": "IAM grants enumerate required actions, resources, and conditions instead of opening a service namespace. Broad allow statements make future resources reachable automatically and hide which operation required the privilege. Enforce this boundary in /infra/iam so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- List the exact API actions exercised by the workload and separate read, write, and permission-management capabilities.\n- Scope resources to stable identifiers and use documented conditions for tenant, environment, region, or source identity where supported.\n- Keep wildcard resources only where the service API cannot scope them, and document that limitation beside the statement.\n- Place organization or account guardrails above delegated roles so a local policy cannot grant prohibited capabilities.\n\nVerification: Run policy validation and an access simulation for one allowed and several forbidden resources; capture any unavoidable wildcard with an owner and review date.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Use temporary workload credentials",
      "summary": "Automation assumes a narrowly scoped role at run time and never depends on a stored cloud access key.",
      "body": "Automation assumes a narrowly scoped role at run time and never depends on a stored cloud access key. Long-lived credentials copied into CI can be exfiltrated, reused outside the job, and forgotten after the workflow changes. Enforce this boundary in /.github/workflows so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Federate the CI identity to a dedicated role and restrict its trust policy to the repository, branch, environment, and workflow that need it.\n- Keep session duration no longer than the deployment or maintenance operation requires.\n- Separate plan, deploy, rollback, and security-audit roles so read-only jobs cannot mutate infrastructure.\n- Fail closed when federation claims or audience values are missing or unexpected.\n\nVerification: Inspect issued credentials during a test run, confirm they expire, and prove a fork, unprotected branch, or unrelated workflow cannot assume the role.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/terraform",
      "title": "Separate permission delegation from resource ownership",
      "summary": "Infrastructure modules expose narrow role inputs and cannot grant themselves authority outside their owned resources.",
      "body": "Infrastructure modules expose narrow role inputs and cannot grant themselves authority outside their owned resources. A reusable module that creates both a resource and broad delegation can escalate every caller and makes ownership impossible to audit. Enforce this boundary in /terraform so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Keep permission boundaries and organization guardrails in a dedicated security-owned module.\n- Pass role identifiers into application modules instead of letting them discover or create administrator roles.\n- Require review for trust-policy changes, permission-management actions, and cross-account principals.\n- Detect public, cross-account, and wildcard grants in the infrastructure plan before apply.\n\nVerification: Generate a plan containing an intentional escalation and confirm policy checks block it while ordinary resource changes remain deployable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/infra/iam",
      "title": "Permissions are reduced from observed use",
      "summary": "Least privilege is a maintenance loop, not a policy written once during initial deployment.",
      "body": "Least privilege is a maintenance loop, not a policy written once during initial deployment. Applications add and remove calls, but permissions usually only grow unless usage evidence feeds a review process.\n\nCollect action and resource usage for each role without treating lack of recent use as automatic proof that access is unnecessary. Compare observed use to intended capabilities, investigate seasonal and incident-only actions, then remove permissions through a reviewed change. Keep generated-policy tools as input to judgment because they reflect historical behavior, including accidental behavior, rather than desired authority. Keep the decision explicit at /infra/iam; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /terraform for the deployment boundary and the IAM review skill for the removal procedure. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-iam-access",
      "summary": "Review human and workload roles for unused, broad, cross-account, and emergency permissions.",
      "body": "---\nname: review-iam-access\ndescription: Review human and workload roles for unused, broad, cross-account, and emergency permissions.\n---\n\n# Review Iam Access\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Inventory principals, trust policies, attached policies, permission boundaries, session duration, and the service owner for each role.\n2. Compare granted actions and resources with deployment manifests, runbooks, and recent access evidence; flag wildcard or permission-management grants.\n3. Test the proposed reduction with policy simulation and a non-production workflow, including one expected denial and the rollback path.\n4. Record removed authority, retained exceptions, owner, expiry, and the next review date; verify emergency access remains usable and audited.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "iam",
        "least-privilege",
        "security-review",
        "cloud"
      ]
    }
  ]
};
