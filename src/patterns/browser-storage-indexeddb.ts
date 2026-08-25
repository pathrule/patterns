import type { Pattern } from "../types.js";

export const browserStorageIndexeddb: Pattern = {
  "slug": "browser-storage-indexeddb",
  "version": "1.0.0",
  "name": "Browser Storage and IndexedDB",
  "tagline": "Own browser persistence schemas, quotas, migrations, cross-tab coordination, privacy, and recovery.",
  "description": "Browser storage is durable enough to become product state but not durable enough to be a database of record: users clear it, quotas vary, private modes differ, transactions abort, tabs race, and old application versions can open the same origin data. This pattern constrains sensitive data and transaction ownership while recording schema migration, cache authority, quota, and cross-tab decisions. It complements client-state management by focusing on persistence and multi-context lifecycle; state libraries decide how UI state changes, while this pattern decides what can survive browser and application restarts.",
  "category": "Frontend",
  "icon": "archive",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "IndexedDB storage pattern for AI coding agents",
  "metaDescription": "IndexedDB schema, transactions, migrations, quota handling, cross-tab coordination, cache authority, privacy cleanup, and corruption recovery. In production.",
  "problem": "AI agents often store secrets in local storage, perform asynchronous work that lets an IndexedDB transaction close, rewrite all data during upgrade, or let two tabs race the same queue.",
  "audience": "Frontend teams persisting offline data, drafts, caches, queues, or large client-side records",
  "prevents": [
    "Persisting bearer secrets where injected scripts can read them",
    "Losing writes because a transaction became inactive",
    "Blocking application startup on an unsafe migration",
    "Processing the same local operation from multiple tabs"
  ],
  "appliesTo": {
    "paths": [
      "/src/storage",
      "/src/offline",
      "/tests/storage"
    ],
    "stacks": [
      "indexeddb",
      "browser-storage",
      "offline-first",
      "frontend",
      "web"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/storage",
      "title": "Keep IndexedDB transactions synchronous in ownership",
      "summary": "Create requests and dependent writes within the active transaction and move unrelated asynchronous work before or after it.",
      "body": "IndexedDB transactions can become inactive when control returns without a pending request. Awaiting network calls, timers, or unrelated promises inside a transaction can make later writes fail after partial application logic.\n\n- Load remote data and perform expensive computation before opening the transaction, then revalidate local assumptions once the transaction begins.\n- Create all reads and writes that form one invariant from the same transaction and wait for its completion event before reporting durable local success.\n- Abort on validation or write failure and treat transaction abort as a first-class result, not an exception to suppress.\n- Keep transaction scope to the required object stores and duration so one tab does not block upgrades or unrelated local work longer than necessary.\n\nSee /src/offline for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/storage",
      "title": "Do not persist reusable secrets in script-readable storage",
      "summary": "Keep bearer credentials and private key material out of localStorage, sessionStorage, IndexedDB, and general cache entries.",
      "body": "All script-readable origin storage is available to code executing in that origin, including compromised dependencies and injected scripts. Obfuscation or a key stored beside ciphertext does not create a meaningful boundary.\n\n- Use protected cookie or platform credential mechanisms for reusable session secrets when the architecture supports them.\n- Persist only the minimum offline data the product contract permits, and classify personal or sensitive fields before writing them.\n- Delete user-scoped databases, caches, queues, and cross-tab state on sign-out or account removal according to the privacy contract.\n- Do not log stored records during migration or corruption recovery; diagnostics should use schema versions, keys, counts, and non-sensitive error codes.\n\nSee /tests/storage for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/offline",
      "title": "Give cross-tab work a lease and idempotent identity",
      "summary": "Coordinate queue ownership and mutation replay so two tabs cannot perform the same logical operation concurrently.",
      "body": "Each tab has its own JavaScript runtime but shares origin storage. Storage events or broadcast messages notify peers; they do not provide durable mutual exclusion or exactly-once execution.\n\n- Give every queued operation a stable idempotency key that the server also understands.\n- Acquire a time-bounded lease or use a single worker owner for replay, and renew only while the owner is alive and making progress.\n- Recheck operation state before external submission and before final local commit because another tab may have completed it after the first read.\n- Broadcast state changes for responsiveness but recover truth from storage after missed messages, suspended tabs, or browser restart.\n\nSee /src/storage for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/storage",
      "title": "Schema upgrades are short structural transitions",
      "summary": "Keep version-change handlers synchronous and bounded, then perform large data backfills as resumable application work.",
      "body": "An IndexedDB upgrade blocks other connections and can be blocked by old tabs that keep the prior version open. Long record-by-record work inside the version-change transaction creates startup stalls and fragile recovery.\n\n- Use the version-change transaction for creating, deleting, or renaming stores and indexes and for only the bounded data changes required for structural validity.\n- Prompt or coordinate old tabs to close when an upgrade is blocked, and provide a usable recovery path rather than waiting forever.\n- Record a separate data-migration cursor and process large transformations in resumable batches after the database opens.\n- Test upgrade from every supported stored version and preserve a reset or export path when corrupted legacy data cannot be migrated safely.\n\nSee /tests/storage for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/storage",
      "title": "Browser persistence is a rebuildable cache unless the product says otherwise",
      "summary": "Define the server or user export as authority and design reset, quota, and eviction behavior before relying on local data.",
      "body": "Browsers can evict data, users can clear it, and storage availability differs across contexts. If local data is the only copy, that is a product-level durability promise requiring backup and user communication, not an implementation shortcut.\n\n- Classify each store as cache, draft, queued command, downloaded content, or local-only user data and assign recovery behavior.\n- Estimate usage and handle quota errors without deleting unrelated stores or looping on the same failed write.\n- For rebuildable caches, version the cache key and allow a full reset from authoritative data.\n- For local-only user content, provide export, backup, and explicit deletion semantics and test them before claiming offline durability.\n\nSee /src/offline for the rule or workflow that puts this decision into practice."
    }
  ]
};
