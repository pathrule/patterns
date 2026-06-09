import type { Pattern } from "../types.js";

export const llmEvals: Pattern = {
  "slug": "llm-evals",
  "version": "1.0.0",
  "name": "LLM Evaluations & Testing",
  "tagline": "Catch hallucinations and quality regressions before users do, with evals on every prompt change.",
  "description": "The discipline that turns an LLM feature from a demo into something you can change with confidence. Hallucinations and inconsistent quality are the top reported problems with AI-generated work, and you cannot fix what you do not measure. This pattern builds a labelled evaluation set, scores outputs with deterministic checks plus a calibrated LLM-as-judge, and gates every prompt, model, or retrieval change on an eval run so a tweak that helps one case but breaks ten is caught in CI, not in production.",
  "category": "AI",
  "icon": "clipboard-check",
  "color": "bg-purple-500/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "LLM Evaluations & Testing pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for LLM evaluation and testing: a labelled eval set, deterministic checks plus a calibrated LLM-as-judge, grounding/hallucination checks, and gating prompt and model changes on an eval run, tuned for AI coding agents.",
  "problem": "AI agents ship prompt and model changes on vibes, with no eval set, so hallucinations and quality regressions only surface once users hit them.",
  "audience": "Teams shipping LLM features that need to measure and defend output quality",
  "prevents": [
    "Changing a prompt or model and shipping it because the one example you tried looked good",
    "Having no labelled dataset, so quality is a feeling rather than a number",
    "Using an LLM judge with a vague rubric that does not agree with humans",
    "Letting hallucinations through because nothing checks answers against their source"
  ],
  "appliesTo": {
    "paths": [
      "/evals",
      "/src/ai"
    ],
    "stacks": [
      "llm",
      "ai",
      "evals"
    ],
    "packages": []
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/ai",
      "title": "Gate prompt, model, and retrieval changes on an eval run",
      "summary": "No change to a prompt, model, or retrieval config ships without running the eval set and comparing scores against the current baseline.",
      "body": "A prompt is code: a small edit can improve one case and silently break ten others. Without an eval gate, you find out from users.\n\n- Run the eval set on every change to a prompt, model id, temperature, tool definition, or retrieval config, and compare the scores to the committed baseline before merging.\n- Treat a regression on the eval set like a failing test: it blocks the change. An improvement on your one hand-picked example is not evidence; the aggregate score on the dataset is.\n- Pin the model version in the eval run. A provider silently changing a model under you is itself a regression you want the evals to catch.\n- Keep eval runs in CI (or a pre-merge step) so the gate is enforced regardless of who makes the change. Record the score so the trend is visible over time.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/evals",
      "title": "Build a labelled eval set that mirrors real usage",
      "summary": "Curate a versioned dataset of representative and adversarial inputs with expected outputs or acceptance criteria; grow it from real failures.",
      "body": "The eval set is the asset. The model and prompt will change; the dataset is what lets you tell whether a change is better.\n\n- Curate inputs that mirror real traffic: common cases, important edge cases, and adversarial inputs (prompt injection, ambiguous or out-of-scope requests, inputs that should be refused). A dataset of only happy-path examples measures nothing useful.\n- For each case, record either an expected output, a reference answer, or explicit acceptance criteria. Some tasks have one right answer; many have a rubric instead, and that is fine as long as it is written down.\n- Version the dataset alongside the code and grow it from production failures: every real hallucination or bad answer becomes a new eval case so the same regression cannot return unnoticed.\n- Keep the set balanced and labelled honestly; do not overfit prompts to a tiny set of examples you keep re-reading. Aim for coverage of the behaviours that matter.\n\nSee /evals for the scoring memory and /src/ai for the eval-gate rule."
    },
    {
      "kind": "memory",
      "nodePath": "/evals",
      "title": "Score with deterministic checks first, then a calibrated judge",
      "summary": "Use exact/programmatic checks where outputs are verifiable; use an LLM-as-judge with a clear rubric, calibrated against human labels, for open-ended quality.",
      "body": "Pick the cheapest scoring method that actually measures the thing, and only reach for an LLM judge when the output is genuinely open-ended.\n\n- Score deterministically wherever you can: exact match, schema/JSON validity, regex, contains-required-facts, executes-without-error, latency, and cost. These are free, fast, and not themselves subject to model error.\n- For open-ended quality (helpfulness, tone, faithfulness), use an LLM-as-judge: a separate model call that scores the output against a specific, written rubric, ideally returning a structured verdict with a reason, not a bare number.\n- Calibrate the judge against human labels on a sample: if the judge does not agree with your team's judgments, fix the rubric before trusting it. An uncalibrated judge is just another opinion.\n- For RAG and any grounded answer, score faithfulness explicitly: does the answer follow from the retrieved context, or did the model invent it? This is the direct measure of hallucination. (See the rag-embeddings pattern for retrieval quality.)\n\nSee /evals for the dataset memory and /src/ai for the eval-gate rule."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "llm-eval-set-builder",
      "summary": "Checklist for building or extending an LLM evaluation set and wiring it into the change workflow.",
      "body": "---\nname: llm-eval-set-builder\ndescription: Checklist for building or extending an LLM evaluation set and gating changes on it. Run when adding an LLM feature or after a production quality failure.\n---\n\n# LLM eval set builder\n\n## Dataset\n- [ ] Inputs mirror real usage: common cases, important edge cases, and adversarial inputs (injection, out-of-scope, must-refuse).\n- [ ] Each case has an expected output, reference answer, or written acceptance criteria/rubric.\n- [ ] Dataset is versioned with the code and grows from real production failures.\n- [ ] Coverage is balanced; prompts are not overfit to a handful of examples.\n\n## Scoring\n- [ ] Deterministic checks used where outputs are verifiable (exact match, schema validity, required facts, runs-clean, latency, cost).\n- [ ] LLM-as-judge used only for open-ended quality, with a specific written rubric and a structured verdict + reason.\n- [ ] Judge calibrated against human labels on a sample; rubric fixed until it agrees.\n- [ ] Grounded answers scored for faithfulness (does the answer follow from the source) to catch hallucination.\n\n## Gate\n- [ ] Eval run triggers on any prompt/model/temperature/tool/retrieval change; model version pinned.\n- [ ] Scores compared to a committed baseline; a regression blocks the change like a failing test.\n- [ ] Eval runs in CI / pre-merge; scores recorded so the quality trend is visible.\n",
      "skillTags": [
        "llm",
        "evals",
        "testing",
        "llm-as-judge",
        "hallucination",
        "ai-review"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "llm-as-judge-rubric",
      "summary": "Template and guidance for writing a reliable LLM-as-judge scoring prompt and rubric.",
      "body": "---\nname: llm-as-judge-rubric\ndescription: Guidance for writing a reliable LLM-as-judge scoring prompt. Use when building automated scoring for open-ended LLM outputs.\n---\n\n# LLM-as-judge rubric\n\nUse when an output is too open-ended for a deterministic check. A judge is only as good as its rubric.\n\n## Writing the rubric\n- [ ] Define each criterion concretely (e.g. faithfulness, relevance, completeness, tone) with what a pass and a fail look like, not just a label.\n- [ ] Prefer a small discrete scale (e.g. 1-5 or pass/fail per criterion) over an unanchored 0-100; anchor each level with a description.\n- [ ] Ask the judge to give its reasoning and cite the part of the input/source that justifies the score, then the score. Require a structured output (per-criterion verdict + reason).\n- [ ] For faithfulness/grounding, give the judge the source context and ask explicitly whether each claim is supported by it.\n\n## Making it reliable\n- [ ] Use a capable model as the judge; do not have a weak model grade a strong one.\n- [ ] Calibrate: score a sample the team has labelled and measure agreement; revise the rubric until the judge matches human judgment.\n- [ ] Watch for known judge biases (position, length, self-preference) and control for them (e.g. randomize order in pairwise comparisons).\n- [ ] Keep the judge prompt and model versioned with the eval set; a judge change is itself an eval change.\n",
      "skillTags": [
        "llm",
        "llm-as-judge",
        "evals",
        "scoring",
        "rubric",
        "ai-review"
      ]
    }
  ]
};
