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
  <img src="https://img.shields.io/badge/patterns-150-119e6f" alt="150 patterns">
  <img src="https://img.shields.io/badge/content-first--party-119e6f" alt="First-party content">
</p>

<p align="center">
  Works with <strong>Claude Code</strong>, <strong>Cursor</strong>, <strong>Codex</strong>, <strong>GitHub Copilot</strong>, <strong>Windsurf</strong>, and any MCP client.
</p>

---

A Pattern is not a single skill. It is a small, opinionated bundle of memories, rules, and skills, each pre-scoped to the path it belongs to (for example, a "Server Components by default" rule scoped to `/app`). Add a Pattern and your AI assistant gets the right conventions in the right place, then it evolves with your project.

Everything here is **free and Apache-2.0**. Pathrule only ever charges for the hosted product, never for this content.

## Catalog

**150 patterns across 8 categories.** Each links to its full page; `Bundle` shows the mix of **R**ules, **M**emories, and **S**kills, composed to fit the topic rather than a fixed template.

### Framework

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Android with Jetpack Compose](https://pathrule.io/patterns/android-jetpack-compose) | Model Android UI state, effects, navigation, persistence, and background work across real lifecycles. | 2R · 3M · 1S | `::pathrule:package:android-jetpack-compose` |
| [Angular](https://pathrule.io/patterns/angular) | Write signal-first, zoneless Angular with standalone components and no manual subscriptions. | 4R · 2M | `::pathrule:package:angular` |
| [ASP.NET Core](https://pathrule.io/patterns/aspnet-core) | Build ASP.NET Core services with ordered middleware, validated options, safe lifetimes, and clear boundaries. | 3R · 4M · 1S | `::pathrule:package:aspnet-core` |
| [Astro](https://pathrule.io/patterns/astro) | Ship content-first sites that send almost no JavaScript by default. | 3R · 3M · 1S | `::pathrule:package:astro` |
| [Django](https://pathrule.io/patterns/django) | Write Django apps with a query-efficient ORM, safe settings, and async views that do not block. | 3R · 3M · 1S | `::pathrule:package:django` |
| [Electron Desktop Applications](https://pathrule.io/patterns/electron-desktop) | Harden Electron process boundaries, IPC contracts, navigation, permissions, updates, and local data. | 3R · 2M · 1S | `::pathrule:package:electron-desktop` |
| [Expo (React Native)](https://pathrule.io/patterns/expo-react-native) | Ship Expo apps with file-based routing, EAS Build, and safe OTA updates. | 3R · 3M · 1S | `::pathrule:package:expo-react-native` |
| [Express.js Production APIs](https://pathrule.io/patterns/express-js) | Make middleware order, proxy trust, asynchronous failures, and shutdown behavior explicit. | 3R · 2M · 1S | `::pathrule:package:express-js` |
| [Firebase and Firestore Production](https://pathrule.io/patterns/firebase-firestore) | Design Firestore rules, indexes, offline writes, and server authority as one data contract. | 3R · 2M · 1S | `::pathrule:package:firebase-firestore` |
| [Flask Production Applications](https://pathrule.io/patterns/flask) | Keep Flask application state, request context, extensions, and deployment boundaries explicit. | 2R · 2M | `::pathrule:package:flask` |
| [Flutter](https://pathrule.io/patterns/flutter) | Build Flutter apps that stay fast and leak-free with disciplined widgets and clear state boundaries. | 2R · 3M · 1S | `::pathrule:package:flutter` |
| [Laravel](https://pathrule.io/patterns/laravel) | Build Laravel apps with lean Eloquent queries, validated requests, and queued work that retries safely. | 3R · 2M · 1S | `::pathrule:package:laravel` |
| [NestJS Production Architecture](https://pathrule.io/patterns/nestjs) | Control provider scope, module ownership, validation, and transport-independent application logic. | 2R · 3M · 1S | `::pathrule:package:nestjs` |
| [Next.js App Router](https://pathrule.io/patterns/nextjs-app-router) | Battle-tested conventions for a Next.js App Router codebase, scoped to the paths they belong to. | 4R · 2M · 1S | `::pathrule:package:nextjs-app-router` |
| [Nuxt](https://pathrule.io/patterns/nuxt) | Ship Nuxt 4 apps with correct data fetching, server routes, and SSR-safe code. | 5R · 2M · 1S | `::pathrule:package:nuxt` |
| [React Router 7](https://pathrule.io/patterns/react-router) | Build full-stack React apps with framework mode loaders, actions, and generated route types. | 3R · 2M · 1S | `::pathrule:package:react-router` |
| [Ruby on Rails](https://pathrule.io/patterns/rails) | Work with Rails 8 as it ships today: the Solid stack, Hotwire views, and queries that do not multiply. | 2R · 5M | `::pathrule:package:rails` |
| [Spring Boot](https://pathrule.io/patterns/spring-boot) | Keep controllers thin, configuration typed, transactions explicit, and tests aligned with application slices. | 2R · 3M · 1S | `::pathrule:package:spring-boot` |
| [SvelteKit](https://pathrule.io/patterns/sveltekit) | Keep server secrets, load data, and mutations correct across SvelteKit 2 and Svelte 5. | 2R · 4M · 1S | `::pathrule:package:sveltekit` |
| [SwiftUI](https://pathrule.io/patterns/swiftui) | Build SwiftUI apps that compile under Swift 6 strict concurrency and keep state in one owner. | 4R · 2M · 1S | `::pathrule:package:swiftui` |
| [Unity Game Development](https://pathrule.io/patterns/unity-game-development) | Control frame-loop work, object lifetimes, physics timing, asset loading, and saved game state. | 2R · 2M · 1S | `::pathrule:package:unity-game-development` |
| [Vue 3 Production Patterns](https://pathrule.io/patterns/vue-3) | Keep Vue reactivity explicit, composables bounded, and server-rendered output deterministic. | 2R · 3M · 1S | `::pathrule:package:vue-3` |
| [WordPress Plugin and Theme Development](https://pathrule.io/patterns/wordpress-development) | Keep WordPress hooks, capabilities, data access, rendering, and updates safe across releases. | 3R · 2M · 2S | `::pathrule:package:wordpress-development` |

### Frontend

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Browser Storage and IndexedDB](https://pathrule.io/patterns/browser-storage-indexeddb) | Own browser persistence schemas, quotas, migrations, cross-tab coordination, privacy, and recovery. | 3R · 2M | `::pathrule:package:browser-storage-indexeddb` |
| [Client State Management](https://pathrule.io/patterns/client-state-management) | Give URL, form, local, shared, and server state one owner each and derive everything else. | 1R · 2M | `::pathrule:package:client-state-management` |
| [Core Web Vitals](https://pathrule.io/patterns/core-web-vitals) | Hit LCP under 2.5 seconds, INP under 200 milliseconds, and CLS under 0.1 on real traffic. | 2R · 2M · 2S | `::pathrule:package:core-web-vitals` |
| [Data Tables and Grids](https://pathrule.io/patterns/data-tables-grids) | Keep query state, row identity, virtualization, selection, editing, and keyboard semantics coherent. | 3R · 1M · 1S | `::pathrule:package:data-tables-grids` |
| [Dates, Time Zones, and Calendars](https://pathrule.io/patterns/dates-timezones-calendars) | Model instants, local dates, wall-clock schedules, zones, and calendar rules as distinct types. | 2R · 3M · 1S | `::pathrule:package:dates-timezones-calendars` |
| [Design Systems with Storybook](https://pathrule.io/patterns/design-systems-storybook) | Turn component contracts into documented states, interaction evidence, accessibility checks, and releases. | 1R · 1M · 2S | `::pathrule:package:design-systems-storybook` |
| [Forms with React Hook Form + Zod](https://pathrule.io/patterns/forms-rhf-zod) | Schema-first, type-safe forms with shared client and server validation. | 3R · 1M · 1S | `::pathrule:package:forms-rhf-zod` |
| [Internationalization and Localization](https://pathrule.io/patterns/internationalization-localization) | Make locale, messages, formatting, direction, routes, and layout behavior explicit product contracts. | 2R · 2M · 1S | `::pathrule:package:internationalization-localization` |
| [PWA and Offline-First Service Workers](https://pathrule.io/patterns/pwa-service-workers) | Control service-worker updates, cache versions, offline mutations, navigation, and recovery. | 2R · 2M · 1S | `::pathrule:package:pwa-service-workers` |
| [React + TypeScript](https://pathrule.io/patterns/react-typescript) | Pragmatic React and TypeScript conventions: typed props, accessible UI, and predictable hooks. | 2R · 3M · 1S | `::pathrule:package:react-typescript` |
| [Real-Time UI with WebSockets](https://pathrule.io/patterns/websocket-realtime-ui) | Design WebSocket identity, ordering, reconnect, backpressure, presence, and resynchronization. | 3R · 2M · 1S | `::pathrule:package:websocket-realtime-ui` |
| [Responsive CSS Layouts](https://pathrule.io/patterns/responsive-css-layouts) | Build intrinsic layouts that survive narrow containers, long content, zoom, and localization. | 2R · 1M · 1S | `::pathrule:package:responsive-css-layouts` |
| [shadcn/ui](https://pathrule.io/patterns/shadcn-ui) | Own your component code and theme it with CSS variables instead of installing a black-box UI library. | 2R · 3M · 1S | `::pathrule:package:shadcn-ui` |
| [SSR Hydration and Server-Client Consistency](https://pathrule.io/patterns/ssr-hydration) | Keep server HTML, initial client state, identifiers, and browser-only behavior deterministic. | 2R · 3M · 1S | `::pathrule:package:ssr-hydration` |
| [Tailwind CSS](https://pathrule.io/patterns/tailwind-css) | Keep Tailwind v4 utility code clean, token-driven, and free of arbitrary-value sprawl. | 2R · 3M · 1S | `::pathrule:package:tailwind-css` |
| [TanStack Query](https://pathrule.io/patterns/tanstack-query) | Treat the server as the source of truth and let the cache do the work. | 2R · 3M · 1S | `::pathrule:package:tanstack-query` |
| [Technical SEO and Structured Data](https://pathrule.io/patterns/technical-seo-structured-data) | Make crawlability, canonical identity, metadata, structured data, and rendering testable per page. | 2R · 2M | `::pathrule:package:technical-seo-structured-data` |
| [TypeScript Strict](https://pathrule.io/patterns/typescript-strict) | Make the compiler do the work: no any, no escape hatches, types that model reality. | 4R · 1M · 1S | `::pathrule:package:typescript-strict` |
| [Web Accessibility](https://pathrule.io/patterns/web-accessibility) | Ship interfaces that work for keyboard, screen reader, and low-vision users by default. | 3R · 2M · 1S | `::pathrule:package:web-accessibility` |
| [Web Animation and Motion](https://pathrule.io/patterns/web-animation-motion) | Use motion to explain state change while keeping interaction interruptible, accessible, and fast. | 2R · 2M | `::pathrule:package:web-animation-motion` |

### Backend

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Apache Airflow Data Workflows](https://pathrule.io/patterns/apache-airflow) | Design Airflow DAGs around data intervals, idempotent tasks, backfills, retries, and observable datasets. | 2R · 2M · 2S | `::pathrule:package:apache-airflow` |
| [Apache Spark Data Processing](https://pathrule.io/patterns/apache-spark) | Control Spark partitioning, shuffles, skew, schemas, retries, and output commits at data scale. | 2R · 2M · 1S | `::pathrule:package:apache-spark` |
| [Auth (Sessions, JWT, OAuth)](https://pathrule.io/patterns/auth-sessions-jwt-oauth) | Build authentication that resists XSS, CSRF, and token replay by default. | 4R · 1M · 1S | `::pathrule:package:auth-sessions-jwt-oauth` |
| [Background Jobs & Queues](https://pathrule.io/patterns/background-jobs-queues) | Make every queued job safe to run twice so retries heal instead of corrupt. | 2R · 3M · 1S | `::pathrule:package:background-jobs-queues` |
| [Database Connections, Pooling, and Capacity](https://pathrule.io/patterns/database-connection-pooling) | Budget database connections across replicas, workers, transactions, queues, and failure recovery. | 3R · 2M · 1S | `::pathrule:package:database-connection-pooling` |
| [Database Transactions, Deadlocks, and Concurrency](https://pathrule.io/patterns/database-transactions-deadlocks) | Protect database invariants with explicit isolation, locking order, retries, idempotency, and evidence. | 4R · 2M · 1S | `::pathrule:package:database-transactions-deadlocks` |
| [Drizzle ORM](https://pathrule.io/patterns/drizzle-orm) | Keep your TypeScript schema, migrations, and typed queries honest with Drizzle. | 2R · 3M · 1S | `::pathrule:package:drizzle-orm` |
| [Elasticsearch and OpenSearch](https://pathrule.io/patterns/elasticsearch-opensearch) | Design mappings, analyzers, queries, shards, aliases, and reindexing around search behavior. | 3R · 3M · 1S | `::pathrule:package:elasticsearch-opensearch` |
| [Email Delivery and SMTP](https://pathrule.io/patterns/email-delivery-smtp) | Treat email as an authenticated, asynchronous delivery system with feedback and privacy boundaries. | 3R · 2M · 2S | `::pathrule:package:email-delivery-smtp` |
| [FastAPI (Python)](https://pathrule.io/patterns/fastapi) | Build type-safe async Python APIs with Pydantic validation and dependency injection. | 4R · 2M · 1S | `::pathrule:package:fastapi` |
| [File Uploads and Object Storage](https://pathrule.io/patterns/file-uploads-object-storage) | Treat uploads as untrusted objects with bounded transfer, quarantine, validation, and authorized delivery. | 3R · 1M · 1S | `::pathrule:package:file-uploads-object-storage` |
| [Go API (Gin / Echo)](https://pathrule.io/patterns/go-api) | Build idiomatic Go HTTP services with honest errors, context propagation, and validated input. | 3R · 2M · 1S | `::pathrule:package:go-api` |
| [GraphQL API](https://pathrule.io/patterns/graphql-api) | Ship a GraphQL API that batches its queries, authorizes per field, and cannot be walked by a stranger. | 4R · 1M · 1S | `::pathrule:package:graphql-api` |
| [gRPC and Protocol Buffers](https://pathrule.io/patterns/grpc-protobuf) | Evolve Protobuf contracts with deadlines, status semantics, streaming backpressure, and compatibility. | 3R · 3M · 1S | `::pathrule:package:grpc-protobuf` |
| [Kafka Event-Driven Services](https://pathrule.io/patterns/kafka-event-driven) | Produce and consume Kafka events with keys that preserve order and handlers that survive redelivery. | 3R · 2M · 2S | `::pathrule:package:kafka-event-driven` |
| [MongoDB + Mongoose](https://pathrule.io/patterns/mongodb-mongoose) | Model MongoDB documents around the queries you run, then keep those queries indexed and lean. | 2R · 3M · 1S | `::pathrule:package:mongodb-mongoose` |
| [Multi-Tenant SaaS](https://pathrule.io/patterns/multi-tenancy) | Make cross-tenant data leaks structurally impossible instead of relying on every query being careful. | 4R · 2M · 1S | `::pathrule:package:multi-tenancy` |
| [Node + TypeScript API (Hono)](https://pathrule.io/patterns/node-ts-api-hono) | Build type-safe Hono APIs with chained routes, schema validation, and a typed RPC client. | 3R · 3M · 1S | `::pathrule:package:node-ts-api-hono` |
| [Pandas and DataFrame Pipelines](https://pathrule.io/patterns/pandas-dataframes) | Make DataFrame schemas, missing values, joins, mutation, memory, and reproducibility explicit. | 2R · 3M · 1S | `::pathrule:package:pandas-dataframes` |
| [PostgreSQL Schema & Migrations](https://pathrule.io/patterns/postgres-schema) | Design normalized PostgreSQL schemas and ship lock-safe, forward-only migrations. | 3R · 2M · 1S | `::pathrule:package:postgres-schema` |
| [Prisma ORM](https://pathrule.io/patterns/prisma-orm) | Use Prisma 7 as it actually ships: generated client, driver adapters, and one instance per process. | 3R · 1M · 1S | `::pathrule:package:prisma-orm` |
| [RabbitMQ Messaging](https://pathrule.io/patterns/rabbitmq-messaging) | Design RabbitMQ routing, acknowledgements, publisher confirms, retries, dead letters, and flow control. | 3R · 2M · 1S | `::pathrule:package:rabbitmq-messaging` |
| [Redis Caching](https://pathrule.io/patterns/redis-caching) | Cache with Redis so reads get faster without serving stale or inconsistent data. | 2R · 3M · 1S | `::pathrule:package:redis-caching` |
| [REST / HTTP API Design](https://pathrule.io/patterns/rest-api-design) | Design HTTP APIs that stay predictable, safe to retry, and easy to evolve. | 2R · 3M · 1S | `::pathrule:package:rest-api-design` |
| [SQL Query Performance and Indexing](https://pathrule.io/patterns/sql-query-performance) | Tune SQL from measured plans, realistic data, deliberate indexes, and bounded result shapes. | 3R · 2M · 1S | `::pathrule:package:sql-query-performance` |
| [SQLite in Production](https://pathrule.io/patterns/sqlite-production) | Operate SQLite with explicit transactions, WAL behavior, connection ownership, migrations, and backups. | 3R · 2M | `::pathrule:package:sqlite-production` |
| [Supabase + RLS](https://pathrule.io/patterns/supabase-rls) | Row Level Security done right: deny by default, user JWT only, and a clean migration workflow. | 3R · 3M · 1S | `::pathrule:package:supabase-rls` |

### Billing

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [B2B Billing and Net Terms](https://pathrule.io/patterns/b2b-billing-net-terms) | Connect purchase orders, approvals, due dates, partial payments, and collections in one receivable flow. | 2R · 2M · 1S | `::pathrule:package:b2b-billing-net-terms` |
| [Dunning and Churn Recovery](https://pathrule.io/patterns/dunning-churn-recovery) | Recover failed payments with stateful retries, clear customer action, and safe access transitions. | 1R · 1M · 2S | `::pathrule:package:dunning-churn-recovery` |
| [E-commerce Cart and Checkout](https://pathrule.io/patterns/ecommerce-cart-checkout) | Keep catalog, cart, price, inventory, order, payment, and fulfillment state consistent. | 4R · 2M · 1S | `::pathrule:package:ecommerce-cart-checkout` |
| [Invoicing and Tax](https://pathrule.io/patterns/invoicing-tax) | Keep invoice facts immutable, tax evidence traceable, and corrections auditable across providers. | 2R · 1M · 1S | `::pathrule:package:invoicing-tax` |
| [Marketplace Payments and Payouts](https://pathrule.io/patterns/marketplace-payouts) | Keep charges, fees, seller balances, refunds, disputes, and payouts in one auditable ledger. | 3R · 2M · 1S | `::pathrule:package:marketplace-payouts` |
| [Multi-Currency Payments](https://pathrule.io/patterns/multi-currency-payments) | Keep presentment, settlement, ledger, and reporting currencies explicit through every money movement. | 2R · 2M | `::pathrule:package:multi-currency-payments` |
| [Paddle Billing](https://pathrule.io/patterns/paddle-billing) | Treat Paddle transactions and webhooks as evidence while your application owns access state. | 3R · 2M · 1S | `::pathrule:package:paddle-billing` |
| [Payment Authentication with 3DS and SCA](https://pathrule.io/patterns/payment-3ds-sca) | Model payment authentication as a resumable server-owned state machine, not a browser callback. | 4R · 2M · 1S | `::pathrule:package:payment-3ds-sca` |
| [Payment Reconciliation Ledger](https://pathrule.io/patterns/payment-reconciliation-ledger) | Close the gap between internal orders, provider balances, bank payouts, fees, refunds, and disputes. | 2R · 3M · 2S | `::pathrule:package:payment-reconciliation-ledger` |
| [Pricing and Plan Modeling](https://pathrule.io/patterns/pricing-plan-modeling) | Model products, prices, entitlements, and commercial terms without scattering plan-name checks. | 1R · 2M | `::pathrule:package:pricing-plan-modeling` |
| [Refunds, Chargebacks, and Disputes](https://pathrule.io/patterns/refunds-chargebacks-disputes) | Model every payment reversal as an auditable state transition with deadlines, evidence, and ledger impact. | 3R · 3M · 2S | `::pathrule:package:refunds-chargebacks-disputes` |
| [Stripe Billing](https://pathrule.io/patterns/stripe-billing) | Safe Stripe integration: verified webhooks, idempotent handlers, and the right API for the job. | 4R · 4M · 1S | `::pathrule:package:stripe-billing` |
| [Subscriptions & Usage Billing](https://pathrule.io/patterns/subscriptions-usage-billing) | Ship metered subscriptions on Stripe Billing without dropping usage or double-charging customers. | 3R · 2M · 1S | `::pathrule:package:subscriptions-usage-billing` |

### Infra

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [AWS ECS and Fargate](https://pathrule.io/patterns/aws-ecs-fargate) | Operate ECS services with bounded tasks, IAM roles, networking, health, deployment, and Fargate capacity. | 2R · 3M · 1S | `::pathrule:package:aws-ecs-fargate` |
| [AWS Lambda](https://pathrule.io/patterns/aws-lambda) | Write Lambda handlers that reuse their init work, retry safely, and do not exhaust the database. | 3R · 2M · 1S | `::pathrule:package:aws-lambda` |
| [Azure Functions Production Patterns](https://pathrule.io/patterns/azure-functions) | Design Azure Functions around trigger semantics, bindings, idempotency, configuration, and scaling. | 2R · 2M | `::pathrule:package:azure-functions` |
| [Backup and Disaster Recovery](https://pathrule.io/patterns/backup-disaster-recovery) | Define recovery objectives, isolate backups, prove restores, and rehearse service recovery under pressure. | 3R · 1M · 2S | `::pathrule:package:backup-disaster-recovery` |
| [CDN and Edge Caching](https://pathrule.io/patterns/cdn-edge-caching) | Define cache keys, freshness, validation, privacy, invalidation, and origin protection as one contract. | 2R · 2M · 1S | `::pathrule:package:cdn-edge-caching` |
| [Cloudflare Workers](https://pathrule.io/patterns/cloudflare-workers) | Write Workers that use bindings, respect the isolate model, and stay inside the CPU budget. | 2R · 2M · 1S | `::pathrule:package:cloudflare-workers` |
| [DNS and Domain Management](https://pathrule.io/patterns/dns-domain-management) | Manage zones, delegation, DNSSEC, records, TTLs, and cutovers as reviewed production infrastructure. | 3R · 2M | `::pathrule:package:dns-domain-management` |
| [Docker & Containers](https://pathrule.io/patterns/docker-containers) | Ship small, secure, cache-friendly container images by default. | 2R · 2M · 1S | `::pathrule:package:docker-containers` |
| [GitHub Actions CI/CD](https://pathrule.io/patterns/github-actions-cicd) | Build hardened, fast, OIDC-deployed GitHub Actions pipelines that AI agents keep secure by default. | 3R · 1M · 1S | `::pathrule:package:github-actions-cicd` |
| [GitOps with Argo CD](https://pathrule.io/patterns/gitops-argocd) | Operate Argo CD through desired-state ownership, reconciliation, sync waves, health, drift, and rollback. | 2R · 3M · 1S | `::pathrule:package:gitops-argocd` |
| [Google Cloud Run](https://pathrule.io/patterns/google-cloud-run) | Design Cloud Run around container concurrency, request lifetime, identity, scaling, and revisions. | 2R · 2M · 1S | `::pathrule:package:google-cloud-run` |
| [Kubernetes + Helm](https://pathrule.io/patterns/kubernetes-helm) | Ship workloads that Kubernetes can schedule, restart, drain, and scale without dropping requests. | 5R · 2M · 1S | `::pathrule:package:kubernetes-helm` |
| [Linux Services with systemd](https://pathrule.io/patterns/linux-systemd-services) | Run Linux services with explicit users, dependencies, restart policy, signals, logs, limits, and hardening. | 3R · 2M · 1S | `::pathrule:package:linux-systemd-services` |
| [Nginx and Reverse Proxy Operations](https://pathrule.io/patterns/nginx-reverse-proxy) | Operate Nginx with explicit upstream, header, timeout, buffering, reload, and trust contracts. | 3R · 2M · 1S | `::pathrule:package:nginx-reverse-proxy` |
| [Observability](https://pathrule.io/patterns/observability) | Emit correlated logs, metrics, and traces that make incidents debuggable. | 2R · 2M · 1S | `::pathrule:package:observability` |
| [Prometheus and Grafana Operations](https://pathrule.io/patterns/prometheus-grafana) | Operate metrics with bounded cardinality, durable rules, actionable alerts, and trustworthy dashboards. | 2R · 3M · 2S | `::pathrule:package:prometheus-grafana` |
| [Secrets & Environment Management](https://pathrule.io/patterns/secrets-env-management) | Keep secrets out of git, inject them at runtime, and rotate them automatically. | 3R · 2M · 1S | `::pathrule:package:secrets-env-management` |
| [Terraform / IaC](https://pathrule.io/patterns/terraform-iac) | Ship Terraform with locked remote state, pinned versions, and a plan-gated CI pipeline. | 3R · 3M · 1S | `::pathrule:package:terraform-iac` |
| [TLS Certificates and HTTPS Operations](https://pathrule.io/patterns/tls-https-operations) | Operate certificate identity, issuance, renewal, trust chains, protocol policy, and key rotation. | 4R · 2M · 1S | `::pathrule:package:tls-https-operations` |
| [Vercel Deployment](https://pathrule.io/patterns/vercel-deploy) | Ship to Vercel with safe previews, scoped env vars, and instant rollbacks. | 2R · 3M · 1S | `::pathrule:package:vercel-deploy` |

### Workflow

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Bash and Shell Automation](https://pathrule.io/patterns/bash-shell-automation) | Write shell automation with safe quoting, strict inputs, deterministic cleanup, and portable failure. | 3R · 2M · 1S | `::pathrule:package:bash-shell-automation` |
| [Code Review](https://pathrule.io/patterns/code-review) | Ship small pull requests that reviewers can approve fast with confidence. | 3R · 1M · 1S | `::pathrule:package:code-review` |
| [Debugging and Root Cause Analysis](https://pathrule.io/patterns/debugging-root-cause) | Turn vague failures into reproducible evidence, competing hypotheses, controlled tests, and verified causes. | 1R · 2M · 2S | `::pathrule:package:debugging-root-cause` |
| [Dependency Upgrades and Breaking Changes](https://pathrule.io/patterns/dependency-upgrades) | Upgrade dependencies through contract inventory, small steps, codemods, compatibility tests, and rollback. | 2R · 2M · 2S | `::pathrule:package:dependency-upgrades` |
| [Developer Onboarding](https://pathrule.io/patterns/developer-onboarding) | Turn a new contributor's first setup and change into a repeatable test of the engineering system. | 2R · 4M · 2S | `::pathrule:package:developer-onboarding` |
| [Documentation Engineering](https://pathrule.io/patterns/documentation-engineering) | Treat operational and developer documentation as owned, testable interfaces that change with the system. | 1R · 2M | `::pathrule:package:documentation-engineering` |
| [Feature Flags and Progressive Delivery](https://pathrule.io/patterns/feature-flags-progressive-delivery) | Separate deployment from exposure with typed flags, deterministic targeting, rollback, and retirement. | 2R · 2M · 1S | `::pathrule:package:feature-flags-progressive-delivery` |
| [Flaky Test Management](https://pathrule.io/patterns/flaky-test-management) | Detect, quarantine, diagnose, own, and eliminate nondeterministic tests without normalizing retries. | 1R · 2M · 2S | `::pathrule:package:flaky-test-management` |
| [Git & Conventional Commits](https://pathrule.io/patterns/git-conventional-commits) | Keep history readable and releases automatic with small commits and Conventional Commits. | 2R · 1M · 1S | `::pathrule:package:git-conventional-commits` |
| [Git Branching, Rebase, and Merge Conflicts](https://pathrule.io/patterns/git-branching-rebase) | Keep Git history integration reviewable, recoverable, conflict-aware, and free of accidental data loss. | 2R · 2M | `::pathrule:package:git-branching-rebase` |
| [Incident Response and Postmortems](https://pathrule.io/patterns/incident-response-postmortems) | Coordinate incidents with clear authority, durable timelines, safe mitigation, and owned learning. | 1R · 1M · 3S | `::pathrule:package:incident-response-postmortems` |
| [Modern Python Tooling (uv + Ruff)](https://pathrule.io/patterns/python-tooling) | Set up Python projects the 2026 way: one fast tool for envs and deps, one for lint and format. | 2R · 2M · 1S | `::pathrule:package:python-tooling` |
| [Monorepo (pnpm + Turborepo)](https://pathrule.io/patterns/monorepo-pnpm-turborepo) | Keep a pnpm and Turborepo monorepo fast, cacheable, and boundary-clean. | 3R · 2M · 1S | `::pathrule:package:monorepo-pnpm-turborepo` |
| [OpenAPI and Swagger Contract Workflow](https://pathrule.io/patterns/openapi-swagger-workflow) | Keep OpenAPI contracts authoritative, compatible, generated, and aligned with runtime behavior. | 2R · 2M · 1S | `::pathrule:package:openapi-swagger-workflow` |
| [Release Management](https://pathrule.io/patterns/release-management) | Promote immutable artifacts with compatibility evidence, explicit approval, rollback, and release notes. | 2R · 1M · 2S | `::pathrule:package:release-management` |
| [Technical Debt Management](https://pathrule.io/patterns/technical-debt-management) | Turn costly shortcuts into owned, evidence-backed decisions with triggers and a credible payoff path. | 1R · 2M · 1S | `::pathrule:package:technical-debt-management` |
| [Testing (Vitest + Playwright)](https://pathrule.io/patterns/testing-vitest-playwright) | Unit test behavior with Vitest, drive real user flows with Playwright, and keep both green in CI. | 3R · 2M · 1S | `::pathrule:package:testing-vitest-playwright` |

### AI

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Agent Memory](https://pathrule.io/patterns/agent-memory) | Store durable agent memory with provenance, tenant isolation, retrieval policy, and deliberate forgetting. | 1R · 3M · 1S | `::pathrule:package:agent-memory` |
| [AI Agents in Production](https://pathrule.io/patterns/ai-agents) | Run agent loops with hard budgets, small tool surfaces, and approval gates on anything irreversible. | 4R · 2M · 1S | `::pathrule:package:ai-agents` |
| [AI Safety Guardrails](https://pathrule.io/patterns/ai-safety-guardrails) | Classify risk, isolate untrusted content, authorize tools, validate output, and escalate safely. | 3R · 1M · 1S | `::pathrule:package:ai-safety-guardrails` |
| [AI SDK (Vercel AI SDK)](https://pathrule.io/patterns/ai-sdk) | Build streaming, tool-calling LLM features with one typed API across every provider. | 3R · 2M · 1S | `::pathrule:package:ai-sdk` |
| [AI-Generated Code Verification](https://pathrule.io/patterns/ai-code-verification) | Verify AI-authored changes through scope control, contracts, tests, security, runtime evidence, and rollback. | 2R · 2M · 2S | `::pathrule:package:ai-code-verification` |
| [LLM Evaluations & Testing](https://pathrule.io/patterns/llm-evals) | Catch hallucinations and quality regressions before users do, with evals on every prompt change. | 1R · 2M · 2S | `::pathrule:package:llm-evals` |
| [LLM Fine-Tuning and Dataset Curation](https://pathrule.io/patterns/llm-fine-tuning) | Fine-tune models through licensed datasets, leakage control, reproducible training, evaluations, and rollback. | 2R · 3M · 2S | `::pathrule:package:llm-fine-tuning` |
| [LLM Observability and Tracing](https://pathrule.io/patterns/llm-observability-tracing) | Trace model, retrieval, tool, safety, token, cost, and user outcomes without leaking prompt content. | 2R · 4M · 1S | `::pathrule:package:llm-observability-tracing` |
| [LLM Streaming UX](https://pathrule.io/patterns/llm-streaming-ux) | Design typed stream events, resumable state, cancellation, and honest partial-output interactions. | 1R · 2M · 2S | `::pathrule:package:llm-streaming-ux` |
| [LLM Structured Outputs](https://pathrule.io/patterns/llm-structured-outputs) | Treat model output as untrusted data that must satisfy a versioned schema before use. | 2R · 1M · 1S | `::pathrule:package:llm-structured-outputs` |
| [Local LLM Inference with Ollama and vLLM](https://pathrule.io/patterns/local-llm-ollama-vllm) | Operate local inference with explicit model identity, memory budgets, batching, quantization, and limits. | 2R · 3M · 1S | `::pathrule:package:local-llm-ollama-vllm` |
| [MCP Client and Tool Integration](https://pathrule.io/patterns/mcp-client-integration) | Build MCP clients with explicit capabilities, consent, auth, transport, schemas, and result handling. | 3R · 2M · 1S | `::pathrule:package:mcp-client-integration` |
| [MCP Server Authoring](https://pathrule.io/patterns/mcp-server-authoring) | Build Model Context Protocol servers whose tools an LLM can actually call correctly and safely. | 3R · 1M · 1S | `::pathrule:package:mcp-server-authoring` |
| [Model Routing and Cost Control](https://pathrule.io/patterns/model-routing-cost-control) | Route AI work by capability, risk, latency, reliability, and budget with observable fallbacks. | 3R · 2M · 1S | `::pathrule:package:model-routing-cost-control` |
| [Prompt Versioning and Management](https://pathrule.io/patterns/prompt-versioning-management) | Ship prompts as immutable, reviewable artifacts with typed inputs, eval evidence, rollout, and rollback. | 2R · 2M · 2S | `::pathrule:package:prompt-versioning-management` |
| [RAG & Embeddings](https://pathrule.io/patterns/rag-embeddings) | Ground LLM answers in your own data with retrieval that returns the right chunks, not just similar ones. | 2R · 3M · 1S | `::pathrule:package:rag-embeddings` |

### Security

| Pattern | What it gives you | Bundle | Token |
| --- | --- | --- | --- |
| [Account Takeover and MFA](https://pathrule.io/patterns/account-takeover-mfa) | Protect sign-in, recovery, factor changes, and sensitive actions as one abuse-resistant system. | 3R · 1M · 1S | `::pathrule:package:account-takeover-mfa` |
| [API Keys and Service-to-Service Authentication](https://pathrule.io/patterns/api-keys-service-auth) | Issue machine credentials with scopes, prefixes, hashing, rotation, audit, expiration, and leak response. | 3R · 1M | `::pathrule:package:api-keys-service-auth` |
| [API Rate Limiting and Abuse](https://pathrule.io/patterns/api-rate-limiting-abuse) | Bound request frequency, concurrency, payload cost, and expensive business actions. | 3R · 1M | `::pathrule:package:api-rate-limiting-abuse` |
| [Application Encryption and Key Management](https://pathrule.io/patterns/application-encryption-key-management) | Design encryption around threat models, authenticated modes, envelope keys, rotation, access, and recovery. | 4R · 2M · 1S | `::pathrule:package:application-encryption-key-management` |
| [Authorization with RBAC and ReBAC](https://pathrule.io/patterns/authorization-rbac-rebac) | Authorize every action against the real resource, relationship, tenant, and current policy state. | 4R · 2M · 1S | `::pathrule:package:authorization-rbac-rebac` |
| [Container and Image Security](https://pathrule.io/patterns/container-image-security) | Build traceable images, minimize contents, verify provenance, and constrain runtime power. | 2R · 1M · 2S | `::pathrule:package:container-image-security` |
| [Enterprise SSO with SAML and OIDC](https://pathrule.io/patterns/enterprise-sso-saml-oidc) | Operate enterprise SSO with tenant-bound issuers, signed responses, secure linking, JIT, SCIM, and rotation. | 4R · 2M · 1S | `::pathrule:package:enterprise-sso-saml-oidc` |
| [IAM and Least Privilege](https://pathrule.io/patterns/iam-least-privilege) | Keep human and workload access temporary, scoped, reviewable, and deny-first. | 3R · 1M · 1S | `::pathrule:package:iam-least-privilege` |
| [PII and Data Privacy](https://pathrule.io/patterns/pii-data-privacy) | Minimize personal data, preserve purpose, enforce access, and make deletion real. | 3R · 2M | `::pathrule:package:pii-data-privacy` |
| [Security Audit Logging](https://pathrule.io/patterns/security-audit-logging) | Record security-relevant actions as trustworthy evidence without turning logs into a secret database. | 3R · 2M | `::pathrule:package:security-audit-logging` |
| [Software Supply Chain Security](https://pathrule.io/patterns/supply-chain-security) | Stop a poisoned dependency from running in your build, CI, and production. | 4R · 1M · 1S | `::pathrule:package:supply-chain-security` |
| [SSRF and Egress Security](https://pathrule.io/patterns/ssrf-egress-security) | Treat server-side URL fetching as a privileged network capability with validation at every hop. | 5R · 1M · 1S | `::pathrule:package:ssrf-egress-security` |
| [Threat Modeling](https://pathrule.io/patterns/threat-modeling) | Model trust boundaries, rank realistic abuse paths, and turn threats into tested requirements. | 1R · 1M · 2S | `::pathrule:package:threat-modeling` |
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
