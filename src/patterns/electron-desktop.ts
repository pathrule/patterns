import type { Pattern } from "../types.js";

export const electronDesktop: Pattern = {
  "slug": "electron-desktop",
  "version": "1.0.0",
  "name": "Electron Desktop Applications",
  "tagline": "Harden Electron process boundaries, IPC contracts, navigation, permissions, updates, and local data.",
  "description": "Electron combines a privileged Node main process with web-rendered content, so a renderer bug becomes a desktop compromise when preload exposure, IPC routing, navigation, permissions, or update trust are broader than the feature requires. This pattern constrains renderer privileges and IPC validation, records window and local-data ownership, separates main-process services from UI state, and adds an adversarial desktop release audit. It differs from ordinary web security because the protected capabilities include filesystem, operating-system integration, native dialogs, protocol handlers, and signed application updates.",
  "category": "Framework",
  "icon": "monitor-up",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Electron desktop pattern for AI coding agents",
  "metaDescription": "Electron sandboxing, preload APIs, validated IPC, navigation controls, permissions, local data, and signed update boundaries for desktop apps. In production.",
  "problem": "AI agents often enable Node integration in renderers, expose raw ipcRenderer through preload, trust renderer-provided paths or channels, or open arbitrary URLs with operating-system privileges.",
  "audience": "Teams shipping Electron applications with local files, native integrations, or automatic updates",
  "prevents": [
    "Giving remote or compromised renderer code direct Node access",
    "Accepting arbitrary IPC channels and unvalidated payloads",
    "Opening attacker-controlled navigation or external protocols",
    "Applying an update without a verifiable origin and rollback plan"
  ],
  "appliesTo": {
    "paths": [
      "/src/main",
      "/src/preload",
      "/src/renderer"
    ],
    "stacks": [
      "electron",
      "typescript",
      "desktop",
      "ipc",
      "nodejs"
    ],
    "packages": [
      "electron"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/main",
      "title": "Run every renderer with the narrowest privilege set",
      "summary": "Keep sandboxing and context isolation enabled, disable renderer Node access, and create windows from one reviewed factory.",
      "body": "A renderer processes HTML, styles, user content, and sometimes remote data. It must be treated as an untrusted presentation process even when every asset is packaged locally.\n\n- Create BrowserWindow instances through one factory that enables sandboxing and context isolation and does not enable Node integration in the renderer.\n- Do not weaken web security or certificate verification to make development convenient. Fix origins, certificates, and content policy instead.\n- Use a strict content security policy appropriate to packaged assets and avoid evaluating strings or loading executable content from writable application data.\n- Partition sessions deliberately and clear sensitive session data on sign-out where the product contract requires it; do not let incidental window creation choose storage isolation.\n\nSee /src/preload for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/preload",
      "title": "Expose capability-specific preload methods",
      "summary": "Publish a small typed API through the context bridge and keep Electron event objects, channels, and Node primitives private.",
      "body": "Exposing `ipcRenderer`, filesystem modules, shell access, or a generic send method through preload turns every renderer injection into an unrestricted privileged command surface.\n\n- Expose one named method per allowed capability, with typed arguments and results. Do not expose generic channel strings or the raw IPC object.\n- Strip Electron event objects before invoking renderer callbacks because they carry privileged sender and frame references.\n- Validate arguments again in the main process against a runtime schema and authorization context; TypeScript declarations in preload are not a trust boundary.\n- Return serializable domain values and stable public failures. Do not leak absolute filesystem layout, stack traces, or native object handles into the renderer.\n\nSee /src/main for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/main",
      "title": "Validate IPC sender, payload, and target resource",
      "summary": "Authorize each privileged handler against the calling frame and selected resource before touching files, shell, clipboard, or operating-system APIs.",
      "body": "IPC originates from a renderer that may be compromised. A valid channel name alone does not prove the caller is an expected application frame or that the requested path and operation are allowed.\n\n- Check the sender frame's URL and window ownership against the expected packaged application origin before performing a privileged action.\n- Validate payload shape, size, enum values, and identifiers with a runtime schema before using them in path, command, or native API construction.\n- Resolve file operations beneath product-owned roots or through user-selected handles; reject traversal and do not accept arbitrary absolute paths from the renderer.\n- Treat external URL opening as a protocol allowlist decision and construct known destinations from trusted components rather than forwarding a renderer-provided string.\n\nSee /src/renderer for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/main",
      "title": "The main process owns durable and privileged state",
      "summary": "Keep operating-system resources, update state, windows, and durable local services in main while renderers hold disposable view state.",
      "body": "Renderer processes can reload or crash independently. Durable work tied to a renderer disappears at the wrong lifetime, while privileged objects mirrored into UI state become hard to revoke.\n\n- Own windows, tray state, file watchers, protocol registration, update orchestration, and durable database connections in main-process services.\n- Represent renderer subscriptions with explicit identifiers and remove them when the frame or window closes so main does not retain dead listeners.\n- Keep local database migrations and encryption setup before renderer access, with a failure screen that does not open the main application against a partial schema.\n- Send renderer updates as serializable events and let the view request a fresh snapshot after reload rather than assuming it observed every transition.\n\nSee /src/renderer for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/main",
      "title": "Updates are a signed state transition",
      "summary": "Download only from the configured trusted channel, verify package identity, and stage restart and rollback behavior as product flows.",
      "body": "Desktop update failures persist on user machines and can prevent the application from starting. Automatic update code must treat origin, signing, compatibility, restart timing, and rollback as one transition.\n\n- Pin update configuration to the intended product and channel and reject redirects or metadata that escape the trusted distribution boundary.\n- Require platform signing and verify that the installed update identifies as the same application before replacing the current build.\n- Do not restart over unsaved work. Surface readiness, release notes, and a user-controlled restart or a clearly documented mandatory policy.\n- Keep local data migrations forward-compatible with rollback where feasible, or gate irreversible migrations until the new build is confirmed healthy.\n\nSee /src/main for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "audit-electron-trust-boundaries",
      "summary": "Attack renderer, preload, IPC, navigation, permission, file, protocol, and update boundaries before a desktop release.",
      "body": "---\nname: audit-electron-trust-boundaries\ndescription: Audit an Electron application after adding a window, preload method, native capability, protocol, or updater change.\n---\n\n# Audit Electron Trust Boundaries\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Enumerate every BrowserWindow and WebView preference, loaded origin, session partition, navigation path, popup handler, and permission decision.\n- [ ] List the complete contextBridge surface and prove no generic IPC, Node module, event object, or unrestricted path operation reaches the renderer.\n- [ ] Invoke each IPC handler from the wrong frame with malformed, oversized, stale, unauthorized, and traversal payloads; confirm rejection before side effects.\n- [ ] Attempt navigation, window creation, download, and external protocol opening with attacker-controlled URLs and mixed encoding.\n- [ ] Install a valid update, a tampered package, a wrong-channel package, and an update around unsaved work and local-data migration; record recovery for every outcome.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "electron",
        "desktop",
        "security",
        "ipc",
        "audit"
      ]
    }
  ]
};
