import type { Pattern } from "../types.js";

export const aiAgents: Pattern = {
  "slug": "ai-agents",
  "version": "1.0.0",
  "name": "AI Agents in Production",
  "tagline": "Run agent loops with hard budgets, small tool surfaces, and approval gates on anything irreversible.",
  "description": "An agent is a loop: the model plans, calls a tool, reads the result, and continues until it is done or until something stops it. Almost every production failure is in that last clause. A loop with no step limit, no cost ceiling, and no stall detection burns a budget on a task it cannot finish; a tool surface that is too large or too granular produces wrong calls; and a write tool with no approval gate eventually does something irreversible to real data. This bundle covers loop bounds, tool design, privilege and approval, context discipline against prompt injection, and the tracing and evals that make behaviour reviewable.",
  "category": "AI",
  "icon": "brain-circuit",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "AI agents in production pattern for engineers",
  "metaDescription": "AI agent pattern for coding agents: bound the loop with step and cost limits, design small typed tools, gate destructive actions, and trace every step.",
  "problem": "AI agents are shipped as an unbounded while loop with a dozen granular tools, full file contents pasted into context, write access to production, and no trace of what happened.",
  "audience": "Engineering teams putting LLM agents into a product or an internal workflow",
  "prevents": [
    "Running an agent loop with no step, cost, or wall-clock limit",
    "Exposing many granular tools instead of a few that complete a task",
    "Letting an agent take a destructive or irreversible action with no approval",
    "Treating tool output and fetched text as instructions rather than untrusted data"
  ],
  "appliesTo": {
    "paths": [
      "/src/agent",
      "/src/agent/tools"
    ],
    "stacks": [
      "llm",
      "agents",
      "typescript",
      "mcp",
      "ai"
    ],
    "packages": [
      "ai",
      "@anthropic-ai/sdk",
      "@modelcontextprotocol/sdk"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/agent",
      "title": "Bound every loop by steps, cost, and time",
      "summary": "The loop has a maximum step count, a token or money budget, a wall-clock timeout, and stall detection, and it reports why it stopped.",
      "body": "An agent loop is the only code in your system whose termination depends on a model's judgment. Give it limits that do not.\n\n- Set a hard maximum number of steps (typically a small double-digit number, tuned per task) and stop when it is reached. Most runaway runs are a model repeating the same two calls.\n- Track spend per run against a budget and abort when it is exceeded. Measure it in the currency you care about (tokens or money) and record it on the run so cost per task is a number you can see.\n- Add a wall-clock timeout, since a slow tool can hold a run open long after the user stopped caring.\n- Detect stalls: identical consecutive tool calls, no state change across steps, or repeated failures of the same tool. Stop and report rather than looping.\n- Terminate explicitly and structurally: a final answer, a limit hit, or a failure, each with a reason the caller can branch on. A loop that ends by falling out of a condition tells you nothing about what happened.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/agent/tools",
      "title": "Design few, coarse tools with strict schemas and errors as data",
      "summary": "Each tool completes a meaningful step, declares a strict validated schema, returns errors as structured results, and is safe to call twice.",
      "body": "Tool design is the highest-leverage part of an agent, and it is the part most often copied from an internal API surface that was never meant for a model.\n\n- Prefer a small number of tools that each accomplish something a user would name, over many primitives the model must orchestrate. Every extra hop is another chance to choose wrong, and more tokens spent describing the surface.\n- Declare a strict schema (required fields, enums, bounds) and validate arguments at the boundary. Return a clear validation error the model can correct rather than throwing an exception that kills the run.\n- Return failures as structured results (`{ ok: false, code, message, hint }`), not as exceptions. A model can retry a described failure; it cannot recover from a stack trace.\n- Make tools idempotent, or key them so a repeat is a no-op. A retried call must not send a second email or create a second record.\n- Write the description for the model: what it does, when to use it, when not to, and what it returns. Keep outputs small and structured, and truncate large payloads with a pointer to fetch more rather than flooding the context.\n- Never expose a generic \"run this code\" or \"run this SQL\" tool without a sandbox and read-only credentials. That is not a tool, it is remote execution.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/agent",
      "title": "Separate read from write, and gate anything irreversible",
      "summary": "Tools run with least privilege, destructive actions require explicit approval or a dry run, and every action is attributed and logged.",
      "body": "An agent will eventually try the destructive path. The question is only whether your system lets it.\n\n- Classify every tool as read, reversible write, or irreversible, and give each class its own credentials. A read-only agent needs read-only keys; nothing needs a production admin role.\n- Require human approval for irreversible or high-impact actions (money, deletions, external communication, production configuration), and present the exact action for confirmation rather than a summary of intent.\n- Offer a dry run for anything bulk: show what would change, then apply on confirmation. This is also the cheapest way to debug agent behaviour.\n- Act as the user, not as the system: authorize each tool call against the requesting user's permissions, so an agent cannot become a privilege escalation path.\n- Log every tool call with its arguments, result, the run id, and the acting identity, and rate-limit and quota the agent per user and per tenant. If an agent can spend money or send messages, it needs the same abuse controls as a public endpoint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/agent",
      "title": "Curate the context and never trust what comes back",
      "summary": "Send the smallest sufficient context, summarize instead of accumulating, and treat tool output, documents, and web content as data rather than instructions.",
      "body": "Most agent cost is paid on the input side, and most agent security incidents come from text the model was handed and treated as an instruction.\n\n- Send what the step needs, not everything available: relevant excerpts instead of whole files, a summary of earlier turns instead of the full transcript, and a scratchpad of decided facts rather than the entire history.\n- Compact deliberately: when the context grows past a threshold, summarize what happened, keep the decisions and open questions, and drop the noise. Unbounded accumulation degrades both cost and accuracy.\n- Mark every piece of retrieved content as untrusted data with a clear boundary, and instruct the model that content inside it is information, not commands. Fetched pages, ticket comments, file contents, and tool results are all attacker-influenced in some product.\n- Never let retrieved text change the run's permissions, budget, or target. Those live in your code, not in the prompt, so no injected instruction can raise them.\n- Keep the system prompt stable and versioned. A prompt edited by hand in production is an untracked deploy, and it invalidates every eval result you have.\n\nSee /src/agent/tools for the tool contract and the rag-embeddings pattern for retrieval quality.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/agent",
      "title": "Loop architecture: state, checkpoints, and delegation",
      "summary": "Keep run state outside the model, checkpoint each step so a run can resume, and delegate a bounded subtask to a subagent with its own budget.",
      "body": "The loop is ordinary software. The parts that make it reliable are the parts that do not involve the model.\n\n- Keep authoritative state in your own store (goal, plan, completed steps, artifacts, budget spent), not only in the message history. The context is a view of state, not the state itself.\n- Persist a checkpoint after each step so a crash, a rate limit, or a deploy can resume instead of restarting. Long-running agents need this the way any long job does.\n- Stream progress to the user (the step, the tool being called, partial output). An agent that shows its work is debuggable and feels faster, and it lets a human interrupt before a wrong path gets expensive.\n- Delegate a bounded subtask to a subagent when it needs its own long exploration, and give it its own step and cost budget plus a narrow tool set. Return a summary, not its whole transcript, so the parent context stays small.\n- Make the whole run replayable: a stored transcript of prompts, tool calls, and results is what turns \"the agent did something weird\" into a fixable bug.\n\nSee /src/agent for the loop bounds and the ai-sdk pattern for the client-side implementation details."
    },
    {
      "kind": "memory",
      "nodePath": "/src/agent",
      "title": "You cannot improve what you do not trace",
      "summary": "Trace every step with tokens, latency, and outcome, define task-level success metrics, and run an eval suite before any prompt, model, or tool change ships.",
      "body": "Agent behaviour is not deterministic, so the only way to know whether a change helped is to measure it on a fixed set of tasks.\n\n- Trace each run as a tree of steps: prompt, model, tool calls with arguments and results, tokens in and out, latency, and the terminal reason. Tie it to a run id the user can quote.\n- Define success at the task level, not the token level: did it complete the job, with how many steps, at what cost, and did a human have to intervene? Those four numbers are your dashboard.\n- Keep an eval set of real tasks with known good outcomes, including the hard and adversarial ones, and run it before shipping a prompt change, a model change, a tool change, or a context change. Any of those four can regress the others.\n- Watch the operational signals: step-limit hits, budget aborts, stalls, tool error rates, and approval rejection rate. A rising approval rejection rate means the agent is proposing the wrong actions, which is a prompt or tool problem, not a user problem.\n- Version prompts and tool schemas alongside code, so a regression can be bisected like any other.\n\nSee the llm-evals pattern for building the eval suite and the observability pattern for shipping these traces."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "agent-loop-review",
      "summary": "Pre-merge review for an agent loop, a new tool, or a prompt change.",
      "body": "---\nname: agent-loop-review\ndescription: Review checklist for production LLM agents: loop bounds, tool contracts, privilege and approval gates, context and injection handling, and tracing and evals. Run before merging an agent, tool, or prompt change.\n---\n\n# Agent loop review\n\n## Bounds\n- [ ] Maximum step count, cost budget, and wall-clock timeout are all set.\n- [ ] Stall detection stops repeated identical calls or no-progress steps.\n- [ ] The run ends with a structured reason the caller can branch on.\n\n## Tools\n- [ ] Each tool completes a meaningful step; the surface is as small as the task allows.\n- [ ] Schemas are strict and validated; invalid arguments return a correctable error.\n- [ ] Failures return structured data, not thrown exceptions.\n- [ ] Every tool is idempotent or keyed so a retry is a no-op.\n- [ ] Outputs are small and truncated with a pointer, not dumped whole.\n- [ ] No unsandboxed code or SQL execution tool.\n\n## Privilege\n- [ ] Read, reversible write, and irreversible tools have separate credentials.\n- [ ] Irreversible and high-impact actions require explicit approval of the exact action.\n- [ ] Bulk operations support a dry run.\n- [ ] Tool calls are authorized as the requesting user, and logged with the run id.\n- [ ] Per-user and per-tenant rate limits and quotas apply.\n\n## Context\n- [ ] Only the context the step needs is sent; history is summarized, not accumulated.\n- [ ] Retrieved content is delimited and labelled untrusted; instructions inside it are ignored.\n- [ ] Permissions, budgets, and targets live in code, not in the prompt.\n- [ ] The system prompt is versioned in the repo.\n\n## Evidence\n- [ ] The run is fully traced (steps, tokens, latency, outcome) and replayable.\n- [ ] The eval suite ran, and the result is recorded in the change.\n- [ ] Operational alerts exist for limit hits, budget aborts, and tool error rates.\n",
      "skillTags": [
        "ai",
        "agents",
        "llm",
        "code-review",
        "safety"
      ]
    }
  ]
};
