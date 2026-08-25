import type { Pattern } from "../types.js";

export const databaseTransactionsDeadlocks: Pattern = {
  "slug": "database-transactions-deadlocks",
  "version": "1.0.0",
  "name": "Database Transactions, Deadlocks, and Concurrency",
  "tagline": "Protect database invariants with explicit isolation, locking order, retries, idempotency, and evidence.",
  "description": "Concurrent requests can each pass a read check and still violate an invariant, while longer transactions, inconsistent lock order, and automatic retries can turn ordinary contention into deadlocks or duplicate external effects. This pattern constrains transaction boundaries, locking, retry safety, and external effects; it records isolation and optimistic-concurrency decisions and supplies a deadlock investigation workflow. It complements schema and query-performance patterns by focusing on interleavings and correctness under concurrency rather than table design or individual statement latency.",
  "category": "Backend",
  "icon": "repeat-2",
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
  "metaTitle": "Database transaction pattern for AI agents",
  "metaDescription": "Database isolation, row locks, optimistic concurrency, deadlock ordering, retries, idempotency, outbox effects, and concurrency tests. In production.",
  "problem": "AI agents often read then write outside one transaction, hold locks during HTTP calls, retry a deadlock without making the operation idempotent, or apply locks in inconsistent order.",
  "audience": "Backend teams protecting inventory, balances, quotas, workflow state, and other shared relational data",
  "prevents": [
    "Overselling inventory through concurrent check-then-update requests",
    "Creating a deadlock cycle through inconsistent lock acquisition",
    "Charging or publishing twice after a transaction retry",
    "Holding database locks while waiting on a remote dependency"
  ],
  "appliesTo": {
    "paths": [
      "/src/services",
      "/src/db",
      "/tests/concurrency"
    ],
    "stacks": [
      "database",
      "transactions",
      "deadlocks",
      "concurrency",
      "sql"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/services",
      "title": "Place the complete database invariant in one transaction",
      "summary": "Read the deciding state, enforce the condition, write every related row, and commit as one explicit service transition.",
      "body": "A read followed by a later write can interleave with another request even when each statement is individually correct. The transaction must cover the state on which the decision depends.\n\n- Open the transaction in the application service that owns the full business transition, not separately inside each repository method.\n- Read or lock the rows that determine eligibility, then re-evaluate the invariant inside the transaction immediately before writing.\n- Update all related records, counters, and idempotency state before commit so no observer sees a partially applied transition.\n- Return a typed conflict when the invariant no longer holds; do not silently overwrite newer state or convert concurrency loss into generic server failure.\n\nSee /src/db for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Acquire locks in one deterministic order",
      "summary": "Define row, table, and advisory lock order across code paths and keep locked work minimal to reduce cycles.",
      "body": "Deadlocks require a cycle: two transactions each hold something the other needs. Inconsistent resource order creates the cycle even when both operations are legitimate.\n\n- Sort resource identifiers before locking multiple rows and use the same ordering in every command that touches that resource set.\n- Document interactions between row locks, foreign-key checks, index updates, and explicit advisory locks where the engine can acquire hidden dependencies.\n- Do not add sleeps, network calls, user callbacks, or large computation after acquiring locks.\n- Treat deadlock detection as expected concurrency control: roll back the whole transaction, preserve the operation identity, and retry only through the bounded policy.\n\nSee /tests/concurrency for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/services",
      "title": "Keep remote effects outside retried transactions",
      "summary": "Represent intended external work durably in the transaction, then deliver it idempotently after commit.",
      "body": "A database can roll back and retry local state, but it cannot roll back an email, payment, webhook, or message already accepted by another system. Performing the effect inside a retried callback duplicates it.\n\n- Write an outbox or equivalent durable effect record in the same transaction as the domain change.\n- Publish or call the external system after commit using a stable effect identity and record acknowledgement or reconciliation state.\n- Never call an external dependency while holding database locks merely to keep code visually inside one callback.\n- When the external outcome is ambiguous, query or reconcile by idempotency key before retrying rather than assuming failure.\n\nSee /src/db for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/db",
      "title": "Retry only classified transient concurrency failures",
      "summary": "Retry the entire transaction with bounded backoff, a stable operation key, and fresh reads; surface permanent conflicts immediately.",
      "body": "A deadlock victim or serialization failure invalidates the transaction's snapshot and partial work. Retrying only the failed statement preserves incorrect assumptions, while retrying every database error can repeat permanent faults forever.\n\n- Classify engine-specific deadlock, serialization, and selected lock-timeout outcomes separately from validation, constraint, authentication, syntax, and capacity errors.\n- Discard the failed transaction and run the whole service transition again against fresh state.\n- Use bounded attempts with jitter and respect the request or job deadline; contention retries must not amplify an overloaded database indefinitely.\n- Require stable operation identity for any transition that clients, queues, or infrastructure may also retry.\n\nSee /tests/concurrency for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/db",
      "title": "Isolation level is chosen per invariant and query shape",
      "summary": "Select the weakest level that still protects the operation, then add locks or constraints where the engine contract requires them.",
      "body": "Isolation names do not map to identical implementation details across databases, and stronger isolation can increase aborts or lock duration. The decision starts from the anomaly the business cannot tolerate.\n\n- Describe the concurrent interleaving that would violate the invariant and identify which reads or predicate ranges participate.\n- Use database constraints for facts the schema can enforce and transaction isolation or explicit locking for multi-row or conditional transitions.\n- Test the actual engine and access path because indexes and predicate locks can affect which concurrent changes conflict.\n- Record why the operation uses its isolation level and what retry behavior callers must support when the engine aborts it.\n\nSee /src/services for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/services",
      "title": "Optimistic concurrency makes lost updates visible",
      "summary": "Carry a version or compared prior state through the write and treat zero updated rows as a domain conflict.",
      "body": "For detached edits and read-mostly records, holding a lock while a user or remote caller decides is impossible. A version check detects whether the state changed since it was read.\n\n- Return a version token with editable data and include it in the update predicate alongside stable identity and authorization scope.\n- Increment or replace the token atomically on success and check the affected row count.\n- On conflict, load the current state and let product policy reject, merge, or ask the user; never overwrite silently with the stale snapshot.\n- Keep fields with commutative operations, such as counters, on atomic update paths rather than forcing a whole-record version conflict.\n\nSee /tests/concurrency for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "investigate-database-deadlock",
      "summary": "Reconstruct the lock cycle, map statements to application transitions, fix ordering, and verify bounded retries.",
      "body": "---\nname: investigate-database-deadlock\ndescription: Investigate a database deadlock or repeated serialization failure under production concurrency.\n---\n\n# Investigate Database Deadlock\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Capture the engine deadlock graph or lock-wait evidence, transaction and statement identities, bound resource keys, timing, and application operation IDs.\n2. Map each statement to its service transaction and list the order in which rows, indexes, tables, and advisory locks are acquired.\n3. Identify the cycle and choose a deterministic order or narrower transaction that removes one edge without weakening the invariant.\n4. Reproduce with a concurrent test that controls interleaving, then verify one transaction commits and the other retries or conflicts as designed.\n5. Monitor deadlock rate, retry attempts, transaction duration, and final operation outcomes after release; preserve the graph and fix rationale beside the service.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "database",
        "deadlock",
        "transactions",
        "concurrency",
        "debugging"
      ]
    }
  ]
};
