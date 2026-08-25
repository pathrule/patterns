import type { Pattern } from "../types.js";

export const rabbitmqMessaging: Pattern = {
  "slug": "rabbitmq-messaging",
  "version": "1.0.0",
  "name": "RabbitMQ Messaging",
  "tagline": "Design RabbitMQ routing, acknowledgements, publisher confirms, retries, dead letters, and flow control.",
  "description": "RabbitMQ separates exchanges, queues, bindings, delivery acknowledgements, publisher confirms, and consumer credit, so a message can be routed nowhere, accepted but not durably replicated, redelivered after work, or trapped in an immediate retry loop. This pattern constrains topology declaration, idempotent consumption, and bounded retries; it records publisher outcome and prefetch decisions and provides a delivery-failure verification workflow. It differs from Kafka by focusing on broker routing and per-message acknowledgement to queues rather than replayable partition logs and consumer offsets.",
  "category": "Backend",
  "icon": "rabbit",
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
  "metaTitle": "RabbitMQ messaging pattern for AI agents",
  "metaDescription": "RabbitMQ exchanges, queues, routing keys, publisher confirms, acknowledgements, prefetch, retries, dead letters, idempotency, and recovery. In production.",
  "problem": "AI agents often publish without confirming routing, acknowledge before committing work, requeue permanent failures forever, or set prefetch without considering task cost.",
  "audience": "Backend teams using RabbitMQ for commands, work queues, integration events, or delayed processing",
  "prevents": [
    "Silently dropping an unroutable published message",
    "Losing work by acknowledging before durable completion",
    "Creating a hot poison-message redelivery loop",
    "Overloading a consumer with more unacknowledged work than it can process"
  ],
  "appliesTo": {
    "paths": [
      "/src/messaging",
      "/src/consumers",
      "/ops/rabbitmq"
    ],
    "stacks": [
      "rabbitmq",
      "amqp",
      "messaging",
      "queues",
      "event-driven"
    ],
    "packages": [
      "amqplib"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/messaging",
      "title": "Declare topology as versioned application infrastructure",
      "summary": "Create exchanges, queues, bindings, durability, arguments, and ownership explicitly and detect incompatible changes before traffic.",
      "body": "RabbitMQ entities are durable shared state whose declarations must agree. A copied queue name or changed argument can route data incorrectly or fail only when a new process starts against an existing broker.\n\n- Declare exchanges and queues from one topology module or infrastructure workflow with stable names, types, durability, and environment ownership.\n- Bind each queue with the exact routing keys it consumes and test an unroutable key; do not assume publishing success means a queue matched.\n- Treat queue argument changes such as dead-lettering, expiry, priority, or type as migrations that may require a new queue and controlled drain.\n- Separate application queues by workload ownership and retry behavior rather than binding unrelated consumers to one broad shared queue.\n\nSee /ops/rabbitmq for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/consumers",
      "title": "Acknowledge only after durable, idempotent completion",
      "summary": "Process under stable message identity and acknowledge after the business transition and required effect record are committed.",
      "body": "A consumer can lose its connection after committing work but before acknowledgement, causing redelivery. Acknowledging before commit creates the opposite failure: the broker removes work the application never finished.\n\n- Require a stable message or operation ID and make the domain transition return the prior outcome on redelivery.\n- Validate schema, authorization context, and supported version before starting expensive work or opening a transaction.\n- Acknowledge after local durable completion; reject or dead-letter permanent invalid messages without requeueing them indefinitely.\n- On transient failure, release according to the retry topology and preserve attempt and original identity without creating a new logical command.\n\nSee /src/messaging for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/messaging",
      "title": "Confirm publish outcome and handle unroutable messages",
      "summary": "Use publisher confirms and routing failure handling before marking an outbox or command as delivered to the broker.",
      "body": "Opening a channel and sending bytes does not prove that the broker accepted and routed a durable message. Connection loss around publish creates an ambiguous outcome that needs idempotent retry.\n\n- Publish persistent messages to durable topology when durability is required and wait for publisher confirmation before advancing local delivery state.\n- Use mandatory routing or an alternate path and treat a returned unroutable message as configuration failure, not successful delivery.\n- Bound outstanding confirms and channel buffers so a fast producer respects broker backpressure instead of accumulating memory.\n- Reconnect by recreating channels, confirm state, consumers, and topology through one owner; a channel is not safe to reuse after protocol-level failure.\n\nSee /ops/rabbitmq for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/consumers",
      "title": "Prefetch is per-consumer in-flight work capacity",
      "summary": "Set credit from task cost, concurrency, memory, downstream pools, and fairness rather than maximizing throughput blindly.",
      "body": "Prefetch controls how many unacknowledged deliveries a consumer can hold. A large value can strand work on a slow worker and overwhelm database or HTTP dependencies; a value of one can underuse parallel capacity.\n\n- Choose prefetch with the consumer's actual parallelism and maximum memory per message, not just average processing time.\n- Keep in-flight database and remote calls within their own pool limits so RabbitMQ credit does not create a larger hidden concurrency queue.\n- Use separate queues or consumers for workloads with very different duration and priority instead of relying on one prefetch value for all.\n- Observe unacknowledged messages, processing latency, redelivery, consumer utilization, and queue age before changing credit.\n\nSee /ops/rabbitmq for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/rabbitmq",
      "title": "Retries move through bounded stages",
      "summary": "Use delayed retry tiers and a terminal dead-letter queue so transient failures back off and permanent failures become inspectable.",
      "body": "Immediate requeue returns the same poison message to active consumers with no delay, consuming CPU and dependency capacity while making no progress.\n\n- Classify validation, unsupported version, authorization, and impossible domain state as permanent failures that go directly to a terminal path.\n- Route transient failures through bounded delay tiers that preserve original message identity, reason, and attempt count.\n- Cap total attempts and age, then dead-letter with enough context to diagnose and replay after repair without exposing sensitive payloads broadly.\n- Provide an operator workflow that validates current code and data before replay and uses the same idempotent consumer path.\n\nSee /src/consumers for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-rabbitmq-delivery-semantics",
      "summary": "Prove routing, confirms, acknowledgements, retries, dead letters, redelivery, and recovery under broker and consumer failure.",
      "body": "---\nname: verify-rabbitmq-delivery-semantics\ndescription: Verify a RabbitMQ topology, publisher, or consumer change before production traffic.\n---\n\n# Verify Rabbitmq Delivery Semantics\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Publish valid, invalid, oversized, unknown-version, and unroutable messages and inspect exchange, binding, return, confirm, and queue outcomes.\n2. Terminate the consumer before work, during the transaction, after commit, and before acknowledgement; prove redelivery is harmless and no completed work is lost.\n3. Fail the dependency with transient and permanent errors and confirm bounded delay, attempt metadata, terminal dead-lettering, and no immediate hot loop.\n4. Throttle consumers and broker connections to observe prefetch, unacknowledged count, backpressure, memory, queue age, and fair distribution.\n5. Restart broker nodes and client connections, then verify topology, channels, confirms, consumers, and in-flight operation identities recover through one controlled path.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "rabbitmq",
        "amqp",
        "messaging",
        "reliability",
        "testing"
      ]
    }
  ]
};
