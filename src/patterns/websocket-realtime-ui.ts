import type { Pattern } from "../types.js";

export const websocketRealtimeUi: Pattern = {
  "slug": "websocket-realtime-ui",
  "version": "1.0.0",
  "name": "Real-Time UI with WebSockets",
  "tagline": "Design WebSocket identity, ordering, reconnect, backpressure, presence, and resynchronization.",
  "description": "A WebSocket provides an ordered byte stream for one live connection, not durable delivery across disconnects, browser sleep, server restarts, deployment, or a client that processes messages slower than the producer sends them. This pattern constrains authenticated connection setup, message validation, and bounded queues; it records sequence, resume, presence, and optimistic-state decisions and provides a reconnect failure test. It complements Kafka and background-job patterns by focusing on the browser-facing session, where ephemeral connection state must reconcile with an authoritative API or event log.",
  "category": "Frontend",
  "icon": "messages-square",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "WebSocket real-time UI pattern for AI agents",
  "metaDescription": "WebSocket authentication, message schemas, ordering, reconnect, resume cursors, backpressure, presence, optimistic UI, and resync testing. In production.",
  "problem": "AI agents often authenticate only the initial page, assume reconnect preserves missed events, append duplicates without sequence identity, or allow an unbounded client message queue.",
  "audience": "Frontend and backend teams building collaborative, presence, notification, monitoring, or live-update interfaces",
  "prevents": [
    "Applying the same event twice after reconnect",
    "Missing events produced while the browser was suspended",
    "Treating a socket connection as permanent authorization",
    "Crashing a client or server through unbounded buffered messages"
  ],
  "appliesTo": {
    "paths": [
      "/src/realtime",
      "/server/realtime",
      "/tests/realtime"
    ],
    "stacks": [
      "websocket",
      "real-time",
      "frontend",
      "nodejs",
      "event-stream"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/server/realtime",
      "title": "Authenticate and authorize the live subscription",
      "summary": "Validate connection identity, origin, channel access, and authorization changes instead of inheriting trust from page load.",
      "body": "A long-lived connection can outlast tokens, membership, and resource permissions. Accepting a socket once and trusting every later subscribe command creates access that cannot be revoked correctly.\n\n- Authenticate the handshake or first protocol message through a reviewed token mechanism and validate browser origin where the deployment relies on it.\n- Authorize each channel, document, tenant, or topic subscription against current server state; do not trust a client-supplied tenant or room name.\n- Define token expiry and permission-change behavior, including reauthentication, subscription removal, or connection close with a stable reason.\n- Rate-limit connection, authentication, subscription, and message actions separately so reconnect storms and channel scanning cannot consume the service.\n\nSee /src/realtime for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/server/realtime",
      "title": "Validate every message against a versioned envelope",
      "summary": "Use bounded payload schemas, message type allowlists, correlation identity, and explicit protocol errors on both client and server.",
      "body": "WebSocket frames are untrusted input without HTTP route and body-parser boundaries. A generic event name plus arbitrary object recreates remote procedure calls without a reviewable contract.\n\n- Define an envelope with protocol version, type, message or operation identity, and a payload schema per allowed message.\n- Reject unknown types, oversized frames, invalid nesting, and unsupported versions before dispatching to domain behavior.\n- Separate commands, events, acknowledgements, and errors so clients do not confuse a requested action with an authoritative state transition.\n- Log protocol type, stable identity, size, and outcome without recording secret or personal payload fields.\n\nSee /tests/realtime for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/server/realtime",
      "title": "Bound outbound and inbound connection buffers",
      "summary": "Set queue, frame, rate, and processing limits, then close or degrade slow consumers with a recoverable reason.",
      "body": "A connection that receives faster than it can transmit or process accumulates memory. Backpressure must become a protocol decision before one slow browser harms every session in the process.\n\n- Track buffered bytes and queued messages per connection and define a maximum with a close, snapshot, or coalescing policy.\n- Coalesce replaceable state updates such as progress or presence instead of retaining every intermediate value.\n- Keep durable domain events outside the socket process so dropping an ephemeral connection does not lose the authoritative transition.\n- Apply inbound rate and concurrency limits before expensive validation or database work, and return a protocol-level throttle or close reason clients understand.\n\nSee /src/realtime for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/realtime",
      "title": "Reconnect resumes from an authoritative cursor",
      "summary": "Persist the last applied sequence, request events after it, and fall back to a fresh snapshot when the history window is unavailable.",
      "body": "A new socket is a new stream. Reconnecting without a cursor either loses events created during the gap or forces the client to append a full replay over state it already has.\n\n- Give authoritative events a stable stream and sequence identity and make client application idempotent by event ID.\n- Persist or retain the last applied cursor at the state owner, not merely in the socket instance that was lost.\n- On reconnect, request events after the cursor and apply them in order; buffer out-of-order arrivals only within a strict bound.\n- When the cursor is too old or the server cannot prove continuity, replace local state from a versioned snapshot and resume from its cursor.\n\nSee /server/realtime for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/realtime",
      "title": "Presence is leased, approximate state",
      "summary": "Represent presence with heartbeats and expiry, and never use it as durable identity, authorization, or business truth.",
      "body": "Disconnect events are not guaranteed when a laptop sleeps, a network changes, or a process dies. Presence must expire without a clean close and tolerate brief disagreement between viewers.\n\n- Issue a connection or session presence identity distinct from the user account and refresh it through bounded heartbeats.\n- Expire presence after a documented lease and communicate that online indicators are approximate rather than instantaneous truth.\n- Aggregate multiple tabs and devices intentionally so one closing tab does not mark a still-connected user offline.\n- Keep authorization and durable workflow state in the authoritative backend; presence can inform UI but cannot grant access or prove attendance.\n\nSee /server/realtime for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-websocket-resynchronization",
      "summary": "Break and resume live connections across gaps, duplicates, reordering, slow consumers, token changes, and server restarts.",
      "body": "---\nname: test-websocket-resynchronization\ndescription: Test a WebSocket protocol or real-time UI change before release.\n---\n\n# Test Websocket Resynchronization\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Connect with valid, expired, unauthorized, wrong-origin, malformed, oversized, and unsupported-version inputs and confirm rejection occurs before subscription or domain work.\n- [ ] Produce events while the client is disconnected, then reconnect from a current, old, invalid, and missing cursor; verify replay or snapshot behavior.\n- [ ] Duplicate and reorder events around optimistic UI changes and prove the final state follows authoritative sequence without duplicate rows or effects.\n- [ ] Throttle the client and server consumer to grow buffers; verify coalescing, limits, close reason, and recovery without process-level memory growth.\n- [ ] Restart and deploy socket servers while several tabs and devices are connected, then revoke access and confirm every connection eventually loses the subscription.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "websocket",
        "realtime",
        "resync",
        "testing",
        "protocol"
      ]
    }
  ]
};
