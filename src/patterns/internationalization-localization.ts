import type { Pattern } from "../types.js";

export const internationalizationLocalization: Pattern = {
  "slug": "internationalization-localization",
  "version": "1.0.0",
  "name": "Internationalization and Localization",
  "tagline": "Make locale, messages, formatting, direction, routes, and layout behavior explicit product contracts.",
  "description": "Internationalization and localization require more than replacing visible strings because locale affects routing, formatting, plural rules, text direction, metadata, assets, and layout. This bundle defines canonical locale negotiation, message ownership, Intl formatting, bidi-safe rendering, and release checks. Unlike React TypeScript, it owns language and cultural behavior rather than component typing and React architecture.",
  "category": "Frontend",
  "icon": "languages",
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
  "metaTitle": "Internationalization pattern for AI agents",
  "metaDescription": "Canonical locale routing, message catalogs, Intl formatting, plural rules, text direction, layout resilience, and localization release checks for web apps.",
  "problem": "Agents hard-code strings and dates, infer text direction from language incorrectly, mix locale sources, or ship translated text without testing routes and layout expansion.",
  "audience": "Frontend teams serving products in multiple languages, regions, scripts, or cultural formats",
  "prevents": [
    "Different locale values in URL, cookie, server render, and client state",
    "Hand-built date, number, currency, and plural formatting",
    "Right-to-left or expanded translations breaking layout and interaction"
  ],
  "appliesTo": {
    "paths": [
      "/src/i18n",
      "/src/components",
      "/src/routes"
    ],
    "stacks": [
      "i18n",
      "localization",
      "intl",
      "frontend"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/routes",
      "title": "Resolve one canonical locale before rendering",
      "summary": "Routing, server data, metadata, messages, and client hydration consume the same validated locale value.",
      "body": "Routing, server data, metadata, messages, and client hydration consume the same validated locale value. When URL, profile, cookie, browser preference, and deployment default are resolved independently, the server and client can render different languages or cache one user's locale for another. Enforce this boundary in /src/routes so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Define precedence and supported fallback in one server-side resolver, then redirect or rewrite unsupported locale forms to a canonical route.\n- Carry locale through data loading, metadata, cache keys, and hydration rather than reading browser globals in render code.\n- Keep language, region, and text direction as separate values; language alone does not always determine direction or business region.\n- Use locale-neutral identifiers in application state and persistence so translated labels never become keys.\n\nVerification: Request every supported, aliased, unsupported, missing, and malformed locale through server render and client navigation; confirm one canonical URL and no hydration mismatch.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components",
      "title": "Format user-facing values with locale-aware APIs",
      "summary": "Dates, times, numbers, currency, units, lists, and plurals use Intl or an equivalent locale engine at the display boundary.",
      "body": "Dates, times, numbers, currency, units, lists, and plurals use Intl or an equivalent locale engine at the display boundary. String concatenation and hand-authored plural branches fail for grouping, decimal digits, calendars, time zones, grammar, and currency conventions outside the developer's locale. Enforce this boundary in /src/components so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Keep stored and transported values locale-neutral, including ISO timestamps, numeric amounts with currency, and stable enum identifiers.\n- Format with an explicit locale and time zone where the product promises one; never rely on a server's process defaults.\n- Use plural and select messages from the catalog rather than constructing sentences around translated fragments.\n- Parse user-entered localized values with a deliberate product flow; do not assume display formatting is safely reversible.\n\nVerification: Snapshot representative values across supported locales, time zones, plural categories, currencies, negative amounts, and daylight changes; verify semantics, not only visual text.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/i18n",
      "title": "Message identifiers describe meaning, not English wording",
      "summary": "Keys copied from source text become unstable when English changes and tempt translators to reuse a sentence whose context differs.",
      "body": "Keys copied from source text become unstable when English changes and tempt translators to reuse a sentence whose context differs. Use stable semantic identifiers scoped to the product surface and provide description, variables, plural behavior, and screenshots or usage context where tooling supports them.\n\nKeep whole translatable sentences together instead of concatenating fragments. Require named variables with clear types and escape rules. Retire obsolete keys through extraction and usage checks so stale translations do not mask missing coverage. Keep the decision explicit at /src/i18n; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/components for rendering context and the localization release skill for catalog validation. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components",
      "title": "Bidirectional text needs metadata and isolation",
      "summary": "Right-to-left layout direction and the direction of an embedded user string are separate concerns, especially for mixed names, numbers, code, URLs, and identifiers.",
      "body": "Right-to-left layout direction and the direction of an embedded user string are separate concerns, especially for mixed names, numbers, code, URLs, and identifiers. Set document or region direction from resolved locale, then isolate unknown-direction content with appropriate HTML direction semantics.\n\nPrefer logical CSS properties such as inline-start and inline-end over left and right for layout behavior. Do not reverse icons or timelines unless their meaning is directional in that culture. Test keyboard order, focus, tables, charts, truncation, and copy behavior under mixed-direction content. Keep the decision explicit at /src/components; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/routes for canonical locale and /src/i18n for string direction metadata. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "release-localization",
      "summary": "Release a locale with complete catalogs, formatting evidence, route checks, bidi coverage, and fallback behavior.",
      "body": "---\nname: release-localization\ndescription: Release a locale with complete catalogs, formatting evidence, route checks, bidi coverage, and fallback behavior.\n---\n\n# Release Localization\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Freeze the source catalog, extract used keys, remove obsolete entries, and provide translators with variable types, plural context, descriptions, and screenshots.\n2. Validate catalog syntax, required variables, plural categories, rich-text tags, unsafe markup, missing messages, and unintended fallback to the source language.\n3. Run route, metadata, server-render, hydration, formatting, input, accessibility, text expansion, and right-to-left checks with representative production content.\n4. Roll out the locale with explicit fallback and monitoring for missing messages, route errors, layout failures, and support feedback; record ownership for updates.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "i18n",
        "localization",
        "frontend",
        "release"
      ]
    }
  ]
};
