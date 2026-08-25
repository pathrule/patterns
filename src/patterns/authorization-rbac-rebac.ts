import type { Pattern } from "../types.js";

export const authorizationRbacRebac: Pattern = {
  "slug": "authorization-rbac-rebac",
  "version": "1.0.0",
  "name": "Authorization with RBAC and ReBAC",
  "tagline": "Authorize every action against the real resource, relationship, tenant, and current policy state.",
  "description": "Application authorization decides whether an authenticated principal may perform one action on one resource in one context. This bundle defines a deny-by-default decision boundary, object-level checks, role and relationship modeling, policy evolution, and adversarial tests. Unlike Auth Sessions, JWT, and OAuth, it starts after identity is known; unlike IAM and Least Privilege, it governs application resources rather than cloud administration.",
  "category": "Security",
  "icon": "badge-check",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "RBAC and ReBAC authorization pattern for agents",
  "metaDescription": "Deny-first authorization, object-level checks, role and relationship models, tenant context, policy versioning, cache safety, and adversarial review.",
  "problem": "Agents scatter role-name checks through handlers, trust tenant or owner ids from requests, and authorize list pages while missing the individual object mutation path.",
  "audience": "Teams building multi-user or multi-tenant applications with role, attribute, ownership, group, hierarchy, or sharing permissions",
  "prevents": [
    "Authenticated users accessing another tenant's object by changing an id",
    "Role strings becoming an unreviewable substitute for resource policy",
    "Stale authorization caches preserving access after a relationship changes"
  ],
  "appliesTo": {
    "paths": [
      "/src/authorization",
      "/src/domain",
      "/tests/authorization"
    ],
    "stacks": [
      "authorization",
      "rbac",
      "rebac",
      "abac"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/authorization",
      "title": "Every protected operation asks one deny-first decision API",
      "summary": "Handlers call a central decision boundary with principal, action, resource, tenant, and trusted context before side effects begin.",
      "body": "Authorization is a server-side precondition for every protected read and write, not a UI feature or a role-name convention. Route handlers, jobs, GraphQL resolvers, batch actions, and internal tools call one decision interface with the authenticated principal, canonical action, loaded resource, trusted tenant, and current policy context. Any missing input, evaluation error, or unknown action denies.\n\n- Resolve principal and tenant from authenticated server state, never from an unverified request field.\n- Name actions from business capabilities such as invoice.approve rather than HTTP verbs or screen names.\n- Return a stable allow or deny result with policy version and reason code, without leaking sensitive relationship data.\n- Complete authorization before writes, external calls, queues, or protected response bytes.\n\nVerification: Remove each input, use an unknown action, inject an evaluator failure, and call the same operation through every transport; confirm all paths deny consistently.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/domain",
      "title": "Authorize the loaded object and its current relationships",
      "summary": "Permission checks bind to the exact server-loaded resource, parent, tenant, and relationship state used by the operation.",
      "body": "Checking permission to access a collection, route, or resource type does not authorize a specific object. Load the object through a tenant-safe lookup, derive its immutable identifiers and relevant parents, then evaluate the action against that exact state. Recheck inside the same consistency boundary when relationships or ownership can change concurrently.\n\n- Reject identifiers that resolve outside the authenticated tenant without revealing whether the object exists.\n- Apply checks to nested resources, exports, bulk selection, indirect references, and side-channel metadata such as counts.\n- Avoid post-filtering unauthorized rows after an unbounded query; constrain reads at the data or policy boundary.\n- Treat create operations as authorization against the intended parent and attributes, not a resource that does not exist yet.\n\nVerification: Swap object, parent, tenant, group, and owner ids across otherwise valid requests; confirm no content, timing detail, count, or mutation crosses the boundary.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/authorization",
      "title": "Policy changes invalidate affected authorization decisions",
      "summary": "Cached decisions are bounded by principal, action, resource, context, policy version, relationship version, and a deliberate lifetime.",
      "body": "Authorization caches can turn revoked membership, changed ownership, disabled accounts, or new policy into continuing access. Cache only after proving the complete decision key, and include every input that can change the result: principal, action, resource, tenant, relevant context, policy version, and relationship or data version. Prefer short request-scoped memoization for complex decisions.\n\n- Invalidate or version-bust on membership, role, ownership, policy, account, and tenant status changes.\n- Never share a cached allow across principals or resources because the public response looks identical.\n- Define failure behavior and maximum stale access explicitly; evaluator unavailability must not silently allow.\n- Measure hit rate, decision age, invalidations, and stale-deny or stale-allow test outcomes without logging sensitive tuples.\n\nVerification: Cache an allow, revoke each underlying relationship, and race reads with the change; confirm access ends within the documented bound.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/tests/authorization",
      "title": "Authorization tests prove denials and relationship edges",
      "summary": "The matrix covers every action across allowed, denied, cross-tenant, missing, stale, indirect, and concurrent relationship cases.",
      "body": "Happy-path role tests do not expose broken object-level authorization. Build a policy matrix from principal types, actions, resource states, ownership, group and hierarchy relationships, tenant boundaries, and exceptional attributes. For every allow, include the nearest denial created by changing one fact.\n\n- Test direct endpoints, nested routes, batch operations, exports, background jobs, and alternate transports that reach the same capability.\n- Include deleted, disabled, suspended, unowned, transferred, shared, inherited, and cyclic relationship cases.\n- Assert both the decision and the absence of protected fields, counts, timing clues, and side effects.\n- Run policy-model tests and integration tests against the real data loader and evaluator configuration.\n\nVerification: Generate the action-resource matrix from registered capabilities and fail CI when a new protected action has no explicit allow and deny cases.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/authorization",
      "title": "Roles, attributes, and relationships solve different dimensions",
      "summary": "RBAC groups stable job capabilities, ABAC adds trusted context, and ReBAC expresses resource relationships such as owner, member, parent, or viewer.",
      "body": "Use roles for stable bundles of capabilities, not for every team, customer, document, or exception. Use trusted attributes for contextual conditions such as account status, region, data classification, or approved time window. Use relationships when access depends on how a principal connects to a resource through ownership, membership, hierarchy, delegation, or sharing. Complex applications usually combine these dimensions behind one decision API.\n\nDo not copy relationship facts into ever-growing role names or accept authorization attributes from the client. Define tuple or relation ownership, cardinality, inheritance, cycle behavior, and deletion semantics. Keep policy readable enough that product and security owners can review the intended matrix. See /src/domain for canonical resource loading and /tests/authorization for edge coverage."
    },
    {
      "kind": "memory",
      "nodePath": "/src/authorization",
      "title": "Authorization decisions are explainable without exposing the graph",
      "summary": "Decision records retain safe reason codes, policy versions, and resource references while sensitive membership and policy internals stay protected.",
      "body": "Support, incident response, and audit need to know why access was allowed or denied, but returning raw policy traces can reveal group membership, hidden resources, tenant structure, or security rules. Define stable internal reason codes and a privileged explanation path separate from the ordinary application response.\n\nRecord principal, canonical action, protected resource reference, tenant, decision, policy version, evaluator status, and safe reason with correlation identifiers. Minimize attributes and relationship data in logs, apply retention and access controls, and never make the explanation record itself a bypass path. Aggregate denial categories for monitoring without high-cardinality sensitive labels. See the Security Audit Logging pattern for evidence integrity and access review."
    },
    {
      "kind": "skill",
      "nodePath": "/tests/authorization",
      "title": "review-authorization-model",
      "summary": "Review actions, resources, roles, attributes, relationships, loaders, caches, denials, and policy migrations as one authorization system.",
      "body": "---\nname: review-authorization-model\ndescription: Review an application authorization model and its enforcement paths for bypass and drift.\n---\n\n# Review Authorization Model\n\n1. Inventory protected actions and every transport, job, export, batch path, and internal tool that can invoke them.\n2. Map each action to canonical resource loading, tenant derivation, required roles, trusted attributes, relationships, exceptional states, and default denial.\n3. Trace one allow and the nearest deny through handler, policy decision, data query, side effects, cache, and audit evidence.\n4. Test cross-tenant ids, indirect references, nested and bulk operations, stale relationships, evaluator failure, policy migration, and concurrent ownership change.\n5. Record uncovered capabilities, ambiguous policy, sensitive explanations, cache risks, owner, and the evidence from a clean rerun.\n\nThe review is complete only when every protected capability has one enforceable decision boundary and explicit negative tests.",
      "skillTags": [
        "authorization",
        "rbac",
        "rebac",
        "security"
      ]
    }
  ]
};
