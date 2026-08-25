import type { Pattern } from "../types.js";

export const llmObservabilityTracing: Pattern = {
  "slug": "llm-observability-tracing",
  "version": "1.0.0",
  "name": "LLM Observability and Tracing",
  "tagline": "Trace model, retrieval, tool, safety, token, cost, and user outcomes without leaking prompt content.",
  "description": "LLM observability connects one user outcome to model calls, retrieval, tool execution, structured output, safety decisions, retries, latency, token usage, and cost. This bundle defines trace boundaries, safe content policy, semantic adapters, streaming and retry accounting, and quality links. Unlike general Observability, it addresses model-specific behavior and data sensitivity while still integrating with shared OpenTelemetry infrastructure.",
  "category": "AI",
  "icon": "waypoints",
  "color": "bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "LLM observability and tracing pattern for agents",
  "metaDescription": "End-to-end generation traces, safe content controls, semantic adapters, streaming and retry accounting, token and cost evidence, feedback, and eval links.",
  "problem": "Agents log raw prompts and responses while failing to connect retrieval, tools, retries, token usage, cost, safety results, and user outcomes into one explainable trace.",
  "audience": "Teams operating LLM applications with retrieval, tools, streaming, fallbacks, safety layers, evaluations, or usage-based cost controls",
  "prevents": [
    "Sensitive prompt or tool content leaking into broadly accessible telemetry",
    "Retries and fallbacks double-counting usage or hiding the call that served the user",
    "Quality reports that cannot be linked to the exact model, prompt, retrieval, and tool path"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai/telemetry",
      "/src/ai/runtime",
      "/src/ai/evals"
    ],
    "stacks": [
      "llm",
      "opentelemetry",
      "tracing",
      "ai-operations"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai/telemetry",
      "title": "One generation trace links every AI and application stage",
      "summary": "The user operation parents model attempts, retrieval, reranking, tool calls, safety checks, parsing, retries, and downstream effects with stable identities.",
      "body": "A model span alone cannot explain the result a user received. Start from the application operation and create linked spans or events for input preparation, prompt release resolution, retrieval and reranking, each model attempt, tool execution, output validation, safety decisions, streaming milestones, persistence, and material downstream effects. Preserve causality across queues and retries.\n\n- Record provider, requested and response model, prompt release, tool and schema versions, retrieval corpus, attempt number, finish status, and safe error category.\n- Distinguish the attempt that served the response from abandoned, failed, retried, or fallback attempts.\n- Correlate user feedback and evaluation samples to the generation id without using user input as a high-cardinality metric label.\n- Propagate trace context through tool and workflow boundaries with deliberate trust filtering.\n\nVerification: Exercise retrieval, parallel tools, streaming, timeout, retry, fallback, parser repair, and downstream write; confirm the trace reconstructs order and outcome without guessing.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ai/telemetry",
      "title": "Prompt and response content is off by default",
      "summary": "Telemetry records approved metadata and references unless a separately authorized, sampled, redacted, and retained content policy is active.",
      "body": "Prompts, responses, retrieved documents, tool arguments, and tool results can contain personal data, secrets, customer records, source code, credentials, or regulated content. Do not emit them to traces or logs by default. Define an explicit content-capture policy with purpose, environment, field allowlist, redaction, sampling, encryption, access group, retention, deletion, and audit of reads.\n\n- Prefer artifact references, safe classifications, counts, lengths, hashes, and version ids over raw content.\n- Apply redaction before export and test nested JSON, messages, URLs, exceptions, headers, binary metadata, and provider-specific fields.\n- Prevent dynamic debug flags and vendor SDK defaults from bypassing the central policy.\n- Keep production content capture time-bounded and independently reviewable, with a kill switch.\n\nVerification: Seed secrets and personal data through every model, retrieval, and tool field; confirm no raw value leaves the process under the default policy.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/telemetry",
      "title": "GenAI semantic conventions are isolated behind an adapter",
      "summary": "Internal telemetry fields remain stable while OpenTelemetry and provider-specific generative AI conventions evolve independently.",
      "body": "Generative AI semantic conventions and provider attributes evolve faster than core application contracts. Keep one internal generation telemetry model and map it to the supported OpenTelemetry convention at the exporter boundary. Preserve the convention version and instrumentation library version so stored traces remain interpretable.\n\nDo not scatter raw provider field names across business code or copy experimental attributes into permanent dashboards without an ownership plan. Normalize common provider, requested model, response model, token usage, operation, finish, error, and tool concepts while retaining a bounded provider-extension map where investigation needs it. Review mapping changes like schema migrations. See the general Observability pattern for collector, sampling, and SLO infrastructure."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/runtime",
      "title": "Usage and cost are attempt-level facts",
      "summary": "Input, output, cached, reasoning, and other provider usage categories attach to each actual attempt before aggregation by generation and feature.",
      "body": "One user generation may cause several provider calls because of retries, fallbacks, parallel candidates, tool loops, or repair passes. Record usage on the specific attempt using the provider's authoritative response or usage event, including requested and response model, currency, price schedule version, and any separately reported input, output, cached, reasoning, or other token categories.\n\nAggregate all incurred attempts for true cost and mark which attempt served the user. Keep estimated usage visibly distinct when a provider omits final data, and reconcile estimates later if authoritative records arrive. Never infer exact billing only from text length. See /src/ai/telemetry for trace identity and the Model Routing and Cost Control pattern for routing policy."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/runtime",
      "title": "Streaming has separate first-token, completion, and abandonment outcomes",
      "summary": "A stream records request start, first useful output, terminal provider result, client disconnect, cancellation, partial delivery, and persisted response separately.",
      "body": "A streaming request can show low time to first token while taking too long to finish, being abandoned by the user, failing after partial delivery, or continuing after the client disconnected. Capture queue time, provider start, first byte, first useful token, terminal event, validation completion, persistence, and client-visible completion as distinct milestones.\n\nPropagate cancellation to provider, retrieval, and tool work where safe, and record whether usage after disconnect was avoided or still incurred. Keep partial output handling explicit so retries do not duplicate text or downstream effects. Separate successful provider completion from successful delivery and accepted application output. See the LLM Streaming UX pattern for client behavior."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai/evals",
      "title": "Quality and safety evidence joins telemetry by generation id",
      "summary": "User feedback, sampled review, automated scores, incidents, and policy decisions link to the exact production configuration that produced the output.",
      "body": "Latency, error rate, and cost can be healthy while answer quality or safety degrades. Assign a stable generation id before model work and carry it into response records, user feedback, support cases, safety decisions, sampled human review, evaluation datasets, and incident artifacts. Link by reference rather than copying sensitive content into telemetry.\n\nRecord prompt release, model and fallback, tool versions, retrieval corpus, output schema, safety policy, locale, feature cohort, and serving attempt so comparisons use meaningful slices. Control evaluator and rubric versions as separate evidence. See /src/ai/telemetry for the operational trace and the LLM Evaluations and Testing pattern for regression gates."
    },
    {
      "kind": "skill",
      "nodePath": "/src/ai/telemetry",
      "title": "review-llm-observability",
      "summary": "Review trace completeness, content safety, usage and cost accounting, retry semantics, streaming milestones, cardinality, and quality links.",
      "body": "---\nname: review-llm-observability\ndescription: Review LLM telemetry for complete causality, safe data handling, accurate usage, and actionable outcomes.\n---\n\n# Review LLM Observability\n\n1. Trace representative simple, retrieval, tool, streaming, retry, fallback, validation-failure, cancellation, and downstream-effect generations end to end.\n2. Verify generation, attempt, prompt, model, tool, schema, corpus, policy, and user-operation identities remain stable across process and queue boundaries.\n3. Seed secrets and personal data into prompts, retrieved content, tool arguments, results, errors, and provider extensions; test default exclusion and approved redaction.\n4. Reconcile attempt-level usage and cost, first-token and completion milestones, terminal states, served attempt, feedback, evals, and incident links.\n5. Inspect metric cardinality, sampling, exporter mapping versions, dashboards, alerts, access controls, retention, and content-capture kill switch.\n\nRecord every missing edge or unsafe field as a scoped telemetry-contract defect and rerun after correction.",
      "skillTags": [
        "llm",
        "observability",
        "tracing",
        "opentelemetry"
      ]
    }
  ]
};
