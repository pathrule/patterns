import type { Pattern } from "../types.js";

export const llmStructuredOutputs: Pattern = {
  "slug": "llm-structured-outputs",
  "version": "1.0.0",
  "name": "LLM Structured Outputs",
  "tagline": "Treat model output as untrusted data that must satisfy a versioned schema before use.",
  "description": "LLM structured outputs replace prose parsing with an explicit schema contract, but schema-constrained generation does not make values correct or safe. This bundle versions schemas, distinguishes refusal and incomplete states, validates semantics, and migrates consumers deliberately. Unlike AI SDK, it defines a provider-independent data boundary rather than one library's generation and transport conventions.",
  "category": "AI",
  "icon": "braces",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "LLM structured outputs for AI coding agents",
  "metaDescription": "Versioned JSON schemas, strict validation, refusal and incomplete states, semantic checks, and consumer migrations for reliable LLM application boundaries.",
  "problem": "Agents parse model prose with regex, trust schema-constrained values without semantic validation, or change a shared schema without migrating stored output and consumers.",
  "audience": "Teams using model output to drive application state, tools, workflows, or persisted records",
  "prevents": [
    "Regex parsing of prose presented as a stable contract",
    "Refusals and truncated output treated as valid business data",
    "Schema changes that silently break stored results and downstream consumers"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai",
      "/src/schemas",
      "/tests/ai"
    ],
    "stacks": [
      "llm",
      "structured-outputs",
      "json-schema",
      "ai"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai",
      "title": "Validate syntax, schema, and semantics before side effects",
      "summary": "Model output crosses three validation layers before it can mutate state, call a tool, or reach another system.",
      "body": "Model output crosses three validation layers before it can mutate state, call a tool, or reach another system. A payload can be valid JSON and match a schema while containing impossible amounts, unauthorized identifiers, stale versions, or unsafe instructions. Enforce this boundary in /src/ai so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Separate transport completion, refusal, truncation, and provider error from the domain result type.\n- Parse once and validate against the exact schema version requested from the provider.\n- Apply domain checks for ranges, references, authorization, invariants, and current state after structural validation.\n- Perform no write, message, charge, or tool call until every layer succeeds.\n\nVerification: Feed malformed JSON, schema mismatches, refusal, truncation, valid but unauthorized IDs, and a fully valid payload; confirm only the final case reaches effects.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/schemas",
      "title": "Version every structured-output contract",
      "summary": "Schema identity and version travel with prompts, model requests, stored results, fixtures, and consumers.",
      "body": "Schema identity and version travel with prompts, model requests, stored results, fixtures, and consumers. Editing a shared schema in place makes old stored output ambiguous and can turn a harmless field rename into a production parsing failure. Enforce this boundary in /src/schemas so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Give each contract a stable name and explicit version independent from the prompt or provider model name.\n- Keep old readers while stored or in-flight results can still use the old version.\n- Treat required-field, enum, type, meaning, and nesting changes as compatibility decisions with migration plans.\n- Generate provider-specific schema subsets from one canonical domain contract when providers support different JSON Schema features.\n\nVerification: Load fixtures for every supported version through current readers and reject an unknown version before domain work; test one planned migration end to end.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai",
      "title": "Constrained generation is not trusted generation",
      "summary": "A provider can constrain shape while the model still selects incorrect, fabricated, stale, or attacker-influenced values.",
      "body": "A provider can constrain shape while the model still selects incorrect, fabricated, stale, or attacker-influenced values. Keep the schema at the generation boundary to reduce parser ambiguity, then treat the parsed object exactly like untrusted API input.\n\nAuthorize referenced resources against the current principal and tenant. Resolve identifiers from trusted stores rather than accepting display text as authority. Keep high-impact decisions behind deterministic policy or human review even when the payload is structurally perfect. Keep the decision explicit at /src/ai; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/schemas for contract versions and /tests/ai for refusal and adversarial fixtures. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "migrate-llm-schema",
      "summary": "Migrate a structured-output schema, stored results, prompts, validators, and consumers without an ambiguous cutover.",
      "body": "---\nname: migrate-llm-schema\ndescription: Migrate a structured-output schema, stored results, prompts, validators, and consumers without an ambiguous cutover.\n---\n\n# Migrate Llm Schema\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Classify the proposed change as backward compatible, reader-compatible, or breaking for both generation and every downstream consumer.\n2. Create the new schema version, provider adapter, fixtures, semantic validator, and dual-version reader before switching production requests.\n3. Replay representative and adversarial inputs, compare refusal and validation rates, and migrate stored output only when its meaning can be preserved.\n4. Roll out by cohort with version metrics, keep rollback readers, then retire the old version only after in-flight and stored dependencies are gone.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "llm",
        "structured-outputs",
        "json-schema",
        "migration"
      ]
    }
  ]
};
