import type { Pattern } from "../types.js";

export const incidentResponsePostmortems: Pattern = {
  "slug": "incident-response-postmortems",
  "version": "1.0.0",
  "name": "Incident Response and Postmortems",
  "tagline": "Coordinate incidents with clear authority, durable timelines, safe mitigation, and owned learning.",
  "description": "Incident response and postmortems turn a production failure into coordinated mitigation and durable system improvement. This bundle defines incident authority, communication, evidence capture, safe operational changes, handoffs, blameless analysis, and measurable follow-up. Unlike Observability, it governs what people and systems do after a signal indicates impact rather than how telemetry and service objectives are instrumented.",
  "category": "Workflow",
  "icon": "fire-extinguisher",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Incident response pattern for AI coding agents",
  "metaDescription": "Incident authority, communication, durable timelines, safe mitigation, handoffs, blameless postmortems, and measurable follow-up for service teams.",
  "problem": "Agents suggest simultaneous fixes, overwrite evidence, or optimize for root cause while users are still affected, creating risky changes and an unusable incident record.",
  "audience": "Teams operating production services with on-call ownership and cross-team incident coordination",
  "prevents": [
    "Multiple responders making conflicting production changes",
    "Root-cause investigation delaying impact mitigation",
    "Postmortem actions with no owner or verifiable end state"
  ],
  "appliesTo": {
    "paths": [
      "/runbooks",
      "/docs/postmortems",
      "/src/observability"
    ],
    "stacks": [
      "incident-response",
      "postmortems",
      "sre",
      "operations"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/runbooks",
      "title": "One incident commander owns coordination",
      "summary": "A declared incident commander sets priorities, assigns roles, approves high-risk changes, and maintains shared state.",
      "body": "A declared incident commander sets priorities, assigns roles, approves high-risk changes, and maintains shared state. Without explicit authority, responders duplicate work, make incompatible changes, and leave stakeholders unsure which update is current. Enforce this boundary in /runbooks so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Separate incident command, operations, communications, and subject-matter roles even when one person temporarily holds several.\n- Prioritize user impact, safety, and reversible mitigation before complete causal analysis.\n- Route production changes through a visible log with actor, time, hypothesis, expected signal, and rollback condition.\n- Hand off command explicitly with current impact, actions, risks, owners, and next decision time.\n\nVerification: Run a simulation with conflicting hypotheses and a shift change; confirm responders can identify the commander, approved action, rollback condition, and current status instantly.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/postmortems",
      "title": "The timeline records observations and decisions separately",
      "summary": "Incident recollection changes under stress, and a later narrative can accidentally present uncertain hypotheses as facts.",
      "body": "Incident recollection changes under stress, and a later narrative can accidentally present uncertain hypotheses as facts. Capture timestamps, observed signals, declared impact, decisions, actions, results, communications, and role changes from durable system sources where possible.\n\nMark hypotheses and confidence at the time they were made instead of rewriting them after root cause is known. Normalize clocks and preserve links to logs, deploys, tickets, and chat without copying sensitive customer content. Use the timeline to examine detection, coordination, mitigation, and communication, not only the final technical trigger. Keep the decision explicit at /docs/postmortems; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /runbooks for live command and the postmortem skill for analysis. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "manage-incident",
      "summary": "Manage a production incident from declaration through mitigation, recovery validation, communication, and handoff.",
      "body": "---\nname: manage-incident\ndescription: Manage a production incident from declaration through mitigation, recovery validation, communication, and handoff.\n---\n\n# Manage Incident\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Declare severity, user impact, incident channel, commander, operations lead, communications lead, and the next update time.\n2. Stabilize the system with the safest reversible action, record the expected signal and rollback condition, and limit concurrent production changes.\n3. Maintain a timestamped timeline, update stakeholders on impact and mitigation without unsupported cause claims, and reassess severity as evidence changes.\n4. Validate recovery against user-facing signals, monitor for regression, assign postmortem ownership, and hand off any residual risk or cleanup.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "incident-response",
        "operations",
        "sre",
        "coordination"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/runbooks",
      "title": "run-incident-handoff",
      "summary": "Hand off an active incident without losing authority, context, risks, or pending decisions.",
      "body": "---\nname: run-incident-handoff\ndescription: Hand off an active incident without losing authority, context, risks, or pending decisions.\n---\n\n# Run Incident Handoff\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Confirm the incoming commander and role owners are present, available, and able to access every required system and communication channel.\n2. State current impact, severity, leading evidence, disproven hypotheses, mitigations, recent changes, and whether rollback is still possible.\n3. Review active risks, customer or regulatory commitments, queued actions, owners, deadlines, and the next decision or communication time.\n4. Record the transfer in the timeline, announce the new commander, and have the incoming lead restate priorities before outgoing responders leave.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "incident-response",
        "handoff",
        "on-call",
        "operations"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/docs/postmortems",
      "title": "write-blameless-postmortem",
      "summary": "Write and review a blameless postmortem with evidence, system causes, and measurable corrective actions.",
      "body": "---\nname: write-blameless-postmortem\ndescription: Write and review a blameless postmortem with evidence, system causes, and measurable corrective actions.\n---\n\n# Write Blameless Postmortem\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Define impact, duration, affected users, detection, response, and recovery from verified evidence; distinguish facts from unresolved questions.\n2. Build the timeline and analyze contributing technical, process, coordination, and organizational conditions without assigning blame to individuals.\n3. Explain why safeguards did not prevent or limit impact, then create prevention, mitigation, detection, and response actions with owners and verifiable end states.\n4. Review with responders and affected owners, publish at the appropriate access level, track actions to closure, and link recurrence or trend analysis.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "postmortem",
        "incident-response",
        "learning",
        "reliability"
      ]
    }
  ]
};
