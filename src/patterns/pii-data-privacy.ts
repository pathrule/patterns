import type { Pattern } from "../types.js";

export const piiDataPrivacy: Pattern = {
  "slug": "pii-data-privacy",
  "version": "1.0.0",
  "name": "PII and Data Privacy",
  "tagline": "Minimize personal data, preserve purpose, enforce access, and make deletion real.",
  "description": "PII and data privacy fail when personal information spreads through databases, logs, analytics, queues, exports, and backups without a shared lifecycle. This bundle establishes data classification, purpose-limited collection, field-level access, safe observability, retention, deletion, and subject-request evidence. Unlike Postgres Schema, it governs personal data across every processor rather than relational structure and migration mechanics.",
  "category": "Security",
  "icon": "fingerprint",
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
  "metaTitle": "PII data privacy pattern for AI coding agents",
  "metaDescription": "Purpose-limited PII collection, field-level access, safe logs, retention, deletion, and subject-request evidence across modern application data flows.",
  "problem": "Agents add a field for convenience without tracing where it is copied, logged, exported, retained, or deleted, creating undocumented personal-data processing.",
  "audience": "Teams whose products collect, derive, transmit, or retain personal information",
  "prevents": [
    "Collecting personal data without a named purpose and owner",
    "PII leaking into logs, analytics, prompts, or support exports",
    "Deletion that clears one table while copies remain active elsewhere"
  ],
  "appliesTo": {
    "paths": [
      "/src/db",
      "/src/api",
      "/migrations"
    ],
    "stacks": [
      "pii",
      "privacy",
      "data-governance",
      "backend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Collect only declared personal data",
      "summary": "Every personal-data field has a purpose, lawful basis or user expectation, owner, and retention rule before collection.",
      "body": "Every personal-data field has a purpose, lawful basis or user expectation, owner, and retention rule before collection. Convenience fields become permanent liabilities when no service can explain why they exist or when they should disappear. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Reject new PII fields unless the schema change names purpose, consumers, retention, deletion behavior, and whether the value is required.\n- Separate optional product data from authentication, fraud, billing, and legal records so consent and retention do not bleed across purposes.\n- Do not infer or enrich sensitive attributes merely because a provider makes them available.\n- Return only fields required by the caller's operation; never serialize a whole user record into a convenience response.\n\nVerification: Trace one field from request through storage and every response; prove a caller lacking the purpose-specific permission cannot submit, read, or export it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Authorize personal data at field and purpose boundaries",
      "summary": "Access to a record does not automatically grant access to every personal field stored on it.",
      "body": "Access to a record does not automatically grant access to every personal field stored on it. Coarse model-level authorization exposes contact, identity, risk, or support information to callers that only need a display name or account state. Enforce this boundary in /src/db so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Define purpose-specific read models that select only approved fields instead of returning persistence entities.\n- Separate highly sensitive values and encryption keys from ordinary profile data, with independent access paths and audit signals.\n- Authorize service-to-service reads with workload identity and declared purpose, not a shared database credential.\n- Log access decisions using subject and field classes without copying the protected values into the audit event.\n\nVerification: Add contract tests for each read model and an adversarial query that requests a forbidden field; confirm the database or service boundary denies it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/migrations",
      "title": "Make retention and deletion cover every copy",
      "summary": "Retention jobs and subject deletion traverse primary data, derived stores, queues, search, analytics, exports, and restoration paths.",
      "body": "Retention jobs and subject deletion traverse primary data, derived stores, queues, search, analytics, exports, and restoration paths. Deleting a primary row is misleading when active replicas, attachments, model features, or reprocessed backups recreate the person's data. Enforce this boundary in /migrations so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Maintain a machine-readable inventory of systems that receive each personal-data class and the key used to locate it.\n- Define deletion, anonymization, or legal-hold behavior per destination and preserve only the minimum proof that the action occurred.\n- Apply retention to failed jobs, dead-letter queues, temporary files, debug captures, and generated exports, not only production tables.\n- When a backup is restored, rerun tombstones or deletion journals before making the recovered system available.\n\nVerification: Run a seeded subject through collection, export, deletion, and a restoration drill; query every registered destination and confirm only permitted evidence remains.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Data classification travels with the field",
      "summary": "A wiki label is not enough because copied values lose context as they move through schemas, events, logs, and analytics.",
      "body": "A wiki label is not enough because copied values lose context as they move through schemas, events, logs, and analytics. Represent classification, purpose, retention class, and exportability in schema metadata or code that generators and linters can read.\n\nPropagate the classification into event schemas and data contracts rather than relying on variable names. Use the metadata to redact logs, block unsafe destinations, select encryption, and require privacy review on changes. Treat derived and joined values as personal when they can identify or single out a person in the product's context. Keep the decision explicit at /src/db; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/api for collection controls and /migrations for lifecycle enforcement. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Privacy requests are durable workflows",
      "summary": "Access, correction, portability, and deletion requests cross services and can outlive an HTTP request, so a synchronous controller is not the system of record.",
      "body": "Access, correction, portability, and deletion requests cross services and can outlive an HTTP request, so a synchronous controller is not the system of record. This decision has to survive retries, asynchronous work, and future implementation changes instead of living only in a controller or a reviewer's memory.\n\nCreate a request record with identity-verification evidence, scope, jurisdiction or policy basis, deadlines, and an immutable event history. Fan out idempotent tasks to registered processors and distinguish completed, exempt, failed, and awaiting-human states. Generate the final response from stored evidence and never expose another person's data through weak request verification. Keep the decision explicit at /src/api; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/db for field classification and the privacy request skill for execution. That related boundary consumes this decision and carries the evidence that proves it still holds."
    }
  ]
};
