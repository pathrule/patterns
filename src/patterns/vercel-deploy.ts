import type { Pattern } from "../types.js";

export const vercelDeploy: Pattern = {
  "slug": "vercel-deploy",
  "version": "1.0.0",
  "name": "Vercel Deployment",
  "tagline": "Ship to Vercel with safe previews, scoped env vars, and instant rollbacks.",
  "description": "An opinionated bundle for teams deploying Next.js and other apps on Vercel in 2026. It codifies the preview-then-promote workflow, per-environment secrets with OIDC and Sensitive variables, Fluid Compute function config, and CDN-aware caching so deploys stay fast, safe, and reversible.",
  "category": "Infra",
  "icon": "triangle",
  "color": "bg-neutral-500/10 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-300",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Vercel Deployment pattern for AI coding agents",
  "metaDescription": "A Pathrule pattern that teaches AI coding agents the 2026 Vercel workflow: preview-then-promote, scoped env vars with OIDC, Fluid Compute, ISR caching, and instant rollbacks.",
  "problem": "Teams break production on Vercel by pushing untested changes, leaking secrets into client bundles, and misconfiguring functions and caching.",
  "audience": "Frontend and full-stack teams deploying Next.js apps on Vercel",
  "prevents": [
    "Promoting an untested build straight to the production branch",
    "Leaking server secrets through NEXT_PUBLIC_ variables or unredacted env values",
    "Stale or runaway pages from missing revalidation and wrong function durations"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/app",
      "/src",
      "/api"
    ],
    "stacks": [
      "vercel",
      "nextjs",
      "edge",
      "serverless"
    ],
    "packages": [
      "next",
      "vercel"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Preview first, then promote to production",
      "summary": "Never push directly to the production branch; validate a preview deployment and promote it.",
      "body": "Production traffic only ever serves a deployment that was first validated as a preview.\n\n- Land changes on a non-production branch or PR so Vercel builds a preview, and run health checks against that preview URL before promoting.\n- Promote the exact preview build with `vercel promote <url>` or the dashboard Promote action instead of re-merging, so the bytes serving production are the bytes you tested.\n- Keep instant rollback usable: a known-good earlier production deployment must always exist, since rollback just reassigns the domain rather than rebuilding.\n- Treat the production branch (usually `main`) as protected; do not force-push or rebase history that has been deployed.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Scope secrets to the server and the right environment",
      "summary": "Only NEXT_PUBLIC_ vars reach the client; mark real secrets Sensitive and prefer OIDC.",
      "body": "Environment variables are scoped per environment and never leak server secrets to the browser.\n\n- Only prefix a variable with `NEXT_PUBLIC_` when it is safe in client JS; everything else (API keys, DB URLs, tokens) stays server-only.\n- Set distinct values per environment (Production, Preview, Development) rather than reusing production credentials in previews.\n- Mark credentials as Sensitive so Vercel redacts them, and never commit `.env*` files; pull with `vercel env pull` for local dev.\n- For backend access (AWS, GCP, Azure, databases), prefer OIDC Federation via `VERCEL_OIDC_TOKEN` to get short-lived tokens instead of long-lived static secrets.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Function runtime config with Fluid Compute",
      "summary": "How maxDuration, runtime, and memory work on Vercel Functions in 2026.",
      "body": "Fluid Compute is the default execution model for new Vercel projects as of 2025, and it changes how function limits behave.\n\n- Set `maxDuration` per function in `vercel.json` (or via route segment config in Next.js); with Fluid Compute the Pro max rises to 800s, versus 300s without it.\n- Memory can no longer be set in `vercel.json` when Fluid Compute is on; configure it under Functions in the project dashboard.\n- Choose the runtime deliberately: Edge for low-latency middleware and lightweight routes, Node.js for heavier or dependency-rich work.\n- Use Cron Jobs for scheduled invocations rather than external pingers, and keep cold-start-sensitive paths lean."
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Caching and ISR on the Vercel CDN",
      "summary": "How revalidation, cacheTag/cacheLife, and CDN purges fit together.",
      "body": "Next.js sets `Cache-Control` from the rendering strategy, and Vercel's CDN serves those responses; on-demand invalidation must reach both layers.\n\n- Static pages emit `s-maxage=31536000`; ISR pages emit `s-maxage={revalidate}` with `stale-while-revalidate` so users get fast pages that refresh in the background.\n- With Cache Components, wrap cacheable work in `use cache`, set lifetime via `cacheLife`, and label entries with `cacheTag` for targeted invalidation.\n- Invalidate on mutation with `revalidateTag` / `revalidatePath` (or `updateTag`); these clear the Next.js cache and Vercel propagates the CDN purge for those keys.\n- Avoid `revalidate = 0` or fully dynamic rendering on hot pages unless the data truly cannot be cached."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "vercel-deploy-review",
      "summary": "Pre-promotion checklist before sending a Vercel deployment to production.",
      "body": "---\nname: vercel-deploy-review\ndescription: Run this checklist before promoting any Vercel deployment to production. Covers preview validation, environment variables, function config, caching, and rollback readiness for Next.js apps on Vercel in 2026.\n---\n\n# Vercel deployment review\n\n- [ ] Change landed on a non-production branch or PR and produced a green preview deployment.\n- [ ] Preview URL passed health checks and key flows; build logs show no errors or unredacted secrets.\n- [ ] No server secret is exposed via a `NEXT_PUBLIC_` variable; secrets are marked Sensitive.\n- [ ] Environment variables are set per environment (Production/Preview/Development), with no production credentials reused in previews.\n- [ ] Backend access uses OIDC (`VERCEL_OIDC_TOKEN`) or short-lived credentials where possible.\n- [ ] `maxDuration` and runtime (Edge vs Node.js) are correct for each function; memory is set in the dashboard under Fluid Compute.\n- [ ] Caching is intentional: ISR `revalidate` / `cacheLife` set, hot pages tagged with `cacheTag`, mutations call `revalidateTag` / `revalidatePath`.\n- [ ] A known-good prior production deployment exists so instant rollback is available.\n- [ ] Promotion will reuse the tested preview build (`vercel promote` or dashboard Promote), not a fresh rebuild.\n",
      "skillTags": [
        "vercel",
        "deployment",
        "nextjs",
        "ci-cd",
        "checklist"
      ]
    }
  ]
};
