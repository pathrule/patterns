import type { Pattern } from "../types.js";

export const cdnEdgeCaching: Pattern = {
  "slug": "cdn-edge-caching",
  "version": "1.0.0",
  "name": "CDN and Edge Caching",
  "tagline": "Define cache keys, freshness, validation, privacy, invalidation, and origin protection as one contract.",
  "description": "CDN and edge caching change correctness as well as speed because a response can outlive the request, deployment, permission, or data state that produced it. This bundle defines cache eligibility, keys, Vary behavior, validators, freshness, stale serving, invalidation, and origin shielding. Unlike Cloudflare Workers, it governs HTTP cache semantics across providers rather than edge-compute APIs and deployment conventions.",
  "category": "Infra",
  "icon": "cloud",
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
  "metaTitle": "CDN edge caching pattern for AI coding agents",
  "metaDescription": "Safe cache eligibility, complete keys, Vary handling, validators, freshness, stale policy, invalidation, privacy, and origin protection across CDNs.",
  "problem": "Agents cache successful GET responses without proving that identity, locale, encoding, query, cookies, and authorization are represented in the cache contract.",
  "audience": "Teams serving dynamic or static web content through shared caches and CDNs",
  "prevents": [
    "Personalized or authorized responses shared across users",
    "Cache keys omitting locale, encoding, query, or representation inputs",
    "Invalidation that purges one URL while equivalent variants remain stale"
  ],
  "appliesTo": {
    "paths": [
      "/infra/cdn",
      "/src/api",
      "/public"
    ],
    "stacks": [
      "cdn",
      "http-cache",
      "edge",
      "caching"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Cache only responses with a complete representation key",
      "summary": "A shared response is cacheable only when every input that changes its bytes or authorization is represented or intentionally normalized.",
      "body": "A shared response is cacheable only when every input that changes its bytes or authorization is represented or intentionally normalized. URL-only keys can mix identities, tenants, locales, devices, experiments, encodings, query meanings, or cookie-selected representations. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Classify endpoints as public shared, private browser, or non-cacheable before setting response directives.\n- Normalize accepted query parameters and reject or bypass unknown variants that would fragment or poison the cache.\n- Use Vary for request headers that select a representation and configure CDN-specific key inputs consistently.\n- Never shared-cache a personalized response merely because authentication happens upstream; make identity variance explicit or mark it private or no-store.\n\nVerification: Request equivalent and different identities, tenants, locales, encodings, cookies, headers, and query orders through the real CDN; confirm hits only for byte-equivalent authorized representations.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra/cdn",
      "title": "Define freshness, validation, and stale behavior per content class",
      "summary": "Each cache policy names its freshness lifetime, validators, revalidation, stale permissions, purge path, and failure behavior.",
      "body": "Each cache policy names its freshness lifetime, validators, revalidation, stale permissions, purge path, and failure behavior. A single long TTL makes critical state wrong, while a single no-cache policy overloads origins and removes safe resilience for immutable content. Enforce this boundary in /infra/cdn so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Use immutable content-addressed assets with long freshness and never reuse a URL for different bytes.\n- Give mutable public content explicit freshness plus ETag or Last-Modified validation where the origin can determine equivalence correctly.\n- Permit stale responses only for content and failure modes the product has judged safe; honor must-revalidate where stale data would cause incorrect operation.\n- Protect the origin with request collapsing, shielding, bounded revalidation, and capacity that assumes a cold-cache event.\n\nVerification: Expire, revalidate, purge, disconnect the origin, and create a thundering-herd load for each content class; verify the documented stale and failure outcome.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/infra/cdn",
      "title": "Invalidation targets content identity, not one visible URL",
      "summary": "A resource can have path aliases, query variants, locales, encodings, device forms, and surrogate keys, so purging one URL may leave equivalent stale objects active.",
      "body": "A resource can have path aliases, query variants, locales, encodings, device forms, and surrogate keys, so purging one URL may leave equivalent stale objects active. Assign content or collection tags when generating cacheable responses and map mutations to the tags they invalidate.\n\nVersion assets and large immutable datasets instead of relying on global purge. Purge only after the new origin state is committed and observable. Measure invalidation propagation and keep an emergency bypass that does not expose private responses or overwhelm the origin. Keep the decision explicit at /infra/cdn; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/api for cache tags and /public for content-addressed assets. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Authorization and caching are one design decision",
      "summary": "A response generated after an authorization check can still be replayed by a shared cache unless cache eligibility and keying preserve that decision.",
      "body": "A response generated after an authorization check can still be replayed by a shared cache unless cache eligibility and keying preserve that decision. Decide whether the representation is public, tenant-shared, user-private, or non-cacheable at the same boundary that authorizes the request.\n\nKeep Set-Cookie and personalized headers from accidentally changing otherwise public objects. Use private browser caching only when the client may safely retain the data for the specified lifetime. Treat signed URLs and token-bearing query parameters as sensitive inputs with explicit cache and log policy. Keep the decision explicit at /src/api; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /infra/cdn for key configuration and the cache review skill for end-to-end tests. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-cdn-cache",
      "summary": "Review a CDN cache path for eligibility, keys, freshness, validators, stale behavior, invalidation, privacy, and origin load.",
      "body": "---\nname: review-cdn-cache\ndescription: Review a CDN cache path for eligibility, keys, freshness, validators, stale behavior, invalidation, privacy, and origin load.\n---\n\n# Review Cdn Cache\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Trace requests from client through every proxy and CDN layer to the origin, recording normalized URL, key inputs, bypass conditions, and response directives.\n2. Build a representation matrix for identity, tenant, locale, encoding, cookies, experiments, headers, query, and authorization; test hit and miss expectations.\n3. Exercise freshness, conditional validation, purge, mutation, stale-while-revalidate, stale-if-error where used, and disconnected-origin behavior.\n4. Load-test cold cache, expiry, and mass invalidation with shielding and request collapse; verify privacy, correctness, origin capacity, and observable cache reasons.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "cdn",
        "http-cache",
        "edge",
        "review"
      ]
    }
  ]
};
