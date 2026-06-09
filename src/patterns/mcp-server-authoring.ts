import type { Pattern } from "../types.js";

export const mcpServerAuthoring: Pattern = {
  "slug": "mcp-server-authoring",
  "version": "1.0.0",
  "name": "MCP Server Authoring",
  "tagline": "Build Model Context Protocol servers whose tools an LLM can actually call correctly and safely.",
  "description": "A focused standard for authoring Model Context Protocol servers. An MCP tool is an API consumed by a language model, so its description and input schema are not documentation - they are the contract the model reasons over. This pattern covers writing tools the model calls correctly, keeping side effects honest and destructive actions gated, and choosing transport and auth: stdio for local servers, streamable HTTP with bearer/OAuth for remote ones.",
  "category": "AI",
  "icon": "plug-zap",
  "color": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "MCP Server Authoring pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for authoring Model Context Protocol (MCP) servers: tool descriptions and schemas as the LLM contract, side-effect-honest and gated destructive tools, and stdio vs streamable HTTP transport with auth, tuned for AI coding agents.",
  "problem": "AI agents building MCP servers write vague tool descriptions, skip input schemas, let destructive tools fire without confirmation, and expose remote servers with no auth.",
  "audience": "Developers building MCP servers and tools for Claude, Cursor, and other MCP clients",
  "prevents": [
    "Tool descriptions too vague for the model to know when to call them",
    "Tools that accept arguments with no schema and crash on bad input",
    "Destructive tools that act with no confirmation parameter or dry-run",
    "Remote HTTP servers with no authentication"
  ],
  "appliesTo": {
    "paths": [
      "/src/mcp",
      "/src/tools",
      "/server"
    ],
    "stacks": [
      "mcp",
      "typescript",
      "node"
    ],
    "packages": [
      "@modelcontextprotocol/sdk",
      "zod"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/mcp",
      "title": "Treat the tool description and schema as the LLM-facing API contract",
      "summary": "Write each tool's name, description, and input schema for the model that reads them; the schema is mandatory and validated before the handler runs.",
      "body": "The model never sees your handler code. It decides whether and how to call a tool from the name, description, and input schema alone. Those three are the entire API as far as the LLM is concerned.\n\n- Name tools by action and object (`create_issue`, `search_docs`), not by internal function names. The name is the first thing the model matches against intent.\n- Write the description for the model: what the tool does, when to use it, when NOT to use it, and what it returns. Mention units, formats, and constraints the model would otherwise guess wrong. A vague description is the most common reason a tool is never called or called wrong.\n- Declare an input schema for every tool (Zod or JSON Schema) with `.describe()` on non-obvious fields. The SDK validates input against it before your handler runs, so the handler receives typed, checked arguments - never raw, unvalidated input.\n- Return structured, model-readable results and use the protocol's error channel (`isError`) for failures instead of throwing opaque strings. The model uses the result to decide its next step, so make the result legible.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/mcp",
      "title": "Keep tools side-effect-honest and gate destructive actions",
      "summary": "A tool's effects must match its description; destructive or irreversible tools require an explicit confirmation argument or a dry-run mode, and re-check authorization in the handler.",
      "body": "A model will call any tool it is given if the description fits the goal. The server, not the model's good judgement, is what stops a destructive call from doing damage.\n\n- A tool must do exactly what its description says and nothing more. A `search_*` tool must not write; a tool that mutates state must say so plainly in its description so the model (and the human approving it) understands the consequence.\n- Gate destructive or irreversible actions (delete, send, charge, deploy): require an explicit `confirm: true` argument, or support a `dryRun` that returns what would happen without doing it. Do not let one unqualified call wipe data.\n- Re-check authorization inside the handler against the authenticated session. The model selecting a tool is not authorization; the handler must verify the caller may perform this specific action on this specific resource.\n- Make handlers safe to retry: design mutations to be idempotent (or guarded by an idempotency key) so a re-issued call after a timeout does not double-act.\n- Scope each tool narrowly. A surgical tool the model uses correctly beats a powerful do-everything tool it misuses.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/mcp",
      "title": "Choose transport by deployment and authenticate remote servers",
      "summary": "Use stdio for local single-client servers and streamable HTTP for remote/multi-client servers; every HTTP server requires auth (bearer token or OAuth).",
      "body": "Transport is a deployment decision, and the moment a server is reachable over the network it needs authentication.\n\n- Use the stdio transport for a local server launched by one client (a desktop AI app, an editor): no network surface, the client owns the process lifecycle.\n- Use streamable HTTP for a remote or multi-client server. It is the current HTTP transport; do not build new servers on the deprecated HTTP+SSE transport.\n- Authenticate every HTTP server. At minimum require a bearer token; for third-party or user-facing servers, implement the MCP OAuth flow so each user authorizes with their own identity. An unauthenticated remote MCP server is an open door to whatever its tools can do.\n- Validate the `Origin` header and bind local HTTP servers to `127.0.0.1` to prevent DNS-rebinding and cross-site access. Keep secrets in server env, never in tool output or logs.\n- Pass the authenticated identity into tool handlers so per-tool authorization checks have a subject to check against.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/mcp",
      "title": "Choose the right primitive: tool vs resource vs prompt",
      "summary": "Tools are model-invoked actions, resources are app-controlled readable context, prompts are user-invoked templates; map each capability to the primitive whose control model fits.",
      "body": "MCP exposes three primitives with different control models, and picking the wrong one is a recurring design mistake.\n\n- Tools are model-controlled: the LLM decides to call them to take an action or fetch dynamic data. Use a tool when the model should act (mutations, searches, computations, live lookups).\n- Resources are application-controlled: readable, addressable context (a file, a record, a schema) the host app or user attaches. Use a resource for content the model should be able to read but not \"invoke\" - it has no side effect and is referenced by URI.\n- Prompts are user-controlled: parameterized templates a user explicitly selects (slash commands, canned workflows). Use a prompt to package a reusable interaction the user triggers, not the model.\n- A read-only lookup can legitimately be either a resource (attachable context) or a tool (model fetches on demand); choose by whether the host or the model should decide when it enters context. When unsure for actions, a narrowly-scoped tool is the safe default.\n\nSee /src/mcp for the tool-contract and destructive-action rules."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "mcp-tool-authoring-checklist",
      "summary": "Checklist to run before merging a new or changed MCP tool, resource, or prompt.",
      "body": "---\nname: mcp-tool-authoring-checklist\ndescription: Checklist for adding or changing an MCP tool, resource, or prompt. Run before merging any change to a Model Context Protocol server.\n---\n\n# MCP tool authoring checklist\n\n## Contract (model-facing)\n- [ ] Tool name is action+object and matches what the model would search for.\n- [ ] Description states what it does, when to use it, when NOT to, and what it returns - written for the model, with units/formats spelled out.\n- [ ] Input schema declared (Zod/JSON Schema) with `.describe()` on non-obvious fields; handler reads only validated input.\n- [ ] Result is structured and model-readable; failures use the error channel (`isError`), not opaque throws.\n\n## Safety\n- [ ] Effects match the description exactly; mutating tools say so.\n- [ ] Destructive/irreversible actions require `confirm: true` or support `dryRun`.\n- [ ] Handler re-checks authorization against the authenticated session for this resource.\n- [ ] Mutations are idempotent or guarded by an idempotency key (safe to retry).\n- [ ] Tool is narrowly scoped, not a do-everything tool.\n\n## Transport & auth\n- [ ] stdio for local single-client; streamable HTTP for remote (not the deprecated SSE transport).\n- [ ] Every HTTP server authenticates (bearer or OAuth); local HTTP binds to 127.0.0.1 and validates `Origin`.\n- [ ] No secrets in tool output or logs; authenticated identity flows into handlers.\n\n## Primitive choice\n- [ ] Capability mapped to the right primitive: tool (model acts), resource (readable context), prompt (user-triggered template).\n",
      "skillTags": [
        "mcp",
        "tools",
        "llm",
        "transport",
        "auth",
        "ai-review"
      ]
    }
  ]
};
