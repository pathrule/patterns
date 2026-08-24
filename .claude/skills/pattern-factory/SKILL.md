---
name: pattern-factory
description: End-to-end autonomous factory for authoring NEW Pathrule Patterns in @pathrule/patterns. Use when asked to add, produce, or batch-generate patterns. Takes an agent from topic selection through narrow web verification, topic-fit composition, the SEO contract that the website actually enforces, brand logo/icon wiring, registration, and a machine gate that must pass before the work is done. No human in the loop: every quality claim is either measured by .gen/_validate.mjs or self-verified against a current source. Pairs with ::pattern-authoring-standard (the bar) and ::pattern-freshness-audit (re-verification); shipping is ::pathrule-release-patterns.
---

# Pattern Factory

`::pattern-authoring-standard` says what a good Pattern *is*. This skill is the
**runnable procedure** that produces one (or fifteen) without asking a human
anything, and proves the result rather than asserting it.

Read both. Where they overlap, the standard wins on judgment and this skill wins
on mechanics.

## The contract of autonomy

You are finished when `node .gen/_validate.mjs --only <slugs>` exits 0 **and**
every version-sensitive claim you wrote has a current source you actually
checked. Until then, keep working: a failing gate is a task, not a question.

Three things you never do without a human:

1. `git push`, `git tag`, or anything that publishes to npm (that is
   `::pathrule-release-patterns`, an owner-gated flow).
2. Edit or delete an existing pattern's content while adding new ones. Additions
   are additive; fixing published content is `::pattern-freshness-audit`.
3. Invent a "close enough" fact. If a claim cannot be verified and cannot be
   written in a version-independent way, cut the claim.

## Repo map

| Thing | Where |
| --- | --- |
| Content model (the only contract) | `src/types.ts` |
| One pattern per file, generated | `src/patterns/<slug>.ts` |
| Catalog + derived helpers, generated | `src/index.ts` |
| Your authoring input | `.gen/<slug>.json` |
| JSON to TS + index generator | `node .gen/_build.mjs` |
| README catalog generator | `node .gen/_readme.mjs` |
| **The machine gate** | `node .gen/_validate.mjs --only <slugs>` |
| Web: brand logos (svgl at build time) | `../pathrule-web/scripts/fetch-pattern-logos.mjs` |
| Web: lucide name registry | `../pathrule-web/src/lib/pattern-icons.ts` |
| Web: SEO rewriter you must satisfy | `../pathrule-web/src/lib/pattern-metadata.ts` |
| Web: per-pattern OG card | `../pathrule-web/src/app/patterns/[slug]/opengraph-image.tsx` |

`PATHRULE_WEB=/path/to/pathrule-web` overrides the web location for the gate.

## Stage 0 — Inventory before ideas

Never propose a topic before you know what is already there. Run:

```sh
npm run build >/dev/null 2>&1
node -e '
const {getAllPatterns,countByKind}=require("./dist/index.js");
for(const p of getAllPatterns()){const c=countByKind(p);
console.log([p.category.padEnd(9),p.slug.padEnd(30),`${c.rule}R/${c.memory}M/${c.skill}S`,"|",(p.appliesTo?.stacks||[]).join(",")].join(" "));}'
node .gen/_validate.mjs --report
```

The report tells you the current composition spread and which pages are outside
the SEO window. Both are inputs to your decisions: do not add a bundle shape
that is already the catalog's most common one, and never copy the metaTitle
style of a page the report says needs a rewrite.

## Stage 1 — Topic selection

Rank candidates by **(real 2026 pain frequency) x (search demand) x (catalog gap)**.
A topic qualifies only if all three hold:

- **Gap**: no existing pattern covers it, and it does not overlap one by more
  than ~25% of its bundle. Adjacent-but-distinct is fine and good
  (`drizzle-orm` next to a Prisma pattern); a second pattern about the same
  advice is not.
- **Pain**: the mistake it prevents is one an AI assistant *actually makes today*
  (stale API, changed default, missing boundary check), not textbook trivia.
- **Demand**: the slug reads like something a human types into a search box.
  `prisma-orm` beats `type-safe-db-access`; `kubernetes-helm` beats
  `container-orchestration-standards`. The slug IS the URL and the token, so it
  is the single most load-bearing SEO decision in the pattern.

Then run the anti-overlap check, out loud, against the Stage 0 inventory: name
the closest existing pattern and one sentence on why the new one is not it.

Ecosystem coverage is a legitimate tiebreaker: a huge developer population with
zero patterns (a language, a framework, a cloud) beats a marginal addition to a
category that already has six.

## Stage 2 — Narrow verification

Cheap by default (`::pattern-authoring-standard` Principle 6):

1. **Draft from knowledge.** For mainstream topics you already know the durable
   advice. Do not spend tokens re-reading docs to write it.
2. **List the version-sensitive claims** before searching: current major, renamed
   config, changed default, removed API, new required step, threshold numbers.
   That list, and only that list, is your search plan.
3. **One `WebSearch` per topic** is the default budget. Read the snippets, not
   the pages.
4. **`WebFetch` only for high-risk specifics** — an exact generator block, an
   exact import path, a threshold you will print as a number. One page, a
   precise prompt.
5. **Prefer official sources** for anything you will state as a fact: docs,
   release notes, upgrade guides. A blog is a signal to check, never the source.
6. **Version-independent phrasing beats a verified version number.** "Every
   database connection goes through a driver adapter" survives the next release;
   "as of 7.3.0" is a liability. Print a version only where the version IS the
   point (a breaking change, a removed API, a threshold).

If a search contradicts what you were going to write, the search wins. If two
sources conflict and neither is official, drop the claim.

## Stage 3 — Composition, designed per topic

The catalog's historic failure is the cookie-cutter: 42 of 43 patterns shipped
with exactly one skill. The gate now enforces spread across a batch, but the
real job is to derive each bundle from its subject:

| The topic is mostly... | Compose it as | Typical total |
| --- | --- | --- |
| Hard constraints, security, money, data loss | rule-heavy (3-5 rules) | 4-7 |
| Conventions, architecture, "how this ecosystem works now" | memory-heavy (3-5 memories) | 4-7 |
| A procedure people repeat (review, audit, migration, incident) | skill-heavy (2-3 skills) | 3-6 |
| A migration with a known before/after | 1-2 rules + 1 memory + 1 skill | 3-4 |
| A broad ecosystem with several distinct sub-surfaces | mixed, 7-9 pieces | 7-9 |
| A tight single-mechanism topic | 2-3 pieces, no filler | 2-3 |

Rules that keep it honest:

- **Some topics get no skill.** If there is no repeatable procedure, adding a
  checklist is padding. The gate fails a batch of 8+ where every pattern has one.
- **Vary the total**, not only the mix. Four different bundle sizes in a batch of
  15 is the floor, not the target.
- **Every piece earns its place.** If you cannot say what breaks without it, cut it.

### Path scoping is the product

Each piece lands on the most specific path it governs. This is what makes a
Pattern a Pattern instead of a pile of markdown:

- Framework conventions to the framework's directory (`/app`, `/src/app`, `/lib`).
- Server/API constraints to `/server`, `/api`, `/app/api`, `/src/api`.
- Infra to `/infra`, `/k8s`, `/terraform`, `/.github/workflows`, `/deploy`.
- Data layer to `/prisma`, `/db`, `/src/db`, `/migrations`, `/models`.
- Mobile to `/ios`, `/android`, `/app`, `/lib` (Flutter), `/src`.
- Only workspace-wide truths go to `/`. Skills usually live at `/`; memories and
  rules usually must not (the gate requires 60% of memories+rules off root, and
  2+ distinct paths per bundle).

Use paths that real projects have. Invented paths (`/my-app/core`) make the
pattern feel generated.

## Stage 4 — Authoring each kind

Voice: direct, specific, second person, present tense. Explain the *why* in one
clause, then the *what* concretely. No marketing, no hedging, no "it is
important to". Name real APIs, flags, files, and numbers. **No em dashes and no
en dashes anywhere** (the gate fails on them, and the web strips them).

**Rule** — a hard constraint, honestly scoped.
- Body: one short paragraph naming the failure mode, then 3-5 bullets that are
  each independently actionable. 500-1800 characters.
- `scopeType`: `folder` when it governs a directory, `file_type` when it governs
  a file kind, `project` when it is workspace-wide. `folder` at `/` is dishonest
  and the gate rejects it.
- `priority: high` **only** when a violation causes a bug, a regression, a
  security hole, or a money/data error. Not every rule in a bundle is high; if
  they all are, none is.
- `enforcement: strict` for true must-nots, `advisory` for strong defaults.

**Memory** — one non-obvious decision or convention, and why it holds here.
- Not a doc summary. The test: could a competent developer who read the official
  docs still get this wrong? If no, it is not a memory.
- One fact per memory. End architecture/convention memories with a router line
  (`See /server for the transaction rule; see the observability pattern for
  tracing.`) so a workspace's knowledge tree links up instead of floating.

**Skill** — a procedure someone repeats.
- `title` is the kebab-case skill name and MUST equal the frontmatter `name`.
- Body opens with `---\nname: ...\ndescription: ...\n---`, then a heading, then
  the actual steps or checklist. Checkboxes for review skills, numbered steps for
  migrations/incidents.
- `skillTags`: 3-6 lowercase tags.
- Write it so it is useful to a human reading it cold, because that is exactly
  how an agent reads it.

**Summaries**: 40-200 characters, one line, says what the piece decides. Not a
restatement of the title.

## Stage 5 — The SEO contract (measured, not vibes)

`../pathrule-web/src/lib/pattern-metadata.ts` **silently replaces** any title or
description that falls outside its windows with a generic template. Missing the
window means your page ranks with boilerplate copy. As of this writing only 3 of
43 pages are inside it, so this is where new patterns win.

| Field | Hard requirement | Why |
| --- | --- | --- |
| `metaTitle` | **39-49 characters** | The web renders `"<metaTitle> \| Pathrule"` and demands a 50-60 rendered length |
| `metaDescription` | **<= 160**, aim 145-160 | Over 160 the web rewrites it; under 145 wastes the snippet |
| `tagline` | < 110 chars, sentence case, ends in a period | Card subtitle, also the OG card line |
| `description` | 280+ chars, real intro | The only long-form copy a crawler and an LLM see |
| `problem` | 1-2 sentences on what agents get wrong | Renders under "Why this pattern" |
| `audience` | Reads after "Built for ..." | Entity/relevance signal |
| `prevents` | 3-5 concrete mistakes | The highest-signal block on the page |
| `appliesTo.stacks` | 2+ lowercase tags | Rendered as tags, used by the browser filter |

Writing them:

- **metaTitle**: lead with the searched term, then intent. `"<Tech> <surface>
  pattern for AI coding agents"` fits the window for most names; drop words from
  the tail (`for AI agents`, `pattern`) to fit, never the tech name. Count the
  characters. Every title must be unique in the catalog.
- **metaDescription**: one sentence naming the concrete things inside the bundle
  (real API names, the actual constraints), then who it is for. Bad: "best
  practices for X". Good: "Server-side deny-by-default authorization,
  parameterized queries, and secure headers, scoped to the paths that enforce
  them." Never open the same way as another pattern's description.
- **description** (page intro): 2-4 sentences. Sentence 1 names the current
  reality (version, default, threshold) so the page reads as maintained.
  Sentence 2 says what the bundle actually contains. Sentence 3 draws the
  boundary against the neighbouring pattern (this is what stops cannibalisation
  and tells a crawler the pages are distinct).
- **Discoverability beyond the title**: the searched term should appear in
  `slug`, `name`, `metaTitle`, `metaDescription`, the first sentence of
  `description`, and at least one piece title. Naturally, not stuffed. Synonyms
  people actually type belong in `appliesTo.stacks` (which renders as tags) and
  in the body, e.g. `k8s` next to `kubernetes`, `nextauth` next to `auth.js`.
- The page auto-emits `TechArticle` + `BreadcrumbList` JSON-LD, a per-pattern OG
  card, a sitemap row keyed on `updatedAt`, and a `/raw` markdown view. You get
  all of that for free, but `updatedAt` must be the real date because it is the
  freshness signal in the sitemap.

## Stage 6 — Visual identity

Never leave a pattern on the silent `Boxes` fallback. Resolution order:

1. **Brand/stack topic → real logo from svgl.app**, downloaded at build time to
   `public/pattern-logos/<slug>.svg`. Find the exact filename first:

   ```sh
   curl -s https://api.svgl.app | python3 -c '
   import json,sys
   for i in json.load(sys.stdin):
       t=i["title"]; r=i["route"]
       if "SEARCH" in t.lower(): print(t, "|", r if isinstance(r,str) else r["light"])'
   ```

   Pick the **light-theme variant** (a dark-coloured mark): it renders on a
   neutral white tile in both themes. Add `"<slug>": "<file>.svg"` to
   `BRAND_LOGOS` in `../pathrule-web/scripts/fetch-pattern-logos.mjs`, then run
   `node scripts/fetch-pattern-logos.mjs` in the web repo (it rewrites
   `src/lib/pattern-logos.ts`). If svgl has no logo for the technology, fall to
   step 2 rather than shipping a wrong mark.
2. **Abstract/workflow topic → a meaningful lucide glyph.** `icon` is a
   kebab-case lucide name and MUST be registered in
   `../pathrule-web/src/lib/pattern-icons.ts` (import + map entry). The gate
   fails an unregistered name. Pick a glyph that depicts the mechanism, and do
   not reuse a glyph another pattern already owns.
3. `color` is always required (it colours the lucide glyph): exactly
   `bg-<hue>-500/10 text-<hue>-600 dark:bg-<hue>-400/15 dark:text-<hue>-400`.
   Choose the hue nearest the technology's brand colour, or by meaning for
   abstract topics (rose/red for security and risk, amber for workflow, emerald
   for data, blue for platform, violet for AI).

`installs` stays `0` (it is a placeholder until real effectiveness scoring).

## Stage 7 — Register, build, gate

Author `.gen/<slug>.json` with the full object (no nulls; omit optional fields
you are not setting):

```json
{
  "slug": "kebab-case-slug",
  "version": "1.0.0",
  "name": "Display Name",
  "tagline": "One sentence, sentence case, ends with a period.",
  "description": "Two to four sentences of real intro.",
  "category": "Framework | Frontend | Backend | Billing | Infra | Workflow | AI | Security",
  "icon": "lucide-name",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "YYYY-MM-DD",
  "changelog": [{ "version": "1.0.0", "date": "YYYY-MM-DD", "note": "First release." }],
  "metaTitle": "39 to 49 characters, unique",
  "metaDescription": "145 to 160 characters, unique, concrete.",
  "problem": "What agents get wrong today.",
  "audience": "Teams that ...",
  "prevents": ["Concrete mistake", "Concrete mistake", "Concrete mistake"],
  "appliesTo": { "paths": ["/src"], "stacks": ["lowercase", "tags"], "packages": ["dep-name"] },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Imperative sentence naming the constraint",
      "summary": "One line, 40 to 200 chars.",
      "body": "Paragraph naming the failure mode.\n\n- Bullet.\n- Bullet.\n- Bullet.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/server",
      "title": "Sentence-case title of the decision",
      "summary": "One line.",
      "body": "Why it holds here, then specifics.\n\nSee /src for the related rule."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "kebab-case-skill-name",
      "summary": "When to run it.",
      "body": "---\nname: kebab-case-skill-name\ndescription: When to run it and what it checks.\n---\n\n# Heading\n\n- [ ] Check.\n",
      "skillTags": ["three", "or", "more"]
    }
  ]
}
```

Then, in order:

```sh
node .gen/_build.mjs                        # JSON -> src/patterns/*.ts + src/index.ts
npm run build                               # tsc; type errors are gate failures
node .gen/_validate.mjs --only <slug,slug>  # the machine gate
node .gen/_readme.mjs                       # regenerate the README catalog
```

`.gen/` is gitignored, so a clone has no authoring JSON. `_build.mjs` therefore
builds `src/index.ts` from the **union** of the JSON it just generated and the
patterns already committed under `src/patterns/`, which means a missing JSON no
longer drops a pattern from the catalog. (It used to: twelve patterns were in
that state until their JSON was restored from `dist/` on 2026-08-24.) Two habits
still matter: write `.gen/<slug>.json` for anything you author so the input
survives on this machine, and always confirm the catalog count after building:

```sh
node -e 'console.log(require("./dist/index.js").getAllPatterns().length)'
```

When the gate reports a failure, fix the content, not the gate. The only
legitimate reason to edit `.gen/_validate.mjs` is that the web's own contract
changed (check `pattern-metadata.ts` before you believe that).

## Stage 8 — Hand-off (do not ship)

Leave the tree clean and the next step explicit:

- New/changed files: `.gen/<slug>.json`, `src/patterns/<slug>.ts`, `src/index.ts`,
  `README.md`, plus the two web files if you wired a logo or icon.
- Report: what you added, the composition and paths of each bundle, what you
  verified and against which source, the gate result, and the exact remaining
  steps (version bump, tag, web dep bump) that belong to
  `::pathrule-release-patterns`.
- Do not bump `package.json` version, tag, or push.

## Batch mode (producing many at once)

For a batch of N:

1. Stage 0 once. Then pick all N topics up front and write the list down with
   category, slug, closest existing pattern, and intended composition. Check the
   whole list for internal overlap before writing any content.
2. **Group by ecosystem** and research per group, not per pattern. One search
   serves several patterns in the same stack.
3. Balance the batch across categories so the catalog's browse page stays
   navigable, and deliberately spread bundle shapes (the gate enforces a 25% cap
   per composition signature, 4+ distinct totals, and at least one skill-free
   pattern in a batch of 8+).
4. Author, build, and gate **incrementally** (every 3-5 patterns) so a systematic
   mistake is caught early instead of 15 times.
5. Final pass: run the gate over the whole batch at once (`--only` with all
   slugs) so the set-level diversity and uniqueness checks apply, then re-read
   the three weakest bundles and ask whether each piece still earns its place.

## Anti-patterns

- The cookie-cutter: same mix, same total, one skill, every time.
- Padding a bundle to look symmetric.
- A metaTitle or metaDescription outside the window (the web replaces it and your
  copy never ships).
- Em dashes, en dashes, invisible characters, "best practices" as the whole idea.
- Memories that restate the official docs; rules with dishonest `high` priority;
  skills with no real procedure.
- Everything scoped to `/`.
- Version numbers sprinkled everywhere for freshness theatre.
- A brand pattern wearing a generic glyph, or an unregistered icon name.
- Editing published patterns while adding new ones.
- Declaring done without the gate exiting 0.

## Definition of Done

Machine-checked (run it; do not assert it):

- [ ] `node .gen/_validate.mjs --only <slugs>` exits 0.
- [ ] `npm run build` is clean and the catalog count is what you expect.
- [ ] `node .gen/_readme.mjs` ran and the README table includes the new rows.
- [ ] Every new brand slug is in `fetch-pattern-logos.mjs` and every new icon
      name is in `pattern-icons.ts`.

Judgment (state your evidence in the report):

- [ ] Each topic is a real 2026 pain with search demand and no catalog overlap.
- [ ] Every version-sensitive claim was checked against a current source, and the
      sources are named.
- [ ] Each bundle's composition and size came from its topic; no filler piece.
- [ ] Paths are ones real projects have, and the knowledge sits off root.
- [ ] The batch is spread across categories and bundle shapes.

See also: `::pattern-authoring-standard` (the quality bar and its rationale),
`::pattern-freshness-audit` (re-verify published patterns), the "Patterns
architecture" memory (repo/web/importer topology), `::pathrule-release-patterns`
(shipping), `::web-design-guidelines` (web UI).
