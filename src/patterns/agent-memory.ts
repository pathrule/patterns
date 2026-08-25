import type { Pattern } from "../types.js";

export const agentMemory: Pattern = {
  "slug": "agent-memory",
  "version": "1.0.0",
  "name": "Agent Memory",
  "tagline": "Store durable agent memory with provenance, tenant isolation, retrieval policy, and deliberate forgetting.",
  "description": "Agent memory is a governed data lifecycle, not a transcript dumped into a vector index. This bundle separates working, episodic, semantic, and user-authored memory; records provenance and time; enforces tenant access; and makes retention, correction, and forgetting observable. Unlike AI Agents, it focuses on durable memory quality and privacy rather than orchestration, tools, and loop control.",
  "category": "AI",
  "icon": "brain",
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
  "metaTitle": "Agent memory pattern for AI coding agents",
  "metaDescription": "Provenance-aware agent memory, tenant isolation, typed retention, retrieval policy, contradiction handling, correction, and deliberate forgetting controls.",
  "problem": "Agents save untrusted conversation text as fact, mix tenants in retrieval, ignore contradictions and time, and provide no reliable way to correct or forget memory.",
  "audience": "Teams building assistants or agents that retain information across sessions and users",
  "prevents": [
    "Conversation claims promoted to durable truth without provenance",
    "Cross-tenant memory retrieval and disclosure",
    "Stale or corrected facts continuing to steer future actions"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai/memory",
      "/src/db",
      "/src/ai"
    ],
    "stacks": [
      "agents",
      "memory",
      "retrieval",
      "llm"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai/memory",
      "title": "Authorize memory writes and reads by tenant and subject",
      "summary": "Memory isolation is enforced before storage queries and again before retrieved content enters model context.",
      "body": "Memory isolation is enforced before storage queries and again before retrieved content enters model context. A vector similarity match can cross tenants, users, projects, or consent boundaries when authorization is treated as a post-filter. Enforce this boundary in /src/ai/memory so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Partition or filter every write and query with server-derived tenant, subject, workspace, and memory-class identifiers.\n- Authorize the requested memory class and purpose independently from access to the current conversation.\n- Recheck each retrieved record before context assembly because indexes and metadata can drift.\n- Never let model-generated filters, namespaces, or owner IDs override the authenticated scope.\n\nVerification: Seed near-identical memories across tenants and subjects, corrupt one index label, and attempt model-supplied scope changes; confirm no unauthorized text reaches context.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/memory",
      "title": "Different memory classes have different lifecycles",
      "summary": "Working context, episodic events, distilled semantic knowledge, and explicit user preferences differ in authority, retention, update, and retrieval behavior.",
      "body": "Working context, episodic events, distilled semantic knowledge, and explicit user preferences differ in authority, retention, update, and retrieval behavior. Give each class its own schema, write trigger, provenance requirement, expiry, correction policy, and ranking signals.\n\nDo not promote conversation summaries into user-authored preferences or verified facts. Keep ephemeral task state out of durable indexes once the task ends. Require stronger evidence and review for memory that can authorize tools or change high-impact behavior. Keep the decision explicit at /src/ai/memory; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/ai for context assembly and /src/db for deletion and audit state. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/memory",
      "title": "Every memory carries source, time, and confidence",
      "summary": "A fluent statement without provenance is impossible to distinguish from inference, outdated information, or attacker-planted text.",
      "body": "A fluent statement without provenance is impossible to distinguish from inference, outdated information, or attacker-planted text. Store the source event or record, observation time, author or producer, memory class, confidence basis, and supersession links.\n\nRank current primary evidence above repeated paraphrases of the same source. Expose provenance to the agent so it can qualify uncertain or stale claims. Do not increase confidence merely because the same generated claim appears in several derived summaries. Keep the decision explicit at /src/ai/memory; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/db for immutable provenance and the agent memory audit skill for quality review. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Forgetting uses tombstones across derived stores",
      "summary": "Deleting the canonical row is insufficient when embeddings, summaries, caches, exports, and backups can continue returning or recreating the memory.",
      "body": "Deleting the canonical row is insufficient when embeddings, summaries, caches, exports, and backups can continue returning or recreating the memory. Create a durable deletion or supersession record keyed to every derived artifact and block retrieval immediately.\n\nRemove active copies asynchronously with idempotent jobs and retain only the minimum non-content evidence needed to prevent re-import. Reapply tombstones after index rebuilds and backup restoration before serving queries. Distinguish user correction, expiry, policy deletion, and source retraction so future ingestion behaves correctly. Keep the decision explicit at /src/db; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/ai/memory for retrieval filtering and /src/ai for context invalidation. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "audit-agent-memory",
      "summary": "Audit agent memory for provenance, isolation, freshness, contradiction, retrieval quality, and deletion behavior.",
      "body": "---\nname: audit-agent-memory\ndescription: Audit agent memory for provenance, isolation, freshness, contradiction, retrieval quality, and deletion behavior.\n---\n\n# Audit Agent Memory\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Sample each memory class and trace records to source, subject, tenant, observation time, confidence basis, retention, and supersession state.\n2. Run retrieval tests with authorized, unauthorized, stale, contradictory, corrected, and adversarially similar memories across tenants.\n3. Inspect context assembly for provenance visibility, token budgeting, duplicate evidence, and instructions embedded inside remembered content.\n4. Delete and correct seeded memories, rebuild the index, and restore a test backup; confirm tombstones prevent every active and regenerated copy.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "agents",
        "memory",
        "privacy",
        "audit"
      ]
    }
  ]
};
