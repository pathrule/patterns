import type { Pattern } from "../types.js";

export const technicalDebtManagement: Pattern = {
  "slug": "technical-debt-management",
  "version": "1.0.0",
  "name": "Technical Debt Management",
  "tagline": "Turn costly shortcuts into owned, evidence-backed decisions with triggers and a credible payoff path.",
  "description": "Technical debt management makes intentional tradeoffs visible without labeling every imperfection as debt. This bundle records the decision, affected boundary, current cost, risk, owner, review trigger, and retirement options, then prioritizes work from delivery and reliability evidence. Unlike Code Review, it governs accumulated system tradeoffs over time rather than deciding whether one change is ready to merge.",
  "category": "Workflow",
  "icon": "wrench",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Technical debt management pattern for agents",
  "metaDescription": "Owned debt records, cost and risk evidence, review triggers, expiry dates, prioritization, scoped payoff plans, regression guards, and closure proof.",
  "problem": "Agents create vague cleanup tickets, expand feature work into opportunistic rewrites, or leave temporary shortcuts with no owner, trigger, cost evidence, or retirement condition.",
  "audience": "Engineering teams balancing feature delivery, reliability, maintainability, migration work, and deliberate architectural tradeoffs",
  "prevents": [
    "Debt backlogs becoming unactionable lists of subjective complaints",
    "Temporary exceptions becoming permanent because no trigger or owner exists",
    "Large rewrites starting without measured cost, boundary, or incremental payoff"
  ],
  "appliesTo": {
    "paths": [
      "/docs/engineering/debt",
      "/src",
      "/tests"
    ],
    "stacks": [
      "technical-debt",
      "architecture",
      "workflow",
      "maintenance"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/docs/engineering/debt",
      "title": "Every debt record names cost, owner, trigger, and exit",
      "summary": "A debt item identifies the compromised boundary, evidence of cost or risk, accountable owner, review trigger, and smallest credible retirement path.",
      "body": "A ticket called refactor later is not a manageable obligation. Record the original decision or shortcut, affected paths and consumers, benefit received, present delivery or operational cost, failure risk, constraints, accountable owner, date introduced, review or expiry trigger, and options for retirement. Link measurements and incidents rather than using age or dislike as the only evidence.\n\n- Distinguish intentional debt, discovered design weakness, obsolete dependency, missing test, migration gap, and ordinary defect.\n- Define what would make the item more urgent, safe to close, or no longer relevant.\n- Keep the scope small enough that one team can own the next decision and avoid umbrella items that hide unrelated work.\n- Revisit debt when the named boundary changes, the trigger fires, or the review date arrives.\n\nVerification: Sample open items and ask another engineer to explain impact, priority, owner, next action, and closure evidence without private context.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/docs/engineering/debt",
      "title": "Debt priority comes from interest and risk, not age alone",
      "summary": "Repeated engineering time, change failure, incident exposure, security impact, customer friction, and blocked strategy determine payoff priority.",
      "body": "Old code can be stable and cheap, while a recent shortcut can tax every deployment. Estimate debt interest from repeated debugging, slow delivery, review burden, test instability, compute or vendor cost, incident frequency, security exposure, compliance constraint, customer impact, and blocked product options. Use ranges and observable proxies when exact numbers are unavailable.\n\nCompare payoff cost and risk with the expected avoided interest over a named horizon. Prioritize items at actively changing boundaries or with approaching triggers, and lower priority when usage or impact disappears. Review the portfolio by subsystem and owner so one visible codebase does not absorb the entire budget. See /src for the implementation boundary and /tests for the regression evidence needed after payoff."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Pay debt at the smallest stable seam",
      "summary": "Incremental payoff isolates a boundary, preserves behavior with characterization evidence, migrates consumers, and deletes the old path last.",
      "body": "A full rewrite bundles discovery, behavior change, migration, and cleanup into one risky release. Find a stable seam around the costly behavior, capture current contracts and exceptions, add characterization tests or production evidence, then introduce the improved path behind an adapter, flag, or versioned interface. Move consumers in observable increments and compare outcomes.\n\nDefine rollback and dual-run limits before migration, avoid permanent synchronization between old and new models, and delete compatibility code when the last consumer leaves. Feature work should pay adjacent debt only when the boundary and verification are already in scope; otherwise create the owned record. See /docs/engineering/debt for the decision and /tests for the proof that enables deletion."
    },
    {
      "kind": "skill",
      "nodePath": "/docs/engineering/debt",
      "title": "triage-technical-debt",
      "summary": "Turn a debt claim into a bounded decision using cost evidence, risk, ownership, triggers, payoff options, and closure proof.",
      "body": "---\nname: triage-technical-debt\ndescription: Triage a technical debt claim into an owned, evidence-backed payoff or acceptance decision.\n---\n\n# Triage Technical Debt\n\n1. State the compromised boundary, affected paths and consumers, original tradeoff, current behavior, and why this is debt rather than a defect or preference.\n2. Gather evidence of interest and risk from delivery time, incidents, failures, test instability, security, cost, customer impact, and blocked plans.\n3. Identify owner, dependencies, expiry or review trigger, options to accept, contain, incrementally pay, replace, or retire, and the smallest stable seam.\n4. Estimate payoff and migration risk, define characterization and regression evidence, and choose a priority against other owned work.\n5. Record the decision and next review; on completion, remove obsolete paths, close linked exceptions, and attach before-and-after evidence.\n\nDo not open an unbounded rewrite item when the next decision or first safe slice can be stated directly.",
      "skillTags": [
        "technical-debt",
        "architecture",
        "prioritization",
        "maintenance"
      ]
    }
  ]
};
