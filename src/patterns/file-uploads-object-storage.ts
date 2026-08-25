import type { Pattern } from "../types.js";

export const fileUploadsObjectStorage: Pattern = {
  "slug": "file-uploads-object-storage",
  "version": "1.0.0",
  "name": "File Uploads and Object Storage",
  "tagline": "Treat uploads as untrusted objects with bounded transfer, quarantine, validation, and authorized delivery.",
  "description": "File uploads and object storage form an asynchronous trust boundary spanning authorization, transfer, validation, malware scanning, metadata, lifecycle, and download delivery. This bundle defines bounded upload intents, opaque keys, quarantine and publish states, safe content handling, and cleanup. Unlike REST API Design, it owns blob security and lifecycle rather than the general shape and semantics of HTTP resources.",
  "category": "Backend",
  "icon": "cloud-upload",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "File uploads object storage for AI agents",
  "metaDescription": "Authorized upload intents, bounded direct transfer, opaque object keys, quarantine, content validation, malware scanning, safe delivery, and lifecycle cleanup.",
  "problem": "Agents trust filenames and MIME headers, publish objects before scanning, put user names into storage keys, or issue broad presigned URLs with no ownership or lifecycle state.",
  "audience": "Backend teams accepting user files into cloud or self-hosted object storage",
  "prevents": [
    "Executable or deceptive content published from client-declared metadata",
    "Cross-tenant overwrite or download through predictable object keys",
    "Abandoned multipart uploads and quarantined objects retained forever"
  ],
  "appliesTo": {
    "paths": [
      "/src/uploads",
      "/src/api",
      "/src/jobs"
    ],
    "stacks": [
      "file-uploads",
      "object-storage",
      "s3",
      "backend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Create a bounded upload intent before transfer",
      "summary": "The server authorizes owner, purpose, size, content class, object key, operation, and expiry before any client writes bytes.",
      "body": "The server authorizes owner, purpose, size, content class, object key, operation, and expiry before any client writes bytes. A broad presigned request or shared storage credential lets clients choose arbitrary keys, overwrite objects, exceed quotas, or upload a type the product never intended to process. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Generate an opaque server-owned object key that includes no filename, email, tenant secret, or trusted path fragment from the client.\n- Bind the upload authorization to one tenant, subject, purpose, object key, method, maximum size, allowed content class, and short expiry.\n- Reserve quota and an upload record before transfer, then release it when the intent expires or validation fails.\n- Use multipart upload only through a tracked session with bounded part count, total size, completion, abort, and cleanup behavior.\n\nVerification: Attempt key changes, method changes, oversized bodies, expired intents, cross-tenant reuse, duplicate completion, and abandoned multipart sessions; confirm storage and quota remain correct.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/uploads",
      "title": "Quarantine bytes until independent validation completes",
      "summary": "New objects remain unavailable to users and processors until server-side type, structure, policy, and malware checks pass.",
      "body": "New objects remain unavailable to users and processors until server-side type, structure, policy, and malware checks pass. Filename extensions, Content-Type headers, and browser previews are attacker-controlled hints and cannot establish that content is safe to serve or parse. Enforce this boundary in /src/uploads so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Read the stored bytes from quarantine and validate signature, parseability, declared class, size, decompression limits, and product-specific structure.\n- Run malware or content-disarm controls appropriate to the allowed type without sending sensitive files to an unapproved external scanner.\n- Process risky formats in an isolated, resource-bounded worker with no ambient credentials or unnecessary network access.\n- Publish by changing durable application state or copying to a delivery boundary only after every required check succeeds.\n\nVerification: Upload polyglots, mismatched extensions and signatures, malformed archives, decompression bombs, scanner timeout, and clean fixtures; confirm only clean objects become addressable.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Authorize every download and serve safe content metadata",
      "summary": "Object possession and object-store URLs never replace application authorization, response isolation, and content disposition policy.",
      "body": "Object possession and object-store URLs never replace application authorization, response isolation, and content disposition policy. A predictable key or leaked long-lived URL can bypass tenant access, while active content rendered inline can execute in the application's trusted origin. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Resolve the object through application metadata, authorize the current principal and tenant, then issue a narrow short-lived download or stream it through the service.\n- Set a server-controlled safe filename and Content-Disposition according to whether the type may render inline.\n- Serve user-controlled active content from an isolated origin with restrictive headers rather than the application's authenticated origin.\n- Log access with object and subject identifiers without placing secret URLs or personal filenames in routine telemetry.\n\nVerification: Try cross-tenant IDs, guessed keys, revoked ownership, expired links, header injection filenames, and active HTML or SVG; confirm denial and origin isolation.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/uploads",
      "title": "An upload is a two-phase resource",
      "summary": "Object storage can contain bytes before the application has validated, accepted, or made them visible, so existence is not completion.",
      "body": "Object storage can contain bytes before the application has validated, accepted, or made them visible, so existence is not completion. Track intent-created, transferring, uploaded, validating, ready, rejected, expired, and deleted states with idempotent transitions.\n\nKeep object events as evidence that may trigger validation, not proof that the intended principal completed the intended upload. Reconcile records and storage when events are missing, duplicated, or reordered. Expose only ready objects to product queries and schedule cleanup for every terminal non-ready state. Keep the decision explicit at /src/uploads; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/jobs for reconciliation and scanning and /src/api for download authorization. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-file-upload-pipeline",
      "summary": "Test file uploads across authorization, transfer, validation, scanning, publication, delivery, and cleanup failure paths.",
      "body": "---\nname: test-file-upload-pipeline\ndescription: Test file uploads across authorization, transfer, validation, scanning, publication, delivery, and cleanup failure paths.\n---\n\n# Test File Upload Pipeline\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Create clean, malformed, oversized, mislabeled, polyglot, active-content, archive-bomb, malware-test, duplicate-name, and zero-byte fixtures for every allowed class.\n2. Attempt cross-tenant keys, expired and replayed intents, changed methods, multipart abuse, concurrent completion, and quota races through the real storage integration.\n3. Inject storage, event, parser, scanner, worker, database, and publish failures before and after each durable transition, then replay events and jobs.\n4. Verify only ready objects are downloadable, active content is isolated, rejected and abandoned bytes expire, quotas reconcile, and audit events reveal no secret URL or personal filename.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "file-upload",
        "object-storage",
        "security",
        "testing"
      ]
    }
  ]
};
