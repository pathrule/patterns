export * from "./types.js";

import type { Pattern, PatternCategory, PatternContentKind } from "./types.js";
import { patternToken } from "./types.js";
import { angular } from "./patterns/angular.js";
import { astro } from "./patterns/astro.js";
import { django } from "./patterns/django.js";
import { expoReactNative } from "./patterns/expo-react-native.js";
import { flutter } from "./patterns/flutter.js";
import { laravel } from "./patterns/laravel.js";
import { nextjsAppRouter } from "./patterns/nextjs-app-router.js";
import { nuxt } from "./patterns/nuxt.js";
import { reactRouter } from "./patterns/react-router.js";
import { rails } from "./patterns/rails.js";
import { sveltekit } from "./patterns/sveltekit.js";
import { swiftui } from "./patterns/swiftui.js";
import { coreWebVitals } from "./patterns/core-web-vitals.js";
import { formsRhfZod } from "./patterns/forms-rhf-zod.js";
import { reactTypescript } from "./patterns/react-typescript.js";
import { shadcnUi } from "./patterns/shadcn-ui.js";
import { tailwindCss } from "./patterns/tailwind-css.js";
import { tanstackQuery } from "./patterns/tanstack-query.js";
import { typescriptStrict } from "./patterns/typescript-strict.js";
import { webAccessibility } from "./patterns/web-accessibility.js";
import { authSessionsJwtOauth } from "./patterns/auth-sessions-jwt-oauth.js";
import { backgroundJobsQueues } from "./patterns/background-jobs-queues.js";
import { drizzleOrm } from "./patterns/drizzle-orm.js";
import { fastapi } from "./patterns/fastapi.js";
import { goApi } from "./patterns/go-api.js";
import { graphqlApi } from "./patterns/graphql-api.js";
import { kafkaEventDriven } from "./patterns/kafka-event-driven.js";
import { mongodbMongoose } from "./patterns/mongodb-mongoose.js";
import { multiTenancy } from "./patterns/multi-tenancy.js";
import { nodeTsApiHono } from "./patterns/node-ts-api-hono.js";
import { postgresSchema } from "./patterns/postgres-schema.js";
import { prismaOrm } from "./patterns/prisma-orm.js";
import { redisCaching } from "./patterns/redis-caching.js";
import { restApiDesign } from "./patterns/rest-api-design.js";
import { supabaseRls } from "./patterns/supabase-rls.js";
import { stripeBilling } from "./patterns/stripe-billing.js";
import { subscriptionsUsageBilling } from "./patterns/subscriptions-usage-billing.js";
import { awsLambda } from "./patterns/aws-lambda.js";
import { cloudflareWorkers } from "./patterns/cloudflare-workers.js";
import { dockerContainers } from "./patterns/docker-containers.js";
import { githubActionsCicd } from "./patterns/github-actions-cicd.js";
import { kubernetesHelm } from "./patterns/kubernetes-helm.js";
import { observability } from "./patterns/observability.js";
import { secretsEnvManagement } from "./patterns/secrets-env-management.js";
import { terraformIac } from "./patterns/terraform-iac.js";
import { vercelDeploy } from "./patterns/vercel-deploy.js";
import { codeReview } from "./patterns/code-review.js";
import { gitConventionalCommits } from "./patterns/git-conventional-commits.js";
import { pythonTooling } from "./patterns/python-tooling.js";
import { monorepoPnpmTurborepo } from "./patterns/monorepo-pnpm-turborepo.js";
import { testingVitestPlaywright } from "./patterns/testing-vitest-playwright.js";
import { aiAgents } from "./patterns/ai-agents.js";
import { aiSdk } from "./patterns/ai-sdk.js";
import { llmEvals } from "./patterns/llm-evals.js";
import { mcpServerAuthoring } from "./patterns/mcp-server-authoring.js";
import { ragEmbeddings } from "./patterns/rag-embeddings.js";
import { supplyChainSecurity } from "./patterns/supply-chain-security.js";
import { webSecurity } from "./patterns/web-security.js";

/** The catalog. Generated; order is category-grouped. */
export const PATTERNS: Pattern[] = [
  angular,
  astro,
  django,
  expoReactNative,
  flutter,
  laravel,
  nextjsAppRouter,
  nuxt,
  reactRouter,
  rails,
  sveltekit,
  swiftui,
  coreWebVitals,
  formsRhfZod,
  reactTypescript,
  shadcnUi,
  tailwindCss,
  tanstackQuery,
  typescriptStrict,
  webAccessibility,
  authSessionsJwtOauth,
  backgroundJobsQueues,
  drizzleOrm,
  fastapi,
  goApi,
  graphqlApi,
  kafkaEventDriven,
  mongodbMongoose,
  multiTenancy,
  nodeTsApiHono,
  postgresSchema,
  prismaOrm,
  redisCaching,
  restApiDesign,
  supabaseRls,
  stripeBilling,
  subscriptionsUsageBilling,
  awsLambda,
  cloudflareWorkers,
  dockerContainers,
  githubActionsCicd,
  kubernetesHelm,
  observability,
  secretsEnvManagement,
  terraformIac,
  vercelDeploy,
  codeReview,
  gitConventionalCommits,
  pythonTooling,
  monorepoPnpmTurborepo,
  testingVitestPlaywright,
  aiAgents,
  aiSdk,
  llmEvals,
  mcpServerAuthoring,
  ragEmbeddings,
  supplyChainSecurity,
  webSecurity,
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
