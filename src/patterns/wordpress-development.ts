import type { Pattern } from "../types.js";

export const wordpressDevelopment: Pattern = {
  "slug": "wordpress-development",
  "version": "1.0.0",
  "name": "WordPress Plugin and Theme Development",
  "tagline": "Keep WordPress hooks, capabilities, data access, rendering, and updates safe across releases.",
  "description": "WordPress extension code runs inside a shared request lifecycle with mutable globals, a hook graph assembled by many packages, long-lived public data, and administrators who can update core or neighboring plugins independently. This pattern constrains authorization and output boundaries, records hook and data ownership conventions, separates plugin behavior from theme presentation, and provides repeatable compatibility and release audits. It is not a generic PHP or Laravel pattern: it focuses on WordPress actions, filters, capabilities, nonces, enqueue APIs, database prefixes, activation, deactivation, uninstall, and backward-compatible extension contracts.",
  "category": "Framework",
  "icon": "puzzle",
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
  "metaTitle": "WordPress development pattern for AI agents",
  "metaDescription": "WordPress hooks, capabilities, nonces, escaping, database access, asset loading, and update-safe plugin and theme release workflows. In production.",
  "problem": "AI agents often treat a nonce as authorization, escape too early or too late, run expensive work on every hook, write directly to core tables, or break sites during plugin activation and upgrade.",
  "audience": "Teams maintaining WordPress plugins, themes, blocks, and site-specific integrations",
  "prevents": [
    "Using nonce verification as a substitute for a capability check",
    "Rendering unescaped dynamic values into HTML attributes or URLs",
    "Executing migrations or remote calls on every page request",
    "Removing user data during ordinary plugin deactivation"
  ],
  "appliesTo": {
    "paths": [
      "/wp-content/plugins",
      "/wp-content/themes",
      "/tests"
    ],
    "stacks": [
      "wordpress",
      "php",
      "plugins",
      "themes",
      "gutenberg"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/wp-content/plugins",
      "title": "Check capability and intent before every privileged change",
      "summary": "Authorize the current user, verify request intent, validate input, and fail before mutating WordPress or external state.",
      "body": "A WordPress nonce demonstrates request intent and origin freshness, not permission. Privileged actions need both a capability decision and nonce verification before any update, upload, option write, or remote effect.\n\n- Use a capability that describes the resource and action, then call the matching authorization check before loading mutable state or invoking a service.\n- Verify the nonce for state-changing browser requests and reject missing or invalid values; do not treat successful nonce verification as proof of role or ownership.\n- Validate identifiers, enums, and structured input before use, then pass parameters through the appropriate WordPress APIs or prepared database statements.\n- Return a generic public error while recording enough structured context for an administrator to identify the extension, action, and rejected actor.\n\nSee /wp-content/plugins for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/wp-content/plugins",
      "title": "Escape at the final rendering context",
      "summary": "Sanitize stored input by domain, then escape dynamic output for HTML, attributes, URLs, JavaScript, or structured markup at the sink.",
      "body": "Sanitization and escaping solve different problems. Values can be safe for storage but unsafe in a particular output context, while escaping before transformation can be undone by later concatenation.\n\n- Validate and sanitize incoming values according to their domain before storage; do not erase meaningful content with a generic sanitizer chosen only for convenience.\n- Escape plain text at HTML output, attribute values at attribute output, and URLs at URL output. Choose the function for the sink, not the source variable name.\n- Avoid inline script assembly with dynamic strings. Pass structured data through the supported script-data APIs and let JSON encoding preserve boundaries.\n- When intentionally allowing rich HTML, use an explicit allowlist and test disallowed elements and attributes rather than trusting editor permissions alone.\n\nSee /wp-content/themes for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/wp-content/plugins",
      "title": "Run migrations and remote effects outside the hot hook path",
      "summary": "Version data migrations, schedule bounded work, and make activation fast and retryable instead of blocking every request.",
      "body": "Plugin hooks can run on front-end, admin, REST, cron, and command-line requests. An expensive migration or remote call registered broadly can slow the entire site or leave it half-upgraded after a timeout.\n\n- Store a schema or data version and run idempotent, bounded migration steps only when the installed version lags behind the code.\n- Keep activation limited to capability setup, schedules, and small deterministic initialization; enqueue long work for a background or command-line path.\n- Register hooks conditionally and as late as necessary so admin-only or endpoint-only behavior does not execute on unrelated front-end requests.\n- Make remote calls timeout-bounded and failure-aware. Cache stable results, and never make page rendering depend on an unbounded third-party response.\n\nSee /tests for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/wp-content/plugins",
      "title": "Hooks are a public ordering contract",
      "summary": "Name callbacks, choose priorities deliberately, and keep filter functions pure enough for other extensions to compose around them.",
      "body": "Actions and filters form a shared graph across core, the active theme, and every plugin. A callback that relies on accidental registration order can break when another extension adds work at the same hook.\n\n- Register named callbacks from one bootstrap surface so hook, priority, accepted arguments, and owner are reviewable together.\n- Use priority only to express a real ordering dependency and document what must run before or after; avoid extreme priorities used merely to win a race.\n- A filter returns the transformed value on every path and avoids unrelated side effects. An action performs effects but should remain idempotent when hooks can fire more than once.\n- Remove or replace callbacks using the same callable identity and priority that registered them; anonymous callbacks cannot be reliably detached.\n\nSee /wp-content/themes for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/wp-content/themes",
      "title": "Themes present content while plugins own portable behavior",
      "summary": "Keep content types, data, integrations, and business behavior in plugins so changing presentation does not remove site capability.",
      "body": "A theme can be replaced from the administration interface, so behavior embedded only in the theme disappears with a visual redesign. Portable site capability belongs in a plugin even when the first user interface is theme-specific.\n\n- Register custom content types, taxonomies, scheduled work, external integrations, and persistent domain data from a plugin.\n- Keep templates, theme supports, presentation assets, and visual block styles in the theme, consuming stable plugin APIs where behavior is needed.\n- Enqueue scripts and styles through WordPress dependency APIs with accurate dependencies and versions instead of printing tags directly into templates.\n- Use child-theme or block-theme extension points for site presentation changes rather than editing a vendor theme that will be overwritten by updates.\n\nSee /wp-content/plugins for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "audit-wordpress-extension-security",
      "summary": "Review a WordPress extension for capability, nonce, input, output, query, upload, and remote-request boundaries.",
      "body": "---\nname: audit-wordpress-extension-security\ndescription: Audit a WordPress plugin or theme before a public release or security-sensitive change.\n---\n\n# Audit Wordpress Extension Security\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Enumerate every state-changing admin, REST, AJAX, and form entry point; verify capability, ownership, intent, and validation before mutation.\n- [ ] Trace dynamic values to their HTML, attribute, URL, script, query, file, and redirect sinks; apply the context-specific boundary at the final use.\n- [ ] Inspect direct database access for table prefixes, prepared parameters, bounded result sets, and a reason the official data API cannot satisfy the operation.\n- [ ] Exercise upload and remote-request paths with unexpected MIME types, large bodies, redirects, private destinations, timeouts, and failed cleanup.\n- [ ] Run the extension with debugging enabled and a minimal neighboring-plugin set, then inspect logs for notices that signal hook timing or compatibility errors.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "wordpress",
        "security",
        "php",
        "plugins",
        "audit"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "release-wordpress-extension",
      "summary": "Package and test activation, upgrade, rollback, deactivation, and uninstall without losing user-controlled data.",
      "body": "---\nname: release-wordpress-extension\ndescription: Release a WordPress plugin or theme update across supported core and PHP environments.\n---\n\n# Release Wordpress Extension\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Build the distributable from a clean checkout and confirm development files, secrets, tests, and local dependencies are excluded while runtime assets are present.\n2. Install fresh and activate with realistic permissions; then upgrade from the oldest supported data version and verify each migration is idempotent when interrupted and rerun.\n3. Deactivate and reactivate without deleting user data or duplicating schedules, roles, options, tables, or generated content.\n4. Exercise uninstall separately and require an explicit product decision before removing user-created or business-critical data.\n5. Test rollback to the prior package against migrated data, record incompatibilities, and publish the required backup or forward-fix instructions before release.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "wordpress",
        "release",
        "migration",
        "compatibility",
        "packaging"
      ]
    }
  ]
};
