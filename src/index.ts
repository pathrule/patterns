export * from "./types.js";

import type { Pattern, PatternCategory, PatternContentKind } from "./types.js";
import { patternToken } from "./types.js";
import { angular } from "./patterns/angular.js";
import { aspnetCore } from "./patterns/aspnet-core.js";
import { astro } from "./patterns/astro.js";
import { django } from "./patterns/django.js";
import { expoReactNative } from "./patterns/expo-react-native.js";
import { flutter } from "./patterns/flutter.js";
import { laravel } from "./patterns/laravel.js";
import { nextjsAppRouter } from "./patterns/nextjs-app-router.js";
import { nuxt } from "./patterns/nuxt.js";
import { reactRouter } from "./patterns/react-router.js";
import { rails } from "./patterns/rails.js";
import { springBoot } from "./patterns/spring-boot.js";
import { sveltekit } from "./patterns/sveltekit.js";
import { swiftui } from "./patterns/swiftui.js";
import { clientStateManagement } from "./patterns/client-state-management.js";
import { coreWebVitals } from "./patterns/core-web-vitals.js";
import { dataTablesGrids } from "./patterns/data-tables-grids.js";
import { designSystemsStorybook } from "./patterns/design-systems-storybook.js";
import { formsRhfZod } from "./patterns/forms-rhf-zod.js";
import { internationalizationLocalization } from "./patterns/internationalization-localization.js";
import { reactTypescript } from "./patterns/react-typescript.js";
import { shadcnUi } from "./patterns/shadcn-ui.js";
import { tailwindCss } from "./patterns/tailwind-css.js";
import { tanstackQuery } from "./patterns/tanstack-query.js";
import { typescriptStrict } from "./patterns/typescript-strict.js";
import { webAccessibility } from "./patterns/web-accessibility.js";
import { webAnimationMotion } from "./patterns/web-animation-motion.js";
import { authSessionsJwtOauth } from "./patterns/auth-sessions-jwt-oauth.js";
import { backgroundJobsQueues } from "./patterns/background-jobs-queues.js";
import { drizzleOrm } from "./patterns/drizzle-orm.js";
import { fastapi } from "./patterns/fastapi.js";
import { fileUploadsObjectStorage } from "./patterns/file-uploads-object-storage.js";
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
import { b2bBillingNetTerms } from "./patterns/b2b-billing-net-terms.js";
import { dunningChurnRecovery } from "./patterns/dunning-churn-recovery.js";
import { invoicingTax } from "./patterns/invoicing-tax.js";
import { marketplacePayouts } from "./patterns/marketplace-payouts.js";
import { multiCurrencyPayments } from "./patterns/multi-currency-payments.js";
import { paddleBilling } from "./patterns/paddle-billing.js";
import { paymentReconciliationLedger } from "./patterns/payment-reconciliation-ledger.js";
import { pricingPlanModeling } from "./patterns/pricing-plan-modeling.js";
import { refundsChargebacksDisputes } from "./patterns/refunds-chargebacks-disputes.js";
import { stripeBilling } from "./patterns/stripe-billing.js";
import { subscriptionsUsageBilling } from "./patterns/subscriptions-usage-billing.js";
import { awsLambda } from "./patterns/aws-lambda.js";
import { backupDisasterRecovery } from "./patterns/backup-disaster-recovery.js";
import { cdnEdgeCaching } from "./patterns/cdn-edge-caching.js";
import { cloudflareWorkers } from "./patterns/cloudflare-workers.js";
import { dnsDomainManagement } from "./patterns/dns-domain-management.js";
import { dockerContainers } from "./patterns/docker-containers.js";
import { githubActionsCicd } from "./patterns/github-actions-cicd.js";
import { kubernetesHelm } from "./patterns/kubernetes-helm.js";
import { observability } from "./patterns/observability.js";
import { secretsEnvManagement } from "./patterns/secrets-env-management.js";
import { terraformIac } from "./patterns/terraform-iac.js";
import { vercelDeploy } from "./patterns/vercel-deploy.js";
import { codeReview } from "./patterns/code-review.js";
import { developerOnboarding } from "./patterns/developer-onboarding.js";
import { documentationEngineering } from "./patterns/documentation-engineering.js";
import { featureFlagsProgressiveDelivery } from "./patterns/feature-flags-progressive-delivery.js";
import { gitConventionalCommits } from "./patterns/git-conventional-commits.js";
import { incidentResponsePostmortems } from "./patterns/incident-response-postmortems.js";
import { pythonTooling } from "./patterns/python-tooling.js";
import { monorepoPnpmTurborepo } from "./patterns/monorepo-pnpm-turborepo.js";
import { releaseManagement } from "./patterns/release-management.js";
import { technicalDebtManagement } from "./patterns/technical-debt-management.js";
import { testingVitestPlaywright } from "./patterns/testing-vitest-playwright.js";
import { agentMemory } from "./patterns/agent-memory.js";
import { aiAgents } from "./patterns/ai-agents.js";
import { aiSafetyGuardrails } from "./patterns/ai-safety-guardrails.js";
import { aiSdk } from "./patterns/ai-sdk.js";
import { llmEvals } from "./patterns/llm-evals.js";
import { llmObservabilityTracing } from "./patterns/llm-observability-tracing.js";
import { llmStreamingUx } from "./patterns/llm-streaming-ux.js";
import { llmStructuredOutputs } from "./patterns/llm-structured-outputs.js";
import { mcpServerAuthoring } from "./patterns/mcp-server-authoring.js";
import { modelRoutingCostControl } from "./patterns/model-routing-cost-control.js";
import { promptVersioningManagement } from "./patterns/prompt-versioning-management.js";
import { ragEmbeddings } from "./patterns/rag-embeddings.js";
import { accountTakeoverMfa } from "./patterns/account-takeover-mfa.js";
import { apiRateLimitingAbuse } from "./patterns/api-rate-limiting-abuse.js";
import { authorizationRbacRebac } from "./patterns/authorization-rbac-rebac.js";
import { containerImageSecurity } from "./patterns/container-image-security.js";
import { iamLeastPrivilege } from "./patterns/iam-least-privilege.js";
import { piiDataPrivacy } from "./patterns/pii-data-privacy.js";
import { securityAuditLogging } from "./patterns/security-audit-logging.js";
import { supplyChainSecurity } from "./patterns/supply-chain-security.js";
import { ssrfEgressSecurity } from "./patterns/ssrf-egress-security.js";
import { threatModeling } from "./patterns/threat-modeling.js";
import { webSecurity } from "./patterns/web-security.js";

/** The catalog. Generated; order is category-grouped. */
export const PATTERNS: Pattern[] = [
  angular,
  aspnetCore,
  astro,
  django,
  expoReactNative,
  flutter,
  laravel,
  nextjsAppRouter,
  nuxt,
  reactRouter,
  rails,
  springBoot,
  sveltekit,
  swiftui,
  clientStateManagement,
  coreWebVitals,
  dataTablesGrids,
  designSystemsStorybook,
  formsRhfZod,
  internationalizationLocalization,
  reactTypescript,
  shadcnUi,
  tailwindCss,
  tanstackQuery,
  typescriptStrict,
  webAccessibility,
  webAnimationMotion,
  authSessionsJwtOauth,
  backgroundJobsQueues,
  drizzleOrm,
  fastapi,
  fileUploadsObjectStorage,
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
  b2bBillingNetTerms,
  dunningChurnRecovery,
  invoicingTax,
  marketplacePayouts,
  multiCurrencyPayments,
  paddleBilling,
  paymentReconciliationLedger,
  pricingPlanModeling,
  refundsChargebacksDisputes,
  stripeBilling,
  subscriptionsUsageBilling,
  awsLambda,
  backupDisasterRecovery,
  cdnEdgeCaching,
  cloudflareWorkers,
  dnsDomainManagement,
  dockerContainers,
  githubActionsCicd,
  kubernetesHelm,
  observability,
  secretsEnvManagement,
  terraformIac,
  vercelDeploy,
  codeReview,
  developerOnboarding,
  documentationEngineering,
  featureFlagsProgressiveDelivery,
  gitConventionalCommits,
  incidentResponsePostmortems,
  pythonTooling,
  monorepoPnpmTurborepo,
  releaseManagement,
  technicalDebtManagement,
  testingVitestPlaywright,
  agentMemory,
  aiAgents,
  aiSafetyGuardrails,
  aiSdk,
  llmEvals,
  llmObservabilityTracing,
  llmStreamingUx,
  llmStructuredOutputs,
  mcpServerAuthoring,
  modelRoutingCostControl,
  promptVersioningManagement,
  ragEmbeddings,
  accountTakeoverMfa,
  apiRateLimitingAbuse,
  authorizationRbacRebac,
  containerImageSecurity,
  iamLeastPrivilege,
  piiDataPrivacy,
  securityAuditLogging,
  supplyChainSecurity,
  ssrfEgressSecurity,
  threatModeling,
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
