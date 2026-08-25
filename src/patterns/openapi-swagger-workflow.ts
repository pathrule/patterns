import type { Pattern } from "../types.js";

export const openapiSwaggerWorkflow: Pattern = {
  "slug": "openapi-swagger-workflow",
  "version": "1.0.0",
  "name": "OpenAPI and Swagger Contract Workflow",
  "tagline": "Keep OpenAPI contracts authoritative, compatible, generated, and aligned with runtime behavior.",
  "description": "An OpenAPI document becomes harmful when it describes a different API than production, accepts broad unspecified objects, changes response or error semantics without detection, or generates clients from an unpublished local schema. This pattern constrains contract authority and compatibility while recording schema reuse and generated-artifact ownership and providing a release verification procedure. It complements REST API design by governing specification lifecycle, validation, diffing, documentation, and code generation rather than resource and HTTP semantics themselves.",
  "category": "Workflow",
  "icon": "file-json-2",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "OpenAPI Swagger pattern for AI coding agents",
  "metaDescription": "OpenAPI contract authority, runtime validation, schema reuse, compatibility diffs, generated clients, examples, documentation, and release gates.",
  "problem": "AI agents often edit handlers without updating the contract, mark breaking changes as harmless documentation, or generate clients from a schema different from the deployed server.",
  "audience": "API platform teams publishing OpenAPI contracts, generated SDKs, gateways, or partner documentation",
  "prevents": [
    "Deploying a response shape not described by the published contract",
    "Removing or narrowing a field without a compatibility decision",
    "Generating clients from an uncommitted developer schema",
    "Allowing examples to drift into invalid or misleading payloads"
  ],
  "appliesTo": {
    "paths": [
      "/openapi",
      "/src/api",
      "/generated"
    ],
    "stacks": [
      "openapi",
      "swagger",
      "api-contract",
      "code-generation",
      "workflow"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/openapi",
      "title": "Choose one authoritative contract generation direction",
      "summary": "Make the reviewed OpenAPI artifact derive code or derive from code through one reproducible pipeline, never through manual edits on both sides.",
      "body": "When annotations, handlers, and YAML can each be edited independently, drift has no deterministic resolution. The team needs one source and a build that reproduces the published artifact.\n\n- Declare contract-first or code-first ownership and identify the files reviewers change for paths, schemas, security, errors, and examples.\n- Generate the distributable schema in CI from a clean checkout and fail when committed or published output differs.\n- Do not patch generated clients or schema output manually; change the source and regenerate.\n- Version and publish the exact schema used for server validation, documentation, gateway configuration, and client generation.\n\nSee /generated for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Validate runtime traffic against the public schema",
      "summary": "Parse request boundaries and verify representative responses so TypeScript, annotations, and implementation cannot silently diverge.",
      "body": "A static contract diff proves only document compatibility. Runtime serializers, middleware, feature flags, and error paths can still emit data the schema does not describe.\n\n- Validate path, query, header, and body inputs at the transport boundary with the same semantics as the published schema.\n- Exercise and validate success and documented error responses in tests, including nullability, optional fields, formats, content types, and status codes.\n- Reject or strip unexpected input properties according to the API contract and security model instead of passing them into domain or persistence code.\n- Keep runtime validation failures attributable to operation and schema version without logging secret or personal payload fields.\n\nSee /openapi for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/openapi",
      "title": "Compatibility is evaluated from the consumer's view",
      "summary": "Classify changes to operations, parameters, security, schemas, enums, errors, and behavior before merging or publishing.",
      "body": "A server may accept a code change while generated clients, cached callers, gateways, or partner integrations fail. Compatibility depends on how existing consumers send and interpret data.\n\n- Treat removed operations or fields, new required inputs, narrowed values, changed types, stronger security, and changed status semantics as breaking until proven otherwise.\n- Review enum additions against clients that deserialize into closed sets even when the wire change is technically additive.\n- Use a contract-diff gate against the last released schema and require an explicit version or migration decision for breaking changes.\n- Provide an overlap period and deprecation evidence when consumers cannot update atomically with the server.\n\nSee /src/api for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/openapi",
      "title": "Examples are executable contract fixtures",
      "summary": "Keep request and response examples valid against schemas and representative of real success, failure, pagination, and authentication behavior.",
      "body": "Examples drive documentation, mock servers, tests, and human integration decisions. A pretty but invalid example teaches consumers a payload the server rejects.\n\n- Validate every embedded and external example during the contract build.\n- Use stable fictional data that demonstrates required and optional fields without copying production personal or secret values.\n- Include representative errors and edge states, not only the smallest success response.\n- Reuse examples in runtime contract tests or generated-client smoke tests so documentation changes receive executable feedback.\n\nSee /generated for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "release-openapi-contract",
      "summary": "Diff, validate, generate, test, publish, and verify one OpenAPI contract and its downstream artifacts.",
      "body": "---\nname: release-openapi-contract\ndescription: Release an API contract change with generated clients or public documentation.\n---\n\n# Release Openapi Contract\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Generate the schema from the authoritative source in a clean environment and validate syntax, references, operation IDs, security, schemas, and examples.\n2. Diff against the last released contract, classify every consumer-visible change, and stop for an unresolved breaking change or missing migration plan.\n3. Regenerate supported clients, compile and smoke-test them against the candidate server, and verify old clients still satisfy the promised compatibility window.\n4. Publish server, schema, documentation, gateway configuration, and SDK artifacts under one traceable release identity and intended order.\n5. Fetch the deployed schema and call representative success and error operations, confirming runtime behavior and documentation match the released artifact.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "openapi",
        "swagger",
        "contract",
        "release",
        "codegen"
      ]
    }
  ]
};
