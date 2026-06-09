import type { Pattern } from "../types.js";

export const monorepoPnpmTurborepo: Pattern = {
  "slug": "monorepo-pnpm-turborepo",
  "version": "1.0.0",
  "name": "Monorepo (pnpm + Turborepo)",
  "tagline": "Keep a pnpm and Turborepo monorepo fast, cacheable, and boundary-clean.",
  "description": "A pattern bundle for JavaScript and TypeScript monorepos built on pnpm workspaces and Turborepo. It codifies the rules that keep task pipelines deterministic and cacheable, package boundaries explicit, and dependency versions unified. Use it so AI agents and humans both extend the repo without breaking the cache or leaking cross-package imports.",
  "category": "Workflow",
  "icon": "folder-tree",
  "color": "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Monorepo (pnpm + Turborepo) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for pnpm + Turborepo monorepos: cacheable task pipelines, clean package boundaries, catalog-pinned versions, and shared configs for AI agents.",
  "problem": "Monorepo task pipelines silently lose cache hits and packages drift across boundaries as the repo grows.",
  "audience": "Teams running a JavaScript or TypeScript monorepo on pnpm workspaces and Turborepo.",
  "prevents": [
    "Cache misses from unset outputs or env vars left out of a task hash",
    "Cross-package imports that bypass the package's public entry and break boundaries",
    "Duplicate dependency versions because packages pin their own ranges instead of using the catalog"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/apps",
      "/packages",
      "/turbo.json",
      "/pnpm-workspace.yaml"
    ],
    "stacks": [
      "pnpm",
      "turborepo",
      "monorepo",
      "typescript",
      "node"
    ],
    "packages": [
      "turbo",
      "pnpm",
      "@turbo/gen"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/turbo.json",
      "title": "Every task declares outputs, inputs, and env",
      "summary": "A task that omits outputs, inputs, or env hashing will cache wrong results or never hit cache.",
      "body": "Turborepo only caches and replays a task correctly when its hash is complete. Configure each task in `turbo.json` so the hash reflects exactly what the task reads and writes.\n\n- Set `outputs` to every artifact the task produces (for example `[\".next/**\", \"!.next/cache/**\"]` or `[\"dist/**\"]`); a missing `outputs` means nothing is restored from cache.\n- Add build-time `env` and `globalEnv` entries for any variable that changes output, and run with `envMode: \"strict\"` so undeclared vars cannot silently leak into a build.\n- Use `dependsOn: [\"^build\"]` to build upstream packages first, and mark `dev`/`watch` tasks `persistent: true` with `cache: false`.\n- Narrow `inputs` only when you understand the default; the safe default already hashes all tracked files in the package."
    },
    {
      "kind": "rule",
      "nodePath": "/packages",
      "title": "Import packages only through their public entry",
      "summary": "Reaching into another package's src or dist by relative or deep path breaks boundaries and caching.",
      "body": "Internal packages are consumed by their name and `exports` map, never by reaching across folders. This keeps Turborepo Boundaries valid and the dependency graph honest.\n\n- Import a workspace package as `@repo/ui` (resolved via its `package.json` `exports`), never as `../../packages/ui/src/...`.\n- Declare every workspace package you use in that package's `package.json` with `\"@repo/ui\": \"workspace:*\"`; an undeclared import is an implicit dependency Turborepo cannot track.\n- Keep each package's public surface in its `exports` field and avoid deep subpath imports unless they are explicitly exported.\n- Run `turbo boundaries` in CI to catch cross-package imports and undeclared dependencies before merge."
    },
    {
      "kind": "memory",
      "nodePath": "/pnpm-workspace.yaml",
      "title": "Pin shared dependency versions with pnpm catalogs",
      "summary": "Define one version per shared dependency in pnpm-workspace.yaml and reference it with catalog:.",
      "body": "This repo uses pnpm workspaces with catalogs as the single source of truth for shared dependency versions, so every package stays on the same React, TypeScript, and tooling versions.\n\n- `pnpm-workspace.yaml` lists workspace globs under `packages:` (for example `apps/*` and `packages/*`) plus a `catalog:` block and optional named `catalogs:` for version sets.\n- Packages reference shared deps as `\"react\": \"catalog:\"` (default catalog) or `\"catalog:react19\"` for a named one, instead of hard-coding a range.\n- Bump a version in one place in the catalog and run `pnpm install`; pnpm rewrites the resolved lockfile entries across all packages.\n- The content-addressable store hard-links shared deps, so a single committed `pnpm-lock.yaml` keeps installs fast and deterministic."
    },
    {
      "kind": "memory",
      "nodePath": "/packages/config",
      "title": "Share base configs as workspace packages",
      "summary": "TypeScript, ESLint, and Tailwind base configs live in packages and are extended per package.",
      "body": "Tooling configuration is published as internal config packages (for example `@repo/typescript-config`, `@repo/eslint-config`) rather than duplicated or pushed to the repo root. Each app and package extends the base it needs.\n\n- There is intentionally no root `tsconfig.json` for source; each package has its own `tsconfig.json` that does `\"extends\": \"@repo/typescript-config/base.json\"`.\n- ESLint flat config and Tailwind/PostCSS presets are exported from config packages and imported, so a rule change ships once.\n- List the config package as a `devDependency` with `workspace:*` so Turborepo treats a config change as an input and busts the cache.\n- Keep the root `package.json` for workspace scripts and `turbo` only; per-package concerns stay in their own package."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "monorepo-pnpm-turborepo-review",
      "summary": "Checklist to review a pnpm + Turborepo monorepo change before merge.",
      "body": "---\nname: monorepo-pnpm-turborepo-review\ndescription: Review checklist for changes in a pnpm workspaces plus Turborepo monorepo, covering task hashing, caching, package boundaries, catalog-pinned versions, and shared configs. Use before merging any change that touches turbo.json, pnpm-workspace.yaml, package.json files, or cross-package imports.\n---\n\n# Monorepo (pnpm + Turborepo) review\n\n- [ ] Every new or changed `turbo.json` task sets `outputs` covering all produced artifacts (and excludes cache dirs like `!.next/cache/**`).\n- [ ] Build-affecting env vars are declared in the task `env` or `globalEnv`, and `envMode` is `strict`.\n- [ ] `dependsOn` uses `^build` for upstream packages; `dev`/`watch` tasks are `persistent: true` and `cache: false`.\n- [ ] New cross-package usage imports by package name (`@repo/*` via `exports`), never by relative or deep `src`/`dist` paths.\n- [ ] Each used workspace package is declared with `workspace:*` in the consuming package's `package.json`.\n- [ ] `turbo boundaries` and the build pass with a clean dependency graph; no implicit deps.\n- [ ] Shared dependency versions use `catalog:` (or a named catalog) instead of hard-coded ranges.\n- [ ] `pnpm-lock.yaml` is committed and reflects the install; only one version of each shared dep is resolved.\n- [ ] TypeScript, ESLint, and Tailwind extend the shared `@repo/*-config` packages rather than duplicating config.\n- [ ] `packageManager` is pinned in the root `package.json` and matches the pnpm version used in CI.\n",
      "skillTags": [
        "monorepo",
        "pnpm",
        "turborepo",
        "caching",
        "review"
      ]
    }
  ]
};
