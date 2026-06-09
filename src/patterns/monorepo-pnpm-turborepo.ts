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
      "title": "Every Turborepo task declares outputs, inputs, and env",
      "summary": "A task that omits outputs, inputs, or env entries will cache wrong results or never restore from cache.",
      "body": "Turborepo only caches and replays a task correctly when its hash covers everything the task reads and produces. Configure each task so the hash is complete.\n\n- Set `outputs` to every artifact the task produces (for example `[\".next/**\", \"!.next/cache/**\"]` or `[\"dist/**\"]`); a missing `outputs` means cache restores nothing.\n- Add build-time `env` entries for every variable that affects output, and set `envMode: \"strict\"` so undeclared variables cannot silently influence a build and invalidate the hash.\n- Use `dependsOn: [\"^build\"]` to build upstream packages first; mark `dev`/`watch` tasks `persistent: true` and `cache: false`.\n- Enabling Turborepo Remote Cache (`turbo login && turbo link`) shares hits across CI machines and branches; configure `remoteCache: { enabled: true }` in `turbo.json` and use the Vercel Remote Cache or a self-hosted Turborepo Cache Server.",
      "scopeType": "file_type",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/packages",
      "title": "Import workspace packages only through their exported public entry",
      "summary": "Deep or relative imports across packages bypass the exports map and break Turborepo's dependency graph.",
      "body": "Internal packages are consumed by their name and `exports` field, never by reaching across folder boundaries. This keeps the dependency graph honest and Turborepo Boundaries valid.\n\n- Import a workspace package as `@repo/ui` (resolved via its `package.json` `exports`), never as `../../packages/ui/src/...`.\n- Declare every workspace package you use in the consuming package's `package.json` as `\"@repo/ui\": \"workspace:*\"`; an undeclared import is an implicit dependency Turborepo cannot track.\n- Keep each package's public surface in its `exports` field and avoid deep subpath imports unless they are explicitly listed there.\n- Run `turbo boundaries` in CI to catch cross-package violations and undeclared dependencies before merge.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Pin the pnpm version in packageManager and CI",
      "summary": "A mismatched pnpm version between local and CI silently resolves different lockfile entries and breaks reproducibility.",
      "body": "The `packageManager` field and the CI install action must agree on the exact pnpm version so the lockfile is interpreted identically everywhere.\n\n- Set `\"packageManager\": \"pnpm@x.y.z\"` (full semver) in the root `package.json`; this is enforced by Corepack when enabled.\n- Pin the same version in CI: for GitHub Actions, use `pnpm/action-setup` with an explicit `version` matching the `packageManager` field.\n- Commit `pnpm-lock.yaml`; never add it to `.gitignore`.\n- Run `pnpm install --frozen-lockfile` in CI so an out-of-date lockfile fails the build rather than silently resolving.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/pnpm-workspace.yaml",
      "title": "Pin shared dependency versions with pnpm catalogs",
      "summary": "Define one version per shared dependency in pnpm-workspace.yaml and reference it with catalog: in each package.",
      "body": "This repo uses pnpm workspace catalogs as the single source of truth for shared dependency versions, so every package stays on the same React, TypeScript, and tooling versions without manual syncing.\n\n- `pnpm-workspace.yaml` lists workspace globs under `packages:` (for example `apps/*` and `packages/*`) plus a `catalog:` block for the default catalog and optional named `catalogs:` for distinct version sets (for example `catalog:react19`).\n- Packages reference shared deps as `\"react\": \"catalog:\"` (default catalog) or `\"react\": \"catalog:react19\"` for a named one, instead of hard-coding a range in each package.\n- Bump a version in one place in the catalog and run `pnpm install`; pnpm rewrites the resolved lockfile entries across all packages automatically.\n- The content-addressable store hard-links shared deps, so a single `pnpm-lock.yaml` keeps installs deterministic and fast across all machines."
    },
    {
      "kind": "memory",
      "nodePath": "/packages",
      "title": "Share base tooling configs as internal workspace packages",
      "summary": "TypeScript, ESLint, and Tailwind base configs live in dedicated packages and are extended per app or package.",
      "body": "Tooling configuration is published as internal config packages (for example `@repo/typescript-config`, `@repo/eslint-config`) rather than duplicated or pushed to the repo root. Each app and package extends the base it needs.\n\n- There is intentionally no root `tsconfig.json` for source compilation; each package has its own `tsconfig.json` that does `\"extends\": \"@repo/typescript-config/base.json\"`.\n- ESLint flat config and Tailwind/PostCSS presets are exported from config packages and imported so a rule change ships once and busts the cache in all dependents automatically.\n- List the config package as a `devDependency` with `workspace:*` so Turborepo tracks a config change as an input to all consumers.\n- Keep the root `package.json` for workspace-level scripts, the `turbo` binary dep, and `packageManager`; per-package concerns stay inside each package."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "monorepo-pnpm-turborepo-review",
      "summary": "Checklist to review a pnpm + Turborepo monorepo change before merge.",
      "body": "---\nname: monorepo-pnpm-turborepo-review\ndescription: Review checklist for changes in a pnpm workspaces and Turborepo monorepo, covering task hashing and caching, package boundaries, catalog-pinned versions, shared configs, and pnpm version pinning. Use before merging any change that touches turbo.json, pnpm-workspace.yaml, package.json files, or cross-package imports.\n---\n\n# Monorepo (pnpm + Turborepo) review\n\n## Task pipeline and caching\n\n- [ ] Every new or changed `turbo.json` task sets `outputs` covering all produced artifacts and excludes cache dirs (e.g. `!.next/cache/**`).\n- [ ] Build-affecting env vars are declared in the task `env` or `globalEnv`; `envMode` is `strict`.\n- [ ] `dependsOn` uses `^build` for upstream packages; `dev`/`watch` tasks are `persistent: true` and `cache: false`.\n- [ ] Remote cache is configured if the team uses one (`turbo login` run, `remoteCache.enabled: true` in `turbo.json`).\n\n## Package boundaries\n\n- [ ] New cross-package usage imports by package name (`@repo/*` via `exports`), never by relative or deep `src`/`dist` paths.\n- [ ] Each workspace package used is declared with `workspace:*` in the consuming package's `package.json`.\n- [ ] `turbo boundaries` and the build pass with no implicit dependencies.\n\n## Dependencies and versions\n\n- [ ] Shared dependency versions use `catalog:` or a named `catalog:` instead of hard-coded ranges.\n- [ ] `pnpm-lock.yaml` is committed and reflects the current install; only one resolved version of each shared dep.\n- [ ] `packageManager` in the root `package.json` matches the pnpm version pinned in CI (`pnpm/action-setup` `version` field).\n- [ ] CI installs with `--frozen-lockfile`.\n\n## Shared config\n\n- [ ] TypeScript, ESLint, and Tailwind extend the shared `@repo/*-config` packages rather than duplicating config.\n- [ ] Config package changes bust the cache in all downstream packages (listed as `devDependency workspace:*`).\n",
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
