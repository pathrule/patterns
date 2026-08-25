import type { Pattern } from "../types.js";

export const mcpClientIntegration: Pattern = {
  "slug": "mcp-client-integration",
  "version": "1.0.0",
  "name": "MCP Client and Tool Integration",
  "tagline": "Build MCP clients with explicit capabilities, consent, auth, transport, schemas, and result handling.",
  "description": "An MCP client connects model decisions to external tools and resources, so server discovery, capability negotiation, user consent, authentication, transport lifecycle, schema validation, cancellation, and untrusted result rendering become application security boundaries. This pattern constrains tool invocation and result trust, records connection and capability ownership, and supplies a client integration verification workflow. It complements MCP server authoring by focusing on the host or client that discovers servers, presents tools to a model, obtains approval, executes calls, and renders returned content.",
  "category": "AI",
  "icon": "unplug",
  "color": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "MCP client integration pattern for AI agents",
  "metaDescription": "MCP client capability negotiation, tool consent, authentication, transports, JSON schemas, timeouts, cancellation, result trust, and integration tests.",
  "problem": "AI agents often auto-approve discovered tools, persist broad tokens, trust server result text as instructions, or retry a side-effecting tool after an ambiguous transport failure.",
  "audience": "Teams building AI hosts, assistants, editors, or agents that connect to Model Context Protocol servers",
  "prevents": [
    "Giving a newly discovered server silent external-write authority",
    "Executing a tool call outside the user's intended scope",
    "Treating returned content as trusted application instructions",
    "Duplicating a side effect after transport interruption"
  ],
  "appliesTo": {
    "paths": [
      "/src/mcp",
      "/src/tools",
      "/tests/mcp"
    ],
    "stacks": [
      "mcp",
      "model-context-protocol",
      "ai-agents",
      "tool-calling",
      "typescript"
    ],
    "packages": [
      "@modelcontextprotocol/sdk"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/tools",
      "title": "Authorize each tool call at the moment of effect",
      "summary": "Combine server trust, declared tool schema, current user intent, target scope, and write risk before execution.",
      "body": "Connecting a server or listing a tool does not grant blanket authority. Tool descriptions are server-controlled content and can understate the real effect or change over time.\n\n- Classify tools as read, local write, external write, sensitive read, destructive, or privileged and apply the product's consent policy to the actual call.\n- Show the user or policy engine the resolved server, tool, arguments, target, and expected effect before approval where required.\n- Do not allow model text or a server response to broaden credentials, paths, recipients, or resources beyond the active user request.\n- Record approval and execution outcome with bounded arguments and identities while redacting secrets and unnecessary personal data.\n\nSee /src/mcp for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/mcp",
      "title": "Validate discovery and results as untrusted protocol data",
      "summary": "Check capability, schema, size, content type, resource URI, and result shape before exposing them to models or application renderers.",
      "body": "Servers can be buggy or malicious, and tool results can contain prompt injection, unsafe links, oversized payloads, or content types the client is not prepared to display.\n\n- Accept only negotiated capabilities and protocol messages valid for the active connection and supported client version.\n- Validate tool input and output against bounded schemas and reject unknown or oversized content before model context assembly.\n- Treat text and resources returned by servers as untrusted data, not higher-priority instructions, and preserve provenance in model context.\n- Render links, markdown, images, resources, and embedded content through application security policy without executing arbitrary HTML, scripts, or local paths.\n\nSee /tests/mcp for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/mcp",
      "title": "Retry tool calls only when effect semantics permit it",
      "summary": "Use deadlines, cancellation, stable operation identity, and explicit idempotency before repeating an interrupted call.",
      "body": "A transport close or timeout does not prove the server failed before performing the effect. Automatic retry can send the same message, create the same issue, or delete the target twice.\n\n- Assign a deadline and propagate cancellation through the transport and tool execution path.\n- Retry read-only or explicitly idempotent tools under a bounded policy and preserve the same logical operation identity.\n- For ambiguous state-changing outcomes, query server or external state by operation identity before deciding whether to repeat.\n- Surface unknown outcome separately from failure so the user can reconcile instead of receiving a false success or triggering another automatic action.\n\nSee /src/tools for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/mcp",
      "title": "Connection lifecycle owns authentication and capability state",
      "summary": "Bind tokens, negotiated features, server identity, tool catalog, subscriptions, and pending requests to one connection owner.",
      "body": "Transport reconnect can change server version, authentication, tools, or capabilities. Reusing cached discovery blindly after reconnect makes the client call a stale or differently scoped surface.\n\n- Authenticate through the approved flow and keep credentials scoped to server, user, audience, and required capabilities.\n- On connection establishment, negotiate capabilities and discover the surfaces the client supports rather than assuming every server implements every feature.\n- Cancel or reconcile pending requests on disconnect and clear subscriptions and progress handlers owned by the old connection.\n- Rediscover after reconnect and make changed tools or permissions visible before the model can invoke them.\n\nSee /src/tools for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/tools",
      "title": "Tool descriptions are model affordances with product ownership",
      "summary": "Present concise accurate effects, arguments, limits, and failure behavior while keeping security policy outside server-provided prose.",
      "body": "Models select tools from names, descriptions, and schemas. Poor affordances cause wrong calls, but trusting a remote description to define security lets the server write its own permissions.\n\n- Normalize tool names with server identity where collisions are possible and preserve the original protocol identity for calls.\n- Expose descriptions and argument schemas within context budgets and omit tools unavailable to the current user or task.\n- Keep approval, target restrictions, rate limits, credential scopes, and destructive-action policy in the client or host.\n- Measure tool selection and failure evidence without storing sensitive argument values, then improve affordances through reviewed client configuration.\n\nSee /tests/mcp for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-mcp-client-integration",
      "summary": "Test MCP discovery, consent, auth, transport, schemas, cancellation, retries, result rendering, and reconnect behavior.",
      "body": "---\nname: verify-mcp-client-integration\ndescription: Verify an MCP server connection or tool integration in an AI client.\n---\n\n# Verify Mcp Client Integration\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Connect with valid, expired, wrong-audience, missing, and revoked credentials and negotiate supported and unsupported capabilities.\n2. Discover duplicate, changed, malformed, oversized, and unauthorized tools and resources and confirm policy filters them before model exposure.\n3. Invoke read, external-write, destructive, invalid, slow, cancelled, ambiguous, and idempotent calls and verify consent and retry semantics.\n4. Return prompt-injection text, unsafe links, unexpected content types, large resources, and malformed structured results and confirm provenance and safe rendering.\n5. Disconnect during pending calls and subscriptions, reconnect to a changed catalog, and prove stale tools, handlers, credentials, and outcomes are cleared or reconciled.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "mcp",
        "client",
        "tool-calling",
        "security",
        "testing"
      ]
    }
  ]
};
