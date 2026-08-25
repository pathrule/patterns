import type { Pattern } from "../types.js";

export const llmFineTuning: Pattern = {
  "slug": "llm-fine-tuning",
  "version": "1.0.0",
  "name": "LLM Fine-Tuning and Dataset Curation",
  "tagline": "Fine-tune models through licensed datasets, leakage control, reproducible training, evaluations, and rollback.",
  "description": "Fine-tuning changes model behavior through a dataset and training recipe, so provenance, consent, privacy, formatting, deduplication, train-test leakage, base-model identity, checkpoint selection, and serving compatibility become release-critical inputs. This pattern constrains dataset admission and evaluation separation, records objective and checkpoint decisions, and supplies separate dataset and training-release procedures. It complements RAG and LLM eval patterns by focusing on changing model weights; retrieval changes context at inference time, while evaluation measures behavior without authorizing training data.",
  "category": "AI",
  "icon": "sliders-horizontal",
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
  "metaTitle": "LLM fine-tuning pattern for AI coding agents",
  "metaDescription": "LLM fine-tuning datasets, provenance, consent, privacy, deduplication, leakage, PEFT, checkpoints, evaluations, serving compatibility, and rollback.",
  "problem": "AI agents often train on unlicensed or secret data, leak evaluation examples into training, compare checkpoints with changed prompts, or deploy an adapter against a different base model.",
  "audience": "AI teams adapting language models for domain behavior, formats, tools, style, or specialized tasks",
  "prevents": [
    "Training on data without documented rights or retention",
    "Inflating evaluation scores through train-test contamination",
    "Serving an adapter on the wrong base-model revision",
    "Losing the dataset and recipe needed to reproduce a checkpoint"
  ],
  "appliesTo": {
    "paths": [
      "/datasets",
      "/training",
      "/evals"
    ],
    "stacks": [
      "llm",
      "fine-tuning",
      "peft",
      "datasets",
      "machine-learning"
    ],
    "packages": [
      "transformers",
      "peft"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/datasets",
      "title": "Admit training examples through provenance and privacy review",
      "summary": "Record source, rights, consent, purpose, retention, sensitivity, and allowed transformations before data enters a training corpus.",
      "body": "Training can memorize and redistribute patterns from data, and model weights are harder to delete or inspect than an ordinary record. A convenient internal log or scraped source is not automatically authorized training material.\n\n- Assign every source a provenance record and documented legal or product basis for the intended model and distribution.\n- Remove secrets, credentials, private keys, personal identifiers, unnecessary user content, and restricted material before formatting examples.\n- Honor deletion, retention, geographic, customer, and licensing constraints through dataset versions and derived artifacts, not an informal one-time export.\n- Quarantine uncertain sources and fail the dataset build when an example lacks the required provenance or policy fields.\n\nSee /training for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/evals",
      "title": "Keep evaluation data outside training and selection leakage",
      "summary": "Deduplicate across splits and prevent prompts, references, and hidden labels from entering training, tuning, or manual prompt iteration.",
      "body": "A model can appear improved by memorizing evaluation examples or near duplicates. Leakage also occurs when developers repeatedly tune prompts and checkpoint choice against the final test set.\n\n- Split by source, entity, time, conversation, or other leakage boundary before creating transformed examples.\n- Run exact and semantic duplicate checks across train, validation, test, and benchmark sources and review high-similarity clusters.\n- Use validation data for training and checkpoint decisions and reserve a sealed test set for final release comparison.\n- Track who accessed hidden references and regenerate compromised test slices rather than accepting an inflated metric.\n\nSee /datasets for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/training",
      "title": "The training objective matches the production interaction",
      "summary": "Format examples with the exact roles, templates, tools, outputs, and loss boundaries required by the served task.",
      "body": "A dataset of plausible text is not enough. If production uses chat templates, tool calls, structured output, or selective assistant loss, the training representation must preserve those semantics.\n\n- Pin the tokenizer and chat template from the base model and render training examples through the same canonical formatter used for evaluation.\n- Define which tokens contribute to loss and verify user instructions, tool outputs, padding, and control tokens are masked or weighted as intended.\n- Preserve multi-turn context only where it represents production behavior and remove accidental system or hidden annotation leakage.\n- Validate serialized examples by decoding samples and exercising the served model interface, not only by checking dataset columns.\n\nSee /datasets for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/training",
      "title": "An adapter is coupled to one base-model identity",
      "summary": "Record base revision, tokenizer, architecture, target modules, precision, rank, and merge state with every checkpoint.",
      "body": "Parameter-efficient adapters rely on the exact structure and weights they modify. Loading one on a similarly named but different base revision can fail or silently change behavior.\n\n- Pin immutable base-model and tokenizer revisions and store their checksums or repository identities with the run.\n- Record adapter method, target modules, rank, scaling, dropout, precision, quantization, and library versions.\n- Distinguish adapter-only, merged, and quantized deployment artifacts and test the exact one production will load.\n- Expose combined model identity in serving and retain the prior compatible base and adapter pair for rollback.\n\nSee /evals for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/evals",
      "title": "Checkpoint selection is a multi-objective release decision",
      "summary": "Choose from held-out task quality, regressions, safety, format adherence, latency, size, and serving stability rather than minimum training loss.",
      "body": "Training loss measures fit to the training objective. It can improve while generalization, calibration, safety, long-context behavior, or product constraints regress.\n\n- Evaluate each candidate on fixed held-out tasks and critical slices with identical prompts, decoding, tools, and runtime.\n- Compare the base model and prior release, not only neighboring checkpoints from the same run.\n- Include refusal, privacy, memorization, structured-output, tool, and adversarial cases appropriate to the data and intended use.\n- Review qualitative failures and operational cost before selecting a checkpoint, and document accepted regressions explicitly.\n\nSee /training for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "curate-fine-tuning-dataset",
      "summary": "Build a versioned training dataset through provenance, privacy, formatting, deduplication, split, and quality evidence.",
      "body": "---\nname: curate-fine-tuning-dataset\ndescription: Create or revise a dataset for language-model fine-tuning.\n---\n\n# Curate Fine Tuning Dataset\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Define the behavior objective, target distribution, exclusion policy, source rights, privacy constraints, and acceptance metrics before collecting examples.\n2. Ingest through provenance records, remove prohibited data, normalize schema, and retain source-to-example lineage without exposing restricted content broadly.\n3. Deduplicate within and across sources, resolve conflicting examples, and inspect length, language, topic, label, tool, and quality distributions.\n4. Split by the correct leakage boundary, seal the test set, and render examples through the pinned tokenizer and production-compatible template.\n5. Version the manifest, code, source identities, transformations, statistics, approvals, and hashes so the dataset can be reproduced or withdrawn.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "fine-tuning",
        "dataset",
        "privacy",
        "deduplication",
        "curation"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "release-fine-tuned-model",
      "summary": "Reproduce training, evaluate candidate checkpoints, package serving artifacts, canary behavior, and retain rollback.",
      "body": "---\nname: release-fine-tuned-model\ndescription: Release a fine-tuned model or adapter into an inference service.\n---\n\n# Release Fine Tuned Model\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Resolve immutable base, dataset, code, recipe, random seeds, hardware, libraries, tokenizer, template, and output-artifact configuration.\n2. Train with checkpoint, metric, resource, instability, and interruption evidence and reproduce a small run before spending the full budget.\n3. Evaluate candidates against base and prior release on held-out quality, slices, safety, privacy, format, tools, latency, memory, and serving errors.\n4. Package the exact adapter or merged artifact with base identity and load it in the production runtime for compatibility and capacity tests.\n5. Canary bounded traffic with attributable model identity, monitor regressions and feedback, and roll back both artifact and serving configuration on acceptance failure.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "fine-tuning",
        "model-release",
        "evaluation",
        "serving",
        "rollback"
      ]
    }
  ]
};
