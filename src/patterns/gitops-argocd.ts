import type { Pattern } from "../types.js";

export const gitopsArgocd: Pattern = {
  "slug": "gitops-argocd",
  "version": "1.0.0",
  "name": "GitOps with Argo CD",
  "tagline": "Operate Argo CD through desired-state ownership, reconciliation, sync waves, health, drift, and rollback.",
  "description": "GitOps changes deployment authority: the cluster continuously reconciles toward a reviewed repository, so imperative fixes, generated manifests, secret injection, resource ownership, health checks, and sync ordering must all agree with that control loop. This pattern constrains desired-state authority and destructive sync behavior, records application boundaries, drift, health, and ordering decisions, and supplies a repeatable promotion and recovery workflow. It complements Kubernetes and GitHub Actions by focusing on continuous reconciliation after CI has produced an artifact and configuration change.",
  "category": "Infra",
  "icon": "git-pull-request-arrow",
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
  "metaTitle": "Argo CD GitOps pattern for AI coding agents",
  "metaDescription": "Argo CD desired state, reconciliation, applications, projects, sync waves, health, drift, pruning, secrets, promotion, rollback, and recovery. In production.",
  "problem": "AI agents often patch the cluster directly, enable automatic pruning before ownership is clear, hide generated drift, or order a database migration and application rollout through accidental manifest sorting.",
  "audience": "Platform teams operating Kubernetes delivery through Argo CD applications and projects",
  "prevents": [
    "Losing an emergency cluster patch at the next reconciliation",
    "Pruning a shared resource owned by another application",
    "Reporting a custom resource healthy before it is usable",
    "Deploying dependent resources in an unsafe order"
  ],
  "appliesTo": {
    "paths": [
      "/gitops/apps",
      "/gitops/platform",
      "/ops/runbooks"
    ],
    "stacks": [
      "argocd",
      "gitops",
      "kubernetes",
      "continuous-delivery",
      "infra"
    ],
    "packages": [
      "argocd"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/gitops/apps",
      "title": "Make Git the only durable desired-state authority",
      "summary": "Apply production changes through reviewed source and treat imperative cluster edits as bounded incidents that must be reconciled back.",
      "body": "Argo CD will restore declared state after a manual edit. An emergency patch that exists only in the cluster is temporary and leaves the team unable to reproduce or explain the live configuration.\n\n- Change versioned manifests, charts, or overlays and let the reconciler apply them through the approved application boundary.\n- If an emergency patch is required, record exact scope and expiry, apply the minimum change, then update desired state before normal reconciliation resumes.\n- Do not configure broad ignore-difference rules to make persistent unexplained drift disappear; narrow them to known controller-owned fields.\n- Audit direct mutation permissions and use them only for recovery paths whose actions and follow-up reconciliation are documented.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/gitops/platform",
      "title": "Enable pruning only with explicit resource ownership",
      "summary": "Assign every managed resource to one application and exclude shared or generated objects before automated deletion is allowed.",
      "body": "Pruning removes objects absent from desired state. Overlapping applications, renamed resources, generated controllers, or an incorrect source path can turn a configuration mistake into broad deletion.\n\n- Use projects, destinations, namespaces, labels, and repository boundaries to make ownership visible and non-overlapping.\n- Review the prune preview for rename, split, merge, and source-path changes and stage destructive transitions where rollback requires overlap.\n- Protect persistent and shared resources with deliberate lifecycle policy rather than assuming finalizers or storage classes will save data.\n- Apply sync windows, approvals, or manual pruning for high-blast-radius applications until ownership and recovery have been exercised.\n\nSee /gitops/apps for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/gitops/apps",
      "title": "An Argo CD application is an ownership and blast-radius boundary",
      "summary": "Group resources that share source, destination, lifecycle, permissions, and rollback behavior rather than mirroring one giant cluster tree.",
      "body": "An application defines what reconciles and reports health together. If unrelated workloads and platform resources share one application, one invalid manifest or sync blocks and obscures everything.\n\n- Group a service and its directly owned resources when they promote and roll back together.\n- Separate cluster platform, shared operators, tenant infrastructure, and product workloads with projects and destinations that constrain authority.\n- Avoid one application per tiny object when ordering and ownership are shared; the boundary should remain understandable to an operator.\n- Use application sets for repeated, parameterized ownership across clusters or tenants without hiding generated destinations and source revisions.\n\nSee /gitops/platform for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/gitops/apps",
      "title": "Sync order is a declared dependency graph",
      "summary": "Use phases and waves for true readiness dependencies and keep migrations backward compatible with mixed application versions.",
      "body": "Alphabetical manifest order is not deployment semantics, and Kubernetes object creation does not imply application readiness. Database and custom-resource transitions often need explicit sequencing.\n\n- Use pre-sync work for bounded validation or migration only when it is idempotent and reports completion clearly.\n- Assign waves to dependencies that must become healthy before consumers progress, and define health for custom resources Argo CD cannot infer correctly.\n- Keep schema changes compatible with old and new application revisions through rollout and rollback; a sync wave cannot make an irreversible migration safe by itself.\n- Use post-sync checks for acceptance evidence, not for essential state the application needs to start.\n\nSee /ops/runbooks for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/runbooks",
      "title": "Rollback restores desired state, not necessarily data",
      "summary": "Reverting Git or selecting a prior revision restores manifests, while schema, external effects, and controller actions need their own recovery plan.",
      "body": "The reconciler can recreate a Deployment spec, but it cannot automatically undo data migration, issued certificate, sent message, deleted resource, or third-party change caused by the release.\n\n- Classify every release change as declarative and reversible, declarative with retained data, migratory, or externally side-effecting.\n- Keep prior image and configuration revisions reachable and preserve compatibility with the current data state through the rollback window.\n- Define recovery for pruned persistent objects, migrations, secret rotations, and operator-managed resources separately from the Git revert.\n- Verify the cluster reaches healthy prior behavior after reconciliation rather than equating a successful sync with business recovery.\n\nSee /gitops/apps for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "promote-argocd-change",
      "summary": "Render, diff, sync, observe, promote, and recover an Argo CD change through explicit application boundaries.",
      "body": "---\nname: promote-argocd-change\ndescription: Promote a GitOps change across environments or clusters with Argo CD.\n---\n\n# Promote Argocd Change\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Resolve immutable artifact versions and render the exact desired manifests, then validate policy, schema, destinations, ownership, secret references, and generated output.\n2. Inspect the Argo CD diff for replacements, pruning, immutable-field changes, shared resources, sync order, and controller-owned drift.\n3. Sync a bounded target and watch hooks, waves, resource health, events, application signals, migrations, and custom-resource readiness.\n4. Promote the same reviewed revision only while acceptance evidence holds and no unexplained live drift remains.\n5. On failure, choose Git revert, prior revision, paused reconciliation, or resource-specific recovery according to data and side effects, then reconcile source and live state.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "argocd",
        "gitops",
        "kubernetes",
        "promotion",
        "recovery"
      ]
    }
  ]
};
