import type { Pattern } from "../types.js";

export const firebaseFirestore: Pattern = {
  "slug": "firebase-firestore",
  "version": "1.0.0",
  "name": "Firebase and Firestore Production",
  "tagline": "Design Firestore rules, indexes, offline writes, and server authority as one data contract.",
  "description": "Firebase moves authentication, synchronization, and storage close to the client, so correctness depends on a contract that spans Firestore Security Rules, query shapes, indexes, offline retries, server functions, and emulator tests. This pattern constrains deny-by-default rules and server authority, records document and query modeling decisions, separates client retries from trusted side effects, and supplies an emulator-backed release audit. It differs from Supabase RLS because Firestore authorization is evaluated against document reads and query constraints, while offline clients and optimistic local state introduce a different consistency model.",
  "category": "Framework",
  "icon": "database-backup",
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
  "metaTitle": "Firebase Firestore pattern for AI agents",
  "metaDescription": "Firestore Security Rules, query-aligned indexes, offline writes, server authority, and emulator tests for production Firebase applications. In production.",
  "problem": "AI agents often secure individual documents but issue queries the rules cannot prove safe, trust client-written ownership fields, or attach non-idempotent side effects to retried writes.",
  "audience": "Web and mobile teams using Firebase Authentication, Cloud Firestore, and server-side functions",
  "prevents": [
    "Writing broad allow rules that trust client-controlled ownership fields",
    "Shipping a query that cannot satisfy its Security Rules constraints",
    "Charging or emailing twice when an offline write retries",
    "Testing production data access without the emulator rule suite"
  ],
  "appliesTo": {
    "paths": [
      "/firestore",
      "/functions",
      "/src/data"
    ],
    "stacks": [
      "firebase",
      "firestore",
      "security-rules",
      "offline-first",
      "serverless"
    ],
    "packages": [
      "firebase",
      "firebase-admin"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/firestore",
      "title": "Deny access unless rules can prove the entire query safe",
      "summary": "Authorize from trusted identity and stored ownership, and shape queries so Firestore can prove every possible result is allowed.",
      "body": "Firestore evaluates a query against its potential result set, not by filtering unauthorized documents afterward. A rule that secures a document read can still reject a list query whose constraints do not prove the same ownership condition.\n\n- Start from no access and grant the narrow operation on the narrow match path. Separate create, update, delete, get, and list when their invariants differ.\n- Derive actor identity from authentication context and existing stored data. Never let a client grant itself ownership, role, or tenant membership by writing the field the rule later trusts.\n- Make list queries include the same tenant, owner, visibility, or status constraints the rule requires, then test both allowed and overbroad variants.\n- Validate changed fields and immutable fields explicitly on writes so a user cannot preserve an allowed document path while replacing authorization-critical content.\n\nSee /src/data for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/functions",
      "title": "Keep privileged side effects idempotent and server-owned",
      "summary": "Use trusted functions for secrets and privileged transitions, with event identity or operation keys that make retries harmless.",
      "body": "Clients can retry writes after reconnect and server functions can redeliver events. A privileged effect that assumes exactly-once execution can send duplicate email, allocate inventory twice, or charge more than once.\n\n- Move secret-bearing and privilege-escalating operations to a trusted server environment using the Admin SDK only after verifying the caller and target resource.\n- Store a stable operation or event identifier with the side effect and reject or return the prior result when the same identifier is observed again.\n- Write domain state and the idempotency record in the same atomic boundary where the data model permits it; never mark success before the effect is durably represented.\n- Treat function retries, timeouts, and partial failures as normal paths. Log the operation key and final state so an operator can reconcile ambiguity.\n\nSee /firestore for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/data",
      "title": "Model offline writes as pending transitions",
      "summary": "Expose pending, rejected, and confirmed states in the UI instead of treating local acknowledgement as durable server success.",
      "body": "Firestore can apply a write to the local cache before the server accepts it. The interface must distinguish optimistic local state from a confirmed transition, especially when rules, contention, or connectivity can reject the write later.\n\n- Represent operations with a stable client-generated identifier and show pending state where the user might otherwise repeat the action.\n- Listen for server acknowledgement or write failure and reconcile the optimistic item by identity rather than appending a second copy.\n- Do not trigger irreversible client-side side effects merely because the local snapshot changed; wait for trusted server state or a server event.\n- Design conflict behavior for reconnect explicitly. Last-write-wins is not acceptable for counters, inventory, balances, or approval workflows without a server-owned transition.\n\nSee /functions for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/firestore",
      "title": "Document shape follows read and rule boundaries",
      "summary": "Denormalize for known read paths, but keep authorization-critical facts close enough for rules to verify without client trust.",
      "body": "Firestore documents are not relational rows, and joins do not appear at query time. The useful design question is which data must be read together and which facts Security Rules must inspect to decide access.\n\n- Keep a bounded snapshot of display data with a relation when it avoids an extra read, and define how that snapshot is refreshed when the source changes.\n- Duplicate tenant or ownership identifiers where rules and queries need them, but make the trusted server the authority that writes or verifies those fields.\n- Keep documents below practical growth limits by moving unbounded collections, logs, and membership lists into subcollections with their own query strategy.\n- Choose document IDs and collection paths for stable identity, not for mutable presentation values such as names or email addresses.\n\nSee /src/data for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/data",
      "title": "Every production query has an index and cost story",
      "summary": "Query shape, composite indexes, pagination cursor, and expected document reads are reviewed together before a screen ships.",
      "body": "Firestore pricing and latency follow document reads and index traversal. A query that works on a small emulator dataset can become expensive or require a composite index as filters and ordering are combined.\n\n- Define filters, ordering, and cursor pagination together; avoid offset pagination that repeatedly reads skipped documents.\n- Commit required index configuration with the application so environments do not depend on a console-created index no one can reproduce.\n- Measure how listeners behave when tabs background, reconnect, or observe high-churn collections; a permanent listener is an ongoing read surface.\n- Use aggregate or maintained summary documents for dashboards that would otherwise scan large collections on every view.\n\nSee /firestore for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-firestore-contract",
      "summary": "Run an emulator-backed matrix over rules, queries, offline retries, indexes, and privileged function behavior.",
      "body": "---\nname: verify-firestore-contract\ndescription: Verify a Firestore data-contract change before deploying rules, indexes, clients, or functions.\n---\n\n# Verify Firestore Contract\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Seed users, tenants, ownership combinations, and documents in the emulator, including stale and malicious client-controlled fields.\n- [ ] Run every operation as owner, member, outsider, unauthenticated caller, and privileged server; include list queries broader than the intended filter.\n- [ ] Execute the exact production query shapes against committed index configuration and confirm cursor pagination returns stable, non-duplicated pages.\n- [ ] Simulate disconnect, local optimistic write, reconnect, and server rejection; confirm the UI reconciles pending state and does not repeat side effects.\n- [ ] Redeliver the same server event and operation key, then prove the function returns the prior outcome without duplicating external or stored effects.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "firebase",
        "firestore",
        "security-rules",
        "emulator",
        "testing"
      ]
    }
  ]
};
