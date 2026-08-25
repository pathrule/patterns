import type { Pattern } from "../types.js";

export const llmStreamingUx: Pattern = {
  "slug": "llm-streaming-ux",
  "version": "1.0.0",
  "name": "LLM Streaming UX",
  "tagline": "Design typed stream events, resumable state, cancellation, and honest partial-output interactions.",
  "description": "LLM streaming UX is a distributed state machine spanning provider events, server tools, transport, client rendering, cancellation, and persistence. This bundle defines typed events, message identity, commit boundaries, reconnect behavior, accessible updates, and adversarial stream tests. Unlike AI SDK, it owns product behavior under partial, failed, and resumed output rather than a specific streaming helper API.",
  "category": "AI",
  "icon": "message-square-more",
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
  "metaTitle": "LLM streaming UX pattern for AI coding agents",
  "metaDescription": "Typed stream events, stable message identity, cancellation, reconnect, commit boundaries, accessible partial output, and adversarial streaming tests.",
  "problem": "Agents append raw text chunks until done, leaving tool states, partial persistence, reconnects, cancellations, duplicate events, and screen-reader updates undefined.",
  "audience": "Teams building chat, generation, or agent interfaces that render incremental model and tool output",
  "prevents": [
    "Duplicate or reordered chunks corrupting the visible message",
    "Canceled or failed output persisted as complete",
    "Reconnects rerunning tools or creating a second assistant message"
  ],
  "appliesTo": {
    "paths": [
      "/src/ai",
      "/src/components/chat",
      "/app/api/chat"
    ],
    "stacks": [
      "llm",
      "streaming",
      "chat-ui",
      "sse"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/app/api/chat",
      "title": "Stream typed events with stable identity and order",
      "summary": "The transport carries message, part, event, sequence, and terminal state instead of unframed text chunks.",
      "body": "The transport carries message, part, event, sequence, and terminal state instead of unframed text chunks. Raw chunk concatenation cannot represent tool calls, citations, errors, refusal, usage, reconnect position, or duplicate delivery safely. Enforce this boundary in /app/api/chat so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Assign the assistant message and each content or tool part a stable server-generated identifier before streaming deltas.\n- Use explicit event types for start, delta, tool state, metadata, error, canceled, and completed outcomes.\n- Include a monotonic sequence or resumable cursor and make clients ignore already-applied events.\n- Emit exactly one terminal outcome and close the stream after durable finalization or explicit failure.\n\nVerification: Duplicate, reorder, delay, and drop events around tool and terminal boundaries; confirm the client converges or reconnects without corrupting content or effects.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/ai",
      "title": "Persistence follows semantic commit points",
      "summary": "A visible delta is not yet a completed message, a confirmed tool result, or a billable product outcome.",
      "body": "A visible delta is not yet a completed message, a confirmed tool result, or a billable product outcome. Persist the message shell and event cursor early for recovery, but mark content and tool parts with explicit in-progress, failed, canceled, and complete states.\n\nCommit tool side effects through their own idempotent transaction before emitting a successful result. Finalize assistant content only after the terminal provider event and server validation. Keep partial output available for diagnostics or user recovery without presenting it as authoritative completion. Keep the decision explicit at /src/ai; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /app/api/chat for event framing and /src/components/chat for state rendering. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components/chat",
      "title": "The interface renders state, not transport activity",
      "summary": "Chunk arrival rate is noisy and does not map directly to readable motion, focus, or trustworthy completion.",
      "body": "Chunk arrival rate is noisy and does not map directly to readable motion, focus, or trustworthy completion. Buffer visual text updates to a stable cadence while applying semantic events such as tool start, approval, failure, and completion immediately.\n\nKeep focus under user control and announce meaningful state changes through a restrained live region. Show cancellation as an available action while work is active and a durable outcome after it wins the race. Preserve the message identity and visible partial state across reconnect instead of adding another message. Keep the decision explicit at /src/components/chat; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /app/api/chat for terminal truth and the streaming UX test skill for degraded networks. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "implement-streaming-ux",
      "summary": "Implement an LLM streaming flow from typed server events through accessible client state and persistence.",
      "body": "---\nname: implement-streaming-ux\ndescription: Implement an LLM streaming flow from typed server events through accessible client state and persistence.\n---\n\n# Implement Streaming Ux\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Define the event union, message and part identifiers, sequence or cursor, terminal outcomes, and serialization tests before building the UI.\n2. Implement server production with cancellation propagation, idempotent tool effects, durable cursors, and one terminal transition.\n3. Build a client reducer that applies duplicate-safe events, batches text rendering, restores persisted state, and exposes retry or reconnect without new identities.\n4. Add accessible busy, tool, approval, error, canceled, and complete states; verify focus, reduced motion, copy, selection, and screen-reader announcements.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "llm",
        "streaming",
        "ux",
        "accessibility"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/tests/ai",
      "title": "test-streaming-failures",
      "summary": "Test partial, duplicated, reordered, disconnected, canceled, and failed LLM streams across server and client boundaries.",
      "body": "---\nname: test-streaming-failures\ndescription: Test partial, duplicated, reordered, disconnected, canceled, and failed LLM streams across server and client boundaries.\n---\n\n# Test Streaming Failures\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Create deterministic event fixtures with text, tool, metadata, refusal, usage, error, canceled, and completed events around every boundary.\n2. Inject duplicate, missing, delayed, and out-of-order delivery plus disconnect before and after tool commit and final persistence.\n3. Race user cancellation with provider completion and tool completion; confirm exactly one terminal state and no orphaned side effect.\n4. Reconnect from every cursor, reload the UI, and verify message identity, rendered content, accessibility state, stored status, and usage remain consistent.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "llm",
        "streaming",
        "testing",
        "failure-injection"
      ]
    }
  ]
};
