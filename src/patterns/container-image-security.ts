import type { Pattern } from "../types.js";

export const containerImageSecurity: Pattern = {
  "slug": "container-image-security",
  "version": "1.0.0",
  "name": "Container and Image Security",
  "tagline": "Build traceable images, minimize contents, verify provenance, and constrain runtime power.",
  "description": "Container and image security starts before a registry pull and continues through admission and runtime. This bundle covers pinned inputs, secret-free builds, provenance and signature verification, vulnerability triage, base-image refresh, and least-power runtime settings. Unlike Docker Containers, it focuses on supply-chain trust and compromise containment rather than general Dockerfile construction and container lifecycle conventions.",
  "category": "Security",
  "icon": "scan-line",
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
  "metaTitle": "Container image security for AI coding agents",
  "metaDescription": "Pinned image inputs, secret-free builds, provenance checks, vulnerability triage, and least-power runtime settings for container delivery pipelines.",
  "problem": "Agents optimize for a working image, then pull mutable tags, leak build credentials into layers, ignore provenance, or grant runtime privileges the workload never needs.",
  "audience": "Teams building, publishing, admitting, and operating OCI container images",
  "prevents": [
    "Mutable base images that change without code review",
    "Secrets and build tools left in published layers",
    "Signed but vulnerable images admitted with excessive runtime privileges"
  ],
  "appliesTo": {
    "paths": [
      "/deploy",
      "/.github/workflows",
      "/k8s"
    ],
    "stacks": [
      "containers",
      "oci",
      "slsa",
      "kubernetes"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/deploy",
      "title": "Pin every image input by immutable digest",
      "summary": "Base, tool, and deployment images resolve to reviewed digests rather than mutable tags.",
      "body": "Base, tool, and deployment images resolve to reviewed digests rather than mutable tags. A tag can point to different bytes between build, test, and production, invalidating review and making rollback ambiguous. Enforce this boundary in /deploy so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Keep the human-readable tag as an annotation, but make the digest the value used by builds and deployments.\n- Update digests through an automated change that includes upstream release notes, scan results, and rebuild impact.\n- Reject floating tags in Dockerfiles, compose files, build actions, and workload manifests.\n- Record the digest of every stage, including build-only and migration images.\n\nVerification: Re-resolve all declared tags and confirm the reviewed digest is the one built and admitted; change a tag upstream and prove deployment bytes do not drift.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/k8s",
      "title": "Run containers with the least kernel authority",
      "summary": "Workloads drop unnecessary privileges, capabilities, writes, and host integration at admission time.",
      "body": "Workloads drop unnecessary privileges, capabilities, writes, and host integration at admission time. A small application vulnerability becomes a host or cluster compromise when the container runs as root, writes its image, or reaches host namespaces. Enforce this boundary in /k8s so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Require a non-root user, disable privilege escalation, drop capabilities by default, and add back only reviewed needs.\n- Use a read-only root filesystem and explicit writable volumes for the few paths that need state.\n- Block privileged mode, host PID, host network, host paths, and unrestricted device access unless a security-owned exception exists.\n- Apply CPU, memory, process, and ephemeral-storage limits so compromise cannot become node-wide exhaustion.\n\nVerification: Deploy a deliberately over-privileged fixture and confirm admission rejects it; run the real workload under the final policy and exercise startup, shutdown, and maintenance paths.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/deploy",
      "title": "A signature is useful only with an identity policy",
      "summary": "Cryptographic verification must identify the signer and the approved build context, not merely report that bytes have a signature.",
      "body": "Cryptographic verification must identify the signer and the approved build context, not merely report that bytes have a signature. A valid signature proves a key or identity signed bytes, but trust comes from checking who signed, for which repository, through which builder, and from what source revision.\n\nBind admission to the expected issuer, subject, source repository, workflow, and immutable artifact digest. Store provenance beside the image and make the deployment verify it rather than trusting a CI badge. Keep emergency unsigned admission separate, time-bound, and observable because a blanket bypass removes the value of signing. Keep the decision explicit at /deploy; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /.github/workflows for provenance production and /k8s for the admission boundary. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-container-image",
      "summary": "Review one container image for provenance, contents, vulnerabilities, and runtime permissions before release.",
      "body": "---\nname: review-container-image\ndescription: Review one container image for provenance, contents, vulnerabilities, and runtime permissions before release.\n---\n\n# Review Container Image\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Resolve the deployed digest and verify its signature and provenance against the approved builder, repository, workflow, and source revision.\n2. Inspect layers and the final filesystem for package managers, shells, compilers, credentials, private keys, tokens, and files copied from an unintended build context.\n3. Review vulnerabilities by reachable component, exploit conditions, available fix, and compensating controls instead of accepting a severity count alone.\n4. Launch the image with production user, filesystem, capability, network, and resource settings; exercise health, shutdown, and maintenance behavior.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "containers",
        "image-security",
        "provenance",
        "review"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/.github/workflows",
      "title": "refresh-container-base",
      "summary": "Refresh pinned base images with rebuild evidence, compatibility tests, and an auditable digest change.",
      "body": "---\nname: refresh-container-base\ndescription: Refresh pinned base images with rebuild evidence, compatibility tests, and an auditable digest change.\n---\n\n# Refresh Container Base\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Resolve the upstream release to an immutable digest and collect its changelog, end-of-support status, and published security information.\n2. Rebuild without cache, generate a software bill of materials and provenance, then compare packages and image size with the current release.\n3. Run application, integration, and runtime-policy tests on the candidate image, including non-root startup and read-only filesystem behavior.\n4. Promote only the reviewed digest, retain the prior known-good digest for rollback, and record why any unfixed reachable vulnerability is accepted.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "containers",
        "base-image",
        "supply-chain",
        "maintenance"
      ]
    }
  ]
};
