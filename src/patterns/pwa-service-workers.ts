import type { Pattern } from "../types.js";

export const pwaServiceWorkers: Pattern = {
  "slug": "pwa-service-workers",
  "version": "1.0.0",
  "name": "PWA and Offline-First Service Workers",
  "tagline": "Control service-worker updates, cache versions, offline mutations, navigation, and recovery.",
  "description": "A service worker is a separately updated network proxy that can outlive tabs, serve old assets, intercept navigation, queue mutations, and activate while several application versions are open at once. This pattern constrains cache ownership and mutation replay, records install and activation decisions, separates shell caching from application data, and supplies an update and offline-recovery test workflow. It complements CDN caching by focusing on browser-controlled caches and worker lifecycle, where the client can remain stale after the origin and edge are already correct.",
  "category": "Frontend",
  "icon": "refresh-ccw-dot",
  "color": "bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "PWA service worker pattern for AI agents",
  "metaDescription": "PWA service-worker lifecycle, cache versioning, navigation fallback, offline mutations, update prompts, replay safety, and recovery testing. In production.",
  "problem": "AI agents often cache every response, delete old caches before old tabs stop using them, replay non-idempotent mutations, or force activation into an incompatible open client.",
  "audience": "Web teams building installable, resilient, or offline-capable applications",
  "prevents": [
    "Serving private or error responses from a shared cache",
    "Breaking an old open tab during worker activation",
    "Duplicating mutations after reconnect and retry",
    "Keeping a client permanently on an obsolete application shell"
  ],
  "appliesTo": {
    "paths": [
      "/src/service-worker",
      "/src/offline",
      "/tests/pwa"
    ],
    "stacks": [
      "pwa",
      "service-worker",
      "offline-first",
      "web",
      "cache-storage"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/service-worker",
      "title": "Cache only responses with an explicit ownership policy",
      "summary": "Classify shell assets, public immutable data, private data, navigation, and errors before selecting a cache strategy.",
      "body": "A service worker sees credentials, redirects, partial responses, and failures that ordinary static caching guidance does not cover. A broad cache-first handler can persist user-specific or invalid content across sessions.\n\n- Precache only build-owned immutable shell assets from a generated manifest; do not discover and cache arbitrary responses during install.\n- Use separate named caches for shell, public runtime data, and other bounded classes so deletion and retention policies cannot erase unrelated content.\n- Do not cache authenticated or user-specific responses unless the cache key and logout deletion contract isolate them by user and product policy explicitly permits storage.\n- Reject non-success, opaque, partial, and unexpectedly redirected responses from cache insertion unless the endpoint has a reviewed reason to keep them.\n\nSee /src/offline for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/offline",
      "title": "Replay offline mutations with stable operation identity",
      "summary": "Queue only replay-safe commands, preserve user intent, and reconcile by idempotency key after reconnect or worker restart.",
      "body": "An offline client can submit the same queued command after browser restart, network ambiguity, or a failed acknowledgement. Without stable identity, one user action can create several orders, comments, or updates.\n\n- Assign the logical action an idempotency key before local acceptance and store that key with the queued payload and actor context.\n- Encrypt or avoid sensitive queued payloads according to the local-data policy, and remove them on sign-out or account removal.\n- Replay in dependency order with bounded retry and a terminal conflict state; do not loop forever on validation, authorization, or obsolete commands.\n- Reconcile the authoritative server result back into local state by operation identity and surface conflicts the product cannot merge automatically.\n\nSee /tests/pwa for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/service-worker",
      "title": "Activation is a compatibility negotiation with open clients",
      "summary": "Let the new worker wait unless the application can prove old tabs and new cached assets remain compatible.",
      "body": "Calling immediate activation feels like a fast update, but it can put a new network proxy underneath an old JavaScript bundle. Requests, routes, and cached schemas may no longer agree.\n\n- Notify open clients that an update is waiting and let product policy choose a user prompt, safe reload point, or controlled mandatory refresh.\n- Use immediate activation only when the shell, API, cache, and local-data contracts are backward compatible across the open-client window.\n- Delete obsolete caches after activation with a version allowlist, while retaining assets still required by supported clients when compatibility demands it.\n- After controller change, reload or reinitialize the application through one deliberate path instead of letting half the view continue with the prior bundle.\n\nSee /tests/pwa for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/service-worker",
      "title": "Navigation fallback serves the application shell, not every failed request",
      "summary": "Apply shell fallback only to intended document navigations and preserve real errors for APIs, assets, and unsupported routes.",
      "body": "A catch-all fallback that returns HTML for a missing script, JSON endpoint, or image turns a clear network error into confusing parse and content failures elsewhere in the application.\n\n- Check request mode, destination, method, and URL scope before using the application-shell fallback.\n- Exclude API, authentication, upload, payment, callback, and asset routes from document fallback unless each has an explicit offline representation.\n- Preserve server redirects and not-found behavior where the application does not own the route.\n- Provide a bounded offline document for navigations that cannot use the shell, and make its retry behavior independent from a stale cached application.\n\nSee /src/offline for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-pwa-update-and-offline",
      "summary": "Exercise install, update, multi-tab activation, offline navigation, queued mutations, sign-out, and corrupted caches.",
      "body": "---\nname: test-pwa-update-and-offline\ndescription: Test a PWA or service-worker release under lifecycle and network failure conditions.\n---\n\n# Test Pwa Update And Offline\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Install from a clean browser, load representative routes, then update while one old tab, one background tab, and one newly opened tab remain active.\n2. Switch offline before and after install and verify shell, owned routes, excluded APIs, missing assets, and true not-found responses behave distinctly.\n3. Queue mutations, terminate the tab or browser, reconnect, and prove replay uses stable identities and resolves conflicts without duplicate effects.\n4. Sign out while private data and queued work exist, then confirm caches, storage, subscriptions, and replay permissions follow the privacy contract.\n5. Corrupt or delete one cache generation and simulate a failed worker install; verify the previous working version remains usable and recovery does not require manual storage deletion.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "pwa",
        "service-worker",
        "offline",
        "testing",
        "cache"
      ]
    }
  ]
};
