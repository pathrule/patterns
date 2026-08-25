import type { Pattern } from "../types.js";

export const localLlmOllamaVllm: Pattern = {
  "slug": "local-llm-ollama-vllm",
  "version": "1.0.0",
  "name": "Local LLM Inference with Ollama and vLLM",
  "tagline": "Operate local inference with explicit model identity, memory budgets, batching, quantization, and limits.",
  "description": "Local inference moves model download, format, quantization, GPU and host memory, context length, batching, concurrency, warmup, admission, and model provenance into the application's operational boundary. This pattern constrains model identity and request admission, records runtime and quantization decisions, separates interactive Ollama-style use from throughput-oriented vLLM serving, and supplies a capacity benchmark procedure. It differs from model routing and hosted-provider cost control by focusing on self-operated weights, hardware fit, scheduler behavior, and local runtime lifecycle.",
  "category": "AI",
  "icon": "cpu",
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
  "metaTitle": "Ollama vLLM local inference pattern for AI",
  "metaDescription": "Ollama and vLLM model identity, quantization, GPU memory, context limits, batching, concurrency, admission control, benchmarking, and rollout. In production.",
  "problem": "AI agents often load a model by a mutable tag, advertise a context the hardware cannot sustain, accept unbounded concurrent generations, or compare quantizations with different prompts and sampling.",
  "audience": "AI platform teams serving open-weight models on developer machines, workstations, or GPU infrastructure",
  "prevents": [
    "Serving different weights under the same application release",
    "Exhausting accelerator memory through context and concurrency",
    "Queueing requests beyond useful latency and cancellation",
    "Selecting a faster quantization without evaluating task-quality loss"
  ],
  "appliesTo": {
    "paths": [
      "/models",
      "/src/inference",
      "/ops/inference"
    ],
    "stacks": [
      "ollama",
      "vllm",
      "local-llm",
      "inference",
      "gpu"
    ],
    "packages": [
      "ollama",
      "vllm"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/models",
      "title": "Pin model weights, tokenizer, format, and serving parameters",
      "summary": "Resolve every deployment to immutable model artifacts and record context, quantization, template, and trust provenance.",
      "body": "A model name or mutable tag is not a reproducible release. Different weights, tokenizer files, chat templates, or quantization can change output and memory behavior without application code changing.\n\n- Record model repository and immutable revision or checksum, tokenizer and chat template identity, file format, quantization, and license or usage constraints.\n- Store generation defaults and stop behavior with the application evaluation baseline rather than relying on runtime-wide implicit values.\n- Verify downloaded artifacts before load and restrict model sources and custom code according to the execution trust policy.\n- Expose model identity in health and generation metadata so traces and evaluations can attribute output to the actual loaded artifact.\n\nSee /src/inference for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/inference",
      "title": "Admit requests within memory and latency budgets",
      "summary": "Bound prompt tokens, output tokens, concurrent sequences, queued work, and cancellation before the runtime exhausts accelerator or host resources.",
      "body": "KV cache and active sequence memory grow with context and concurrency. Accepting every request until allocation fails creates correlated latency spikes and process loss.\n\n- Validate prompt and requested output limits against the deployed model, runtime configuration, and available memory rather than the model's theoretical maximum alone.\n- Apply concurrency and queue limits with an explicit overload response and useful retry guidance; do not hide an infinite queue behind an API timeout.\n- Propagate cancellation into queued and active generation and release scheduler state promptly when clients disconnect.\n- Separate interactive latency and batch-throughput workloads or assign priorities so long generations cannot starve short user-facing requests.\n\nSee /ops/inference for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/ops/inference",
      "title": "Runtime choice follows workload shape",
      "summary": "Use a developer-friendly local runtime for simple model lifecycle and a batching server when sustained multi-request throughput justifies its operational cost.",
      "body": "Ollama-style runtimes optimize convenient model management and local use, while vLLM-style serving emphasizes continuous batching and accelerator throughput. Neither choice is universally better.\n\n- Choose from request concurrency, latency objective, model count, hardware, batching opportunity, API compatibility, observability, and operator skill.\n- Keep a compatibility adapter at the application boundary so runtime-specific model names, parameters, and errors do not spread through product code.\n- Benchmark the exact model and context distribution on target hardware; published tokens-per-second numbers from another shape do not size this service.\n- Define model load, unload, warmup, health, and replacement behavior for the chosen runtime, including what happens to queued and active requests.\n\nSee /src/inference for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/models",
      "title": "Quantization trades quality, memory, and speed by task",
      "summary": "Select precision from measured task quality and hardware behavior rather than file size or headline throughput alone.",
      "body": "Reducing precision can fit a larger model or more KV cache but may degrade structured output, long-context recall, multilingual behavior, tool use, or domain tasks unevenly.\n\n- Compare candidate quantizations with identical model revision, prompts, chat template, sampling, context distribution, and scoring.\n- Measure accelerator and host memory, load time, prompt processing, generation throughput, latency percentiles, and failure behavior.\n- Evaluate product tasks and critical slices, not only generic benchmarks, and retain outputs for qualitative review where automated scores are incomplete.\n- Treat a quantization change as a model release with evaluation, canary, rollback, and attributable identity.\n\nSee /ops/inference for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/inference",
      "title": "API compatibility does not guarantee behavior compatibility",
      "summary": "Normalize requests and responses, but validate unsupported parameters, token accounting, streaming, errors, and tool formats per runtime.",
      "body": "An endpoint shaped like a popular provider can accept the same JSON while interpreting templates, stop sequences, tools, log probabilities, usage, or errors differently.\n\n- Define the subset of request fields the product supports and reject or translate unsupported values explicitly.\n- Normalize streaming event order, finish reasons, usage accounting, cancellation, and public errors behind the inference adapter.\n- Test structured output and tool-call formats with the exact model and runtime because schema adherence is a model behavior, not only an API feature.\n- Do not compare hosted and local costs or quality until prompt templates, context truncation, and generation settings are aligned.\n\nSee /models for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "benchmark-local-llm-service",
      "summary": "Measure model quality, memory, throughput, latency, batching, overload, cancellation, and recovery on target hardware.",
      "body": "---\nname: benchmark-local-llm-service\ndescription: Benchmark an Ollama, vLLM, or other local inference deployment before production use.\n---\n\n# Benchmark Local Llm Service\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Pin model, tokenizer, template, quantization, runtime, driver, hardware, and generation settings and record warm and cold conditions.\n2. Replay representative prompt and output lengths, concurrency, streaming, tool, and structured-output workloads with product evaluation cases.\n3. Measure load time, host and accelerator memory, prompt throughput, generation throughput, queue time, latency percentiles, errors, and quality scores.\n4. Increase concurrency through saturation, then test queue limit, overload response, cancellation, client disconnect, model reload, and process restart.\n5. Select the smallest capacity that meets quality and latency headroom, publish limits with model identity, and retain a prior artifact and runtime configuration for rollback.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "ollama",
        "vllm",
        "inference",
        "benchmark",
        "gpu"
      ]
    }
  ]
};
