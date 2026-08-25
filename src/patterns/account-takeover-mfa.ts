import type { Pattern } from "../types.js";

export const accountTakeoverMfa: Pattern = {
  "slug": "account-takeover-mfa",
  "version": "1.0.0",
  "name": "Account Takeover and MFA",
  "tagline": "Protect sign-in, recovery, factor changes, and sensitive actions as one abuse-resistant system.",
  "description": "Account takeover defense must cover the full account lifecycle because strong sign-in MFA is bypassed when recovery, enrollment, sessions, or support flows are weaker. This bundle sets anti-enumeration responses, attempt budgets, phishing-resistant factor policy, session revocation, and verified recovery. Unlike Auth Sessions JWT OAuth, it focuses on adversarial takeover and step-up decisions rather than token and identity-protocol architecture.",
  "category": "Security",
  "icon": "shield-user",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Account takeover MFA pattern for AI agents",
  "metaDescription": "Abuse-resistant sign-in, phishing-resistant MFA, verified recovery, factor-change holds, session revocation, and security-event monitoring and alerts.",
  "problem": "Agents add MFA to the happy-path login but leave password reset, factor replacement, remembered devices, session theft, and support recovery as easier takeover routes.",
  "audience": "Teams operating user accounts with password, passkey, federated, or multi-factor authentication",
  "prevents": [
    "Account enumeration through login and recovery responses",
    "A weaker recovery flow bypassing stronger sign-in factors",
    "Factor changes or password resets that leave attacker sessions active"
  ],
  "appliesTo": {
    "paths": [
      "/src/auth",
      "/src/api",
      "/tests/security"
    ],
    "stacks": [
      "authentication",
      "mfa",
      "passkeys",
      "account-security"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Apply attempt budgets to every authentication path",
      "summary": "Sign-in, recovery, enrollment, verification, and resend operations share abuse-aware attempt controls.",
      "body": "Sign-in, recovery, enrollment, verification, and resend operations share abuse-aware attempt controls. Attackers move to the least protected endpoint when only the primary password form is throttled. Enforce this boundary in /src/auth so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Key budgets with account, network, device, and operation signals without revealing whether the account exists.\n- Use progressive delay or challenge without letting an attacker lock a victim out indefinitely.\n- Bound verification-code generation and checks separately so resend does not reset guesses.\n- Preserve capacity for legitimate recovery and support while detecting distributed low-rate attacks.\n\nVerification: Run credential stuffing, code guessing, resend, account rotation, and shared-network scenarios; confirm responses do not enumerate users and alerts group related activity.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Require phishing-resistant factors for high-risk access",
      "summary": "Privileged accounts and sensitive actions use factors bound to the legitimate origin and verifier.",
      "body": "Privileged accounts and sensitive actions use factors bound to the legitimate origin and verifier. One-time codes and approval prompts can be relayed or fatigued, leaving a nominal MFA deployment vulnerable to convincing phishing. Enforce this boundary in /src/auth so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Prefer passkeys or hardware-backed public-key authenticators for administrators and other high-impact roles.\n- Treat email and SMS as recovery or transitional factors according to the product risk model, not equivalent proof for every action.\n- Use step-up authentication for payouts, credential changes, data exports, role grants, and other sensitive operations.\n- Bind step-up approval to the exact action and show the user what will change before confirmation.\n\nVerification: Attempt the privileged flow with a normal session, a relayed code, and the approved origin-bound factor; confirm only the intended method authorizes the exact action.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/api",
      "title": "Treat recovery and factor changes as security events",
      "summary": "Recovery, password reset, factor enrollment, and factor removal trigger verification, notification, holds, and session policy.",
      "body": "Recovery, password reset, factor enrollment, and factor removal trigger verification, notification, holds, and session policy. An attacker who reaches recovery can silently replace factors and keep existing sessions, turning one weak check into durable control. Enforce this boundary in /src/api so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Verify recovery with evidence appropriate to account risk and never use easily discovered profile facts as secrets.\n- Notify established channels before and after factor or recovery changes without including reusable secrets.\n- Revoke or re-evaluate existing sessions after credential recovery and high-risk factor changes.\n- Apply a risk-based hold to payouts, exports, role changes, or other irreversible actions after recovery.\n\nVerification: Simulate recovery by the legitimate user and an attacker with partial profile data; verify session revocation, notifications, holds, and support evidence.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/auth",
      "title": "Authentication assurance belongs to the session",
      "summary": "A successful login is not a permanent assurance level because factor strength, age, risk signals, and credential changes evolve during the session.",
      "body": "A successful login is not a permanent assurance level because factor strength, age, risk signals, and credential changes evolve during the session. Record which factors were used, when authentication occurred, and the resulting assurance in server-side session state or verifiable claims.\n\nRecompute authorization for sensitive actions using required assurance and maximum authentication age. Invalidate remembered-device and assurance state when credentials, factors, recovery, or account risk change. Do not let a client-set flag assert that step-up already happened. Keep the decision explicit at /src/auth; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /src/api for action-specific step-up rules and /tests/security for takeover scenarios. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-account-takeover",
      "summary": "Review account entry, recovery, factor, session, and support flows as one takeover surface.",
      "body": "---\nname: review-account-takeover\ndescription: Review account entry, recovery, factor, session, and support flows as one takeover surface.\n---\n\n# Review Account Takeover\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Inventory every way to authenticate, recover, enroll or remove a factor, remember a device, revoke a session, and ask support for access.\n2. Compare enumeration resistance, attempt budgets, verification strength, notifications, and audit evidence across those flows.\n3. Exercise credential stuffing, recovery with partial data, factor replacement, session theft, and post-recovery sensitive actions in a test environment.\n4. Record gaps by takeover path, prioritize the shortest successful path, and verify fixes with signals that distinguish attack from user error.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "authentication",
        "mfa",
        "account-takeover",
        "security-review"
      ]
    }
  ]
};
