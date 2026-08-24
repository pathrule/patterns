// Machine gate for the Pattern Authoring / Pattern Factory standard.
//
// This is the check that lets an agent author patterns WITHOUT a human in the
// loop: everything in the Definition of Done that can be measured is measured
// here, so "it passed" is a fact rather than a self-assessment.
//
// Usage:
//   node .gen/_validate.mjs --only slug-a,slug-b     # strict gate on new patterns
//   node .gen/_validate.mjs --all                    # strict gate on the whole catalog
//   node .gen/_validate.mjs --report                 # non-blocking audit of every pattern
//
// Reads dist/ (the real published data), so run `npm run build` first.
// Cross-repo icon/logo checks read the web repo; override its location with
// PATHRULE_WEB=/path/to/pathrule-web (default: ../pathrule-web).
//
// Exit code 0 = gate passed (errors: 0). Exit code 1 = blocked.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const require = createRequire(import.meta.url);

const WEB_ROOT = process.env.PATHRULE_WEB || join(root, "..", "pathrule-web");

// The web renders "<metaTitle> | Pathrule"; src/lib/pattern-metadata.ts REPLACES
// any title whose rendered length falls outside 50..60 with a generic fallback,
// and any description longer than 160 chars. Staying inside these windows is the
// difference between our own copy ranking and a templated string ranking.
const TITLE_SUFFIX = " | Pathrule".length; // 11
const TITLE_MIN = 50 - TITLE_SUFFIX; // 39
const TITLE_MAX = 60 - TITLE_SUFFIX; // 49
const DESC_MAX = 160;
const DESC_MIN = 145;

const COLOR_RE =
  /^bg-[a-z]+-\d{3}\/\d{1,2} text-[a-z]+-\d{3} dark:bg-[a-z]+-\d{3}\/\d{1,2} dark:text-[a-z]+-\d{3}$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ICON_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const BANNED_TEXT = /\b(TODO|TBD|FIXME|lorem ipsum|placeholder text)\b/i;
// Em dash, en dash, and the invisible characters that leak in from LLM output.
const BANNED_CHARS = /[—–​‌‍⁠﻿ ]/;

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith("--only"));
const mode = args.includes("--report") ? "report" : args.includes("--all") ? "all" : "only";
const onlySlugs = onlyArg
  ? (onlyArg.includes("=") ? onlyArg.split("=")[1] : args[args.indexOf(onlyArg) + 1] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

if (mode === "only" && onlySlugs.length === 0) {
  console.error("usage: node .gen/_validate.mjs --only slug-a,slug-b | --all | --report");
  process.exit(2);
}

const distIndex = join(root, "dist", "index.js");
if (!existsSync(distIndex)) {
  console.error("dist/ missing. Run `npm run build` first.");
  process.exit(2);
}
const { getAllPatterns, countByKind } = require(distIndex);
const catalog = getAllPatterns();

const target =
  mode === "only" ? catalog.filter((p) => onlySlugs.includes(p.slug)) : catalog.slice();

if (mode === "only" && target.length !== onlySlugs.length) {
  const found = new Set(target.map((p) => p.slug));
  for (const s of onlySlugs) if (!found.has(s)) console.error(`not in catalog: ${s}`);
  process.exit(2);
}

const errors = [];
const warns = [];
const err = (slug, msg) => errors.push(`${slug}: ${msg}`);
const warn = (slug, msg) => warns.push(`${slug}: ${msg}`);

/* ---------- cross-repo assets (icon name + brand logo registration) -------- */

let iconNames = null;
let logoSlugs = null;
let webNote = null;
try {
  const iconsFile = readFileSync(join(WEB_ROOT, "src", "lib", "pattern-icons.ts"), "utf8");
  // Names appear either quoted ("clipboard-list": X) or bare (database: X).
  const block = iconsFile.slice(
    iconsFile.indexOf("const ICONS"),
    iconsFile.indexOf("export function patternIcon"),
  );
  iconNames = new Set(
    [...block.matchAll(/^\s*(?:"([a-z0-9-]+)"|([a-z0-9-]+))\s*:/gm)].map((m) => m[1] || m[2]),
  );
  const logosFile = readFileSync(join(WEB_ROOT, "scripts", "fetch-pattern-logos.mjs"), "utf8");
  const logoBlock = logosFile.slice(
    logosFile.indexOf("const BRAND_LOGOS"),
    logosFile.indexOf("const sleep"),
  );
  logoSlugs = new Set(
    [...logoBlock.matchAll(/^\s*(?:"([a-z0-9-]+)"|([a-z0-9-]+))\s*:/gm)].map((m) => m[1] || m[2]),
  );
} catch {
  webNote = `web repo not readable at ${WEB_ROOT}; icon/logo registration unchecked (set PATHRULE_WEB)`;
}

/* ---------------------------- per-pattern checks --------------------------- */

const strings = (p) => {
  const out = [
    ["name", p.name],
    ["tagline", p.tagline],
    ["description", p.description],
    ["metaTitle", p.metaTitle],
    ["metaDescription", p.metaDescription],
    ["problem", p.problem],
    ["audience", p.audience],
  ];
  (p.prevents || []).forEach((v, i) => out.push([`prevents[${i}]`, v]));
  (p.changelog || []).forEach((c, i) => out.push([`changelog[${i}].note`, c.note]));
  p.pieces.forEach((pc, i) => {
    out.push([`pieces[${i}].title`, pc.title]);
    out.push([`pieces[${i}].summary`, pc.summary]);
    out.push([`pieces[${i}].body`, pc.body]);
  });
  return out.filter(([, v]) => typeof v === "string");
};

function checkPattern(p) {
  /* identity + freshness */
  if (!SLUG_RE.test(p.slug)) err(p.slug, "slug must be kebab-case");
  if (!SEMVER_RE.test(p.version)) err(p.slug, `version "${p.version}" is not x.y.z`);
  if (!DATE_RE.test(p.updatedAt)) err(p.slug, `updatedAt "${p.updatedAt}" is not YYYY-MM-DD`);
  if (!p.changelog || p.changelog.length === 0) err(p.slug, "changelog is required");
  else {
    const top = p.changelog[0];
    if (top.version !== p.version)
      err(p.slug, `changelog[0].version ${top.version} != version ${p.version}`);
    if (top.date !== p.updatedAt)
      err(p.slug, `changelog[0].date ${top.date} != updatedAt ${p.updatedAt}`);
    const dates = p.changelog.map((c) => c.date);
    if ([...dates].sort().reverse().join() !== dates.join())
      err(p.slug, "changelog must be newest first");
  }

  /* SEO contract: this is what makes the page rank as itself */
  const mt = p.metaTitle.length;
  if (mt < TITLE_MIN || mt > TITLE_MAX)
    err(
      p.slug,
      `metaTitle is ${mt} chars; must be ${TITLE_MIN}..${TITLE_MAX} so "<title> | Pathrule" lands in 50..60 (otherwise the web substitutes a generic title)`,
    );
  const md = p.metaDescription.length;
  if (md > DESC_MAX)
    err(p.slug, `metaDescription is ${md} chars; must be <= ${DESC_MAX} or the web rewrites it`);
  else if (md < DESC_MIN) warn(p.slug, `metaDescription is ${md} chars; ${DESC_MIN}..${DESC_MAX} uses the full snippet`);
  if (p.tagline.length > 110) err(p.slug, `tagline is ${p.tagline.length} chars; keep it under 110`);
  if (!/[.!]$/.test(p.tagline.trim())) warn(p.slug, "tagline should end in a period");
  if (p.description.length < 280)
    err(p.slug, `description is ${p.description.length} chars; write a real intro (280+)`);
  if (!p.problem) err(p.slug, "problem is required (drives the 'Why this pattern' block)");
  if (!p.audience) err(p.slug, "audience is required");
  if (!p.prevents || p.prevents.length < 3)
    err(p.slug, "prevents needs at least 3 concrete mistakes");

  /* text hygiene: the web strips these, so never ship them in source */
  for (const [field, value] of strings(p)) {
    if (BANNED_CHARS.test(value))
      err(p.slug, `${field} contains an em/en dash or invisible character`);
    if (BANNED_TEXT.test(value)) err(p.slug, `${field} contains placeholder text`);
    if (value.trim().length === 0) err(p.slug, `${field} is empty`);
  }

  /* visual identity */
  if (!ICON_RE.test(p.icon)) err(p.slug, `icon "${p.icon}" must be a kebab-case lucide name`);
  if (!COLOR_RE.test(p.color)) err(p.slug, `color "${p.color}" is not the 4-class tile format`);
  if (iconNames && !iconNames.has(p.icon))
    err(p.slug, `icon "${p.icon}" is not registered in pathrule-web src/lib/pattern-icons.ts`);
  if (logoSlugs && !logoSlugs.has(p.slug)) {
    const looksBrand = (p.appliesTo?.packages?.length ?? 0) > 0 || p.category === "Framework";
    if (looksBrand)
      warn(
        p.slug,
        "no brand logo registered in pathrule-web scripts/fetch-pattern-logos.mjs (intended for an abstract lucide glyph?)",
      );
  }

  /* detection metadata */
  const stacks = p.appliesTo?.stacks ?? [];
  if (stacks.length < 2) err(p.slug, "appliesTo.stacks needs at least 2 tags");
  if ((p.appliesTo?.paths ?? []).length < 1) err(p.slug, "appliesTo.paths needs at least 1 path");
  for (const t of stacks)
    if (t !== t.toLowerCase()) err(p.slug, `appliesTo.stacks tag "${t}" must be lowercase`);

  /* bundle: composition, scoping, and per-kind bar */
  const c = countByKind(p);
  const total = p.pieces.length;
  if (total < 2) err(p.slug, "a bundle needs at least 2 pieces");
  if (total > 9) warn(p.slug, `${total} pieces; over 9 usually means two patterns`);

  const nonRootKnowledge = p.pieces.filter((x) => x.kind !== "skill" && x.nodePath !== "/").length;
  const knowledge = c.memory + c.rule;
  if (knowledge > 0 && nonRootKnowledge / knowledge < 0.6)
    err(
      p.slug,
      `${knowledge - nonRootKnowledge}/${knowledge} memories+rules sit at "/"; scope them to the paths they govern`,
    );
  const paths = new Set(p.pieces.map((x) => x.nodePath));
  if (paths.size < 2) err(p.slug, "every piece targets one path; real bundles land on 2+ paths");

  for (const [i, piece] of p.pieces.entries()) {
    const at = `pieces[${i}] (${piece.kind} "${piece.title}")`;
    if (!piece.nodePath.startsWith("/")) err(p.slug, `${at} nodePath must start with /`);
    if (piece.nodePath.length > 1 && piece.nodePath.endsWith("/"))
      err(p.slug, `${at} nodePath must not end with /`);
    // Case is NOT normalised: real projects have real directory names, and some
    // ecosystems capitalise them (Laravel's app/Http, app/Jobs).
    if (/[\\\s]/.test(piece.nodePath)) err(p.slug, `${at} nodePath must be a POSIX path with no spaces`);
    if (piece.summary.length > 200) err(p.slug, `${at} summary over 200 chars`);
    if (piece.summary.length < 40) err(p.slug, `${at} summary under 40 chars`);
    if (piece.body.length < 420) err(p.slug, `${at} body is ${piece.body.length} chars; too thin to be useful`);

    if (piece.kind === "rule") {
      if (!piece.scopeType) err(p.slug, `${at} rule needs scopeType`);
      if (!piece.priority) err(p.slug, `${at} rule needs priority`);
      if (!piece.enforcement) err(p.slug, `${at} rule needs enforcement`);
      if (piece.scopeType === "folder" && piece.nodePath === "/")
        err(p.slug, `${at} scopeType "folder" at root is dishonest scoping`);
      const bullets = (piece.body.match(/^\s*-\s/gm) || []).length;
      if (bullets < 2) err(p.slug, `${at} rule body needs at least 2 concrete bullets`);
    } else if (piece.kind === "skill") {
      if (!piece.body.startsWith("---\n"))
        err(p.slug, `${at} skill body must open with YAML frontmatter`);
      const fm = piece.body.slice(4, piece.body.indexOf("\n---", 4));
      const nameLine = /(^|\n)name:\s*(.+)/.exec(fm);
      if (!nameLine) err(p.slug, `${at} skill frontmatter needs name:`);
      else if (nameLine[2].trim() !== piece.title)
        err(p.slug, `${at} frontmatter name "${nameLine[2].trim()}" != piece title "${piece.title}"`);
      if (!/(^|\n)description:\s*\S/.test(fm))
        err(p.slug, `${at} skill frontmatter needs description:`);
      if (!SLUG_RE.test(piece.title))
        err(p.slug, `${at} skill title must be a kebab-case skill name`);
      if ((piece.skillTags ?? []).length < 3) err(p.slug, `${at} skill needs 3+ skillTags`);
      if (!/^#{1,2}\s/m.test(piece.body)) err(p.slug, `${at} skill body needs a heading`);
    } else {
      if (SLUG_RE.test(piece.title) && piece.title.includes("-"))
        warn(p.slug, `${at} memory title looks like a slug; write it as a sentence`);
    }
  }

  const rules = p.pieces.filter((x) => x.kind === "rule");
  if (rules.length >= 4 && rules.every((r) => r.priority === "high"))
    warn(p.slug, "every rule is priority high; reserve high for bug-causing violations");

  /* cross-links: bundles should route, not float */
  const links = p.pieces.filter((x) => x.kind !== "skill" && /(^|\s)(See|see) [\/a-z]/.test(x.body));
  if (knowledge >= 3 && links.length === 0)
    warn(p.slug, "no piece cross-references another path or pattern; add a 'See ...' router line");
}

for (const p of target) checkPattern(p);

/* ------------------------- catalog-level uniqueness ------------------------ */

const bySlug = new Map();
for (const p of catalog) {
  if (bySlug.has(p.slug)) errors.push(`${p.slug}: duplicate slug in catalog`);
  bySlug.set(p.slug, p);
}

function uniqueness(field, get) {
  const seen = new Map();
  for (const p of catalog) {
    const key = get(p).trim().toLowerCase();
    if (seen.has(key)) {
      const other = seen.get(key);
      if (target.some((t) => t.slug === p.slug || t.slug === other))
        err(p.slug, `${field} is identical to ${other}`);
    } else seen.set(key, p.slug);
  }
}
uniqueness("metaTitle", (p) => p.metaTitle);
uniqueness("metaDescription", (p) => p.metaDescription);
uniqueness("tagline", (p) => p.tagline);
uniqueness("name", (p) => p.name);
// Near-duplicate intros read as templated to a crawler.
const openings = new Map();
for (const p of catalog) {
  const key = p.description.slice(0, 70).toLowerCase();
  if (openings.has(key) && target.some((t) => t.slug === p.slug))
    err(p.slug, `description opens exactly like ${openings.get(key)}`);
  openings.set(key, p.slug);
}

/* --------------------- anti-cookie-cutter (set-level) ---------------------- */

const sig = (p) => {
  const c = countByKind(p);
  return `${c.rule}R/${c.memory}M/${c.skill}S`;
};

if (target.length >= 5) {
  const sigCount = new Map();
  const totals = new Set();
  let noSkill = 0;
  let multiSkill = 0;
  for (const p of target) {
    sigCount.set(sig(p), (sigCount.get(sig(p)) || 0) + 1);
    totals.add(p.pieces.length);
    const c = countByKind(p);
    if (c.skill === 0) noSkill++;
    if (c.skill >= 2) multiSkill++;
  }
  const cap = Math.max(2, Math.ceil(target.length * 0.25));
  for (const [s, n] of sigCount)
    if (n > cap)
      errors.push(
        `set: composition ${s} used ${n} times across ${target.length} patterns (cap ${cap}); compose from each topic, not a template`,
      );
  if (totals.size < Math.min(4, target.length))
    errors.push(`set: only ${totals.size} distinct bundle sizes; vary the total, not just the mix`);
  if (target.length >= 8) {
    if (noSkill === 0)
      errors.push("set: every pattern carries a skill; some topics have no repeatable procedure");
    if (multiSkill === 0)
      warns.push("set: no pattern carries 2+ skills; skill-heavy topics exist (review/checklist)");
  }
}

/* --------------------------------- output --------------------------------- */

const label = mode === "only" ? `${target.length} pattern(s)` : `${target.length} pattern(s) [${mode}]`;
console.log(`\npattern gate: ${label}\n`);
if (webNote) console.log(`note: ${webNote}\n`);

if (mode === "report") {
  const rows = catalog.map((p) => {
    const mtRendered = p.metaTitle.length + TITLE_SUFFIX;
    const flags = [];
    if (mtRendered < 50 || mtRendered > 60) flags.push(`title:${mtRendered}`);
    if (p.metaDescription.length > DESC_MAX) flags.push(`desc:${p.metaDescription.length}`);
    return { slug: p.slug, sig: sig(p), n: p.pieces.length, flags: flags.join(" ") };
  });
  const bad = rows.filter((r) => r.flags);
  console.log(`SEO windows: ${catalog.length - bad.length}/${catalog.length} inside the window`);
  for (const r of bad) console.log(`  rewrite ${r.slug.padEnd(34)} ${r.flags}`);
  const sigs = new Map();
  for (const r of rows) sigs.set(r.sig, (sigs.get(r.sig) || 0) + 1);
  console.log("\ncomposition spread:");
  for (const [s, n] of [...sigs].sort((a, b) => b[1] - a[1]))
    console.log(`  ${s.padEnd(10)} ${n}`);
}

for (const w of warns) console.log(`WARN  ${w}`);
if (warns.length) console.log("");
for (const e of errors) console.log(`FAIL  ${e}`);

console.log(`\n${errors.length} error(s), ${warns.length} warning(s)\n`);
process.exit(errors.length ? 1 : 0);
