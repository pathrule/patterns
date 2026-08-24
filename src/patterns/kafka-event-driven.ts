import type { Pattern } from "../types.js";

export const kafkaEventDriven: Pattern = {
  "slug": "kafka-event-driven",
  "version": "1.0.0",
  "name": "Kafka Event-Driven Services",
  "tagline": "Produce and consume Kafka events with keys that preserve order and handlers that survive redelivery.",
  "description": "Kafka 4 removed ZooKeeper entirely and runs only in KRaft mode, the new consumer group protocol from KIP-848 ended stop-the-world rebalances, and idempotent producers are on by default. None of that saves a service that publishes inside a database transaction, picks a random partition key, or assumes a message arrives exactly once. This bundle covers the producer and consumer contracts, the outbox pattern that fixes the dual-write problem, event schema compatibility, and the operational settings that decide whether you lose data.",
  "category": "Backend",
  "icon": "radio-tower",
  "color": "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Kafka event-driven pattern for AI agents",
  "metaDescription": "Kafka pattern for AI coding agents: partition keys that keep order, idempotent consumers with a dead letter topic, the outbox pattern, and schema compatibility.",
  "problem": "AI agents publish events inside the same transaction as the database write, key messages randomly so ordering is lost, and write consumers that assume each message arrives exactly once.",
  "audience": "Backend teams running event-driven services on Kafka 4 in KRaft mode",
  "prevents": [
    "Writing to the database and publishing an event as if both could succeed together",
    "Producing without a partition key, so events for one entity are processed out of order",
    "Consuming with a handler that duplicates its side effect when the message is redelivered",
    "Retrying a poison message forever instead of routing it to a dead letter topic"
  ],
  "appliesTo": {
    "paths": [
      "/src/events",
      "/src/consumers",
      "/src/producers",
      "/infra/kafka"
    ],
    "stacks": [
      "kafka",
      "event-driven",
      "node",
      "java",
      "microservices"
    ],
    "packages": [
      "kafkajs",
      "@confluentinc/kafka-javascript"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/producers",
      "title": "Key every event by its entity and produce with full durability",
      "summary": "The partition key is the entity id whose order matters, acks are set to all with idempotence on, and retries must not reorder writes.",
      "body": "Kafka guarantees order within a partition, and nothing more. A message with no key goes to a partition of the broker's choosing, which means two events about the same order can be processed in the wrong sequence by different consumers.\n\n- Set the key to the identity whose ordering you care about: the aggregate or entity id (order id, user id, device id). Same key, same partition, same order, forever.\n- Never key by something high-cardinality-but-meaningless (a random uuid per event) or by something so coarse it creates a hot partition (a tenant id where one tenant is 90% of traffic).\n- Produce with `acks=all` and idempotence enabled (the default in Kafka 4) so a retry cannot write a duplicate or reorder a batch. If you tune `max.in.flight.requests.per.connection`, keep it within what idempotence supports, or retries will reorder.\n- Handle the producer's error callback and treat a failed send as a failed operation: log it with the key, and let the caller retry or fall back to the outbox. Fire-and-forget sends lose data silently.\n- Include an event id, an event type, a schema version, and the producer's timestamp in every message so consumers can dedupe, route, and evolve.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/consumers",
      "title": "Assume redelivery: idempotent handlers, bounded retries, dead letter topic",
      "summary": "Commit offsets after processing, dedupe on the event id, retry with backoff a fixed number of times, then route the message to a dead letter topic.",
      "body": "Kafka is at-least-once in practice. A rebalance, a crash after processing but before the commit, or a retry all deliver the same message twice.\n\n- Process, then commit. Auto-commit on a timer acknowledges messages you have not handled yet, which turns a crash into silent data loss. Disable it and commit explicitly after the work is durable.\n- Make the handler idempotent: check whether this event id was already processed (a processed-events table or a natural uniqueness constraint on the write), or make the effect naturally repeatable. Never send an email or charge a card without that guard.\n- Bound retries: a fixed number of attempts with exponential backoff, then publish the message plus the failure reason to a dead letter topic. An unbounded retry on a poison message stops the partition and every message behind it.\n- Keep the handler faster than the poll interval, or heartbeat and pause the partition explicitly. A long handler that blocks the poll loop triggers a rebalance, which triggers redelivery, which looks like a bug elsewhere.\n- Consume with `group.protocol=consumer` to use the KIP-848 protocol where the broker supports it; it removes the stop-the-world rebalance that made every deploy a latency spike.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/events",
      "title": "Treat the event payload as a published contract",
      "summary": "Events are versioned, backward-compatible, and carry no data the consumer is not allowed to see; a breaking change means a new event type.",
      "body": "An event is an API with unknown consumers and an unknown replay window. Once it is in a topic, someone will read it a year from now.\n\n- Register schemas and enforce compatibility in CI (backward compatible by default): add optional fields, never remove or retype one, and never repurpose a field's meaning. A genuinely breaking change is a new event type or a new topic, not an edit.\n- Include `eventId`, `eventType`, `version`, `occurredAt`, and the entity id in every envelope, with the domain payload nested underneath. Consumers route on the envelope and only parse the payload they understand.\n- Publish facts, not commands, on shared topics: `OrderPlaced` rather than `SendConfirmationEmail`. A fact stays true and lets consumers decide; a command couples the producer to one consumer's behaviour.\n- Keep secrets and unnecessary personal data out of payloads. A topic is replicated, retained, replayable, and readable by every consumer group; treat it as a durable data store subject to your retention and privacy rules.\n- Send an id rather than a whole entity snapshot when the entity is large or sensitive, and let consumers fetch what they need, accepting the extra call.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/events",
      "title": "The outbox pattern solves the dual write",
      "summary": "A database commit and a Kafka publish cannot be atomic, so write the event to an outbox table in the same transaction and publish it from there.",
      "body": "The most common event-driven bug is not in Kafka: it is a service that writes a row and publishes an event as two separate operations. Either can fail, and the system ends up inconsistent in a way no retry fixes.\n\n- In the same database transaction as the state change, insert the event into an `outbox` table (id, aggregate id, type, payload, created_at, published_at). The transaction guarantees both or neither.\n- A separate relay publishes unpublished rows to Kafka and marks them published: either a poller with a small batch and an index on `published_at`, or change data capture reading the log (Debezium-style). The relay is at-least-once, which is why consumers must dedupe.\n- Never publish from inside application code after commit and hope: a crash between commit and publish is exactly the case the outbox exists for.\n- Keep the outbox small: prune published rows on a schedule, and keep the payload the same envelope the topic carries so the relay is a dumb copy.\n- The inverse (inbox) is the consumer-side counterpart: record the processed event id in the same transaction as the write, which makes the handler idempotent with no extra bookkeeping.\n\nSee /src/consumers for the idempotency rule and /src/producers for the publish contract."
    },
    {
      "kind": "memory",
      "nodePath": "/infra/kafka",
      "title": "Cluster and topic settings that decide whether you lose data",
      "summary": "Kafka 4 is KRaft only; durability comes from replication factor with min.insync.replicas, and topic retention or compaction is a design decision.",
      "body": "Most Kafka data loss is a configuration choice made by default rather than deliberately.\n\n- Kafka 4 removed ZooKeeper: clusters run in KRaft mode with controller quorum nodes. Any runbook, tool, or client setting that mentions ZooKeeper is stale and needs rewriting.\n- Durability is replication factor 3 with `min.insync.replicas=2` and producers using `acks=all`. With `min.insync.replicas=1`, a single broker failure at the wrong moment loses acknowledged writes. Leave unclean leader election disabled.\n- Choose partition count for consumer parallelism (one partition is consumed by at most one member of a group) and remember you can add partitions but not remove them, and adding them changes key-to-partition mapping for new writes.\n- Pick retention deliberately per topic: time or size retention for event streams, log compaction for topics that represent current state by key (compaction keeps the latest value per key forever). Replay windows are a product decision, not a default.\n- Monitor consumer lag per group and partition, plus rebalance frequency and dead letter topic volume. Lag is the single metric that tells you a consumer is failing, and a rising dead letter rate is the second.\n\nSee /src/consumers for the offset and retry rules, and the observability pattern for how these metrics reach your dashboards."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "kafka-topic-design",
      "summary": "Decision procedure for introducing a new topic: naming, key, partitions, retention, and compatibility.",
      "body": "---\nname: kafka-topic-design\ndescription: Procedure for introducing a new Kafka topic. Decide name, partition key, partition count, replication, retention or compaction, and schema compatibility before the first producer ships.\n---\n\n# New Kafka topic\n\nAnswer all six before writing the producer. A topic is hard to change later.\n\n1. **Name and ownership.** `<domain>.<entity>.<event>` (for example `orders.order.placed`), one owning service, documented consumers. Facts, not commands.\n2. **Partition key.** Which identity must stay ordered? Key by that entity id. Check cardinality (enough to spread) and skew (no single key dominating traffic).\n3. **Partition count.** Start from peak throughput divided by what one consumer instance handles, plus headroom. Remember: you can add partitions but never remove them, and adding them breaks key-to-partition stability for new writes.\n4. **Durability.** Replication factor 3, `min.insync.replicas=2`, producers `acks=all`, unclean leader election off.\n5. **Retention.** Is this a stream of events (time or size retention, sized to the longest replay you promise) or the current state per key (log compaction)? Write down the replay window consumers may rely on.\n6. **Schema.** Register the envelope and payload schema, set backward compatibility, and confirm no field carries secrets or unnecessary personal data.\n\n## Before merging\n- [ ] Topic created through infrastructure as code, not by hand or auto-creation.\n- [ ] A dead letter topic exists for every consumer group that will read it.\n- [ ] Lag and dead letter alerts are configured.\n",
      "skillTags": [
        "kafka",
        "event-driven",
        "topic-design",
        "architecture"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "kafka-consumer-review",
      "summary": "Pre-merge checklist for a new or changed Kafka consumer.",
      "body": "---\nname: kafka-consumer-review\ndescription: Review checklist for Kafka consumer code: offset commits, idempotency, retry and dead letter handling, poll loop timing, and rebalance behaviour. Run before merging a consumer change.\n---\n\n# Kafka consumer review\n\n## Offsets and delivery\n- [ ] Auto-commit is off; offsets are committed after the work is durable.\n- [ ] The handler is idempotent: the event id is deduped, or the effect is naturally repeatable.\n- [ ] Redelivery of the last message before a crash produces no duplicate side effect.\n\n## Failure handling\n- [ ] Retries are bounded with backoff, then the message goes to a dead letter topic with its failure reason.\n- [ ] A poison message cannot block the partition indefinitely.\n- [ ] The dead letter topic has an owner and an alert, not just a name.\n\n## Timing and rebalances\n- [ ] Handler duration fits inside `max.poll.interval.ms`, or the partition is paused explicitly.\n- [ ] Long work is moved off the poll loop rather than blocking it.\n- [ ] `group.protocol=consumer` where the broker supports KIP-848.\n\n## Contract\n- [ ] The consumer routes on the envelope and tolerates unknown fields and future versions.\n- [ ] It does not assume ordering across partitions, only within a key.\n- [ ] Metrics expose lag, processing time, and failure count.\n",
      "skillTags": [
        "kafka",
        "consumers",
        "code-review",
        "reliability"
      ]
    }
  ]
};
