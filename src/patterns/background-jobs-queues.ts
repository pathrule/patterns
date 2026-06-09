import type { Pattern } from "../types.js";

export const backgroundJobsQueues: Pattern = {
  "slug": "background-jobs-queues",
  "version": "1.0.0",
  "name": "Background Jobs & Queues",
  "tagline": "Make every queued job safe to run twice so retries heal instead of corrupt.",
  "description": "Queue-backed work is delivered at-least-once, which means every job can and eventually will run more than once. This pattern bundles the rules, memories, and review checklist that keep your workers idempotent, retried with backoff and jitter, drained on dead-letter queues you actually watch, and enqueued atomically with the data they describe.",
  "category": "Backend",
  "icon": "list-todo",
  "color": "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Background Jobs & Queues pattern for AI coding agents",
  "metaDescription": "Teach your AI coding agent to write idempotent jobs, exponential backoff with jitter, dead-letter queues, and atomic enqueue via the transactional outbox.",
  "problem": "Queues deliver at-least-once, so naive jobs run twice and corrupt data, retry storms hammer dependencies, and failed jobs vanish silently.",
  "audience": "Backend and platform teams running Node.js queue workers (BullMQ, SQS, RabbitMQ) behind an API or event stream.",
  "prevents": [
    "Duplicate side effects from a job that re-runs after a retry or redelivery",
    "Retry storms that hammer a downstream dependency because there is no jitter or failure-type classification",
    "Permanently failed jobs disappearing into the failed set with no dead-letter queue or alert"
  ],
  "appliesTo": {
    "paths": [
      "/src/jobs",
      "/src/workers",
      "/src/queues"
    ],
    "stacks": [
      "node",
      "typescript",
      "bullmq",
      "redis",
      "sqs",
      "rabbitmq"
    ],
    "packages": [
      "bullmq",
      "ioredis",
      "@aws-sdk/client-sqs",
      "amqplib"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/jobs",
      "title": "Every job handler must be idempotent",
      "summary": "Assume at-least-once delivery: re-running a job with the same input must not change the final state.",
      "body": "Queue delivery is at-least-once, so write every handler so the same input produces the same end state whether it runs once or five times.\n\n- Carry a stable idempotency key on the job payload (for example `orderId` or a UUID minted at enqueue time), not a value generated inside the worker.\n- Guard side effects with a unique constraint or a dedup record (`INSERT ... ON CONFLICT DO NOTHING`, or a `processed_jobs` row) checked inside the same transaction as the work.\n- Make external calls idempotent too: pass the same key to providers (Stripe `Idempotency-Key`, conditional writes) so a redelivery is a no-op.\n- Keep the dedup record's TTL longer than the queue's full retry window, or a late redelivery will slip past the guard.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/workers",
      "title": "Retry with backoff and route permanent failures to a DLQ",
      "summary": "Use exponential backoff with jitter, a bounded attempt count, and a dead-letter queue that is monitored.",
      "body": "Retries must back off and stop, and exhausted jobs must land somewhere a human will see them.\n\n- Configure `attempts` plus `backoff: { type: 'exponential', delay }` in BullMQ; add jitter so synchronized failures do not retry in lockstep.\n- Classify errors: throw `UnrecoverableError` for permanent failures (malformed payload, missing referenced row) so they skip the remaining attempts instead of burning them.\n- On final failure move the job to a dead-letter queue and emit a metric or alert; never let it sit silently in the `failed` set forever.\n- Set `removeOnComplete` and a bounded `removeOnFail` so Redis does not grow unbounded, but keep enough failed history to debug and replay.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/queues",
      "title": "BullMQ conventions for this service",
      "summary": "Versions, scheduler API, and connection rules we standardize on for BullMQ.",
      "body": "We run BullMQ v5.x (current line as of mid-2026) on a dedicated Redis instance, separate from the cache.\n\n- Use `Worker` and `Queue` from `bullmq`; share one `ioredis` connection per process with `maxRetriesPerRequest: null` (required by BullMQ blocking commands).\n- Schedule recurring work with `queue.upsertJobScheduler(schedulerId, repeat, template)`; the old `Repeat`/`add({ repeat })` API is deprecated and removed in v6.\n- Set `Worker` `concurrency` deliberately and add a rate limiter (`limiter: { max, duration }`) for jobs that call rate-limited providers.\n- Job IDs are the dedup unit: pass a deterministic `jobId` to drop duplicate enqueues, and remember BullMQ keeps a completed job's ID only while its record lives.\n- See /src/workers for retry and DLQ policy and /src/jobs for the idempotency contract every handler must honor."
    },
    {
      "kind": "memory",
      "nodePath": "/src/jobs",
      "title": "Enqueue atomically with the transactional outbox",
      "summary": "Never enqueue inside a DB transaction; write an outbox row and let a relay publish it.",
      "body": "Enqueueing to Redis or SQS from inside a database transaction is a dual-write bug: the commit can succeed while the enqueue fails, or vice versa, leaving data and jobs out of sync.\n\n- Within the business transaction, insert an `outbox` row describing the job instead of calling the queue directly. The row commits atomically with the data it depends on.\n- A relay worker polls the outbox with `SELECT ... FOR UPDATE SKIP LOCKED` to claim a batch, enqueues each job, and marks the row dispatched. Multiple relays can run in parallel without double-claiming.\n- Because the relay can crash after enqueue but before marking the row, dispatch is at-least-once too. That is fine: the downstream job is already idempotent (see /src/jobs idempotency rule).\n- Use a stable outbox row ID as the job's idempotency key so a re-dispatched row maps to the same job."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "background-jobs-queues-review",
      "summary": "Pre-merge checklist for any new or changed queue job, worker, or enqueue path.",
      "body": "---\nname: background-jobs-queues-review\ndescription: Review checklist for background jobs and queues. Use before merging any new or changed job handler, worker configuration, scheduler, or enqueue path to confirm idempotency, retry/backoff policy, dead-letter handling, and atomic enqueue.\n---\n\n# Background Jobs & Queues review\n\n- [ ] The handler is idempotent: the same payload produces the same end state when run more than once.\n- [ ] A stable idempotency key rides on the payload (not generated inside the worker) and guards side effects via a unique constraint or dedup record.\n- [ ] The dedup record's TTL outlives the queue's full retry window.\n- [ ] `attempts` is bounded and `backoff` is exponential with jitter, not a fixed or zero delay.\n- [ ] Permanent failures throw `UnrecoverableError` (or equivalent) so they skip remaining retries instead of burning them.\n- [ ] Exhausted jobs move to a dead-letter queue and emit a metric or alert; nothing fails silently.\n- [ ] `removeOnComplete` and a bounded `removeOnFail` are set so Redis does not grow without limit.\n- [ ] Recurring jobs use `upsertJobScheduler`, not the deprecated `Repeat`/`add({ repeat })` API.\n- [ ] The Redis connection uses `maxRetriesPerRequest: null` and worker `concurrency`/rate limits are set deliberately.\n- [ ] Enqueues that depend on a DB write go through a transactional outbox, not a direct enqueue inside the transaction.\n- [ ] Workers shut down gracefully (`worker.close()`) on SIGTERM so in-flight jobs finish or requeue cleanly on deploy.\n",
      "skillTags": [
        "backend",
        "queues",
        "bullmq",
        "idempotency",
        "reliability",
        "review"
      ]
    }
  ]
};
