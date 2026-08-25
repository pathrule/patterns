import type { Pattern } from "../types.js";

export const enterpriseSsoSamlOidc: Pattern = {
  "slug": "enterprise-sso-saml-oidc",
  "version": "1.0.0",
  "name": "Enterprise SSO with SAML and OIDC",
  "tagline": "Operate enterprise SSO with tenant-bound issuers, signed responses, secure linking, JIT, SCIM, and rotation.",
  "description": "Enterprise SSO connects each customer tenant to an external identity provider whose issuer, keys, metadata, claims, certificates, domains, provisioning, and deprovisioning lifecycle can change independently. This pattern constrains tenant discovery, protocol validation, account linking, and session issuance; it records JIT and provisioning ownership and supplies a metadata and certificate rotation workflow. It deepens generic authentication by focusing on multi-tenant enterprise federation, SAML assertions, OIDC issuers, IdP-initiated entry, and lifecycle coordination with SCIM.",
  "category": "Security",
  "icon": "handshake",
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
  "metaTitle": "Enterprise SSO SAML OIDC pattern for agents",
  "metaDescription": "Enterprise SSO tenant discovery, SAML and OIDC validation, signed responses, account linking, JIT, SCIM, session issuance, and certificate rotation.",
  "problem": "AI agents often select a tenant from an unverified email domain, accept an assertion for the wrong audience, link accounts by mutable email alone, or keep access after the IdP deprovisions a user.",
  "audience": "SaaS identity teams supporting customer-managed SAML or OpenID Connect providers",
  "prevents": [
    "Routing a user to an attacker-controlled tenant connection",
    "Accepting a token or assertion issued for another application",
    "Taking over an existing account through unsafe email linking",
    "Leaving enterprise access active after deprovisioning"
  ],
  "appliesTo": {
    "paths": [
      "/src/auth/sso",
      "/src/provisioning",
      "/tests/sso"
    ],
    "stacks": [
      "saml",
      "oidc",
      "sso",
      "scim",
      "enterprise"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/auth/sso",
      "title": "Bind every federation response to tenant and login transaction",
      "summary": "Resolve the approved connection first, then validate issuer, audience, destination, signature, nonce or request correlation, time, and replay for that tenant.",
      "body": "A structurally valid response is not valid for every tenant or application. Federation security comes from binding it to the exact connection and login initiated by this client.\n\n- Resolve connection through a trusted tenant choice, verified domain policy, or opaque login transaction, never from untrusted response claims alone.\n- For OIDC, validate issuer, audience, signature, time, nonce, state, and authorization-code flow through the configured provider metadata.\n- For SAML, validate signature placement, issuer, audience, recipient or destination, time conditions, request correlation where used, and assertion replay.\n- Reject responses that match more than one tenant or connection and log stable connection and transaction identities without retaining raw sensitive assertions.\n\nSee /tests/sso for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/auth/sso",
      "title": "Link enterprise identities through verified stable keys",
      "summary": "Use tenant connection plus immutable provider subject, and require authenticated proof before attaching SSO to an existing local account.",
      "body": "Email addresses can change, be reassigned, collide across tenants, or arrive unverified. Automatic linking by email can hand an existing account to a different external identity.\n\n- Store enterprise identity by tenant or connection and stable provider subject, preserving issuer and protocol identity.\n- Use email for display or discovery only when its verification and tenant-domain policy are explicit.\n- Require an authenticated existing session, administrative action, or other strong proof before linking an SSO identity to an existing non-federated account.\n- Handle provider subject or tenant changes as controlled migration, never as a silent fallback to matching the latest email.\n\nSee /src/provisioning for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/auth/sso",
      "title": "Issue local sessions only after local authorization",
      "summary": "Translate a valid external identity into current tenant membership, status, policy, and role checks before creating the application session.",
      "body": "Federation authentication proves the IdP's statement. The application still owns tenant access, suspension, product entitlements, local policy, and resource authorization.\n\n- Resolve the local user and tenant membership after protocol validation and reject suspended, deleted, unassigned, or policy-blocked access.\n- Map external groups or roles through a tenant-owned allowlist and default to minimum access; do not accept arbitrary claim values as application permissions.\n- Keep the local session bounded and revocable and decide how IdP session, reauthentication, and logout affect it.\n- Re-evaluate sensitive authorization against current local state rather than assuming claims captured at login remain valid indefinitely.\n\nSee /src/provisioning for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/provisioning",
      "title": "Make provisioning and deprovisioning idempotent and monotonic",
      "summary": "Apply SCIM or administrative changes by stable external identity and prevent stale events from restoring removed access.",
      "body": "Provisioning systems retry and can deliver updates around manual changes. A delete, disable, group removal, or later stale update must not produce contradictory access.\n\n- Use provider resource identity and tenant connection as the idempotent key for users and groups.\n- Track version or modification time where trustworthy and reject stale updates that would move deprovisioned state backward.\n- On disable or removal, revoke sessions and access through a durable local transition and preserve audit evidence.\n- Define precedence between SCIM, JIT, administrator edits, and group mapping so one path cannot silently undo another's security decision.\n\nSee /src/auth/sso for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/auth/sso",
      "title": "JIT provisioning creates minimum local state",
      "summary": "Create a user only from an approved connection and verified claims, then assign no more access than tenant policy grants.",
      "body": "Just-in-time creation is convenient but can turn any successfully authenticated external identity into a tenant member if connection and group policy are broad.\n\n- Enable JIT per tenant and connection and require the claims the tenant policy needs for identity and membership.\n- Create the local user and stable external identity link atomically so login retry cannot create duplicates.\n- Assign baseline access through explicit domain or group mapping and send uncertain cases to administrator approval.\n- Reconcile later SCIM or administrative provisioning with the same stable identity instead of creating a second account.\n\nSee /src/provisioning for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/provisioning",
      "title": "Federation metadata is versioned security configuration",
      "summary": "Track issuer, endpoints, keys, certificates, entity IDs, client settings, domains, and claim mapping with owner and rotation state.",
      "body": "IdP keys and certificates rotate while endpoints, entity identifiers, and claims can also change. Ad hoc console edits leave no review or overlap plan.\n\n- Store connection configuration encrypted and tenant-scoped with audit history and a safe test mode.\n- Support overlapping signing keys or certificates during rotation where the protocol and provider permit it.\n- Validate fetched metadata origin and changes before adoption; do not let an attacker-controlled URL rewrite trust automatically.\n- Monitor login failures and credential expiry by connection and notify the tenant owner before the existing trust material stops working.\n\nSee /tests/sso for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "rotate-enterprise-sso-metadata",
      "summary": "Stage, test, activate, observe, and retire SAML or OIDC trust material without locking out a tenant.",
      "body": "---\nname: rotate-enterprise-sso-metadata\ndescription: Rotate an enterprise IdP certificate, signing key, client credential, endpoint, issuer, or metadata document.\n---\n\n# Rotate Enterprise Sso Metadata\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Inventory tenant connection, protocol, issuer or entity ID, endpoints, audiences, keys, certificates, client secrets, claim maps, domains, and owner.\n2. Validate new metadata through a trusted channel and stage overlapping verification material while keeping the active path available.\n3. Run service-provider and identity-provider initiated flows where supported, including valid, old-key, new-key, wrong-audience, expired, replayed, and deprovisioned users.\n4. Activate for a bounded tenant cohort and monitor protocol validation categories, login success, account linking, session issuance, and support signals.\n5. Retire old trust only after provider confirmation and observed new-key traffic, then update expiry monitoring and the tenant-facing recovery record.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "sso",
        "saml",
        "oidc",
        "rotation",
        "enterprise"
      ]
    }
  ]
};
