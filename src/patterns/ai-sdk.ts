import type { Pattern } from "../types.js";

export const aiSdk: Pattern = {
  "slug": "ai-sdk",
  "version": "1.0.0",
  "name": "AI SDK (Vercel AI SDK)",
  "tagline": "Build streaming, tool-calling LLM features with one typed API across every provider.",
  "description": "A production baseline for shipping LLM features with the Vercel AI SDK v5+. It keeps model calls on the server, streams every user-facing response, validates tool inputs and structured output with Zod, and routes models through the AI Gateway as plain `provider/model` strings so you can swap or fall back without rewriting code. The conventions here are what separate a demo chat box from an agent loop you can ship.",
  "category": "AI",
  "icon": "bot",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "AI SDK (Vercel AI SDK) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for the Vercel AI SDK: server-only model calls, streamed responses, Zod-validated tools and structured output, agent loops with stopWhen, and AI Gateway provider routing, tuned for AI coding agents.",
  "problem": "AI agents wiring up the AI SDK leak provider keys to the browser, block on full generations, pass unvalidated tool arguments, and hardcode one provider.",
  "audience": "Full-stack teams shipping LLM chat, agents, and structured extraction in a TypeScript app",
  "prevents": [
    "Calling the model from a client component with an exposed API key",
    "Awaiting a full generateText for a user-facing reply instead of streaming",
    "Defining tools or generateObject without a schema, so the model returns unparseable output",
    "Hardcoding a single provider SDK with no fallback path"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai",
      "/app/api/chat",
      "/src/app/api/chat"
    ],
    "stacks": [
      "typescript",
      "ai-sdk",
      "nextjs",
      "vercel"
    ],
    "packages": [
      "ai",
      "@ai-sdk/react",
      "@ai-sdk/openai",
      "@ai-sdk/anthropic",
      "zod"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai",
      "title": "Call models server-side only; never expose provider keys",
      "summary": "Every model call runs on the server (route handler, server action, or backend). Provider and gateway keys live in server env only and are never shipped to the client.",
      "body": "A model call carries a secret. If it runs in the browser, the key is in the bundle and the cost is the attacker's.\n\n- Run `streamText`, `generateText`, `generateObject`, and `embed` only in server code: a route handler (`app/api/.../route.ts`), a server action, or a backend service. Never import a provider or call the SDK from a client component.\n- Read keys (`AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) from server-side env. Do not prefix any of them with `NEXT_PUBLIC_` / `VITE_` / `PUBLIC_`; that publishes the secret to the browser.\n- The client talks to your own endpoint, not to the provider. The browser sends messages to `/api/chat`; your handler holds the key and streams tokens back.\n- Enforce auth, rate limiting, and per-user budget on that endpoint before you call the model. An unauthenticated streaming endpoint is an open invoice.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app/api/chat",
      "title": "Stream user-facing responses; do not block on the full generation",
      "summary": "Use streamText + toUIMessageStreamResponse for anything a person reads; reserve generateText/generateObject for backend steps whose whole result is consumed at once.",
      "body": "Latency to first token is the experience. A blocking call makes a fast model feel slow.\n\n- For any response a user watches appear, use `streamText` and return `result.toUIMessageStreamResponse()` from the route handler. On the client, render it with `useChat` from `@ai-sdk/react`.\n- Use `generateText` / `generateObject` only for server steps where you need the complete result before doing anything else (a classification, an extraction feeding the next step, a cron job). Do not `await generateText` to produce a chat reply.\n- Propagate cancellation: pass the request's `AbortSignal` into the call so a user who navigates away stops the generation and the billing.\n- Always render or handle the error part of the stream. A silent failed stream looks like a hang; surface it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src/ai",
      "title": "Schema-validate every tool input and structured output",
      "summary": "Tools declare an inputSchema and generateObject declares a schema (Zod); never trust raw model JSON or hand-parse it.",
      "body": "The model emits text. A schema is the only thing that turns that text into data you can trust.\n\n- Define each tool with `tool({ description, inputSchema: z.object({...}), execute })`. The description is the model's documentation for when to call it; write it for the model. The schema is validated before `execute` runs, so the handler receives typed, checked arguments.\n- For structured extraction, use `generateObject({ schema, ... })` (or `streamObject`) rather than asking for JSON in the prompt and `JSON.parse`-ing the reply. The SDK validates against the schema and retries malformed output.\n- Keep schemas tight: enums over free strings, `.describe()` on fields the model gets wrong, required fields required. A loose schema lets bad data through.\n- A tool's `execute` is real code with real side effects. Validate authorization inside it; a model deciding to call a tool is not authorization to perform the action.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai",
      "title": "Route models through the AI Gateway as provider/model strings",
      "summary": "We pass plain \"provider/model\" strings to the SDK and let the Vercel AI Gateway handle routing, fallback, and observability, instead of wiring provider-specific packages.",
      "body": "Models are configuration, not code. We keep the call site provider-agnostic so swapping or falling back is a string change, not a refactor.\n\n- Pass the model as a string, e.g. `streamText({ model: 'anthropic/claude-sonnet-4.6', ... })`. The AI Gateway resolves it; no `@ai-sdk/anthropic` import at the call site for the default path. Reach for a provider package only when you explicitly need direct provider wiring the gateway does not expose.\n- The gateway gives one API key, unified billing, request observability, and model fallbacks. Configure a fallback chain so a provider outage degrades to another model instead of erroring.\n- Centralize model IDs in one module (e.g. `src/ai/models.ts`) as named constants - `CHAT_MODEL`, `FAST_MODEL`, `EMBEDDING_MODEL` - so prompts and routes never hardcode a raw string and a model upgrade is one edit.\n- Pick the tier by task: a small fast model for classification and routing, a frontier model for reasoning and agent loops. Do not default everything to the most expensive model.\n\nSee /src/ai for the agent loop memory and the structured-output rule."
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai",
      "title": "Build agents with the tool loop, bounded by stopWhen",
      "summary": "An agent is generateText/streamText with tools plus a stop condition; bound the loop with stopWhen: stepCountIs(n) so it cannot run forever.",
      "body": "An \"agent\" in the AI SDK is not a special class. It is a normal generation given tools and allowed to take multiple steps: the model calls a tool, the SDK runs `execute`, feeds the result back, and the model decides the next step.\n\n- Enable multi-step by setting a stop condition: `stopWhen: stepCountIs(5)` (AI SDK v5+ replaced the older `maxSteps` number with composable `stopWhen` conditions). Without a bound, a confused model can loop until it burns the budget.\n- Each step is billed. More tools and more steps cost more tokens and more latency; give the model the fewest tools that cover the task and the smallest step budget that completes it.\n- Make tools idempotent and side-effect-honest so a retried or repeated step heals instead of double-acting (charging twice, sending two emails). See the auth/billing patterns for the idempotency discipline.\n- Inspect `steps` in the result (or stream parts) when debugging: it shows which tools were called with which arguments, which is where most agent bugs actually live.\n- For durable, resumable agents that survive a crash mid-loop, run the loop inside a workflow/queue rather than a single request.\n\nSee /src/ai for the gateway routing memory and the schema-validation rule."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "ai-sdk-chat-route-review",
      "summary": "Pre-merge checklist for an AI SDK chat or agent endpoint: server-only keys, streaming, schemas, stop conditions, and cost controls.",
      "body": "---\nname: ai-sdk-chat-route-review\ndescription: Review checklist for Vercel AI SDK chat and agent endpoints. Run before merging any route handler, tool, or useChat client that calls a model.\n---\n\n# AI SDK chat/agent route review\n\n- [ ] The model call runs on the server only; no provider import or key in client code, and no `NEXT_PUBLIC_`/`PUBLIC_`/`VITE_` prefix on any provider or gateway key.\n- [ ] The endpoint enforces auth and rate limiting before calling the model; per-user budget is bounded.\n- [ ] User-facing replies use `streamText` + `toUIMessageStreamResponse()` and `useChat`; `generateText`/`generateObject` are only used for fully-consumed backend steps.\n- [ ] The request `AbortSignal` is passed through so navigation/cancel stops generation and billing.\n- [ ] Every tool declares `description` + `inputSchema` (Zod); `generateObject`/`streamObject` declares a `schema`. No hand-parsed model JSON.\n- [ ] Each tool's `execute` re-checks authorization for its action; a tool call is not authorization.\n- [ ] Agent loops set `stopWhen: stepCountIs(n)` (or equivalent); tools given are the minimum needed and are idempotent.\n- [ ] Model is a `provider/model` string via the gateway, sourced from a central models module; tier matches the task (cheap for routing, frontier for reasoning).\n- [ ] The error part of the stream is rendered/handled; a failed stream is not silent.\n- [ ] No PII or secrets are logged in prompts/traces beyond what telemetry policy allows.\n",
      "skillTags": [
        "ai-sdk",
        "llm",
        "streaming",
        "tool-calling",
        "agents",
        "ai-review"
      ]
    }
  ]
};
