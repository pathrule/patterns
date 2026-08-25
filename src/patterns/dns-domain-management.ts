import type { Pattern } from "../types.js";

export const dnsDomainManagement: Pattern = {
  "slug": "dns-domain-management",
  "version": "1.0.0",
  "name": "DNS and Domain Management",
  "tagline": "Manage zones, delegation, DNSSEC, records, TTLs, and cutovers as reviewed production infrastructure.",
  "description": "DNS and domain management joins registrar delegation, authoritative zones, record semantics, certificates, email security, DNSSEC, and application ownership. A small record edit can redirect traffic or mail long after deployment because resolvers cache it. This bundle defines declarative ownership, safe cutovers, delegation and DNSSEC sequencing, and independent verification. Unlike CDN and Edge Caching, it governs naming authority and resolution rather than HTTP representation caching.",
  "category": "Infra",
  "icon": "globe-2",
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
  "metaTitle": "DNS and domain operations pattern for AI agents",
  "metaDescription": "Declarative zone ownership, reviewed record changes, TTL-aware cutovers, delegation and DNSSEC sequencing, independent resolution checks, and rollback evidence.",
  "problem": "Agents edit live DNS ad hoc, assume TTL is a propagation timer, change delegation before the new zone is ready, or break DNSSEC by moving signing and DS records out of order.",
  "audience": "Platform and infrastructure teams managing production domains, authoritative DNS zones, service records, email records, and provider migrations",
  "prevents": [
    "Traffic or email cutovers with no verified destination and rollback plan",
    "Zone and registrar state drifting from reviewed infrastructure configuration",
    "DNSSEC validation failures during nameserver or signing transitions"
  ],
  "appliesTo": {
    "paths": [
      "/infra/dns",
      "/ops/domains",
      "/tests/dns"
    ],
    "stacks": [
      "dns",
      "domains",
      "dnssec",
      "infrastructure"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra/dns",
      "title": "Production DNS records have one reviewed source of truth",
      "summary": "Zones and records are declared with owner, purpose, environment, change history, and provider mapping instead of maintained through dashboard drift.",
      "body": "DNS changes route production traffic, mail, certificate validation, and third-party verification, so they require the same review and rollback discipline as code. Keep supported zones and records in a declarative source or controlled change system that records owner, purpose, environment, provider, record type, name, value, TTL intent, dependencies, and change history.\n\n- Restrict direct dashboard edits to documented emergency access and reconcile them back immediately.\n- Validate names, types, values, duplicates, conflicting records, zone boundaries, trailing-dot behavior, and environment separation before apply.\n- Protect apex, nameserver, mail, certificate, and ownership-verification records with appropriate review ownership.\n- Detect drift between declared, provider, registrar, and observed authoritative state.\n\nVerification: Make an emergency provider edit in a test zone and confirm drift detection identifies the exact record and recovery path without overwriting unrelated changes.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/ops/domains",
      "title": "Cutovers are TTL-aware two-sided migrations",
      "summary": "The new destination is proven first, cache lifetime is lowered in advance when useful, and old service remains available through the rollback window.",
      "body": "TTL controls how long a resolver may cache an answer; it does not promise that every client updates at one universal moment. Plan both the DNS record change and the readiness of old and new destinations. Lower TTL sufficiently before the cutover only when faster rollback is needed, wait for prior longer caches to age, and restore the normal value after stability.\n\n- Verify the new origin, certificate, host routing, health, capacity, observability, and data compatibility before directing traffic.\n- Keep the old destination capable of serving mixed traffic for the documented cache and rollback window.\n- Change one resolution boundary at a time and record exact old and new values.\n- Test from multiple independent resolvers and networks while distinguishing recursive cache from authoritative state.\n\nVerification: Rehearse the change and rollback with representative cached answers; confirm both destinations remain correct during mixed resolution.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/ops/domains",
      "title": "DNSSEC transitions coordinate signer and parent delegation",
      "summary": "Signing keys, DNSKEY publication, DS records at the registrar or parent, nameserver changes, validation, and rollback follow an explicit safe sequence.",
      "body": "DNSSEC creates a chain of trust between the parent zone and the authoritative signer. A stale or premature DS record can make otherwise present records fail validation. Treat enablement, key rotation, provider migration, multi-signer operation, algorithm change, and disablement as planned transitions across both the DNS provider and registrar or parent.\n\n- Inventory current nameservers, DNSKEY, DS, signer state, algorithms, key tags, and delegation before changing anything.\n- Publish and observe new signing material before making the parent require it, and remove parent trust before retiring the only matching signer.\n- Validate with independent DNSSEC-aware resolvers and authoritative queries at each stage.\n- Preserve exact rollback steps and avoid combining delegation, zone-content, and trust changes without a tested migration design.\n\nVerification: Rehearse the sequence in a delegated test zone and prove signed positive and negative answers throughout transition and rollback.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/ops/domains",
      "title": "Registrar, registry, parent, and authoritative provider own different state",
      "summary": "Domain registration, parent delegation and DS, nameserver service, and zone records cross organizational and technical control planes.",
      "body": "A domain can be registered with one company, delegated by a registry or parent zone, signed through registrar-managed DS records, and served authoritatively by another DNS provider. Application hosting and certificate providers may create additional records without owning delegation. Document accounts, legal owner, renewal, lock and recovery settings, nameserver set, DS management path, authoritative zone, billing owner, and emergency access separately.\n\nUse role-based access and strong recovery controls for registrar and DNS accounts, with no shared personal ownership. Monitor expiration, nameserver and DS changes, and unauthorized zone edits. See /infra/dns for record source of truth and /tests/dns for observed-state verification."
    },
    {
      "kind": "memory",
      "nodePath": "/tests/dns",
      "title": "DNS verification asks authoritative and recursive questions",
      "summary": "Checks distinguish configured provider state, authoritative answers, parent delegation, DNSSEC validation, and recursive resolver caches.",
      "body": "A provider dashboard can show the desired record while the delegated authoritative nameserver serves something else, and a recursive resolver can continue serving a valid cached answer after authoritative state changes. Verification queries the parent delegation and DS, each authoritative nameserver, several independent validating recursive resolvers, and the application path that consumes the name.\n\nCheck expected record type, value, TTL, aliases, negative answers, IPv4 and IPv6, mail and certificate dependencies, and DNSSEC status. Record query time and responding server so differences are explainable. Do not declare propagation complete from one workstation cache or an online checker with unknown behavior. See /ops/domains for cutover acceptance and rollback criteria."
    }
  ]
};
