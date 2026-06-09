import type { Pattern } from "../types.js";

export const fastapi: Pattern = {
  "slug": "fastapi",
  "version": "1.0.0",
  "name": "FastAPI (Python)",
  "tagline": "Build type-safe async Python APIs with Pydantic validation and dependency injection.",
  "description": "An opinionated baseline for shipping FastAPI services on Python 3.12+. It keeps request and response bodies behind Pydantic v2 models, runs I/O routes as async without blocking the event loop, wires auth, database sessions, and configuration through dependency injection instead of globals, and manages schema changes with forward-only Alembic migrations. These are the conventions that keep a FastAPI app fast, typed, and testable as it grows past the tutorial.",
  "category": "Backend",
  "icon": "rocket",
  "color": "bg-teal-500/10 text-teal-600 dark:bg-teal-400/15 dark:text-teal-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "FastAPI (Python) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for FastAPI on Python 3.12+: Pydantic v2 request/response models, non-blocking async routes, dependency injection for auth and DB sessions, and forward-only Alembic migrations, tuned for AI coding agents.",
  "problem": "AI agents writing FastAPI accept untyped dict bodies, run blocking calls inside async routes, reach for module globals instead of dependencies, and edit the schema without a migration.",
  "audience": "Python teams building and maintaining FastAPI services",
  "prevents": [
    "Accepting untyped dict request bodies with no Pydantic validation",
    "Calling blocking sync DB or HTTP clients inside an async def route",
    "Using module-level globals for the DB session or current user instead of Depends",
    "Changing the database schema without an Alembic migration"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/app/routers",
      "/app/schemas"
    ],
    "stacks": [
      "python",
      "fastapi",
      "pydantic",
      "sqlalchemy"
    ],
    "packages": [
      "fastapi",
      "pydantic",
      "pydantic-settings",
      "sqlalchemy",
      "alembic",
      "uvicorn"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app/schemas",
      "title": "Type every request and response with a Pydantic model",
      "summary": "Declare Pydantic models for request bodies and use response_model on every route; never accept or return a raw dict.",
      "body": "FastAPI's validation, serialization, and OpenAPI docs all flow from type hints. An untyped `dict` body opts out of all three and ships unvalidated input straight into your code.\n\n- Type every request body, query, and path parameter. Use a Pydantic `BaseModel` for bodies; never declare a parameter as a bare `dict` or `Any`.\n- Set `response_model=` (or a typed return annotation) on each route so output is validated and filtered. This is also what stops an ORM object from leaking password hashes or internal fields into the response.\n- Keep separate models for input and output (e.g. `UserCreate` vs `UserRead`); do not reuse one model that both accepts a password and returns the row.\n- Use Pydantic v2 idioms: `model_config = ConfigDict(from_attributes=True)` to read from ORM objects, `Field(...)` for constraints and examples. Validate at the boundary so the rest of the handler works with trusted, typed data.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app/routers",
      "title": "Do not block the event loop in async routes",
      "summary": "Inside async def, only await non-blocking I/O; run blocking/CPU work in a threadpool or use a def route so FastAPI offloads it.",
      "body": "An `async def` route runs on the event loop. One blocking call inside it freezes every concurrent request on that worker, turning a fast server into a slow one under load.\n\n- In an `async def` route, only `await` async-native I/O (async DB driver, `httpx.AsyncClient`, async cache client). Never call a synchronous, blocking client (`requests`, a sync DB cursor, `time.sleep`) directly inside it.\n- If a dependency is only available as blocking code, either define the route as a plain `def` (FastAPI runs it in a threadpool automatically) or offload the blocking call with `anyio.to_thread.run_sync` / `run_in_executor`.\n- Do CPU-bound work (image processing, heavy parsing) off the event loop - a threadpool for the GIL-friendly cases, a process pool or a background worker/queue for the rest. Do not grind CPU inside an async route.\n- Be consistent: an async route calling a sync function calling async code is where event-loop bugs hide. Pick async or sync per route and keep the chain coherent.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Inject dependencies with Depends; no module globals for request state",
      "summary": "Provide DB sessions, the current user, and settings through Depends; never reach for a module-level global mutated per request.",
      "body": "FastAPI's dependency injection is how request-scoped state stays correct and testable. A module global shared across requests is a race condition and an untestable seam.\n\n- Provide the database session, the authenticated user, pagination, and config as dependencies (`db: Session = Depends(get_db)`, `user: User = Depends(get_current_user)`). Do not store the session or current user in a module-level variable.\n- Make the session dependency yield-based so setup and teardown (commit/rollback/close) are guaranteed per request: `def get_db(): db = SessionLocal(); try: yield db; finally: db.close()`.\n- Compose dependencies for cross-cutting concerns (auth, role checks, rate limits) and attach them at the router level with `dependencies=[Depends(...)]` when every route needs them.\n- Override dependencies in tests with `app.dependency_overrides` to inject a test DB or a fake user. This only works if state actually flows through `Depends`, which is the point.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Change the schema only through forward-only Alembic migrations",
      "summary": "Every schema change ships as a reviewed Alembic migration; never autocreate tables in production or edit the DB by hand.",
      "body": "The database schema is shared state across every deploy and environment. An untracked change is a deploy that works on one machine and breaks on the next.\n\n- Generate a migration for every model change with `alembic revision --autogenerate`, then read and edit it. Autogenerate misses some changes (type tweaks, server defaults, constraints, enums); never ship the generated file unread.\n- Do not rely on `Base.metadata.create_all()` in production. It is fine for a test fixture; it does not evolve an existing schema and will silently drift from your migrations.\n- Write migrations forward-only and deploy-safe: add columns nullable or with a default, backfill, then enforce constraints in a later migration. Avoid a single migration that locks a large table for the whole deploy.\n- Commit migrations with the code change that needs them, run them as a gated step before the new code serves traffic, and keep one linear history (resolve multiple heads before merging).",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Project layout and app wiring",
      "summary": "Canonical FastAPI structure - routers, schemas, services, deps - and a lifespan-based app bootstrap.",
      "body": "We keep a FastAPI service organized by responsibility so routes stay thin and logic stays testable.\n\n- Layout: `app/main.py` (create the app, include routers), `app/routers/` (one `APIRouter` per resource), `app/schemas/` (Pydantic models), `app/models/` (ORM models), `app/services/` (business logic), `app/deps.py` (shared dependencies), `app/core/` (settings, security).\n- Routes stay thin: validate via the schema, delegate to a service function, return a typed response. Business logic and DB queries live in services, not in the route handler.\n- Mount feature routers with `app.include_router(router, prefix='/users', tags=['users'])`; group related endpoints under one `APIRouter` with shared dependencies.\n- Use the `lifespan` async context manager for startup/shutdown (DB pool, clients) rather than the deprecated `@app.on_event` hooks. Acquire resources on enter, release on exit.\n- Run with `uvicorn` (one worker per process; scale with multiple workers behind a process manager or `gunicorn -k uvicorn.workers.UvicornWorker`).\n\nSee /app for the settings memory and the Pydantic, async, and DI rules."
    },
    {
      "kind": "memory",
      "nodePath": "/app/core",
      "title": "Configuration via pydantic-settings",
      "summary": "Load all config from environment through a typed pydantic-settings model; never read os.environ scattered across the code.",
      "body": "Configuration is typed and centralized, not `os.environ.get` calls sprinkled through the codebase.\n\n- Define a `Settings(BaseSettings)` model with `pydantic-settings`, typing each field (`database_url: str`, `jwt_secret: str`, `debug: bool = False`). It loads from environment variables and a `.env` file and validates types at startup.\n- Provide settings as a cached dependency (`@lru_cache` on a `get_settings()` factory, exposed via `Depends`) so the app reads and validates config once and tests can override it.\n- Keep secrets out of the repo: `.env` is git-ignored and injected at runtime per environment. A missing required setting should fail fast at startup, not at the first request that needs it.\n- Read config only through the settings object, never `os.environ` directly in handlers or services, so every configurable value is discoverable in one typed place.\n\nSee /app for the project layout memory; see the secrets-env-management pattern for rotation and injection."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "fastapi-endpoint-checklist",
      "summary": "Checklist for adding or changing a FastAPI endpoint: schemas, async, dependencies, status codes, and migrations.",
      "body": "---\nname: fastapi-endpoint-checklist\ndescription: Checklist for adding or changing a FastAPI endpoint. Run before merging any router, schema, dependency, or model change.\n---\n\n# FastAPI endpoint checklist\n\n- [ ] Request body/query/path params are typed; bodies use a Pydantic model - no bare `dict`/`Any`.\n- [ ] `response_model` (or typed return) is set; input and output models are separate so internal fields don't leak.\n- [ ] Route is `async def` only if it awaits non-blocking I/O; any blocking/CPU work runs in a threadpool, a `def` route, or a worker.\n- [ ] DB session and current user come through `Depends`; the session dependency is yield-based with commit/rollback/close.\n- [ ] Auth/role checks attached as router or route dependencies; handler authorizes the specific action.\n- [ ] Correct status codes (`201` on create, `204` on delete) and `HTTPException` for expected failures with a consistent error shape.\n- [ ] Logic lives in a service function; the route stays thin (validate → delegate → return).\n- [ ] Schema changes ship as a reviewed Alembic migration (autogenerate then read/edit); no `create_all` in prod; one linear migration history.\n- [ ] Config is read from the pydantic-settings object, not `os.environ` inline.\n- [ ] Tests override dependencies via `app.dependency_overrides` (test DB / fake user).\n",
      "skillTags": [
        "fastapi",
        "python",
        "pydantic",
        "async",
        "alembic",
        "api-review"
      ]
    }
  ]
};
