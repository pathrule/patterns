# Pathrule Patterns

**The context layer for AI coding agents.** Curated, path-scoped knowledge packages: ready-to-use bundles of memories, rules, and skills that drop into your workspace and apply where they belong.

A Pattern is not a single skill. It is a small, opinionated bundle of memories, rules, and skills, each pre-scoped to the path it belongs to (for example, a "Server Components by default" rule scoped to `/app`). Add a Pattern and your AI assistant gets the right conventions in the right place, then it evolves with your project.

Works with Claude Code, Cursor, Codex, GitHub Copilot, Windsurf, and any MCP client.

## What is in a Pattern

Each Pattern declares its pieces with a `kind` (`memory` | `rule` | `skill`), the target `nodePath`, and the full content body:

- **Memories** capture decisions and conventions ("how we do X here").
- **Rules** are constraints your agent should respect (with scope, priority, and advisory or strict enforcement).
- **Skills** are reusable checklists or procedures.

Everything in this repository is **free and Apache-2.0**. Pathrule only ever charges for the hosted product, never for this content.

## Using a Pattern

Browse the catalog at **[pathrule.io/patterns](https://pathrule.io/patterns)**.

- **One-click import** (coming soon): paste a reference token into your AI assistant and Pathrule places each piece at the right path in your workspace.
  ```
  ::pathrule:package:nextjs-app-router
  ```
- **Manual copy** (works today): copy the full bundle from a Pattern page and paste the pieces where you want them.

## Patterns in this release

| Pattern | Category | Token |
| --- | --- | --- |
| Next.js App Router | Framework | `::pathrule:package:nextjs-app-router` |
| Supabase + RLS | Backend | `::pathrule:package:supabase-rls` |
| Stripe Billing | Billing | `::pathrule:package:stripe-billing` |
| React + TypeScript | Frontend | `::pathrule:package:react-typescript` |

## Using the package programmatically

```ts
import { getAllPatterns, getPattern, serializePatternBundle } from "@pathrule/patterns";

const pattern = getPattern("nextjs-app-router");
if (pattern) {
  console.log(serializePatternBundle(pattern));
}
```

The package is a pure, dependency-free, serializable data module. It carries no React, DOM, or cloud imports, so it can be rendered on the web, bundled into a local snapshot, or synced to a backend without change.

## Contributing

Patterns are curated and first-party for now, so we keep quality and provenance high. Community contribution will open later with a review process. Until then, please use issues to suggest a Pattern or report a fix.

## License

[Apache-2.0](./LICENSE). See [NOTICE](./NOTICE).
