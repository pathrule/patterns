import type { Pattern } from "../types.js";

export const googleCloudRun: Pattern = {
  "slug": "google-cloud-run",
  "version": "1.0.0",
  "name": "Google Cloud Run",
  "tagline": "Design Cloud Run around container concurrency, request lifetime, identity, scaling, and revisions.",
  "description": "Cloud Run runs stateless containers behind managed request routing, but each instance may handle concurrent requests, scale to zero, start from a fresh filesystem, and terminate after a bounded lifecycle while revisions can split traffic. This pattern constrains request-scoped state and background work while recording concurrency, scaling, identity, and revision ownership decisions and providing a rollout verification procedure. It differs from Lambda and Vercel by focusing on container revisions, per-instance concurrency, request-bound CPU and lifecycle, service identity, and managed traffic splitting.",
  "category": "Infra",
  "icon": "cloudy",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Google Cloud Run pattern for AI coding agents",
  "metaDescription": "Google Cloud Run container concurrency, request lifetime, scaling, service identity, secrets, revision traffic, jobs, health, and deployment checks.",
  "problem": "AI agents often keep mutable request state globally, start work after returning a response, rely on the writable filesystem for durability, or scale instances beyond database capacity.",
  "audience": "Platform teams operating containerized HTTP services and jobs on Google Cloud Run",
  "prevents": [
    "Leaking one request's state into another concurrent request",
    "Losing background work after the response completes",
    "Treating ephemeral filesystem data as durable",
    "Overwhelming dependencies as instances and concurrency multiply"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/infra/cloud-run",
      "/ops/runbooks"
    ],
    "stacks": [
      "google-cloud-run",
      "gcp",
      "containers",
      "serverless",
      "cloud"
    ],
    "packages": [
      "@google-cloud/run"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Keep request state local and shared clients concurrency-safe",
      "summary": "Assume several requests can execute in one container and make every mutable global cache bounded, keyed, and safe for concurrent use.",
      "body": "A container instance can serve more than one request at a time. Module globals and singleton objects therefore persist across users and can be read or mutated concurrently.\n\n- Store actor, tenant, locale, payload, and transaction state in request-local values or explicit context.\n- Reuse network clients only when their libraries support concurrent use and their connection pools fit maximum instance concurrency.\n- Do not cache authorization decisions or user data globally without identity keys, expiry, invalidation, and memory bounds.\n- Load-test the configured concurrency with realistic CPU, memory, database, and outbound-call behavior before increasing it.\n\nSee /infra/cloud-run for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Finish required work before the request ends or move it to a durable job",
      "summary": "Do not rely on detached background tasks after returning a response; enqueue durable work or use a Cloud Run job for bounded batch execution.",
      "body": "The platform owns instance lifetime and request-linked resource allocation. Work started after the response can be paused or terminated without completion evidence.\n\n- Await work required for the response and honor request cancellation and deadline through downstream calls.\n- For asynchronous effects, write a durable command or outbox before returning and process it through a retryable service or queue.\n- Use Cloud Run jobs for finite batch work with explicit input, idempotency, completion, and retry semantics rather than inventing a never-ending HTTP process.\n- Keep temporary files within instance limits and copy durable results to an external store before reporting success.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/infra/cloud-run",
      "title": "Concurrency and instance count form one dependency budget",
      "summary": "Choose per-instance concurrency, minimum and maximum instances, and client pools together from measured service and downstream capacity.",
      "body": "A service configured for many concurrent requests per instance may use fewer containers but more simultaneous database or API operations in each process. Maximum instances multiplies that demand.\n\n- Measure CPU, memory, latency, connection use, and blocking behavior across increasing per-instance concurrency.\n- Multiply the chosen concurrency and client pool limits by maximum instances and deployment overlap against downstream capacity.\n- Use minimum instances only for justified latency or availability goals and include their steady cost in the service decision.\n- Cap maximum instances where databases, third-party APIs, subnet connectors, or quotas are the binding constraint and apply application backpressure too.\n\nSee /src for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/infra/cloud-run",
      "title": "A revision is immutable configuration plus image",
      "summary": "Deploy image digest, command, resources, concurrency, timeout, identity, network, secrets, and environment as one reviewable revision.",
      "body": "Changing configuration creates behavior as surely as changing code. Mutable image tags or console edits make rollback and traffic comparison unreliable.\n\n- Reference an immutable image and preserve source revision, build provenance, and schema compatibility with the release.\n- Version CPU, memory, concurrency, timeout, execution environment, service account, ingress, egress, environment, and secret references in infrastructure code.\n- Grant the runtime service account only application permissions and keep deployer permissions outside the container.\n- Compare live revision configuration and image identity with the intended release before moving all traffic.\n\nSee /ops/runbooks for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-cloud-run-revision",
      "summary": "Test a Cloud Run revision under concurrency, cold start, termination, dependency failure, traffic split, and rollback.",
      "body": "---\nname: verify-cloud-run-revision\ndescription: Deploy or revise a Google Cloud Run service safely.\n---\n\n# Verify Cloud Run Revision\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Resolve the immutable image and effective revision configuration, including identity, ingress, egress, secrets, resources, concurrency, timeout, and scaling.\n2. Send a small traffic share and verify cold start, readiness, authentication, required network access, denied permissions, and structured logs.\n3. Load the revision to configured concurrency while watching latency, CPU, memory, instances, database pools, outbound limits, and request cancellations.\n4. Terminate instances and fail dependencies during requests and queued work; confirm required effects are durable and temporary filesystem loss is harmless.\n5. Increase traffic only while acceptance signals hold, and route back to the prior revision immediately if errors, latency, or capacity regress.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "cloud-run",
        "gcp",
        "containers",
        "deployment",
        "verification"
      ]
    }
  ]
};
