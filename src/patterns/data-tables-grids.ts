import type { Pattern } from "../types.js";

export const dataTablesGrids: Pattern = {
  "slug": "data-tables-grids",
  "version": "1.0.0",
  "name": "Data Tables and Grids",
  "tagline": "Keep query state, row identity, virtualization, selection, editing, and keyboard semantics coherent.",
  "description": "Data tables and grids combine server queries, dense rendering, focus, selection, editing, and accessibility, so small inconsistencies become lost work or unusable navigation. This bundle defines authoritative query state, stable row identity, bounded rendering, grid semantics, edit concurrency, and test procedures. Unlike TanStack Query, it owns the interactive grid contract rather than general remote-data fetching and cache behavior.",
  "category": "Frontend",
  "icon": "rows-3",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Data tables and grids for AI coding agents",
  "metaDescription": "Stable row identity, URL query state, bounded rendering, accessible grid keyboard behavior, selection semantics, edit conflicts, and resilient table tests.",
  "problem": "Agents render thousands of rows, key by array index, mix client and server sorting, or add ARIA grid roles without implementing the required keyboard and focus model.",
  "audience": "Frontend teams building sortable, filterable, selectable, editable, or virtualized data grids",
  "prevents": [
    "Selection and edits moving to another row after sorting",
    "Client sorting a single page while the server owns the full dataset",
    "Grid roles that trap focus or hide cells from assistive technology"
  ],
  "appliesTo": {
    "paths": [
      "/src/components/tables",
      "/src/routes",
      "/src/api"
    ],
    "stacks": [
      "data-grid",
      "tables",
      "accessibility",
      "frontend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Keep the server query as one canonical state",
      "summary": "Sorting, filtering, pagination, grouping, and search resolve from validated URL state into one server query contract.",
      "body": "Sorting, filtering, pagination, grouping, and search resolve from validated URL state into one server query contract. Mixing local table state with server paging can sort only the visible page, reset filters unexpectedly, and produce links that do not reproduce the view. Enforce this boundary in /src/routes so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Parse column, direction, filter, cursor or page, and page size against an allowlist before constructing the backend request.\n- Reset or preserve pagination deliberately when filters and sorting change, and use replace versus push according to history behavior.\n- Include normalized query state in cache identity and response metadata so the table can detect stale pages.\n- Keep unsupported and sensitive fields out of client-selectable sort and filter expressions.\n\nVerification: Open copied URLs, navigate history, change filters during requests, and request invalid columns; confirm view, cache, and server query remain equivalent.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components/tables",
      "title": "Use stable row identity for selection and editing",
      "summary": "Selection, expansion, focus, optimistic edits, and virtualization key records by immutable domain identifiers.",
      "body": "Selection, expansion, focus, optimistic edits, and virtualization key records by immutable domain identifiers. Array indexes and visible positions change under sort, filter, pagination, insertion, and virtualization, causing actions to target the wrong record. Enforce this boundary in /src/components/tables so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Require a stable row key from the data contract and never synthesize it from position or mutable display fields.\n- Define whether selection spans pages and filters, then store selected IDs plus an explicit all-matching representation when needed.\n- Authorize bulk actions against current server state and return per-record outcomes rather than trusting the client's selected count.\n- Preserve focus by row and column identity when the viewport recycles elements.\n\nVerification: Sort, filter, insert, remove, paginate, virtualize, and refresh while rows are selected or edited; confirm every action stays attached to the original record.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components/tables",
      "title": "Choose table or grid semantics with the keyboard model",
      "summary": "Static tabular content uses native table semantics, while an interactive grid implements managed focus and documented key behavior completely.",
      "body": "Static tabular content uses native table semantics, while an interactive grid implements managed focus and documented key behavior completely. Adding role=grid without roving focus, arrow navigation, cell labeling, and edit transitions can make content harder to use than a native table. Enforce this boundary in /src/components/tables so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Prefer a native table when cells mainly present information and ordinary links or controls can remain in the page tab order.\n- For a composite grid, keep one tab stop, implement arrow, Home, End, and documented selection behavior, and expose row and column context.\n- Define how focus enters editable cell content and returns to grid navigation without stealing standard text-editing keys.\n- Keep offscreen virtual rows represented with accurate counts and positions where the accessibility API requires them.\n\nVerification: Test native and grid variants with keyboard only, screen reader, zoom, virtualization, editing, empty state, and dynamic row insertion; verify focus never disappears.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/api",
      "title": "Edits carry row version and field intent",
      "summary": "A grid often shows data long enough for another user or job to change it, so submitting the whole stale row can overwrite unrelated updates.",
      "body": "A grid often shows data long enough for another user or job to change it, so submitting the whole stale row can overwrite unrelated updates. Send the stable row identifier, changed fields, and observed version or validator to the mutation boundary.\n\nReject or merge conflicts according to explicit field semantics and return current authoritative values. Keep optimistic UI reversible and preserve the user's draft when the server rejects a conflict. Report partial bulk outcomes per record so retries do not repeat successful changes. Keep the decision explicit at /src/api; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/components/tables for draft and focus state and /src/routes for query identity. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-data-grid",
      "summary": "Test a data table or grid across query state, identity, keyboard access, virtualization, editing, and degraded networks.",
      "body": "---\nname: test-data-grid\ndescription: Test a data table or grid across query state, identity, keyboard access, virtualization, editing, and degraded networks.\n---\n\n# Test Data Grid\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Create fixtures with stable IDs, duplicate labels, long text, empty values, mixed directions, large row counts, permissions, and concurrent versions.\n2. Exercise sort, filter, page, history, selection, expansion, resize, and virtualization while requests overlap, fail, retry, and resolve out of order.\n3. Run the documented keyboard model and screen-reader flow through headers, cells, editing controls, bulk actions, empty state, errors, and restored focus.\n4. Race edits and bulk actions against server changes; verify conflict handling, optimistic rollback, per-record results, and no action targets a recycled row.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "data-grid",
        "tables",
        "accessibility",
        "testing"
      ]
    }
  ]
};
