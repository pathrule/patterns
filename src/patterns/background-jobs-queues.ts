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
      "summary": "Assume at-least-once delivery and concurrent re-execution: the same input must produce the same final state no matter how many times it runs.",
      "body": "Queue delivery is at-least-once and re-execution is not always sequential. A retry, a redelivery, or a lock/visibility-timeout expiry mid-job can all cause the same payload to be processed more than once, sometimes concurrently. Write every handler so the final state is identical whether it runs once or five times.\n\n- Carry a stable idempotency key on the job payload (for example `orderId`, or a UUID minted at enqueue time), never a value generated inside the worker. A worker-generated key changes on every redelivery and defeats deduplication.\n- Guard side effects with a unique constraint or a dedup record (`INSERT ... ON CONFLICT DO NOTHING`, or a `processed_jobs(job_key)` row) checked inside the same transaction as the work, so the check and the write commit or roll back together.\n- Make external calls idempotent too: pass the same key to providers (Stripe `Idempotency-Key`, conditional/compare-and-set writes, S3 PUT with a deterministic key) so a redelivery is a no-op rather than a second charge or duplicate file.\n- Keep the dedup record's TTL longer than the queue's full retry window plus the dead-letter retention; a late redelivery that arrives after the record expires will slip past the guard.\n- Assume two workers can hold the same job at once during a stall. The dedup row, not an in-process flag, is what makes the second one safe.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/workers",
      "title": "Bound retries with jittered backoff and route exhausted jobs to a monitored DLQ",
      "summary": "Exponential backoff with jitter, a bounded attempt count, error classification, and a dead-letter queue someone actually watches.",
      "body": "Retries must back off, must stop, and exhausted jobs must land somewhere a human will see them. Unbounded or zero-delay retries turn one downstream blip into a self-inflicted outage.\n\n- Configure `attempts` plus `backoff: { type: 'exponential', delay }` in BullMQ, and add jitter (a custom backoff strategy that randomizes the computed delay) so a fleet that fails simultaneously does not retry in lockstep and synchronize the next spike.\n- Classify errors. Throw `UnrecoverableError` for permanent failures (malformed payload, a referenced row that will never exist, a 4xx that will never succeed); it moves the job straight to the failed set and skips the remaining attempts instead of burning them on a hopeless retry.\n- On final failure, move the job to a dead-letter queue and emit a metric or alert. A job sitting silently in the `failed` set with no alert is a job nobody will ever notice failed.\n- Set `removeOnComplete: { age, count }` and a bounded `removeOnFail` so Redis does not grow without limit, but keep enough failed history to inspect and replay.\n- For SQS, configure a redrive policy with a `maxReceiveCount` so messages that fail repeatedly land in the DLQ instead of cycling forever.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/queues",
      "title": "BullMQ conventions for this service",
      "summary": "Versions, the Job Scheduler API, connection rules, and dedup-by-jobId we standardize on.",
      "body": "We run BullMQ v5.x on a dedicated Redis instance, separate from the application cache, so a cache flush or eviction can never drop queued jobs.\n\n- Use `Worker` and `Queue` from `bullmq`. Share one `ioredis` connection per process and set `maxRetriesPerRequest: null` on it; BullMQ relies on Redis blocking commands (BRPOPLPUSH/BZPOPMIN) and ioredis throws on blocking calls if a finite retry limit is set.\n- Schedule recurring work with `queue.upsertJobScheduler(schedulerId, repeat, template)`. The old `Repeat` class and `add(name, data, { repeat })` API have been deprecated since v5.16.0 and are removed in v6; `upsertJobScheduler` is idempotent, so calling it again with the same scheduler id updates the schedule instead of creating a duplicate.\n- Set `Worker` `concurrency` deliberately, and add a rate limiter (`limiter: { max, duration }`) for jobs that call rate-limited providers so the worker throttles itself instead of getting throttled.\n- A deterministic `jobId` is the enqueue-side dedup unit: pass one to collapse duplicate enqueues into a single job. Note BullMQ only remembers a completed job's id while its record still exists, so this dedups concurrent/near-term duplicates, not a re-enqueue weeks later.\n- See /src/workers for retry, DLQ, lock-duration, and shutdown policy, and /src/jobs for the idempotency contract every handler must honor."
    },
    {
      "kind": "memory",
      "nodePath": "/src/workers",
      "title": "Locks, stalled jobs, visibility timeout, and graceful shutdown",
      "summary": "Why a job runs twice even without a retry, how we size the lock/visibility window, and how workers drain on deploy.",
      "body": "The most surprising source of duplicate execution is not a retry, it is a lock or visibility timeout expiring while the worker is still alive and processing. This is why idempotency (see /src/jobs) is non-negotiable, not optional.\n\nBullMQ:\n- When a worker picks up a job it takes a lock (default `lockDuration` 30s) and renews it on an interval. If the event loop is starved (CPU-bound work, a long synchronous call, or a blocked promise) the renewal is missed, the lock expires, and `stalledInterval` (default 30s) detection moves the job back to waiting. Another worker then runs it concurrently with the first.\n- Size `lockDuration` above the realistic worst-case processing time, or break long jobs into smaller steps / child jobs. Do not just crank `lockDuration` to hours; that delays recovery of genuinely crashed workers.\n- `maxStalledCount` (default 1) caps how many times a job may stall before it is failed instead of retried, so a job that reliably starves a worker does not loop forever.\n\nSQS:\n- The equivalent knob is the visibility timeout. If processing outlasts it, the message becomes visible again and a second consumer picks it up. For long or variable jobs, run a heartbeat that calls `ChangeMessageVisibility` to extend the timeout while work continues, and delete the message only after the work commits.\n\nGraceful shutdown:\n- On SIGTERM (Kubernetes, PM2, deploy rollouts) call `worker.close()`. It stops the worker from picking up new jobs and waits for in-flight jobs up to `closeTimeout` (default 5000ms); jobs still running past that are moved to failed and re-run under the retry policy when the next pod starts. Wire SIGTERM to `close()` so a deploy drains cleanly instead of mass-stalling every in-flight job."
    },
    {
      "kind": "memory",
      "nodePath": "/src/jobs",
      "title": "Enqueue atomically with the transactional outbox",
      "summary": "Never enqueue inside a DB transaction; write an outbox row and let a relay publish it.",
      "body": "Enqueueing to Redis or SQS from inside a database transaction is a dual-write bug: the commit can succeed while the enqueue fails (work that never runs), or the enqueue can succeed while the transaction rolls back (a job for data that does not exist). You cannot make two systems commit atomically.\n\n- Within the business transaction, insert an `outbox` row describing the job instead of calling the queue directly. The row commits atomically with the data it depends on, because it lives in the same database.\n- A relay worker polls the outbox with `SELECT ... FOR UPDATE SKIP LOCKED` to claim a batch, enqueues each job, then marks the row dispatched (or deletes it). `SKIP LOCKED` lets multiple relays run in parallel without double-claiming the same rows; Postgres and MySQL 8.0+ both support it.\n- Mark a row dispatched only after the broker confirms acceptance. If the relay crashes between enqueue and mark, the row stays claimable and is re-dispatched, so dispatch is at-least-once too. That is fine, because the downstream handler is idempotent (see the /src/jobs idempotency rule).\n- Use the stable outbox row id as the job's idempotency key, so a re-dispatched row always maps to the same logical job."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "background-jobs-queues-review",
      "summary": "Pre-merge checklist for any new or changed queue job, worker, scheduler, or enqueue path.",
      "body": "---\nname: background-jobs-queues-review\ndescription: Review checklist for background jobs and queues. Use before merging any new or changed job handler, worker configuration, scheduler, or enqueue path to confirm idempotency, retry and backoff policy, dead-letter handling, lock/visibility tuning, graceful shutdown, and atomic enqueue.\n---\n\n# Background Jobs & Queues review\n\n## Idempotency\n- [ ] The handler is idempotent: the same payload produces the same end state when run more than once, including concurrently.\n- [ ] A stable idempotency key rides on the payload (not generated inside the worker) and guards side effects via a unique constraint or dedup record checked in the same transaction as the work.\n- [ ] External calls pass the same idempotency key (Stripe `Idempotency-Key`, conditional writes) so a redelivery is a no-op.\n- [ ] The dedup record's TTL outlives the full retry window plus DLQ retention.\n\n## Retry, backoff, and dead-letter\n- [ ] `attempts` is bounded and `backoff` is exponential WITH jitter, not fixed or zero delay.\n- [ ] Permanent failures throw `UnrecoverableError` (or equivalent) so they skip remaining retries instead of burning them.\n- [ ] Exhausted jobs move to a dead-letter queue and emit a metric or alert; nothing fails silently. (SQS: a redrive policy with `maxReceiveCount` is set.)\n- [ ] `removeOnComplete` and a bounded `removeOnFail` are set so Redis does not grow without limit, while keeping enough failed history to debug and replay.\n\n## Locks, stalls, and shutdown\n- [ ] `lockDuration` (BullMQ) or the SQS visibility timeout is larger than the realistic worst-case processing time; long jobs heartbeat (`ChangeMessageVisibility`) or are split into smaller steps.\n- [ ] Workers shut down gracefully: SIGTERM is wired to `worker.close()` so in-flight jobs drain or re-queue cleanly on deploy.\n\n## Scheduling, connection, and enqueue\n- [ ] Recurring jobs use `upsertJobScheduler`, not the deprecated `Repeat` / `add({ repeat })` API.\n- [ ] The Redis connection uses `maxRetriesPerRequest: null`, and worker `concurrency` plus any rate limiter are set deliberately.\n- [ ] Enqueues that depend on a DB write go through a transactional outbox, not a direct enqueue inside the transaction.\n",
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
