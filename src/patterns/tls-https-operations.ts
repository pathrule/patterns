import type { Pattern } from "../types.js";

export const tlsHttpsOperations: Pattern = {
  "slug": "tls-https-operations",
  "version": "1.0.0",
  "name": "TLS Certificates and HTTPS Operations",
  "tagline": "Operate certificate identity, issuance, renewal, trust chains, protocol policy, and key rotation.",
  "description": "HTTPS failures are lifecycle failures as often as cryptographic failures: the certificate covers the wrong names, an intermediate is missing, renewal cannot complete from the real ingress, a private key is copied too broadly, or clients pin assumptions the operator cannot rotate. This pattern constrains certificate identity, key access, protocol policy, and redirect behavior; it records automated renewal and internal trust decisions and supplies issue and rotation runbooks. It complements DNS and secrets patterns but focuses on transport identity, certificate chains, handshake compatibility, mTLS, renewal challenges, and staged key replacement.",
  "category": "Infra",
  "icon": "globe-lock",
  "color": "bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "TLS and HTTPS operations pattern for AI agents",
  "metaDescription": "TLS certificate names, chains, automated renewal, private-key access, HTTPS redirects, protocol policy, mTLS, monitoring, and rotation. In production.",
  "problem": "AI agents often install only a leaf certificate, reuse private keys across environments, redirect challenge traffic incorrectly, or declare renewal solved without testing the deployed chain and next replacement.",
  "audience": "Platform and security teams operating public HTTPS and internal mutual TLS endpoints",
  "prevents": [
    "Serving a certificate that omits a production hostname",
    "Breaking clients by omitting an intermediate certificate",
    "Allowing broad filesystem or secret-store access to private keys",
    "Discovering failed renewal only after certificate expiry"
  ],
  "appliesTo": {
    "paths": [
      "/infra/tls",
      "/deploy",
      "/ops/runbooks"
    ],
    "stacks": [
      "tls",
      "https",
      "certificates",
      "mtls",
      "pki"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra/tls",
      "title": "Issue certificates for the exact service identities",
      "summary": "List canonical names and service identities explicitly, prove control through the chosen challenge path, and avoid wildcard convenience without an ownership model.",
      "body": "A valid certificate is valid only for its encoded identities and trust chain. DNS aliases, internal names, load-balancer endpoints, and service-mesh identities need an intentional mapping rather than assumptions based on the common name.\n\n- Declare every public hostname the endpoint serves and remove retired names through a staged traffic and certificate change rather than silently relying on an old SAN.\n- Use a challenge method compatible with the real ingress and DNS ownership; test that redirects, proxies, firewalls, and split-horizon records do not intercept validation.\n- Use wildcards only when the DNS credential and issuance scope match the blast radius, and remember that a wildcard does not automatically cover the zone apex.\n- For internal mTLS, define workload identities and trust domains separately from public DNS names instead of using one broad certificate for every service.\n\nSee /deploy for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy",
      "title": "Serve the complete chain and verify it from outside",
      "summary": "Deploy the leaf with required intermediates, keep roots out of the served chain, and test name and chain validation from representative clients.",
      "body": "A server can appear healthy in one browser because that client cached an intermediate while clean clients fail to build the chain. The deployed artifact must be self-sufficient for supported trust stores.\n\n- Configure the service with the leaf certificate followed by the required intermediate certificates in issuer order.\n- Do not serve a private root as if it were an intermediate; distribute internal trust anchors through the client trust-management channel.\n- Probe the public endpoint from outside the cluster or load balancer and inspect negotiated protocol, presented chain, hostname validation, and expiry.\n- Test representative older and automated clients where compatibility matters; browser success alone does not prove command-line, mobile, or embedded trust behavior.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra/tls",
      "title": "Limit private-key access and make replacement routine",
      "summary": "Generate and store keys in the narrowest execution boundary, prohibit copying across environments, and rotate by overlapping valid credentials.",
      "body": "The certificate is public; the private key is the service's identity. A copied or over-readable key lets an attacker impersonate the endpoint until trust is removed, even if the certificate file itself is rotated.\n\n- Generate keys through the approved secret, key-management, or workload-identity system and grant read or signing access only to the terminating service.\n- Use separate keys for environments and independent services so one compromise does not require a fleet-wide emergency replacement.\n- Do not place keys in images, repositories, logs, support bundles, or general environment dumps; mount or retrieve them through the platform's protected mechanism.\n- Practice replacement with overlapping certificate validity and reload support, then revoke or remove the prior key after all terminating instances have changed.\n\nSee /deploy for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy",
      "title": "Redirect to HTTPS without breaking bootstrap and recovery",
      "summary": "Make secure transport canonical while preserving certificate validation paths, health behavior, and a staged route to strict transport policy.",
      "body": "A blanket redirect can loop behind a proxy, hide a failed challenge endpoint, or make recovery harder after strict transport policy reaches clients. Redirect and header policy must follow verified request provenance and deployment order.\n\n- Determine the original scheme from a trusted proxy contract, not an arbitrary public header, before redirecting HTTP to the canonical HTTPS origin.\n- Exclude or correctly route the certificate challenge path required by the active issuance method and test renewal through the production edge.\n- Introduce strict transport policy only after every covered hostname works on HTTPS and the organization accepts the persistence and subdomain consequences.\n- Keep health and internal administration routes aligned with the intended transport boundary; do not leave a privileged plaintext bypass because it is convenient inside the network.\n\nSee /infra/tls for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/ops/runbooks",
      "title": "Certificate renewal is an observed deployment loop",
      "summary": "Automate issue, distribute, activate, verify, and alert stages, with enough lead time to repair the entire loop before expiry.",
      "body": "Obtaining a renewed certificate is not success if the load balancer, proxy, secret mount, or long-running process still serves the old one. The lifecycle ends only when every public endpoint presents the replacement.\n\n- Track certificate expiry from the outside and alert with enough lead time for failed issuance, approval, distribution, and rollback.\n- After renewal, reload or roll terminating services through a bounded deployment and query each endpoint or region for the served serial and expiry.\n- Monitor issuance and activation failures separately; one proves authority could not mint a certificate, the other proves the workload did not adopt it.\n- Retain renewal logs and ownership without retaining private-key material so operators can distinguish DNS, rate, permission, and deployment failures.\n\nSee /infra/tls for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/infra/tls",
      "title": "mTLS authenticates a workload, not an authorization decision",
      "summary": "Validate client identity and trust chain at the transport edge, then map that identity to explicit service permissions.",
      "body": "A trusted client certificate proves possession of a key under an accepted authority. It does not by itself decide which tenant, method, topic, or resource the workload may access.\n\n- Validate client chain, validity, intended usage, and workload identity at the endpoint; reject ambiguous fallback to unauthenticated transport.\n- Map the verified identity to a service principal and apply authorization at the application or gateway operation boundary.\n- Plan client and server trust-bundle rotation with overlapping roots or intermediates so both sides can move without a synchronized outage.\n- Record peer identity and authorization outcome in structured audit signals without logging certificate private material or unnecessary subject data.\n\nSee /deploy for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "rotate-tls-certificate",
      "summary": "Issue, stage, activate, verify, and retire a TLS certificate and key without interrupting supported clients.",
      "body": "---\nname: rotate-tls-certificate\ndescription: Rotate a public or internal TLS certificate, private key, intermediate, or trust bundle.\n---\n\n# Rotate Tls Certificate\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Inventory every terminating endpoint, identity, issuer, secret location, reload mechanism, client trust dependency, and owner affected by the rotation.\n2. Issue the replacement through the approved authority and validate names, usage, chain, key access, and challenge or enrollment evidence before distribution.\n3. Stage new certificate and trust material with overlap, then reload or roll a small target while retaining the prior credential for rollback.\n4. Probe handshake, chain, hostname, client authentication, protocol, and application health from representative networks and clients.\n5. Complete rollout, confirm every target presents the replacement, retire the prior key and certificate according to policy, and update expiry monitoring to the new identity.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "tls",
        "https",
        "certificates",
        "rotation",
        "pki"
      ]
    }
  ]
};
