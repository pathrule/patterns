import type { Pattern } from "../types.js";

export const ssrfEgressSecurity: Pattern = {
  "slug": "ssrf-egress-security",
  "version": "1.0.0",
  "name": "SSRF and Egress Security",
  "tagline": "Treat server-side URL fetching as a privileged network capability with validation at every hop.",
  "description": "Server-side request forgery turns image fetchers, webhooks, importers, previews, and integrations into paths toward internal services and cloud metadata. This bundle constrains schemes and destinations, validates resolved addresses, rechecks redirects, limits response handling, and enforces network egress. Unlike the broad Web Security pattern, it focuses on outbound requests initiated from attacker-influenced input.",
  "category": "Security",
  "icon": "route-off",
  "color": "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "SSRF and secure egress pattern for AI agents",
  "metaDescription": "Strict URL parsing, scheme and destination policy, DNS and IP validation, redirect rechecks, response limits, isolated fetchers, and egress tests.",
  "problem": "Agents pass user-provided URLs to a general HTTP client, block only obvious localhost strings, follow redirects automatically, and expose internal response content or timing.",
  "audience": "Teams building URL previews, webhook testers, media importers, feed readers, document fetchers, proxies, or server-side integrations",
  "prevents": [
    "Fetching loopback, private, link-local, metadata, or internal service addresses",
    "A public-looking hostname resolving or redirecting to a forbidden destination",
    "Large, slow, compressed, or unexpected responses exhausting the fetch service"
  ],
  "appliesTo": {
    "paths": [
      "/src/network/fetch",
      "/src/integrations",
      "/infra/egress"
    ],
    "stacks": [
      "ssrf",
      "http",
      "network-security",
      "egress"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/network/fetch",
      "title": "Parse once and allow only required URL schemes and forms",
      "summary": "A strict URL parser produces the canonical destination, and policy rejects every scheme, credential form, port, and hostname not required by the feature.",
      "body": "Do not secure outbound requests with substring checks or regular expressions over the raw URL. Parse with one well-tested library, reject parse ambiguity and embedded credentials, normalize the hostname deliberately, and allow only the schemes and ports the feature needs. Most remote-content features should accept HTTPS only.\n\n- Reject non-network schemes such as file, data, gopher, ftp, and runtime-specific handlers.\n- Handle IPv4, IPv6, integer, hexadecimal, octal, encoded, trailing-dot, Unicode, and mixed-case host representations through canonical parsing and tests.\n- Prefer a destination allowlist for known integrations and a narrow deny policy only when arbitrary public hosts are a true product requirement.\n- Keep the validated URL object through connection setup instead of reparsing or concatenating later.\n\nVerification: Run a corpus of alternative localhost, private-address, credential, port, and parser-confusion forms; confirm every equivalent forbidden destination is rejected.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/network/fetch",
      "title": "Validate every resolved address before connection",
      "summary": "All A and AAAA results are checked against destination policy, and the connection cannot switch to an unvalidated address.",
      "body": "A hostname string that looks public can resolve to loopback, private, link-local, multicast, reserved, documentation, or cloud metadata space. Resolve the canonical host through a controlled resolver, inspect every IPv4 and IPv6 result, and reject the request if any candidate violates policy or if the connector might choose a different unvalidated answer.\n\n- Apply explicit IP range classification rather than a short list of familiar private prefixes.\n- Bind or otherwise verify the chosen connection address to reduce DNS rebinding between validation and connect.\n- Restrict resolver search paths and internal DNS exposure for untrusted arbitrary-host features.\n- Treat resolution failure, mixed public and private answers, and unsupported address forms as denial.\n\nVerification: Test direct addresses, mixed A and AAAA answers, rebinding behavior, internal names, metadata ranges, and resolution races; confirm the socket reaches only an approved address.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/network/fetch",
      "title": "Redirects repeat the complete destination check",
      "summary": "Automatic redirects are disabled or each Location target is parsed, resolved, authorized, and counted before another request is sent.",
      "body": "A permitted public URL can redirect to an internal address, another scheme, an unexpected port, or a long redirect chain. Disable automatic redirect following whenever the feature does not need it. When redirects are required, treat each Location as a new untrusted URL and repeat parsing, scheme, port, hostname, DNS, and IP checks before connection.\n\n- Set a small redirect limit and detect loops using canonical destinations.\n- Do not forward authorization headers, cookies, client certificates, or signed request data across origins.\n- Apply the same timeout, response-size, content-type, and egress policy on every hop.\n- Record safe destination categories and rejection reasons without logging secrets embedded in input.\n\nVerification: Redirect a public host through multiple encodings to loopback, metadata, another scheme, and a second origin; confirm no forbidden hop receives a request or credential.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra/egress",
      "title": "The fetcher runs behind enforced network and response limits",
      "summary": "Network policy blocks internal destinations while the client bounds connect time, total time, bytes, decompression, content type, and concurrency.",
      "body": "Application validation can regress, so the runtime that performs untrusted fetches must also lack network reach to sensitive internal services and metadata endpoints. Place the capability in an isolated worker or workload with the narrowest outbound policy, no ambient cloud credentials, no internal service discovery, and a dedicated identity.\n\n- Enforce connect, read, and total deadlines plus maximum redirects, headers, compressed bytes, decompressed bytes, and concurrent requests.\n- Stream into bounded storage and stop before parsing unexpected or oversized content.\n- Resolve and connect through the approved proxy or egress gateway so policy cannot be bypassed by a custom client.\n- Expose only the minimal normalized result to callers, never raw internal headers, socket errors, or timing detail.\n\nVerification: Bypass application checks in a test environment and attempt internal, metadata, oversized, slow, compressed-bomb, and high-concurrency requests; confirm infrastructure contains each case.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/integrations",
      "title": "Outbound fetch is a capability, not a reusable convenience helper",
      "summary": "Features receive purpose-specific fetch operations with fixed policy instead of direct access to a general HTTP client.",
      "body": "A general fetch(url, options) helper spreads SSRF review across every caller and lets later code add methods, headers, bodies, redirects, or destinations the original feature never required. Expose purpose-specific operations such as fetchPublicImage, deliverWebhookToVerifiedEndpoint, or readApprovedFeed with policy fixed inside the boundary.\n\nGive each capability its own allowed methods, schemes, ports, destination model, credentials, request body, redirect behavior, content types, size limits, and normalized result. Keep vendor API clients separate from arbitrary public-content fetchers. Review any new option as an expansion of network authority. See /src/network/fetch for canonical validation and /infra/egress for the independent containment layer."
    },
    {
      "kind": "rule",
      "nodePath": "/src/integrations",
      "title": "Untrusted fetch capability has an accountable usage budget",
      "summary": "Callers are authenticated, authorized, rate limited, metered, and attributable before they can spend outbound network and parsing resources.",
      "body": "Even a destination-safe fetcher can become a scanning, bandwidth, storage, or denial-of-service primitive. Require an authenticated caller or narrowly scoped workload identity, authorize the named fetch capability, and charge each request to a tenant, user, job, or integration budget before network work begins. Anonymous features need a separately constrained public abuse policy.\n\n- Limit request rate, concurrent work, total bytes, unique destinations, retries, and retained output by accountable subject.\n- Prevent one redirect chain, batch request, or retry loop from escaping the original budget.\n- Expose safe rejection categories and correlation ids while hiding target resolution and internal network detail.\n- Alert on repeated forbidden destinations, limit exhaustion, unusual host diversity, and policy bypass attempts.\n\nVerification: Distribute abusive requests across redirects, batches, retries, tenants, and worker restarts; confirm consumption stays bounded and attributable.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "skill",
      "nodePath": "/src/network/fetch",
      "title": "test-ssrf-boundary",
      "summary": "Exercise parser confusion, DNS answers, redirects, response limits, credentials, and infrastructure egress against a controlled malicious server.",
      "body": "---\nname: test-ssrf-boundary\ndescription: Test an outbound URL-fetching boundary against SSRF and resource-exhaustion cases.\n---\n\n# Test SSRF Boundary\n\n1. Inventory every caller, accepted input form, HTTP method, header, credential, scheme, port, redirect behavior, parser, resolver, proxy, and runtime network path.\n2. Run canonicalization cases for IPv4, IPv6, encoded and alternate numeric forms, Unicode names, credentials, fragments, ports, and non-HTTP schemes.\n3. Serve controlled DNS answers that are private, mixed, changed between lookup and connect, or redirected through several hops.\n4. Attempt metadata and internal services, slow responses, excessive headers, large and highly compressed bodies, wrong content types, redirect loops, and concurrency pressure.\n5. Confirm both application policy and infrastructure deny safely, record the actual connected address, and retain regression fixtures for every bypass found.\n\nA passing test proves the network destination, not merely the input string, stayed inside policy.",
      "skillTags": [
        "ssrf",
        "security",
        "egress",
        "testing"
      ]
    }
  ]
};
