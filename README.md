<p align="center">
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
  <img src="https://img.shields.io/badge/patterns-43-119e6f" alt="43 patterns">
  <img src="https://img.shields.io/badge/content-first--party-119e6f" alt="First-party content">
</p>

<p align="center">
  Works with <strong>Claude Code</strong>, <strong>Cursor</strong>, <strong>Codex</strong>, <strong>GitHub Copilot</strong>, <strong>Windsurf</strong>, and any MCP client.
</p>

---

A Pattern is not a single skill. It is a small, opinionated bundle of memories, rules, and skills, each pre-scoped to the path it belongs to (for example, a "Server Components by default" rule scoped to `/app`). Add a Pattern and your AI assistant gets the right conventions in the right place, then it evolves with your project.

Everything here is **free and Apache-2.0**. Pathrule only ever charges for the hosted product, never for this content.

## Catalog

**43 patterns across 8 categories.** Each links to its full page; `Bundle` shows the mix of **R**ules, **M**emories, and **S**kills, composed to fit the topic rather than a fixed template.

### Framework

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Astro](https://pathrule.io/patterns/astro) | Ship content-first sites that send almost no JavaScript by default. | 3R · 3M · 1S | `::pathrule:package:astro` |
| [Expo (React Native)](https://pathrule.io/patterns/expo-react-native) | Ship Expo apps with file-based routing, EAS Build, and safe OTA updates. | 3R · 3M · 1S | `::pathrule:package:expo-react-native` |
| [Flutter](https://pathrule.io/patterns/flutter) | Build Flutter apps that stay fast and leak-free with disciplined widgets and clear state boundaries. | 2R · 3M · 1S | `::pathrule:package:flutter` |
| [Next.js App Router](https://pathrule.io/patterns/nextjs-app-router) | Battle-tested conventions for a Next.js App Router codebase, scoped to the paths they belong to. | 4R · 2M · 1S | `::pathrule:package:nextjs-app-router` |
| [Nuxt](https://pathrule.io/patterns/nuxt) | Ship Nuxt 4 apps with correct data fetching, server routes, and SSR-safe code. | 5R · 2M · 1S | `::pathrule:package:nuxt` |
| [React Router 7](https://pathrule.io/patterns/react-router) | Build full-stack React apps with framework mode loaders, actions, and generated route types. | 3R · 2M · 1S | `::pathrule:package:react-router` |
| [SvelteKit](https://pathrule.io/patterns/sveltekit) | Keep server secrets, load data, and mutations correct across SvelteKit 2 and Svelte 5. | 2R · 4M · 1S | `::pathrule:package:sveltekit` |

### Frontend

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Forms with React Hook Form + Zod](https://pathrule.io/patterns/forms-rhf-zod) | Schema-first, type-safe forms with shared client and server validation. | 3R · 1M · 1S | `::pathrule:package:forms-rhf-zod` |
| [React + TypeScript](https://pathrule.io/patterns/react-typescript) | Pragmatic React and TypeScript conventions: typed props, accessible UI, and predictable hooks. | 2R · 3M · 1S | `::pathrule:package:react-typescript` |
| [TypeScript Strict](https://pathrule.io/patterns/typescript-strict) | Make the compiler do the work: no any, no escape hatches, types that model reality. | 4R · 1M · 1S | `::pathrule:package:typescript-strict` |
| [shadcn/ui](https://pathrule.io/patterns/shadcn-ui) | Own your component code and theme it with CSS variables instead of installing a black-box UI library. | 2R · 3M · 1S | `::pathrule:package:shadcn-ui` |
| [Tailwind CSS](https://pathrule.io/patterns/tailwind-css) | Keep Tailwind v4 utility code clean, token-driven, and free of arbitrary-value sprawl. | 2R · 3M · 1S | `::pathrule:package:tailwind-css` |
| [TanStack Query](https://pathrule.io/patterns/tanstack-query) | Treat the server as the source of truth and let the cache do the work. | 2R · 3M · 1S | `::pathrule:package:tanstack-query` |
| [Web Accessibility](https://pathrule.io/patterns/web-accessibility) | Ship interfaces that work for keyboard, screen reader, and low-vision users by default. | 3R · 2M · 1S | `::pathrule:package:web-accessibility` |

### Backend

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Auth (Sessions, JWT, OAuth)](https://pathrule.io/patterns/auth-sessions-jwt-oauth) | Build authentication that resists XSS, CSRF, and token replay by default. | 4R · 1M · 1S | `::pathrule:package:auth-sessions-jwt-oauth` |
| [Background Jobs & Queues](https://pathrule.io/patterns/background-jobs-queues) | Make every queued job safe to run twice so retries heal instead of corrupt. | 2R · 3M · 1S | `::pathrule:package:background-jobs-queues` |
| [Drizzle ORM](https://pathrule.io/patterns/drizzle-orm) | Keep your TypeScript schema, migrations, and typed queries honest with Drizzle. | 2R · 3M · 1S | `::pathrule:package:drizzle-orm` |
| [Node + TypeScript API (Hono)](https://pathrule.io/patterns/node-ts-api-hono) | Build type-safe Hono APIs with chained routes, schema validation, and a typed RPC client. | 3R · 3M · 1S | `::pathrule:package:node-ts-api-hono` |
| [PostgreSQL Schema & Migrations](https://pathrule.io/patterns/postgres-schema) | Design normalized PostgreSQL schemas and ship lock-safe, forward-only migrations. | 3R · 2M · 1S | `::pathrule:package:postgres-schema` |
| [REST / HTTP API Design](https://pathrule.io/patterns/rest-api-design) | Design HTTP APIs that stay predictable, safe to retry, and easy to evolve. | 2R · 3M · 1S | `::pathrule:package:rest-api-design` |
| [Supabase + RLS](https://pathrule.io/patterns/supabase-rls) | Row Level Security done right: deny by default, user JWT only, and a clean migration workflow. | 3R · 3M · 1S | `::pathrule:package:supabase-rls` |
| [FastAPI (Python)](https://pathrule.io/patterns/fastapi) | Build type-safe async Python APIs with Pydantic validation and dependency injection. | 4R · 2M · 1S | `::pathrule:package:fastapi` |
| [Go API (Gin / Echo)](https://pathrule.io/patterns/go-api) | Build idiomatic Go HTTP services with honest errors, context propagation, and validated input. | 3R · 2M · 1S | `::pathrule:package:go-api` |
| [Redis Caching](https://pathrule.io/patterns/redis-caching) | Cache with Redis so reads get faster without serving stale or inconsistent data. | 2R · 3M · 1S | `::pathrule:package:redis-caching` |

### Billing

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Stripe Billing](https://pathrule.io/patterns/stripe-billing) | Safe Stripe integration: verified webhooks, idempotent handlers, and the right API for the job. | 4R · 4M · 1S | `::pathrule:package:stripe-billing` |
| [Subscriptions & Usage Billing](https://pathrule.io/patterns/subscriptions-usage-billing) | Ship metered subscriptions on Stripe Billing without dropping usage or double-charging customers. | 3R · 2M · 1S | `::pathrule:package:subscriptions-usage-billing` |

### Infra

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Docker & Containers](https://pathrule.io/patterns/docker-containers) | Ship small, secure, cache-friendly container images by default. | 2R · 2M · 1S | `::pathrule:package:docker-containers` |
| [GitHub Actions CI/CD](https://pathrule.io/patterns/github-actions-cicd) | Build hardened, fast, OIDC-deployed GitHub Actions pipelines that AI agents keep secure by default. | 3R · 1M · 1S | `::pathrule:package:github-actions-cicd` |
| [Observability](https://pathrule.io/patterns/observability) | Emit correlated logs, metrics, and traces that make incidents debuggable. | 2R · 2M · 1S | `::pathrule:package:observability` |
| [Secrets & Environment Management](https://pathrule.io/patterns/secrets-env-management) | Keep secrets out of git, inject them at runtime, and rotate them automatically. | 3R · 2M · 1S | `::pathrule:package:secrets-env-management` |
| [Terraform / IaC](https://pathrule.io/patterns/terraform-iac) | Ship Terraform with locked remote state, pinned versions, and a plan-gated CI pipeline. | 3R · 3M · 1S | `::pathrule:package:terraform-iac` |
| [Vercel Deployment](https://pathrule.io/patterns/vercel-deploy) | Ship to Vercel with safe previews, scoped env vars, and instant rollbacks. | 2R · 3M · 1S | `::pathrule:package:vercel-deploy` |

### Workflow

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Code Review](https://pathrule.io/patterns/code-review) | Ship small pull requests that reviewers can approve fast with confidence. | 3R · 1M · 1S | `::pathrule:package:code-review` |
| [Git & Conventional Commits](https://pathrule.io/patterns/git-conventional-commits) | Keep history readable and releases automatic with small commits and Conventional Commits. | 2R · 1M · 1S | `::pathrule:package:git-conventional-commits` |
| [Monorepo (pnpm + Turborepo)](https://pathrule.io/patterns/monorepo-pnpm-turborepo) | Keep a pnpm and Turborepo monorepo fast, cacheable, and boundary-clean. | 3R · 2M · 1S | `::pathrule:package:monorepo-pnpm-turborepo` |
| [Testing (Vitest + Playwright)](https://pathrule.io/patterns/testing-vitest-playwright) | Unit test behavior with Vitest, drive real user flows with Playwright, and keep both green in CI. | 3R · 2M · 1S | `::pathrule:package:testing-vitest-playwright` |
| [Modern Python Tooling (uv + Ruff)](https://pathrule.io/patterns/python-tooling) | Set up Python projects the 2026 way: one fast tool for envs and deps, one for lint and format. | 2R · 2M · 1S | `::pathrule:package:python-tooling` |

### AI

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [AI SDK (Vercel AI SDK)](https://pathrule.io/patterns/ai-sdk) | Build streaming, tool-calling LLM features with one typed API across every provider. | 3R · 2M · 1S | `::pathrule:package:ai-sdk` |
| [RAG & Embeddings](https://pathrule.io/patterns/rag-embeddings) | Ground LLM answers in your own data with retrieval that returns the right chunks, not just similar ones. | 2R · 3M · 1S | `::pathrule:package:rag-embeddings` |
| [MCP Server Authoring](https://pathrule.io/patterns/mcp-server-authoring) | Build Model Context Protocol servers whose tools an LLM can actually call correctly and safely. | 3R · 1M · 1S | `::pathrule:package:mcp-server-authoring` |
| [LLM Evaluations & Testing](https://pathrule.io/patterns/llm-evals) | Catch hallucinations and quality regressions before users do, with evals on every prompt change. | 1R · 2M · 2S | `::pathrule:package:llm-evals` |

### Security

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Software Supply Chain Security](https://pathrule.io/patterns/supply-chain-security) | Stop a poisoned dependency from running in your build, CI, and production. | 4R · 1M · 1S | `::pathrule:package:supply-chain-security` |
| [Web Security (OWASP)](https://pathrule.io/patterns/web-security) | Build web apps that deny by default, distrust every input, and ship secure headers. | 3R · 2M · 1S | `::pathrule:package:web-security` |

## What is a Pattern

Each Pattern declares its pieces with a `kind` (`memory` | `rule` | `skill`), the target `nodePath`, and the full content body:

- **Memories** capture decisions and conventions ("how we do X here").
- **Rules** are constraints your agent should respect (with scope, priority, and advisory or strict enforcement).
- **Skills** are reusable checklists or procedures.

The bundle for each pattern is composed from its actual subject: rule-heavy for constraint and security topics, memory-heavy for conventions and architecture, skill-heavy for review and checklist topics. No two need to look alike.

## Using a Pattern

Browse the catalog at **[pathrule.io/patterns](https://pathrule.io/patterns)**.

- **One-click import**: paste a reference token into your AI assistant and Pathrule places each piece at the right path in your workspace.
  ```
  ::pathrule:package:nextjs-app-router
  ```
- **Manual copy**: copy the full bundle from a Pattern page and paste the pieces where you want them.

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
