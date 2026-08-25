import type { Pattern } from "../types.js";

export const clientStateManagement: Pattern = {
  "slug": "client-state-management",
  "version": "1.0.0",
  "name": "Client State Management",
  "tagline": "Give URL, form, local, shared, and server state one owner each and derive everything else.",
  "description": "Client state management is an ownership problem before it is a library choice. This bundle classifies URL, form, component, shared client, and server state; keeps one source of truth; derives redundant values; and defines persistence boundaries. Unlike TanStack Query, it decides where every state category belongs while the existing pattern specializes in remote data caching and synchronization.",
  "category": "Frontend",
  "icon": "orbit",
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
  "metaTitle": "Client state management for AI coding agents",
  "metaDescription": "Clear ownership for URL, form, local, shared, and server state with derived values, persistence boundaries, reset semantics, and contradiction-free models.",
  "problem": "Agents copy props into local state, mirror server cache into a global store, and persist transient UI flags, creating contradictions and unclear reset behavior.",
  "audience": "Frontend teams choosing ownership and lifecycle for interactive application state",
  "prevents": [
    "The same value stored in props, local state, and a global store",
    "Server data copied into client state with no synchronization contract",
    "Transient UI state restored after its owning screen or identity changed"
  ],
  "appliesTo": {
    "paths": [
      "/src/state",
      "/src/components",
      "/src/routes"
    ],
    "stacks": [
      "state-management",
      "react",
      "frontend",
      "url-state"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/state",
      "title": "Store each fact once and derive the rest",
      "summary": "Every state value has one authoritative owner, update path, reset event, and persistence policy.",
      "body": "Every state value has one authoritative owner, update path, reset event, and persistence policy. Duplicated and contradictory fields create impossible states such as selected objects no longer present in the latest list or loading flags that outlive the request. Enforce this boundary in /src/state so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Classify state before choosing a store: server resource, URL navigation, form draft, local interaction, cross-screen client state, or derived view.\n- Keep server resources in the server-state layer and store stable identifiers in client state instead of copying full records.\n- Derive filtered lists, totals, validation, selection objects, and status flags from authoritative inputs unless measured performance requires memoization.\n- Define reset behavior for logout, tenant switch, route exit, successful submit, cancel, and schema version change.\n\nVerification: Exercise each ownership transition and intentionally update one source while another is stale; confirm the model cannot represent contradictory or cross-identity state.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/routes",
      "title": "The URL owns shareable navigation state",
      "summary": "Filters, search, sorting, pagination, tabs, and selected resources that define the visible page should survive refresh and support links, history, and browser navigation.",
      "body": "Filters, search, sorting, pagination, tabs, and selected resources that define the visible page should survive refresh and support links, history, and browser navigation. Parse URL input through a typed boundary, normalize defaults, and write changes using push or replace according to the user's navigation expectation.\n\nKeep transient hover, open popover, unsaved text, and secret values out of the URL. Use stable identifiers rather than display labels and make invalid combinations resolve predictably. Let loaders and cache keys consume the normalized URL state so rendered data and address cannot drift. Keep the decision explicit at /src/routes; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/components for local interactions and /src/state for cross-screen ownership. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/state",
      "title": "Persistence is a migration commitment",
      "summary": "Putting state in local storage, IndexedDB, or a native store means old schemas and prior identities can reappear after new code ships.",
      "body": "Putting state in local storage, IndexedDB, or a native store means old schemas and prior identities can reappear after new code ships. Persist only values whose user benefit survives reload, and include schema version, owning identity, tenant, created time, and expiry where relevant.\n\nMigrate or discard incompatible versions explicitly instead of catching parse errors and keeping partial state. Clear identity-scoped data before another user or tenant can render. Never persist credentials or sensitive server records merely to avoid a refetch. Keep the decision explicit at /src/state; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/routes for shareable state and the authentication pattern for identity transitions. That related boundary consumes this decision and carries the evidence that proves it still holds."
    }
  ]
};
