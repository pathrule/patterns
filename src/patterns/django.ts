import type { Pattern } from "../types.js";

export const django: Pattern = {
  "slug": "django",
  "version": "1.0.0",
  "name": "Django",
  "tagline": "Write Django apps with a query-efficient ORM, safe settings, and async views that do not block.",
  "description": "An opinionated bundle for Django on the 6.x line, where 6.1 is current and 5.2 is the LTS most teams run in production. It targets the three places Django projects actually break: N+1 queries that pass every test and fall over under load, settings and secrets that leak because DEBUG and ALLOWED_HOSTS were never split per environment, and async views that call the sync ORM and raise SynchronousOnlyOperation. Where the fastapi pattern covers pure Python APIs, this one covers the full framework: models, migrations, templates, and the settings module.",
  "category": "Framework",
  "icon": "server-cog",
  "color": "bg-green-500/10 text-green-600 dark:bg-green-400/15 dark:text-green-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Django ORM and async pattern for AI agents",
  "metaDescription": "Django pattern for AI coding agents: kill N+1 queries with select_related, keep settings and secrets per environment, and write async views the ORM allows.",
  "problem": "AI agents write Django views that loop over related objects and fire hundreds of queries, hardcode settings that belong in the environment, and put sync ORM calls inside async views.",
  "audience": "Python teams running Django 5.2 LTS or 6.x in production",
  "prevents": [
    "Iterating a queryset and touching related objects, firing one query per row",
    "Leaving DEBUG True or a literal SECRET_KEY in a settings file that ships",
    "Calling the sync ORM inside an async view and raising SynchronousOnlyOperation",
    "Writing a migration that locks a large table or cannot be rolled back"
  ],
  "appliesTo": {
    "paths": [
      "/apps",
      "/config",
      "/tests"
    ],
    "stacks": [
      "django",
      "python",
      "orm",
      "asgi",
      "postgres"
    ],
    "packages": [
      "django",
      "djangorestframework",
      "psycopg",
      "celery"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/apps",
      "title": "Fetch related data explicitly; never let a loop generate queries",
      "summary": "Every queryset that touches related objects must declare select_related or prefetch_related, and aggregates belong in the database.",
      "body": "Django's lazy relations are the single most common performance bug in the framework: the code reads fine, the tests pass on ten rows, and production fires one query per row.\n\n- Declare traversal up front: `select_related` for forward `ForeignKey` and `OneToOneField`, `prefetch_related` for reverse and `ManyToManyField`. If a template or serializer walks a relation, the queryset that feeds it must already include it.\n- Count and sum in the database with `Count`, `Sum`, and `annotate`, not by loading rows into Python. `len(qs)` loads every row; `qs.count()` does not.\n- Narrow the columns you actually read with `only()` or `values()`, and stream large result sets with `.iterator()` so a single request does not hold the whole table in memory.\n- Never issue queries inside a loop or a template tag. If you need per-row data, build a dict keyed by id in one query and look it up.\n- When you must drop to SQL, use `raw()` with parameters or `django.db.connection` with placeholders. String-formatted SQL and `.extra()` are injection surfaces.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/config",
      "title": "Split settings per environment and read every secret from the environment",
      "summary": "DEBUG, SECRET_KEY, ALLOWED_HOSTS, and database credentials come from the environment, and production sets the security headers explicitly.",
      "body": "Django's default settings module is built for a first run on localhost, not for production. Shipping it unchanged is how a project ends up with `DEBUG = True` in front of real users, which prints stack traces and settings to anyone who triggers an error.\n\n- Keep a base settings module plus per-environment overrides (or one module driven entirely by environment variables). Nothing environment-specific is committed.\n- Read `SECRET_KEY`, database URL, and every third-party credential from the environment and fail loudly at startup when one is missing. A default value for a secret is a production incident waiting for a deploy.\n- Set `DEBUG = False` and a real `ALLOWED_HOSTS` list in production, and turn on `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE`, and `CSRF_COOKIE_SECURE`.\n- Run `python manage.py check --deploy` in CI and treat its warnings as failures.\n\nSee the secrets-env-management pattern for how the values are stored and rotated.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/apps",
      "title": "Keep migrations reversible and non-blocking",
      "summary": "Schema and data changes ship as separate migrations, columns arrive nullable before they are populated, and every RunPython has a reverse.",
      "body": "A migration that works on an empty dev database can hold an exclusive lock on a large production table for minutes. Treat migrations as deploys of their own.\n\n- Split schema changes from data backfills. A schema migration should be fast and lock-light; a backfill runs in batches and can be re-run.\n- Add columns as nullable (or with no default that requires a table rewrite), deploy the code that writes them, backfill, then add the constraint. Never do all four in one migration.\n- Give every `RunPython` a `reverse_code` (or `migrations.RunPython.noop`) so the migration is reversible, and never import models directly; use `apps.get_model` inside the function.\n- Do not edit a migration that has already run in any shared environment. Add a new one.\n- Review generated migrations before committing them; `makemigrations` will happily drop and recreate a column when a field is renamed.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/apps",
      "title": "Async views and the ORM: what is safe to await",
      "summary": "Async views run under ASGI and must use the ORM's async API; a sync query inside an async view raises SynchronousOnlyOperation.",
      "body": "Django's async story is real but partial, and the boundary is where projects get hurt. The rule of thumb: an `async def` view may only touch the ORM through its async API.\n\n- The ORM exposes async variants (`aget`, `acreate`, `asave`, `adelete`, `afirst`, `acount`, `aupdate_or_create`) and supports `async for` over a queryset. A plain sync call inside an async context raises `SynchronousOnlyOperation`.\n- Evaluation is still where the query happens. `qs.filter(...)` builds; `async for` or an `a`-prefixed method executes.\n- Wrap unavoidable sync work (a third-party library, a sync-only ORM path) in `sync_to_async(..., thread_sensitive=True)` rather than calling it directly.\n- Async only pays off when the view actually waits on I/O it can overlap: several outbound HTTP calls, a slow external API, streaming. A single query per request is faster in a plain sync view.\n- Async views need an ASGI server (uvicorn, daphne, hypercorn) in front. Under WSGI they are run in a thread and you get the complexity without the benefit.\n\nSee /apps for the query rule and /config for the settings rule."
    },
    {
      "kind": "memory",
      "nodePath": "/apps",
      "title": "Where logic lives: fat models, thin views, explicit services",
      "summary": "Query logic belongs in managers and querysets, multi-model workflows in a service function, and views stay request-and-response only.",
      "body": "Django gives you many places to put behaviour, and the difference between a maintainable project and a pile of views is choosing deliberately.\n\n- Row-level behaviour goes on the model. Reusable query logic goes on a custom `Manager` or `QuerySet` so it composes (`Order.objects.paid().recent()`) instead of being copy-pasted into views.\n- A workflow that spans several models, sends mail, or calls a third party goes in a plain service function under the app, called by the view. It is testable without a request and reusable from a management command or a task.\n- Views translate a request into a call and a response. If a view is longer than a screen, the logic belongs elsewhere.\n- Use signals sparingly and never for business rules. `post_save` side effects are invisible at the call site and fire in tests, fixtures, and bulk operations you did not think about. Call the service explicitly.\n- Bulk paths (`bulk_create`, `bulk_update`, `queryset.update()`) skip `save()` and signals by design. If a rule must always hold, enforce it in the database or in the service, not in `save()`.\n\nSee /apps for the migration rule; the rest-api-design pattern covers the HTTP surface when you add DRF."
    },
    {
      "kind": "memory",
      "nodePath": "/tests",
      "title": "Test setup that stays fast as the suite grows",
      "summary": "Build objects with factories instead of fixtures, reuse the test database, and assert query counts on the endpoints that matter.",
      "body": "Django's test tooling is fast if you let it be, and a slow suite is the reason teams stop running it.\n\n- Prefer factories (`factory_boy`) over JSON fixtures. Fixtures rot silently as the schema changes and force every test to carry rows it does not use.\n- Reuse the test database between runs (`--reuse-db` with pytest-django, `--keepdb` with the Django runner) and only rebuild when migrations change.\n- Use `pytest.mark.django_db` (or `TestCase`) so each test runs in a transaction that rolls back. Reach for `TransactionTestCase` only when you genuinely test commit behaviour, because it truncates tables and is much slower.\n- Guard the N+1 rule with `assertNumQueries` (or `django_assert_num_queries`) on your highest-traffic endpoints. It is the only test that fails when someone removes a `select_related`.\n- Test at the boundary you care about: services with plain function calls, views through the test client, and templates only where rendering logic is real.\n\nSee /apps for the query rule this suite protects."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "django-query-review",
      "summary": "Pre-merge checklist for any Django change that adds a view, serializer, template, or migration.",
      "body": "---\nname: django-query-review\ndescription: Django review checklist for query efficiency, settings safety, async correctness, and migration risk. Run before merging any change that adds a view, serializer, template, or migration.\n---\n\n# Django review\n\n## Queries\n- [ ] Every relation a view, serializer, or template touches is in `select_related` or `prefetch_related`.\n- [ ] No query inside a loop, template tag, or property called per row.\n- [ ] Counts and aggregates run in the database (`count()`, `annotate`, `Sum`), not in Python.\n- [ ] Large reads use `only()`/`values()` and `.iterator()` where the result set is unbounded.\n- [ ] Any raw SQL is parameterized; no f-strings, no `.extra()`.\n- [ ] A high-traffic endpoint has an `assertNumQueries` guard.\n\n## Settings and security\n- [ ] No new setting hardcodes an environment value or a secret.\n- [ ] `manage.py check --deploy` still passes.\n- [ ] User input reaches the database through a form or serializer, not straight from `request`.\n\n## Async\n- [ ] `async def` views use only the ORM's async API (`aget`, `async for`, ...).\n- [ ] Sync-only calls are wrapped in `sync_to_async(thread_sensitive=True)`.\n- [ ] The view actually overlaps I/O; otherwise it is a sync view.\n\n## Migrations\n- [ ] Schema change and data backfill are separate migrations.\n- [ ] New columns land nullable, are backfilled, then constrained.\n- [ ] Every `RunPython` has a reverse and uses `apps.get_model`.\n- [ ] No already-applied migration was edited.\n",
      "skillTags": [
        "django",
        "python",
        "orm",
        "code-review",
        "migrations"
      ]
    }
  ]
};
