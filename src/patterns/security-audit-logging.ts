import type { Pattern } from "../types.js";

export const securityAuditLogging: Pattern = {
  "slug": "security-audit-logging",
  "version": "1.0.0",
  "name": "Security Audit Logging",
  "tagline": "Record security-relevant actions as trustworthy evidence without turning logs into a secret database.",
  "description": "Security audit logging answers who attempted or performed a sensitive action, on which protected object, with what result and authority. This bundle defines event coverage, a stable evidence schema, sensitive-data controls, injection resistance, append-only storage, access monitoring, and retention. Unlike general Observability, it optimizes for investigation and accountability rather than service debugging and performance signals.",
  "category": "Security",
  "icon": "scroll-text",
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
  "metaTitle": "Security audit logging pattern for AI agents",
  "metaDescription": "Security event coverage, stable schemas, actor and object evidence, secret redaction, injection resistance, append-only storage, access review, and retention.",
  "problem": "Agents log vague prose after success, include tokens or personal data, let users inject forged lines, and store audit evidence where the same actor can rewrite it.",
  "audience": "Security, platform, and application teams that must investigate access, privilege, configuration, data, and administrative changes",
  "prevents": [
    "Sensitive changes with no durable actor, target, outcome, or policy evidence",
    "Credentials, session tokens, or unnecessary personal data leaking into logs",
    "An attacker or administrator altering the evidence of their own actions"
  ],
  "appliesTo": {
    "paths": [
      "/src/audit",
      "/src/security",
      "/infra/logging"
    ],
    "stacks": [
      "security",
      "audit",
      "logging",
      "compliance"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/audit",
      "title": "Sensitive operations emit one canonical audit event",
      "summary": "Authentication, authorization, privilege, data, configuration, key, export, and administrative actions record attempts and outcomes through one schema.",
      "body": "Audit coverage is defined from security-relevant actions, not from whatever application logs already happen to exist. Every sensitive operation emits a canonical event at the authoritative boundary with event type, event id, occurred time, recorded time, actor, delegated actor, tenant, action, protected object reference, result, safe reason, policy version, request correlation, and trusted source context.\n\n- Record denied and failed attempts as well as successful changes when they carry security meaning.\n- Emit after the authoritative result is known, or link separate attempt and outcome events through one operation id.\n- Use controlled event names and fields so investigations do not depend on parsing prose.\n- Keep clocks synchronized and preserve both event occurrence and ingestion times.\n\nVerification: Enumerate protected capabilities and fail tests when any success, denial, failure, or delegated path lacks its required canonical event.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/audit",
      "title": "Audit events exclude secrets and sanitize untrusted fields",
      "summary": "Tokens, passwords, keys, raw session ids, payment data, and unnecessary personal content never enter the event stream.",
      "body": "An audit store is widely retained and highly searchable, so a useful event must still minimize exposure. Define an allowlisted schema for each event family and reject or redact fields outside it. Never record authentication secrets, access tokens, refresh tokens, API keys, passwords, connection strings, full payment data, or raw sensitive request and response bodies.\n\n- Use stable internal references or approved pseudonymous identifiers instead of copying personal content.\n- Sanitize carriage returns, line feeds, delimiters, control characters, and encoding ambiguity before serialization.\n- Serialize structured events with a trusted library and prevent callers from supplying severity, event type, actor, or tenant fields they do not own.\n- Test redaction and schema rejection against nested values, exceptions, URLs, headers, and provider payloads.\n\nVerification: Inject secrets and log-forging characters through every untrusted field; confirm no forbidden value or forged record reaches storage or export.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra/logging",
      "title": "Audit evidence is append-only and separately protected",
      "summary": "The application can append approved events but cannot rewrite, delete, disable, or broadly read the audit record it produces.",
      "body": "Evidence cannot be trustworthy when the same compromised application or administrator can edit the record of its own behavior. Send audit events to a separate append-only or immutability-controlled destination through a narrowly scoped writer identity. Restrict search, export, retention change, and deletion to separately approved roles and record their use.\n\n- Buffer or queue safely so temporary destination failure is visible and governed by a defined fail-open or fail-closed policy per event class.\n- Monitor event volume gaps, schema rejection, delivery lag, clock drift, writer changes, retention changes, and privileged reads.\n- Protect transport integrity and validate source identity at ingestion.\n- Test restoration and export so retained evidence remains usable during an incident.\n\nVerification: Compromise a test application identity and attempt read, overwrite, delete, disable, retention change, and forged-source writes; confirm each is denied or detected.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/security",
      "title": "Audit, security, transaction, and diagnostic logs have different purposes",
      "summary": "Evidence for accountability, detections, business transactions, and debugging can correlate without becoming one unrestricted stream.",
      "body": "Audit events support accountability and investigation, security events support detection and response, transaction records support business truth, and diagnostic logs support operation and debugging. One action may create linked records in several systems, but their schemas, access, retention, mutability, and sensitive-data policies differ.\n\nUse shared event or correlation ids to connect them rather than copying entire payloads. Do not treat an application info log as an audit record or make the audit store a replacement for the financial ledger. Define which system owns each fact and how an investigator crosses the boundary under authorization. See /src/audit for the canonical event schema and /infra/logging for protected storage."
    },
    {
      "kind": "memory",
      "nodePath": "/infra/logging",
      "title": "Retention and export follow event risk and investigation needs",
      "summary": "Each audit class has a documented retention period, legal or policy basis, access group, export format, deletion path, and evidence owner.",
      "body": "Keeping every audit event forever increases exposure, while deleting too early destroys investigation and accountability. Classify event families by security value, regulatory or contractual need, subject rights, operational volume, and expected investigation window. Assign a retention period and authorized exception process to each class.\n\nPreserve schema versions and export field definitions so older records remain interpretable. Test legal hold, approved deletion, restoration, and export integrity without granting broad production access. Record changes to retention and access policy in the audit system itself. Review low-value high-volume fields that raise cost or privacy risk without improving decisions. See /src/security for separation from diagnostics and transaction records."
    }
  ]
};
