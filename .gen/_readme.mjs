// Generates README.md from the published catalog data so the pattern list never
// drifts. Run: node .gen/_readme.mjs  (after .gen/_build.mjs + pnpm build)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const require = createRequire(import.meta.url);
const { getAllPatterns, countByKind, patternToken } = require(join(root, "dist/index.js"));

const CATEGORY_ORDER = ["Framework", "Frontend", "Backend", "Billing", "Infra", "Workflow", "AI", "Security"];
const SITE = "https://pathrule.io/patterns";

const patterns = getAllPatterns();

function bundle(p) {
  const c = countByKind(p);
  const parts = [];
  if (c.rule) parts.push(`${c.rule}R`);
  if (c.memory) parts.push(`${c.memory}M`);
  if (c.skill) parts.push(`${c.skill}S`);
  return parts.join(" · ");
}

function categorySection(cat) {
  const rows = patterns
    .filter((p) => p.category === cat)
    .map(
      (p) =>
        `| [${p.name}](${SITE}/${p.slug}) | ${p.tagline} | ${bundle(p)} | \`${patternToken(p)}\` |`,
    );
  if (!rows.length) return "";
  return [
    `### ${cat}`,
    "",
    "| Pattern | What it gives you | Bundle | Token |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}

const catalog = CATEGORY_ORDER.map(categorySection).filter(Boolean).join("\n");
const totalByCat = CATEGORY_ORDER.filter((c) => patterns.some((p) => p.category === c)).length;

const readme = `<p align="center">
  <img src="assets/pathrule-banner.png" alt="Pathrule Patterns" width="640">
</p>

<p align="center"><strong>The context layer for AI coding agents.</strong><br/>Ready-to-use, path-scoped bundles of memories, rules, and skills that drop into your workspace and apply where they belong.</p>

<p align="center">
  <a href="#catalog">Catalog</a> &nbsp;·&nbsp;
  <a href="#what-is-a-pattern">What is a Pattern</a> &nbsp;·&nbsp;
  <a href="#using-a-pattern">Using a Pattern</a> &nbsp;·&nbsp;
  <a href="https://pathrule.io/patterns">Browse online</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License: Apache-2.0"></a>
  <a href="https://www.npmjs.com/package/@pathrule/patterns"><img src="https://img.shields.io/npm/v/%40pathrule%2Fpatterns?label=%40pathrule%2Fpatterns" alt="npm"></a>
  <img src="https://img.shields.io/badge/patterns-${patterns.length}-119e6f" alt="${patterns.length} patterns">
  <img src="https://img.shields.io/badge/content-first--party-119e6f" alt="First-party content">
</p>

<p align="center">
  Works with <strong>Claude Code</strong>, <strong>Cursor</strong>, <strong>Codex</strong>, <strong>GitHub Copilot</strong>, <strong>Windsurf</strong>, and any MCP client.
</p>

---

A Pattern is not a single skill. It is a small, opinionated bundle of memories, rules, and skills, each pre-scoped to the path it belongs to (for example, a "Server Components by default" rule scoped to \`/app\`). Add a Pattern and your AI assistant gets the right conventions in the right place, then it evolves with your project.

Everything here is **free and Apache-2.0**. Pathrule only ever charges for the hosted product, never for this content.

## Catalog

**${patterns.length} patterns across ${totalByCat} categories.** Each links to its full page; \`Bundle\` shows the mix of **R**ules, **M**emories, and **S**kills, composed to fit the topic rather than a fixed template.

${catalog}
## What is a Pattern

Each Pattern declares its pieces with a \`kind\` (\`memory\` | \`rule\` | \`skill\`), the target \`nodePath\`, and the full content body:

- **Memories** capture decisions and conventions ("how we do X here").
- **Rules** are constraints your agent should respect (with scope, priority, and advisory or strict enforcement).
- **Skills** are reusable checklists or procedures.

The bundle for each pattern is composed from its actual subject: rule-heavy for constraint and security topics, memory-heavy for conventions and architecture, skill-heavy for review and checklist topics. No two need to look alike.

## Using a Pattern

Browse the catalog at **[pathrule.io/patterns](https://pathrule.io/patterns)**.

- **One-click import**: paste a reference token into your AI assistant and Pathrule places each piece at the right path in your workspace.
  \`\`\`
  ::pathrule:package:nextjs-app-router
  \`\`\`
- **Manual copy**: copy the full bundle from a Pattern page and paste the pieces where you want them.

## Using the package programmatically

\`\`\`ts
import { getAllPatterns, getPattern, serializePatternBundle } from "@pathrule/patterns";

const pattern = getPattern("nextjs-app-router");
if (pattern) {
  console.log(serializePatternBundle(pattern));
}
\`\`\`

The package is a pure, dependency-free, serializable data module. It carries no React, DOM, or cloud imports, so it can be rendered on the web, bundled into a local snapshot, or synced to a backend without change.

## Contributing

Patterns are curated and first-party for now, so we keep quality and provenance high. Community contribution will open later with a review process. Until then, please use issues to suggest a Pattern or report a fix.

## License

[Apache-2.0](./LICENSE). See [NOTICE](./NOTICE).
`;

writeFileSync(join(root, "README.md"), readme);
console.log(`README.md regenerated: ${patterns.length} patterns, ${totalByCat} categories.`);
