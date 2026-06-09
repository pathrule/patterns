export * from "./types.js";

import type { Pattern, PatternCategory, PatternContentKind } from "./types.js";
import { patternToken } from "./types.js";
import { astro } from "./patterns/astro.js";
import { expoReactNative } from "./patterns/expo-react-native.js";
import { nextjsAppRouter } from "./patterns/nextjs-app-router.js";
import { nuxt } from "./patterns/nuxt.js";
import { reactRouter } from "./patterns/react-router.js";
import { sveltekit } from "./patterns/sveltekit.js";
import { formsRhfZod } from "./patterns/forms-rhf-zod.js";
import { reactTypescript } from "./patterns/react-typescript.js";
import { shadcnUi } from "./patterns/shadcn-ui.js";
import { tailwindCss } from "./patterns/tailwind-css.js";
import { tanstackQuery } from "./patterns/tanstack-query.js";
import { webAccessibility } from "./patterns/web-accessibility.js";
import { authSessionsJwtOauth } from "./patterns/auth-sessions-jwt-oauth.js";
import { backgroundJobsQueues } from "./patterns/background-jobs-queues.js";
import { drizzleOrm } from "./patterns/drizzle-orm.js";
import { nodeTsApiHono } from "./patterns/node-ts-api-hono.js";
import { postgresSchema } from "./patterns/postgres-schema.js";
import { restApiDesign } from "./patterns/rest-api-design.js";
import { supabaseRls } from "./patterns/supabase-rls.js";
import { stripeBilling } from "./patterns/stripe-billing.js";
import { subscriptionsUsageBilling } from "./patterns/subscriptions-usage-billing.js";
import { dockerContainers } from "./patterns/docker-containers.js";
import { githubActionsCicd } from "./patterns/github-actions-cicd.js";
import { observability } from "./patterns/observability.js";
import { secretsEnvManagement } from "./patterns/secrets-env-management.js";
import { terraformIac } from "./patterns/terraform-iac.js";
import { vercelDeploy } from "./patterns/vercel-deploy.js";
import { codeReview } from "./patterns/code-review.js";
import { gitConventionalCommits } from "./patterns/git-conventional-commits.js";
import { monorepoPnpmTurborepo } from "./patterns/monorepo-pnpm-turborepo.js";
import { testingVitestPlaywright } from "./patterns/testing-vitest-playwright.js";

/** The catalog. Generated; order is category-grouped. */
export const PATTERNS: Pattern[] = [
  astro,
  expoReactNative,
  nextjsAppRouter,
  nuxt,
  reactRouter,
  sveltekit,
  formsRhfZod,
  reactTypescript,
  shadcnUi,
  tailwindCss,
  tanstackQuery,
  webAccessibility,
  authSessionsJwtOauth,
  backgroundJobsQueues,
  drizzleOrm,
  nodeTsApiHono,
  postgresSchema,
  restApiDesign,
  supabaseRls,
  stripeBilling,
  subscriptionsUsageBilling,
  dockerContainers,
  githubActionsCicd,
  observability,
  secretsEnvManagement,
  terraformIac,
  vercelDeploy,
  codeReview,
  gitConventionalCommits,
  monorepoPnpmTurborepo,
  testingVitestPlaywright,
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
  if (c.rule) parts.push(`${c.rule} ${c.rule === 1 ? "Rule" : "Rules"}`);
  if (c.memory) parts.push(`${c.memory} ${c.memory === 1 ? "Memory" : "Memories"}`);
  if (c.skill) parts.push(`${c.skill} ${c.skill === 1 ? "Skill" : "Skills"}`);
  return parts.join(" • ");
}

export function serializePatternBundle(p: Pattern): string {
  const blocks = p.pieces.map((piece) => {
    const head = `### [${piece.kind.toUpperCase()}] ${piece.title}  (path: ${piece.nodePath})`;
    const meta =
      piece.kind === "rule"
        ? `\n<!-- scope: ${piece.scopeType ?? "project"} | priority: ${piece.priority ?? "medium"} | ${piece.enforcement ?? "advisory"} -->`
        : "";
    return `${head}${meta}\n\n${piece.body.trim()}`;
  });
  return `# Pathrule Pattern: ${p.name} (${p.version})\n# ${patternToken(p)}\n\n${blocks.join("\n\n---\n\n")}\n`;
}
