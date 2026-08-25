import type { Pattern } from "../types.js";

export const grpcProtobuf: Pattern = {
  "slug": "grpc-protobuf",
  "version": "1.0.0",
  "name": "gRPC and Protocol Buffers",
  "tagline": "Evolve Protobuf contracts with deadlines, status semantics, streaming backpressure, and compatibility.",
  "description": "gRPC gives typed service contracts and efficient streaming, but compatibility depends on field-number discipline, request presence, status mapping, deadline propagation, retry policy, metadata limits, and flow-controlled stream ownership. This pattern constrains schema evolution, deadline handling, and retry safety; it records status, streaming, and gateway decisions and provides a contract and interoperability review. It complements REST and GraphQL patterns by focusing on generated binary contracts, HTTP/2 streams, service-to-service deadlines, and Protobuf wire compatibility.",
  "category": "Backend",
  "icon": "binary",
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
  "metaTitle": "gRPC and Protobuf pattern for AI coding agents",
  "metaDescription": "gRPC Protobuf evolution, field presence, deadlines, cancellation, status codes, retries, metadata, streaming backpressure, and compatibility. In production.",
  "problem": "AI agents often reuse a removed field number, omit deadlines, retry non-idempotent methods, map every failure to UNKNOWN, or read an unbounded stream without cancellation.",
  "audience": "Platform and backend teams building internal RPC, public gRPC, or streaming service contracts",
  "prevents": [
    "Reinterpreting old serialized data through a reused field number",
    "Letting an upstream call outlive the caller's deadline",
    "Duplicating a state-changing RPC through transparent retry",
    "Buffering an unbounded stream faster than the consumer can process it"
  ],
  "appliesTo": {
    "paths": [
      "/proto",
      "/src/grpc",
      "/tests/contract"
    ],
    "stacks": [
      "grpc",
      "protobuf",
      "http2",
      "rpc",
      "streaming"
    ],
    "packages": [
      "@grpc/grpc-js",
      "protobufjs"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/proto",
      "title": "Evolve Protobuf schemas without changing wire meaning",
      "summary": "Never reuse field numbers, reserve removed identities, add compatible fields, and version semantic breaks deliberately.",
      "body": "Generated code hides the wire format, but deployed clients, stored messages, and queued payloads may retain old field numbers for years. Reusing one makes old bytes decode as a different concept.\n\n- Reserve the names and numbers of removed fields and enum values so future authors cannot assign them accidentally.\n- Add fields with safe absence behavior and avoid changing a field's type, repetition, or semantic meaning under the same number.\n- Keep enum zero as a deliberate unspecified value and make receivers handle values newer than their generated code.\n- Introduce a new message, method, or service version for incompatible required semantics instead of relying on coordinated fleet deployment.\n\nSee /tests/contract for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/grpc",
      "title": "Propagate deadlines and cancellation through every downstream call",
      "summary": "Require a bounded deadline, derive child budgets, stop work on cancellation, and avoid committing after the caller can no longer receive the result.",
      "body": "Without a deadline, an RPC can occupy threads, streams, connections, and database work indefinitely. A service that ignores cancellation also wastes capacity after its caller has already timed out.\n\n- Set client deadlines from the product operation budget and reject unbounded internal calls at the service boundary.\n- Propagate the remaining deadline to downstream RPC, database, and external work while reserving time for local cleanup and response serialization.\n- Observe cancellation in handlers and streaming loops, release resources promptly, and do not continue optional work merely because a goroutine or promise is still running.\n- Design commit points so cancellation before commit aborts and cancellation after commit returns or reconciles a stable operation outcome.\n\nSee /src/grpc for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/grpc",
      "title": "Retry only idempotent RPC outcomes under an explicit policy",
      "summary": "Classify method idempotency and retryable transport statuses, apply bounded backoff, and preserve operation identity.",
      "body": "A transport failure or unavailable status does not always prove the server did no work. Retrying a mutation can duplicate the effect unless the application recognizes the same logical request.\n\n- Mark read-only or idempotent methods explicitly in client policy and leave state-changing methods without automatic retry unless they use an idempotency key.\n- Retry only selected transient statuses before the overall deadline and stop after bounded attempts with jitter.\n- Do not retry validation, authentication, authorization, failed precondition, conflict, or unsupported-operation outcomes.\n- Include a stable operation identity in state-changing requests and make the server return the prior result after ambiguous client retry.\n\nSee /tests/contract for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/grpc",
      "title": "Status codes carry stable public failure semantics",
      "summary": "Map domain and transport failures to the narrowest gRPC status and attach bounded structured details for machines.",
      "body": "Returning UNKNOWN or INTERNAL for every expected failure prevents clients from deciding whether to correct input, refresh identity, resolve conflict, or retry later.\n\n- Use invalid-argument for malformed values, failed-precondition for unmet state, not-found for absent authorized resources, and permission outcomes without revealing hidden resources.\n- Reserve unavailable and resource-exhausted for transient service or capacity conditions callers may handle under policy.\n- Attach structured error details only when clients have a contract to consume them and keep metadata within bounded size.\n- Log internal causes with correlation identity while returning a stable public message that excludes secrets, stack traces, SQL, and dependency internals.\n\nSee /proto for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/grpc",
      "title": "Streaming handlers own backpressure and half-close behavior",
      "summary": "Read and write streams incrementally, bound application queues, and define cancellation and partial-result semantics.",
      "body": "HTTP/2 provides transport flow control, but application code can defeat it by reading an entire stream into memory or producing into an unbounded queue before writes complete.\n\n- Process incoming messages incrementally with limits on count, bytes, concurrency, and per-message cost.\n- Wait for outbound write readiness or completion rather than appending indefinitely to an application buffer.\n- Define what client half-close means, when the server may finish, and whether partial results are valid after an error.\n- Stop producer and consumer work together on cancellation or stream failure so one side does not leak after the other exits.\n\nSee /tests/contract for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/proto",
      "title": "Field presence is a business decision",
      "summary": "Use presence-aware fields or explicit wrappers where omitted, default, cleared, and unchanged have different meanings.",
      "body": "Protobuf scalar defaults can make an absent value look like an explicit zero or empty string. Patch and configuration APIs often need to distinguish those states.\n\n- Model optional input with presence when omission means leave unchanged and an explicit default means set or clear.\n- Use a field mask or command-specific patch message for partial updates rather than interpreting every default as missing.\n- Keep output defaults semantically valid so older clients can tolerate newly absent or unknown data.\n- Test generated clients in every supported language because presence and JSON mapping ergonomics differ even when the wire behavior is compatible.\n\nSee /src/grpc for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-grpc-contract",
      "summary": "Check Protobuf compatibility, generated clients, deadlines, statuses, retries, metadata, and streams across supported languages.",
      "body": "---\nname: review-grpc-contract\ndescription: Review a gRPC service or Protobuf change before publishing generated artifacts or deploying servers.\n---\n\n# Review Grpc Contract\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Run schema compatibility checks against the released descriptor set and inspect every changed number, name, type, enum, oneof, and presence rule.\n2. Generate supported clients and compile representative callers, including older clients against the new server and new clients against the old server.\n3. Exercise deadline expiry, cancellation, authentication, authorization, validation, conflict, capacity, and dependency failure and verify status semantics.\n4. Test retry policy with ambiguous state-changing outcomes and stable operation identity; prove no method retries beyond the caller's deadline.\n5. For streams, test slow readers, slow writers, half-close, large messages, cancellation, server restart, and bounded memory under sustained flow.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "grpc",
        "protobuf",
        "compatibility",
        "contract",
        "testing"
      ]
    }
  ]
};
