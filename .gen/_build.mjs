// Generator: reads .gen/*.json (the authoring input) and emits
// src/patterns/<slug>.ts for each, then regenerates src/index.ts sorted by
// category. Deterministic; JSON.stringify guarantees valid TS object literals.
// Run: node .gen/_build.mjs
//
// `.gen/` is gitignored, so a fresh clone has no JSON at all. The index is
// therefore built from the UNION of the generated files and whatever already
// exists in src/patterns/ (which IS committed and is the published source of
// truth). Without that union, running this script on a clone would silently drop
// every pattern whose JSON is missing from this machine.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const genDir = here;
const patternsDir = join(root, "src", "patterns");

// Patterns already committed as TS, read back so they survive a build run on a
// machine (or a clone) whose .gen/ does not carry their JSON.
function readCommittedPatterns() {
  const out = [];
  for (const file of readdirSync(patternsDir).filter((f) => f.endsWith(".ts"))) {
    const slug = file.replace(/\.ts$/, "");
    const src = readFileSync(join(patternsDir, file), "utf8");
    const name = /"name":\s*"((?:[^"\\]|\\.)*)"/.exec(src)?.[1];
    const category = /"category":\s*"([A-Za-z]+)"/.exec(src)?.[1];
    if (!name || !category) {
      errors.push(`${file}: committed pattern is missing name or category`);
      continue;
    }
    out.push({ slug, name: JSON.parse(`"${name}"`), category });
  }
  return out;
}

const CATEGORY_ORDER = ["Framework", "Frontend", "Backend", "Billing", "Infra", "Workflow", "AI", "Security"];

const camel = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// Drop null-valued keys so optional fields (scopeType/priority/etc.) are omitted
// rather than emitted as `null`, which the Pattern types reject.
function clean(v) {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, val] of Object.entries(v)) {
      if (val === null) continue;
      o[k] = clean(val);
    }
    return o;
  }
  return v;
}

const jsonFiles = readdirSync(genDir).filter((f) => f.endsWith(".json"));
const created = [];
const errors = [];

for (const file of jsonFiles) {
  try {
    const obj = JSON.parse(readFileSync(join(genDir, file), "utf8"));
    if (!obj.slug) throw new Error("missing slug");
    const ts =
      `import type { Pattern } from "../types.js";\n\n` +
      `export const ${camel(obj.slug)}: Pattern = ${JSON.stringify(clean(obj), null, 2)};\n`;
    writeFileSync(join(patternsDir, `${obj.slug}.ts`), ts);
    created.push({ slug: obj.slug, name: obj.name, category: obj.category });
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
  }
}

// Merge committed + newly generated (dedupe by slug, generated wins).
const bySlug = new Map();
for (const p of readCommittedPatterns()) bySlug.set(p.slug, p);
for (const p of created) bySlug.set(p.slug, p);
const all = [...bySlug.values()].sort((a, b) => {
  const c = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  return c !== 0 ? c : a.name.localeCompare(b.name);
});

const imports = all.map((p) => `import { ${camel(p.slug)} } from "./patterns/${p.slug}.js";`).join("\n");
const arrayItems = all.map((p) => `  ${camel(p.slug)},`).join("\n");

const index = `export * from "./types.js";

import type { Pattern, PatternCategory, PatternContentKind } from "./types.js";
import { patternToken } from "./types.js";
${imports}

/** The catalog. Generated; order is category-grouped. */
export const PATTERNS: Pattern[] = [
${arrayItems}
];

export function getAllPatterns(): Pattern[] {
  return PATTERNS;
}

export function getPattern(slug: string): Pattern | undefined {
  return PATTERNS.find((p) => p.slug === slug);
}

export function getCategories(): PatternCategory[] {
  return [...new Set(PATTERNS.map((p) => p.category))];
}

export function countByKind(p: Pattern): Record<PatternContentKind, number> {
  const counts: Record<PatternContentKind, number> = { memory: 0, rule: 0, skill: 0 };
  for (const piece of p.pieces) counts[piece.kind] += 1;
  return counts;
}

export function targetPaths(p: Pattern): string[] {
  return [...new Set(p.pieces.map((x) => x.nodePath))].sort();
}

export function bundleSummary(p: Pattern): string {
  const c = countByKind(p);
  const parts: string[] = [];
  if (c.rule) parts.push(\`\${c.rule} \${c.rule === 1 ? "Rule" : "Rules"}\`);
  if (c.memory) parts.push(\`\${c.memory} \${c.memory === 1 ? "Memory" : "Memories"}\`);
  if (c.skill) parts.push(\`\${c.skill} \${c.skill === 1 ? "Skill" : "Skills"}\`);
  return parts.join(" • ");
}

export function serializePatternBundle(p: Pattern): string {
  const blocks = p.pieces.map((piece) => {
    const head = \`### [\${piece.kind.toUpperCase()}] \${piece.title}  (path: \${piece.nodePath})\`;
    const meta =
      piece.kind === "rule"
        ? \`\\n<!-- scope: \${piece.scopeType ?? "project"} | priority: \${piece.priority ?? "medium"} | \${piece.enforcement ?? "advisory"} -->\`
        : "";
    return \`\${head}\${meta}\\n\\n\${piece.body.trim()}\`;
  });
  return \`# Pathrule Pattern: \${p.name} (\${p.version})\\n# \${patternToken(p)}\\n\\n\${blocks.join("\\n\\n---\\n\\n")}\\n\`;
}
`;

writeFileSync(join(root, "src", "index.ts"), index);

console.log(`generated ${created.length} pattern files; total catalog ${all.length}`);
if (errors.length) {
  console.log("ERRORS:");
  for (const e of errors) console.log("  " + e);
}
console.log("catalog order:", all.map((p) => p.slug).join(", "));
