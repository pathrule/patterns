import type { Pattern } from "../types.js";

export const awsLambda: Pattern = {
  "slug": "aws-lambda",
  "version": "1.0.0",
  "name": "AWS Lambda",
  "tagline": "Write Lambda handlers that reuse their init work, retry safely, and do not exhaust the database.",
  "description": "Lambda's execution model decides how the code should be written, and most functions are written as if it were a long-lived server. Work done at module load is paid once per environment and reused across invocations, while work inside the handler is paid every time. Asynchronous invocations retry, so a handler with a non-idempotent side effect will duplicate it. And a connection pool per instance multiplied by the concurrency limit is how a small function takes down a database. This bundle covers handler shape, retry and batch semantics, function configuration, cold starts, and connections.",
  "category": "Infra",
  "icon": "cloud-lightning",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "AWS Lambda pattern for AI coding agents",
  "metaDescription": "AWS Lambda pattern for AI coding agents: initialise clients outside the handler, make retries idempotent, size memory and timeouts, and pool connections.",
  "problem": "AI agents create SDK clients and database connections inside the handler, ignore that asynchronous invocations retry, and leave the default timeout and memory on functions that need neither.",
  "audience": "Teams running serverless services on AWS Lambda with SQS, EventBridge, or API Gateway",
  "prevents": [
    "Constructing an SDK client or database connection on every invocation",
    "Duplicating a side effect because an asynchronous invocation was retried",
    "Failing an entire SQS batch when one message is bad",
    "Opening a connection pool per instance until the database refuses connections"
  ],
  "appliesTo": {
    "paths": [
      "/src/handlers",
      "/src/lib",
      "/infra"
    ],
    "stacks": [
      "aws",
      "lambda",
      "serverless",
      "node",
      "sqs"
    ],
    "packages": [
      "@aws-sdk/client-s3",
      "@aws-lambda-powertools/logger",
      "aws-cdk-lib"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/handlers",
      "title": "Do setup at module scope, keep the handler pure work",
      "summary": "Clients, config, and connections are created once outside the handler; the handler parses the event, does the work, and holds no cross-invocation state.",
      "body": "Everything at module scope runs once per execution environment and is reused for every invocation that lands on it. Everything in the handler runs every time.\n\n- Create SDK clients, database clients, and parsed configuration at module scope. Reuse means one TLS handshake and one credential fetch instead of thousands.\n- Fetch secrets and parameters once and cache them in module scope with a TTL (or use the Lambda extension that does it for you). A Secrets Manager call per invocation is latency and cost you pay forever.\n- Keep no mutable state across invocations beyond caches you designed. The next invocation may be a different request from a different tenant on the same instance, so a module-level variable holding \"the current user\" is a data leak.\n- Make the handler small: validate the event shape, call a function that could run anywhere, and map the result to the response. That function is what your tests exercise.\n- Never rely on background work continuing after the handler returns. The environment is frozen; an unawaited promise may never finish, and its error is invisible.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/handlers",
      "title": "Treat every invocation as retryable",
      "summary": "Asynchronous invocations retry automatically, so side effects are idempotent, batch handlers report partial failures, and poison events go to a failure destination.",
      "body": "Synchronous callers decide what to do with a failure. For everything else (SQS, EventBridge, S3 notifications, asynchronous invokes), the platform retries, and it does not ask.\n\n- Make the side effect idempotent: key it on something stable from the event (message id, request id, an idempotency key from the caller) and check-then-act, or use a conditional write so the second attempt is a no-op. Powertools has an idempotency utility if you want it off the shelf.\n- For SQS event sources, enable partial batch responses (`ReportBatchItemFailures`) and return the failed message ids. Without it, one bad message re-delivers the entire batch and reprocesses everything that already succeeded.\n- Set a dead letter queue or an `OnFailure` destination on every asynchronous function and alarm on it. Silent drops after the retry budget are the failure mode nobody notices for weeks.\n- Bound retries deliberately (maximum attempts, maximum event age) rather than leaving a permanent failure to retry until the event expires.\n- Log the identifiers that make a duplicate traceable (request id, message id, correlation id) so you can tell a retry from a genuine second event.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra",
      "title": "Configure each function deliberately: memory, timeout, permissions, concurrency",
      "summary": "Memory and timeout are set per function from measurement, the role grants only what the function calls, and concurrency is capped to protect downstream systems.",
      "body": "Lambda's defaults are a starting point for a demo. Every one of them is a decision in production.\n\n- Size memory from measurement, not intuition: memory also scales CPU, so more memory often costs less per invocation because the function finishes sooner. Tune it with real payloads rather than guessing.\n- Set a timeout that reflects the work plus headroom, not the maximum. A function that hangs for fifteen minutes is fifteen minutes of billed nothing, and it hides the real failure.\n- Prefer `arm64` (Graviton) unless a native dependency blocks it: same code, lower cost, generally better performance.\n- One IAM role per function, with only the actions and resources that function touches. No wildcard resources, no shared \"lambda-execution-role\" that accumulates every permission the account ever needed.\n- Cap blast radius with reserved concurrency on functions that talk to something fragile (a relational database, a third-party API with a rate limit), and use provisioned concurrency only on latency-critical paths where you have measured that it pays for itself.\n- Define all of this as infrastructure as code so the configuration is reviewable, and so a console change cannot become the source of truth.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/lib",
      "title": "What actually reduces cold starts",
      "summary": "Bundle size and init work dominate; arm64 and lazy imports help, SnapStart helps Java, Python, and .NET, and provisioned concurrency is a paid last resort.",
      "body": "Cold start work is spent loading your code and running module scope. Most of the fix is in the artifact, not in a platform feature.\n\n- Shrink the bundle: tree-shake, bundle only what you import, and never ship the whole SDK when you need one client. Modular AWS SDK imports and a bundler are the largest single win in Node.\n- Import lazily inside the handler for code only some paths need (a PDF renderer, a heavy parser), so the common path does not pay for it at init.\n- Keep init work honest: reading a large config file, compiling schemas, or warming a cache at module scope is added to every cold start. Cache what is reused; defer what is rare.\n- `arm64` typically improves both cost and startup. SnapStart removes most init latency for Java, Python, and .NET by resuming from a snapshot of the initialised environment; it is not a Node feature, and code that captures state at init (random seeds, connections, timestamps) must be written to handle resume.\n- Provisioned concurrency eliminates cold starts on the paths you pay for it on, and it is genuinely expensive at scale. Reach for it after the bundle and init work are already small, and only for user-facing latency.\n\nSee /infra for the configuration rule and /src/handlers for the init-outside-handler rule."
    },
    {
      "kind": "memory",
      "nodePath": "/infra",
      "title": "Databases and Lambda: concurrency is the connection count",
      "summary": "Every concurrent instance holds its own pool, so put a proxy or a data API in front of a relational database and keep the per-instance pool tiny.",
      "body": "The classic serverless outage: traffic spikes, Lambda scales to hundreds of instances, each opens a pool, and the database refuses connections for everyone including the non-serverless services.\n\n- Keep the per-instance pool at one or two connections. An instance handles one invocation at a time, so a large pool buys nothing and multiplies against concurrency.\n- Put a pooler in front of a relational database: RDS Proxy, a serverless-aware driver, or an HTTP data API. This is the actual fix, because it decouples client count from database connections.\n- Cap the function's reserved concurrency to something the database can survive, and treat that number as a capacity decision rather than a throttle you removed once during an incident.\n- Never open a connection inside the handler or close it at the end. Create it at module scope, let it be reused, and let the environment's teardown handle the rest.\n- Prefer purpose-built serverless stores (DynamoDB, S3, SQS) for high-fan-out paths, and keep the relational database behind a bounded, pooled surface.\n\nSee the observability pattern for tracing across these hops, and /src/handlers for the retry rules that assume a healthy database."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "lambda-production-checklist",
      "summary": "Gate a Lambda function before it takes production traffic or an event source.",
      "body": "---\nname: lambda-production-checklist\ndescription: Production checklist for an AWS Lambda function: handler shape, retry and idempotency, configuration, permissions, connections, and observability. Run before wiring a function to production traffic or an event source.\n---\n\n# Lambda production checklist\n\n## Handler\n- [ ] SDK clients, config, and connections are created at module scope.\n- [ ] Secrets are fetched once and cached with a TTL, not per invocation.\n- [ ] No mutable cross-invocation state that could belong to another caller.\n- [ ] Nothing is left running after the handler returns; all promises are awaited.\n\n## Retries and failures\n- [ ] Side effects are idempotent, keyed on a stable identifier from the event.\n- [ ] SQS sources return partial batch failures.\n- [ ] A dead letter queue or `OnFailure` destination exists, with an alarm on it.\n- [ ] Retry attempts and maximum event age are set deliberately.\n\n## Configuration\n- [ ] Memory and timeout come from measurement, not defaults.\n- [ ] Architecture is `arm64` unless a dependency blocks it.\n- [ ] Reserved concurrency protects fragile downstream systems.\n- [ ] Everything is defined in infrastructure as code.\n\n## Permissions\n- [ ] One role per function, no wildcard resources.\n- [ ] No permission the function does not actually call.\n\n## Data access\n- [ ] Per-instance connection pool is 1 to 2.\n- [ ] A proxy or data API sits in front of any relational database.\n\n## Observability\n- [ ] Structured JSON logs with request and correlation ids.\n- [ ] Traces enabled across the hops this function participates in.\n- [ ] Alarms on errors, throttles, duration approaching the timeout, and dead letter depth.\n",
      "skillTags": [
        "aws",
        "lambda",
        "serverless",
        "production-readiness",
        "reliability"
      ]
    }
  ]
};
