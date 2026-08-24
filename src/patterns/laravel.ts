import type { Pattern } from "../types.js";

export const laravel: Pattern = {
  "slug": "laravel",
  "version": "1.0.0",
  "name": "Laravel",
  "tagline": "Build Laravel apps with lean Eloquent queries, validated requests, and queued work that retries safely.",
  "description": "A bundle for teams on Laravel 12 and 13 that keeps agents on the framework's own idioms instead of generic PHP. It covers the four places Laravel apps rot: Eloquent relations that lazy-load inside a Blade loop, controllers that read straight from the request, jobs that are not idempotent and duplicate work on retry, and a production deploy that never caches config or routes. Written so each piece lands on the directory it governs rather than in one README nobody scopes.",
  "category": "Framework",
  "icon": "hammer",
  "color": "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Laravel Eloquent pattern for AI coding agents",
  "metaDescription": "Laravel pattern for AI coding agents: eager-load Eloquent relations, validate with form requests, authorize with policies, and queue work that retries safely.",
  "problem": "AI agents write Laravel code that lazy-loads relations inside Blade loops, validates inline in controllers, authorizes nowhere, and queues jobs that duplicate work when they retry.",
  "audience": "PHP teams shipping Laravel 12 or 13 applications",
  "prevents": [
    "Lazy-loading a relation inside a Blade or collection loop and firing N queries",
    "Reading request input directly in a controller with no validation or authorization",
    "Queueing a job that repeats its side effect every time the queue retries it",
    "Deploying without caching config, routes, views, and events"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/app/Http",
      "/app/Jobs",
      "/database"
    ],
    "stacks": [
      "laravel",
      "php",
      "eloquent",
      "queues",
      "mysql"
    ],
    "packages": [
      "laravel/framework",
      "laravel/horizon",
      "laravel/pint"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Eager-load every relation a view or resource reads",
      "summary": "Declare `with()` on the query that feeds a view, resource, or export, and fail loudly on lazy loading in local and CI.",
      "body": "Eloquent will happily run one query per row, and Blade makes it invisible: the loop reads `$order->customer->name` and the page fires 200 queries.\n\n- Load relations on the query, not in the template: `Order::with(['customer', 'items.product'])`. If a Blade view, API resource, or export touches a relation, the query that feeds it declares it.\n- Turn lazy loading into an error outside production with `Model::preventLazyLoading(! app()->isProduction())` in a service provider. This is the single highest-value line in a Laravel app.\n- Use `withCount` for counts, `chunk`/`lazy`/`cursor` for large sets, and `select` the columns you need. Loading full models to count them is wasted memory.\n- Never call a query inside an accessor or a `map` over a collection. Load what you need in one query and key it by id.\n- Watch the inverse too: `whereHas` on a deep relation can be slower than a join with an index. Read the query log before optimising by feel.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app/Http",
      "title": "Validate in a form request and authorize with a policy",
      "summary": "Every write endpoint takes a typed FormRequest and checks a policy or gate; controllers never read unvalidated input or trust a route id.",
      "body": "Laravel gives you validation and authorization as first-class layers. Skipping them is what turns a mass-assignment convenience into a privilege escalation.\n\n- Put validation in a `FormRequest` per endpoint. The controller receives validated data, never `$request->all()`. Rules live with the endpoint, not scattered across the action.\n- Authorize with a policy or gate for every action on a model, and check ownership of the specific record. A route model binding proves the record exists, not that this user may touch it.\n- Keep `$fillable` (or `$guarded`) accurate on every model and pass only validated data to `create`/`update`. `Model::unguard()` in application code is a bug.\n- Return an API resource rather than the model, so a new database column never leaks into a public response by accident.\n- Rate-limit authentication and other abuse-prone routes with the framework's throttle middleware.\n\nSee the web-security pattern for the app-level authorization and input rules this mirrors.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app/Jobs",
      "title": "Make queued jobs idempotent and bounded",
      "summary": "Queues deliver at least once: give every job a retry budget, a unique lock where it must not overlap, and a side effect that is safe to repeat.",
      "body": "A queued job will run twice eventually: a worker is killed mid-run, a deploy restarts the pool, a transient failure triggers a retry. Design for the second run.\n\n- Set `$tries` and `$backoff` (or `retryUntil`) on every job. A job with unlimited retries and a permanent failure is an infinite loop that burns the queue.\n- Make the side effect idempotent: check state before acting, or key it on something stable so a repeat is a no-op. Charging a card, sending an email, or incrementing a counter twice must be impossible.\n- Use `ShouldBeUnique` (or an explicit cache lock) for jobs that must not overlap for the same subject, and `ShouldBeUniqueUntilProcessing` where only the queued window matters.\n- Dispatch after the transaction commits (`dispatch()->afterCommit()` or `after_commit` on the connection). A job that reads a row the transaction has not committed yet fails intermittently and is a nightmare to reproduce.\n- Pass ids, not serialized models, and handle the row being gone. Implement `failed()` so a dead job leaves a trace instead of silence.\n\nSee the background-jobs-queues pattern for the queue-agnostic version of these constraints.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Where code goes in a Laravel app, and what stays out of the container",
      "summary": "Actions and services hold workflows, models hold scopes and casts, and anything expensive is resolved lazily rather than in a provider boot.",
      "body": "Laravel's structure is loose enough that two developers produce two architectures. Pick the conventional one and stay in it.\n\n- Controllers stay thin: resolve, delegate, respond. Multi-step workflows go in a single-purpose action or service class under `App\\Actions` or `App\\Services`, which is testable without HTTP and reusable from a command or job.\n- Models own their query vocabulary: local scopes for reusable filters, casts for value conversion, accessors for derived display values. Business decisions that span models do not belong there.\n- Avoid heavy work in a service provider's `boot()`. It runs on every request, including artisan commands and health checks. Bind lazily and let the container resolve on demand.\n- Prefer explicit event listeners over model events for anything a reader needs to know about, and never rely on model events in bulk paths: `Model::query()->update()` bypasses them entirely, exactly like Eloquent's docs say.\n- Keep Blade for presentation. A view that queries, formats money, or decides permissions is a view that cannot be tested.\n\nSee /app/Http for the request rules and /app/Jobs for the queue rules."
    },
    {
      "kind": "memory",
      "nodePath": "/database",
      "title": "Migrations, seeders, and the production deploy sequence",
      "summary": "Migrations are forward-only in production, seeders stay idempotent, and every deploy caches config, routes, views, and events.",
      "body": "Most Laravel production surprises come from the deploy, not the code.\n\n- Cache everything the framework can precompute on deploy: `config:cache`, `route:cache`, `view:cache`, `event:cache`. Without config caching, every request re-reads your config tree, and `env()` calls outside config files return null once caching is on. Read config, never `env()`, at runtime.\n- Run `migrate --force` as part of the release, and treat migrations as forward-only in production. Rolling back a shipped migration is a data decision, not a command.\n- Keep destructive schema changes multi-step: add nullable, deploy writers, backfill, then constrain or drop. On MySQL, an added index or a changed column type can lock a large table.\n- Seeders are for reference data and must be idempotent (`upsert`/`firstOrCreate`), so re-running one does not duplicate rows. Test data belongs in factories.\n- Restart the queue workers after every deploy (`queue:restart`); long-lived workers keep the old code in memory until they cycle.\n\nSee /app/Jobs for the job design that makes a worker restart safe."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "laravel-pre-merge-review",
      "summary": "Checklist for any Laravel change that adds a controller, model query, job, or migration.",
      "body": "---\nname: laravel-pre-merge-review\ndescription: Laravel review checklist covering Eloquent query efficiency, request validation and authorization, queued job safety, and deploy-time caching. Run before merging.\n---\n\n# Laravel review\n\n## Eloquent\n- [ ] Every relation the view, resource, or export reads is eager-loaded on the query.\n- [ ] No query inside a loop, accessor, or collection callback.\n- [ ] `preventLazyLoading` is on outside production and the change does not trip it.\n- [ ] Large reads use `chunk`, `lazy`, or `cursor`; counts use `withCount`.\n\n## Request handling\n- [ ] Writes take a `FormRequest`; the controller never reads `$request->all()`.\n- [ ] A policy or gate authorizes the action on the specific record.\n- [ ] Responses go through an API resource; `$fillable` is accurate.\n\n## Jobs and events\n- [ ] `$tries` and `$backoff` are set; the side effect is safe to repeat.\n- [ ] Overlap-sensitive jobs use `ShouldBeUnique` or an explicit lock.\n- [ ] Dispatch happens after commit; the job takes ids, not models, and handles a missing row.\n\n## Migrations and deploy\n- [ ] Schema change is additive, or split into add, backfill, constrain.\n- [ ] No runtime `env()` call outside a config file.\n- [ ] Seeder changes are idempotent.\n",
      "skillTags": [
        "laravel",
        "php",
        "eloquent",
        "code-review",
        "queues"
      ]
    }
  ]
};
