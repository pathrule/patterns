import type { Pattern } from "../types.js";

export const aiSafetyGuardrails: Pattern = {
  "slug": "ai-safety-guardrails",
  "version": "1.0.0",
  "name": "AI Safety Guardrails",
  "tagline": "Classify risk, isolate untrusted content, authorize tools, validate output, and escalate safely.",
  "description": "AI safety guardrails are layered runtime controls around a probabilistic model, not a single system prompt or blocked-word list. This bundle classifies use-case risk, separates instructions from untrusted content, authorizes every tool action, validates output, and defines human escalation and incident evidence. Unlike LLM Evals, it enforces live boundaries while evals measure behavior offline.",
  "category": "AI",
  "icon": "shield-ellipsis",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "AI safety guardrails pattern for coding agents",
  "metaDescription": "Risk-tiered AI boundaries, prompt-injection isolation, tool authorization, output validation, human escalation, and runtime safety monitoring controls.",
  "problem": "Agents rely on prompt wording to resist hostile content, expose broad tools to model choice, and render or execute output before deterministic policy checks.",
  "audience": "Teams deploying AI features that read untrusted content, call tools, or influence consequential decisions",
  "prevents": [
    "Prompt injection turning retrieved content into instructions",
    "A model invoking a valid tool with unauthorized arguments",
    "Unsafe or unsupported output reaching users or downstream systems"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai/safety",
      "/src/api",
      "/tests/ai"
    ],
    "stacks": [
      "ai-safety",
      "guardrails",
      "prompt-injection",
      "llm"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai/safety",
      "title": "Keep untrusted content outside the instruction channel",
      "summary": "User, retrieved, uploaded, web, tool, and memory content is labeled as data and cannot rewrite system policy.",
      "body": "User, retrieved, uploaded, web, tool, and memory content is labeled as data and cannot rewrite system policy. Attackers can place instruction-like text inside any content source the model reads, including documents that appear internal or previously summarized. Enforce this boundary in /src/ai/safety so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Build prompts from typed sections that preserve source, trust level, and intended use instead of concatenating strings.\n- Never interpolate untrusted text into system or developer instructions, tool definitions, or policy templates.\n- Tell the model the data boundary, but enforce it again with deterministic tool and output controls.\n- Treat remembered and retrieved content as untrusted unless a separate verified source grants authority.\n\nVerification: Seed conflicting instructions in every content source and confirm they cannot change allowed tools, data scope, output policy, or approval requirements.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Authorize every tool call outside the model",
      "summary": "A model proposal becomes an action only after schema, principal, tenant, resource, risk, and current-state checks pass.",
      "body": "A model proposal becomes an action only after schema, principal, tenant, resource, risk, and current-state checks pass. Valid JSON and a permitted tool name do not prove that the current user may act on the requested resource or amount. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Expose the smallest tool surface and use server-derived identity and tenant values rather than model-supplied authority.\n- Validate arguments with a strict schema and resolve resource identifiers against authorized current state.\n- Require confirmation or human approval for irreversible, financial, privileged, or externally communicative actions.\n- Give mutations idempotency keys and record proposal, policy decision, approval, effect, and result without leaking sensitive content.\n\nVerification: Attempt cross-tenant IDs, stale state, excessive amounts, hidden side effects, duplicate calls, and approval bypass; verify every rejection occurs before effect.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ai/safety",
      "title": "Validate output for its destination",
      "summary": "Output policy depends on whether content is displayed, stored, executed, indexed, sent externally, or used in a decision.",
      "body": "Output policy depends on whether content is displayed, stored, executed, indexed, sent externally, or used in a decision. A response safe to show as quoted text may be dangerous when rendered as HTML, executed as code, used as a URL, or treated as verified fact. Enforce this boundary in /src/ai/safety so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Apply structural and semantic validators for downstream machine consumers before handing them the result.\n- Escape or sanitize for the actual renderer and keep model text out of raw HTML, shell, query, and template contexts.\n- Require citations or source checks for factual claims where the product promises grounded answers.\n- Block, transform, or escalate according to the use-case risk policy and preserve an auditable reason code.\n\nVerification: Send adversarial markup, links, code, unsupported claims, secret-like data, and policy-sensitive content through every destination; confirm controls differ by destination.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/safety",
      "title": "Guardrail strength follows use-case risk",
      "summary": "A writing suggestion, internal search result, code change, support reply, payout decision, and medical summary have different impact, reversibility, and oversight needs.",
      "body": "A writing suggestion, internal search result, code change, support reply, payout decision, and medical summary have different impact, reversibility, and oversight needs. Classify each AI feature by affected people, data sensitivity, autonomy, scale, detectability, reversibility, and legal or product obligations.\n\nBind the tier to allowed data, models, tools, output destinations, evaluation depth, monitoring, approval, and fallback behavior. Reassess the tier when a feature gains tools, new users, broader data, or automated action. Do not lower a control merely because model quality improved; quality and consequence are separate axes. Keep the decision explicit at /src/ai/safety; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/api for action authorization and /tests/ai for tier-specific adversarial evidence. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "red-team-ai-feature",
      "summary": "Red-team an AI feature across prompt injection, data access, tools, output destinations, failure, and human escalation.",
      "body": "---\nname: red-team-ai-feature\ndescription: Red-team an AI feature across prompt injection, data access, tools, output destinations, failure, and human escalation.\n---\n\n# Red Team Ai Feature\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Map actors, trusted instructions, untrusted data sources, tools, destinations, protected assets, risk tier, and the exact boundaries expected to enforce policy.\n2. Create attacks for instruction override, indirect injection, data exfiltration, cross-tenant access, tool argument abuse, unsafe rendering, and approval fatigue.\n3. Run cases through production-equivalent retrieval, memory, provider, tool, and UI paths while capturing policy decisions and side effects.\n4. Turn successful attacks into deterministic controls and regression fixtures, assign owners, and retest after model, prompt, tool, or data-source changes.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "ai-safety",
        "red-team",
        "prompt-injection",
        "security"
      ]
    }
  ]
};
