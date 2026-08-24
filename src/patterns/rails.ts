import type { Pattern } from "../types.js";

export const rails: Pattern = {
  "slug": "rails",
  "version": "1.0.0",
  "name": "Ruby on Rails",
  "tagline": "Work with Rails 8 as it ships today: the Solid stack, Hotwire views, and queries that do not multiply.",
  "description": "Rails 8 changed the defaults that matter, and assistants trained on older Rails keep reaching for the old ones. Background jobs, caching, and WebSockets now run on the database through Solid Queue, Solid Cache, and Solid Cable instead of assuming Redis. Deploys go out with Kamal and Thruster, assets go through Propshaft, and the view layer is Hotwire rather than a JavaScript build. This bundle captures those defaults, plus the two things that break Rails apps at scale: N+1 queries and migrations that lock a table.",
  "category": "Framework",
  "icon": "gem",
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
  "metaTitle": "Ruby on Rails pattern for AI coding agents",
  "metaDescription": "Rails 8 pattern for AI coding agents: Solid Queue and Solid Cache defaults, Hotwire views, strict eager loading, and migrations that do not lock a table.",
  "problem": "AI agents write Rails as if it were 2019: Redis and Sidekiq assumed for every queue, Sprockets for assets, a JavaScript framework in the view, and querysets that fire one query per row.",
  "audience": "Ruby teams on Rails 8 who deploy with Kamal and want the framework's own defaults",
  "prevents": [
    "Adding Redis and Sidekiq when Solid Queue and Solid Cache are the framework default",
    "Rendering a collection that lazy-loads an association once per row",
    "Writing a migration that adds an index or a NOT NULL column and locks a large table",
    "Reaching for a JavaScript framework where Turbo Frames and Streams already fit"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/app/models",
      "/app/views",
      "/config",
      "/db"
    ],
    "stacks": [
      "rails",
      "ruby",
      "hotwire",
      "activerecord",
      "postgres"
    ],
    "packages": [
      "rails",
      "solid_queue",
      "solid_cache",
      "turbo-rails",
      "stimulus-rails"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app/models",
      "title": "Declare associations you traverse and let strict loading catch the rest",
      "summary": "Every collection that renders an association loads it with includes or preload, and models opt into strict_loading so a missed one fails in development.",
      "body": "Active Record's lazy associations turn a clean partial into hundreds of queries. Rails gives you the tools to make that impossible rather than to notice it in production.\n\n- Load what the view renders: `includes` when you want Rails to pick the strategy, `preload` to force separate queries, `eager_load` to force one join (needed when you filter or order on the joined table).\n- Turn misses into errors, not latency: `config.active_record.strict_loading_by_default = true`, or `strict_loading` on the specific association. A `StrictLoadingViolationError` in development is cheaper than a slow query log in production.\n- Use `counter_cache` or `size` on a loaded association instead of `count`, which issues a query every call, and `exists?` instead of `present?` on an unloaded relation.\n- Batch large reads with `in_batches` or `find_each` so one request never materialises the whole table, and select only the columns you use with `select` or `pluck`.\n- Never query inside a view, helper, or serializer method that runs per row. Build a hash keyed by id in the controller and look it up.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Permit parameters explicitly and authorize the specific record",
      "summary": "Controllers use strong parameters with an explicit allow list, and every action checks that this user may act on this record.",
      "body": "Rails hands you the request as a convenient hash, and mass assignment plus a missing authorization check is the classic Rails privilege escalation.\n\n- Permit an explicit list per action (`params.expect(post: [:title, :body])` or `params.require(:post).permit(...)`). Never permit everything, and never permit a foreign key or a role column that lets a caller reassign ownership.\n- Authorize the record, not the route: load the object through the current user's scope (`current_user.posts.find(params[:id])`) or check a policy. `Post.find` plus a logged-in user is not authorization.\n- Keep validations in the model AND the matching constraint in the database. A uniqueness validation without a unique index is a race, not a rule.\n- Return a filtered representation (a serializer, a view partial, `as_json` with an explicit allow list) so a new column never leaks into an API response.\n- Rate-limit sensitive endpoints with the framework's built-in `rate_limit` in the controller rather than rolling your own counter.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/config",
      "title": "The Solid stack is the default: database-backed queue, cache, and cable",
      "summary": "Rails 8 runs jobs, cache, and WebSockets on the database through Solid Queue, Solid Cache, and Solid Cable, so a new app needs no Redis.",
      "body": "Rails 8 shipped the Solid stack as the default adapters, which removes Redis from the dependency list for most applications. Adding it back is a decision that needs a reason.\n\n- Background jobs run on Solid Queue (an Active Job backend that stores jobs in the database), the cache store is Solid Cache, and Action Cable uses Solid Cable. All three are configured in the generated app and deploy with it.\n- Keep the queue on its own database (the generated `queue` database) so job churn does not compete with application traffic for connections or vacuum.\n- Redis is still the right answer for genuinely high-throughput queues and for cache workloads that need sub-millisecond reads at high concurrency. Below that, the operational win of one fewer service is larger than the latency difference.\n- Solid Cache is disk-backed and designed for a much larger cache than a memory store, so cache more aggressively than Redis habits suggest, and set TTLs deliberately.\n- SQLite is a supported production database in Rails 8 for single-server apps, and the Solid stack is what makes that viable.\n\nSee /db for the migration rules the queue and cache tables also obey, and the background-jobs-queues pattern for queue design that is not Rails specific."
    },
    {
      "kind": "memory",
      "nodePath": "/app/models",
      "title": "Callbacks, concerns, and where a workflow actually belongs",
      "summary": "Callbacks are for keeping a record consistent; anything that touches another system belongs in an explicit object the caller can see.",
      "body": "The Rails model is the easiest place to put behaviour and the hardest place to find it later. Draw the line by side effect.\n\n- A callback may normalise or derive a value on the record being saved. It should not send email, enqueue a job that depends on other systems, call an API, or update unrelated records. Those fire in tests, fixtures, seeds, and bulk operations you did not plan for.\n- Multi-step workflows go in a plain command or service object called from the controller or job. It is readable at the call site, testable without a save, and reusable from a rake task.\n- Reusable query vocabulary goes in scopes on the model or in a query object. Long chains rebuilt in three controllers are a scope waiting to be named.\n- Concerns are for genuinely shared behaviour, not for splitting one large model into files. A concern that only one model includes is just indirection.\n- Bulk paths (`update_all`, `insert_all`, `delete_all`) skip validations and callbacks by design. If a rule must always hold, put it in the database as a constraint.\n\nSee /app for the controller rules and /db for the constraint that backs each validation."
    },
    {
      "kind": "memory",
      "nodePath": "/app/views",
      "title": "Hotwire first: Turbo Frames, Streams, and Stimulus for behaviour",
      "summary": "Rails 8 renders HTML and updates it over the wire; reach for Turbo Frames and Streams before adding a client-side framework.",
      "body": "The default Rails view layer is server-rendered HTML plus Hotwire. Most interactive requirements are solved without a JSON API or a build step.\n\n- Scope a partial update with a Turbo Frame: wrap the region, link or submit into it, and the response replaces just that frame. This covers inline edit, pagination, tabs, and modals.\n- Push updates from the server with Turbo Streams (append, prepend, replace, remove), including from a background job over Action Cable. This is how you get live updates without polling.\n- Add behaviour with a Stimulus controller attached to markup via data attributes. It survives Turbo navigation, which is exactly where ad hoc `DOMContentLoaded` scripts break.\n- Assets go through Propshaft with import maps (or a bundler only if you genuinely need one). Sprockets and a Node build pipeline are legacy for a new Rails 8 app.\n- Introduce a client-side framework only for genuinely stateful, offline-ish, or highly interactive surfaces, and keep it to that surface rather than the whole app.\n\nSee /app for the controller rules that these views call into."
    },
    {
      "kind": "memory",
      "nodePath": "/config",
      "title": "Credentials and the Kamal deploy path",
      "summary": "Secrets live in encrypted credentials or the environment, and deploys run through Kamal with Thruster in front of the app container.",
      "body": "Rails 8 generates a container-first deploy, and the parts fit together in a specific way.\n\n- Keep secrets in encrypted credentials (`rails credentials:edit`, per-environment files) or in environment variables injected at deploy. The master key never lands in the repo, and `config/master.key` stays gitignored.\n- Read configuration through `Rails.application.config` or credentials, not by scattering `ENV[...]` calls through the code. One place to see what an environment must provide.\n- Kamal deploys the app image to your own servers over SSH with zero-downtime container swaps; Thruster sits in front of Puma to handle TLS, HTTP/2, compression, and static file serving with X-Sendfile semantics.\n- Run migrations as part of the release, restart job workers after a deploy so they pick up new code, and keep the health check endpoint fast and dependency-free so a slow database does not fail the deploy.\n- Log in the container to stdout as structured lines, and let the platform ship them. Do not write log files inside an immutable image.\n\nSee the docker-containers and secrets-env-management patterns for the parts that are not Rails specific."
    },
    {
      "kind": "memory",
      "nodePath": "/db",
      "title": "Migrations that do not take the site down",
      "summary": "Schema changes are additive and multi-step, indexes are added concurrently, and destructive changes wait for a deploy that no longer needs the column.",
      "body": "A migration is a deploy against a live database. On a table with millions of rows, the wrong one holds a lock long enough to time out every request.\n\n- Add columns nullable, backfill in batches, then add the constraint. Adding a NOT NULL column with a default rewrites the table on older engines and still needs care on new ones.\n- Add and remove indexes concurrently on PostgreSQL (`add_index ..., algorithm: :concurrently`) and disable the wrapping transaction for that migration (`disable_ddl_transaction!`), because a concurrent index cannot run inside one.\n- Removing a column is a two-deploy operation: stop referencing it (and add it to `ignored_columns` so Active Record stops selecting it), ship, then drop it.\n- Backfill in a separate migration or a job with batching (`in_batches`), never in the schema migration itself, and make it re-runnable.\n- Keep `db/schema.rb` as the source of truth of the current schema and regenerate it rather than hand-editing; resolve conflicts by re-running migrations, not by merging the file.\n\nSee /app/models for the eager loading rule and the postgres-schema pattern for index and constraint design."
    }
  ]
};
