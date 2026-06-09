import type { Pattern } from "../types.js";

export const restApiDesign: Pattern = {
  "slug": "rest-api-design",
  "version": "1.0.0",
  "name": "REST / HTTP API Design",
  "tagline": "Design HTTP APIs that stay predictable, safe to retry, and easy to evolve.",
  "description": "A 2026 HTTP API design pattern for backend teams shipping REST endpoints. It standardizes resource naming and status codes, mandates RFC 9457 problem details for errors, cursor pagination for collections, idempotency keys for unsafe writes, and a deprecation discipline so versions retire cleanly instead of breaking clients.",
  "category": "Backend",
  "icon": "network",
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
  "metaTitle": "REST / HTTP API Design pattern for AI coding agents",
  "metaDescription": "Teach your AI coding agent modern HTTP API design: resource naming, correct status codes, RFC 9457 errors, cursor pagination, idempotency keys, and clean versioning.",
  "problem": "Agents ship inconsistent endpoints with ad-hoc error shapes, offset pagination, no retry safety, and breaking version changes that silently break clients.",
  "audience": "Backend and platform teams building or maintaining public and internal REST/HTTP APIs.",
  "prevents": [
    "Verb-in-path endpoints and 200 responses that hide failures behind a body field",
    "Bespoke per-endpoint error JSON instead of one machine-readable envelope",
    "Duplicate charges and double-creates when a client retries an unsafe POST"
  ],
  "appliesTo": {
    "paths": [
      "/src/api",
      "/src/routes",
      "/app/api"
    ],
    "stacks": [
      "nodejs",
      "typescript",
      "rest",
      "http",
      "openapi"
    ],
    "packages": [
      "express",
      "fastify",
      "zod",
      "@hono/hono",
      "openapi-typescript"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Resource naming and HTTP semantics",
      "summary": "Model nouns as resources, map verbs to HTTP methods, and return the status code that matches the outcome.",
      "body": "URLs name resources with plural nouns; the HTTP method carries the verb and the status code carries the result. Never tunnel an action through a path segment or hide a failure inside a 200 body.\n\n- Use plural noun collections (`/orders`, `/users/{id}/invoices`) and keep nesting at most two levels deep; never `POST /createOrder` or `/orders/get`.\n- Map methods correctly: `GET` reads (safe), `POST` creates, `PUT` replaces, `PATCH` partially updates, `DELETE` removes. `GET`, `PUT`, and `DELETE` must be idempotent.\n- Return the precise status: `201` with a `Location` header on create, `200` on read/update, `204` on a body-less delete, `400`/`422` for invalid input, `401`/`403` for auth, `404` for missing, `409` for conflicts, `429` when rate limited.\n- Never return `200` with `{ \"success\": false }`; let the status line signal failure so clients and proxies can react without parsing the body.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Idempotency keys on unsafe writes",
      "summary": "Every non-idempotent mutation accepts an Idempotency-Key header and deduplicates safely on retry.",
      "body": "Networks drop responses, so clients retry; without deduplication a retried `POST` charges twice or creates duplicate rows. Make unsafe writes safe to retry with a client-supplied key.\n\n- Accept an `Idempotency-Key` request header on every `POST` (and any non-idempotent endpoint) that creates resources, money movement, or external side effects.\n- Persist the key with the request fingerprint and the stored response; a replay with the same key returns the original result without re-executing the operation.\n- Scope keys per endpoint and per authenticated principal, set a retention TTL (commonly 24 hours), and return `409` if the same key arrives with a different request body.\n- While the first request is still in flight, return `409` (or `425 Too Early`) for a concurrent replay rather than running the operation twice.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Error envelope: RFC 9457 problem details",
      "summary": "How every error response is shaped so clients get one consistent, machine-readable contract.",
      "body": "Every error returns an RFC 9457 problem document (the successor to RFC 7807), served as `application/problem+json`. One envelope across the whole API means clients write error handling once.\n\n- Always include `type` (a stable URI identifying the problem class), `title`, and `status`; add `detail` for a human-readable specific message and `instance` for the affected resource.\n- Make `type` a real, documented URI per problem class (for example `https://api.example.com/problems/insufficient-funds`); reuse it so clients can branch on it instead of parsing prose.\n- Add custom extension members for machine use (`errors` array for field-level validation, `traceId` for correlation, `balance` for domain context); never repurpose the standard members.\n- Keep `status` in the body equal to the HTTP status line, and never leak stack traces or internal identifiers into `detail`."
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Collection pagination and list contracts",
      "summary": "We use opaque cursor pagination with consistent parameters and a clear last-page signal.",
      "body": "Collections are paginated with cursor (keyset) pagination, the pattern used by Stripe, GitHub, and Slack. Offset/`OFFSET` paging drifts when rows are inserted or deleted and degrades as the database counts and skips rows at scale.\n\n- Accept `limit` plus an opaque `cursor` (or `after`/`before`); the cursor encodes the sort key and id of the last item so clients cannot tamper with or reverse-engineer it.\n- Enforce a default and a hard maximum page size (for example default `20`, max `100`); clamp oversized `limit` values instead of honoring `limit=1000000`.\n- Return a stable envelope: a `data` array plus a `next_cursor` (null on the last page) or a `has_more` boolean; never make clients guess where the list ends.\n- Sort on a deterministic, indexed tiebreaker (such as `created_at`, `id`) so the cursor maps to a single position and page boundaries stay consistent."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "rest-api-design-review",
      "summary": "Pre-merge checklist for any new or changed HTTP endpoint covering naming, status codes, errors, pagination, idempotency, and versioning.",
      "body": "---\nname: rest-api-design-review\ndescription: Run this checklist before merging any new or changed HTTP/REST endpoint. Covers resource naming, HTTP method and status semantics, RFC 9457 error envelopes, cursor pagination, idempotency keys, and deprecation discipline.\n---\n\n# REST / HTTP API design review\n\n- [ ] Paths name resources with plural nouns and nest at most two levels; no verbs in the path.\n- [ ] HTTP method matches intent and `GET`/`PUT`/`DELETE` are idempotent; safe methods cause no side effects.\n- [ ] Status codes are precise: `201`+`Location` on create, `204` on empty delete, `400`/`422`, `401`/`403`, `404`, `409`, `429`; no `200` wrapping a failure.\n- [ ] All errors return an RFC 9457 `application/problem+json` document with `type`, `title`, `status`, and a documented stable `type` URI.\n- [ ] Field-level validation errors and a `traceId` are carried as problem-detail extension members, with no stack traces leaked.\n- [ ] Collection endpoints use opaque cursor pagination with `limit`, a clamped max page size, and a `next_cursor`/`has_more` last-page signal.\n- [ ] Unsafe `POST` mutations accept an `Idempotency-Key` and return the stored result on replay instead of re-executing.\n- [ ] Breaking changes ship under a new version; the old version sends `Deprecation` and `Sunset` headers (RFC 9745 / RFC 8594).\n- [ ] Retired versions return `410 Gone` after the sunset date, not `404` or `500`, and a migration guide is linked.\n- [ ] The endpoint is documented in the OpenAPI spec with request/response schemas and example error payloads.\n",
      "skillTags": [
        "rest",
        "http",
        "api-design",
        "backend",
        "review"
      ]
    }
  ]
};
