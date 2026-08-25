import type { Pattern } from "../types.js";

export const threatModeling: Pattern = {
  "slug": "threat-modeling",
  "version": "1.0.0",
  "name": "Threat Modeling",
  "tagline": "Model trust boundaries, rank realistic abuse paths, and turn threats into tested requirements.",
  "description": "Threat modeling is a repeatable design activity that asks what is being built, what can go wrong, what will be done, and whether the response is sufficient. This bundle maps data flows and trust boundaries, ranks concrete attacker paths, records decisions, and converts mitigations into owned tests. Unlike Web Security, it chooses and validates controls for a specific system before implementation instead of supplying request-layer defenses.",
  "category": "Security",
  "icon": "siren",
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
  "metaTitle": "Threat modeling pattern for AI coding agents",
  "metaDescription": "Trust-boundary maps, attacker-path analysis, risk decisions, mitigation requirements, and review procedures for security-sensitive system changes.",
  "problem": "Agents jump from a feature description to familiar controls without mapping assets, data flows, trust changes, attacker goals, or untested assumptions.",
  "audience": "Teams designing new services, sensitive flows, integrations, privilege changes, or major architecture revisions",
  "prevents": [
    "Security reviews that list generic threats unrelated to the design",
    "Mitigations with no owner, requirement, or verification method",
    "Threat models that become stale after architecture and trust boundaries change"
  ],
  "appliesTo": {
    "paths": [
      "/docs/security",
      "/src/api",
      "/infra"
    ],
    "stacks": [
      "threat-modeling",
      "stride",
      "security-design",
      "architecture"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/docs/security",
      "title": "Every material threat receives a recorded response",
      "summary": "Threats are mitigated, eliminated, transferred, or explicitly accepted with evidence and ownership.",
      "body": "Threats are mitigated, eliminated, transferred, or explicitly accepted with evidence and ownership. An unranked threat list creates the appearance of review while leaving the team unable to tell which risks block delivery. Enforce this boundary in /docs/security so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Describe the attacker capability, targeted asset, trust boundary crossed, preconditions, and plausible impact in system-specific terms.\n- Choose a response and connect mitigation responses to a concrete requirement, implementation owner, and verification method.\n- Require a named risk owner and review date for acceptance or transfer; developers cannot accept business risk by omission.\n- Reopen the decision when data sensitivity, exposure, identity, dependency, or architecture assumptions change.\n\nVerification: Sample every high-impact path and trace it from model to code or test evidence; fail review for orphan threats, orphan controls, and expired acceptances.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/security",
      "title": "The model is a map of trust, not a diagram of components",
      "summary": "Component boxes alone do not reveal where data changes authority, validation, ownership, or confidentiality.",
      "body": "Component boxes alone do not reveal where data changes authority, validation, ownership, or confidentiality. Show actors, assets, processes, stores, external systems, data flows, and trust boundaries, then annotate identity and protection on each crossing.\n\nSplit broad diagrams until reviewers can reason about one sensitive flow without guessing hidden hops. Include control-plane, support, recovery, CI, and third-party paths because attackers do not stay on the happy-path architecture. Record assumptions such as private-network reachability or upstream validation as testable dependencies, not facts. Keep the decision explicit at /docs/security; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/api for enforcement points and /infra for workload and network trust boundaries. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "run-threat-model",
      "summary": "Run a structured threat-model workshop and turn findings into owned, testable security work.",
      "body": "---\nname: run-threat-model\ndescription: Run a structured threat-model workshop and turn findings into owned, testable security work.\n---\n\n# Run Threat Model\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Define scope, assets, security objectives, attacker capabilities, and out-of-scope assumptions before discussing controls.\n2. Draw data flows with identities, stores, external systems, protocols, and trust boundaries; walk one real scenario end to end.\n3. Use STRIDE or another prompt set at each boundary, then write concrete abuse paths and rank them with product and operations input.\n4. Choose responses, create mitigation requirements and verification tasks, assign risk owners, and schedule the next review trigger.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "threat-modeling",
        "security",
        "stride",
        "architecture"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/docs/security",
      "title": "review-threat-model",
      "summary": "Review an existing threat model for architecture drift, unresolved risks, and ineffective mitigations.",
      "body": "---\nname: review-threat-model\ndescription: Review an existing threat model for architecture drift, unresolved risks, and ineffective mitigations.\n---\n\n# Review Threat Model\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Compare the model with current deployment manifests, routes, identities, stores, third parties, and privileged support or recovery paths.\n2. Re-run abuse-path prompts for changed boundaries and identify assumptions that no longer have evidence.\n3. Trace each open and high-impact threat to a current response, owner, test, monitoring signal, and acceptance expiry where relevant.\n4. Publish the delta, create follow-up work with measurable outcomes, and record the event that will trigger the next review.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "threat-modeling",
        "security-review",
        "risk",
        "maintenance"
      ]
    }
  ]
};
