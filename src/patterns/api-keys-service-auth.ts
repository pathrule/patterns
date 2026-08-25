import type { Pattern } from "../types.js";

export const apiKeysServiceAuth: Pattern = {
  "slug": "api-keys-service-auth",
  "version": "1.0.0",
  "name": "API Keys and Service-to-Service Authentication",
  "tagline": "Issue machine credentials with scopes, prefixes, hashing, rotation, audit, expiration, and leak response.",
  "description": "API keys identify software rather than a human session, so issuance, one-time display, storage, lookup, comparison, scope, environment, network context, rotation, expiration, audit, and compromise response must be designed as a credential lifecycle. This pattern constrains key storage, scope, and transport while recording machine-identity semantics for service and customer integrations. It differs from user authentication and enterprise SSO because keys represent applications, jobs, devices, or integrations and often run unattended for long periods.",
  "category": "Security",
  "icon": "key-square",
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
  "metaTitle": "API key service auth pattern for AI agents",
  "metaDescription": "API key issuance, prefixes, hashing, scopes, environment separation, transport, rotation, expiration, audit, rate limits, and leak response. In production.",
  "problem": "AI agents often store plaintext keys, put them in query strings, grant account-wide authority, or rotate by invalidating the old credential before dependents can move.",
  "audience": "Platform teams authenticating customer integrations, internal services, automation, devices, or command-line clients",
  "prevents": [
    "Recovering every active API key from a database breach",
    "Leaking credentials through URLs and access logs",
    "Using one production key across several unrelated services",
    "Causing outage during an uncoordinated key rotation"
  ],
  "appliesTo": {
    "paths": [
      "/src/auth",
      "/src/api",
      "/ops/credentials"
    ],
    "stacks": [
      "api-keys",
      "service-auth",
      "machine-identity",
      "security",
      "api"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Store only a verifier for API keys",
      "summary": "Generate high-entropy credentials, display the secret once, and retain a prefix plus cryptographic verifier for lookup and comparison.",
      "body": "An API key is a bearer secret. Storing it in plaintext means a database read becomes immediate access to every integration without an additional secret boundary.\n\n- Generate key material with a cryptographically secure source and enough entropy to resist guessing independent of rate limiting.\n- Use a non-secret public prefix or identifier to find the record and store the secret portion through an approved password-style hash or keyed verifier design.\n- Compare verifiers through the library's safe function and return one generic authentication failure for unknown, expired, disabled, and incorrect values.\n- Show the secret only at creation or rotation and require the caller to create a replacement when it is lost.\n\nSee /ops/credentials for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Authorize keys by narrow service scope",
      "summary": "Bind each credential to one principal, environment, allowed operations, resources, and optional network or workload constraints.",
      "body": "A key that means full account access becomes a permanent unattended administrator password. Machine credentials need permissions aligned to the integration's actual job.\n\n- Represent the key as a dedicated service principal or integration identity rather than impersonating a human owner silently.\n- Grant explicit operation and resource scopes and default new capabilities to unavailable until the key owner opts in.\n- Separate development, staging, and production keys and reject a credential outside its environment or intended audience.\n- Apply per-key and per-principal rate, quota, and anomaly controls without treating source IP as the sole authentication factor.\n\nSee /src/auth for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Accept API keys only through protected transport and bounded logging",
      "summary": "Require HTTPS, use a dedicated authorization header, and redact credentials from logs, traces, errors, analytics, and support artifacts.",
      "body": "Keys in query strings leak through browser history, referrers, proxies, access logs, dashboards, and copied URLs. Even headers can leak when generic request logging records them.\n\n- Reject plaintext transport and accept the credential through the documented header or protocol field, not URLs or ordinary form data.\n- Redact full key values and authorization headers at the earliest observability boundary and scan error and debug paths too.\n- Log public key prefix or record identity, service principal, scope decision, operation, outcome, and source context for audit without retaining the secret.\n- Prevent credentials from being accepted in browser-facing cross-origin contexts unless the integration and storage threat model explicitly supports that client.\n\nSee /ops/credentials for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/ops/credentials",
      "title": "Rotation overlaps credentials and preserves attribution",
      "summary": "Issue a replacement beside the old key, identify adoption, then revoke the prior key after a bounded migration window.",
      "body": "Immediate replacement causes unattended clients to fail, while indefinite overlap leaves compromised credentials active. Rotation needs two distinguishable keys and observable use.\n\n- Create a new key with the same or narrower principal and scopes and show its secret once through an authenticated owner workflow.\n- Track last use and recent operation evidence separately for old and new key identities so the owner can prove migration.\n- Set an overlap deadline, notify the owner, and revoke the old key after adoption or immediately when compromise requires it.\n- Keep audit records after revocation according to policy and ensure caches and gateways stop accepting the old verifier promptly.\n\nSee /src/auth for the rule or workflow that puts this decision into practice."
    }
  ]
};
