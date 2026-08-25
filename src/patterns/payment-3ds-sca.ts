import type { Pattern } from "../types.js";

export const payment3dsSca: Pattern = {
  "slug": "payment-3ds-sca",
  "version": "1.0.0",
  "name": "Payment Authentication with 3DS and SCA",
  "tagline": "Model payment authentication as a resumable server-owned state machine, not a browser callback.",
  "description": "Card authentication can add issuer challenges, redirects, app switches, browser returns, exemptions, asynchronous authorization, and region-specific requirements between payment creation and a final charge outcome. This pattern constrains server authority, return handling, amount identity, and fulfillment; it records authentication and recovery states and supplies a complete challenge-flow verification procedure. It differs from user login and OAuth because the authenticated subject is a cardholder for one payment attempt, and the final authority remains the payment provider and issuer network.",
  "category": "Billing",
  "icon": "scan-face",
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
  "metaTitle": "3DS and SCA payment pattern for AI agents",
  "metaDescription": "3DS and SCA payment state, issuer challenges, redirects, return handling, exemptions, server confirmation, idempotency, and recovery testing. In production.",
  "problem": "AI agents often mark payment complete on the return URL, create a new attempt after a challenge reload, or lose the order when the customer completes authentication asynchronously.",
  "audience": "Payment teams accepting cards where issuer authentication or strong customer authentication may be required",
  "prevents": [
    "Fulfilling from an untrusted success redirect",
    "Creating duplicate payment attempts during challenge recovery",
    "Charging an amount different from the authenticated attempt",
    "Leaving customers stuck after completing authentication on another page or app"
  ],
  "appliesTo": {
    "paths": [
      "/src/payments",
      "/src/checkout",
      "/tests/payments"
    ],
    "stacks": [
      "3ds",
      "sca",
      "payments",
      "cards",
      "authentication"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Treat provider payment state as the final authority",
      "summary": "Verify authenticated server-side state and amount before marking an order payable or fulfilled.",
      "body": "Browser callbacks and return parameters are navigation hints. They can be replayed, forged, reached before provider processing finishes, or omitted when the customer closes the page.\n\n- Create and confirm payment attempts through authenticated server calls and bind them to the server-owned order, amount, and currency.\n- On return, load the checkout by opaque identity and retrieve current payment state from the server or verified provider event.\n- Require the provider identity, account, amount, currency, and terminal state to match the order before advancing it.\n- Trigger fulfillment after the paid transition commits through durable work, never directly from client JavaScript.\n\nSee /src/checkout for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Reuse one logical payment attempt through authentication",
      "summary": "Preserve order and payment identities across redirects, challenges, reloads, and retries instead of creating a replacement automatically.",
      "body": "An authentication-required result is an intermediate state, not a failed checkout. Creating another payment attempt can produce multiple authorizations and make later events impossible to reconcile.\n\n- Generate a stable checkout and provider idempotency identity before the first confirmation request.\n- Store the provider payment reference and required next-action state against the order before returning control to the browser.\n- Return to the same server checkout identity and query current status after refresh, browser back, repeated callback, or delayed completion.\n- Create a new payment attempt only after the prior one is terminal or explicitly cancelled and record the relationship between attempts.\n\nSee /tests/payments for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/checkout",
      "title": "Keep return destinations fixed and state opaque",
      "summary": "Use allowlisted application return routes and opaque checkout references instead of forwarding arbitrary URLs or financial state through the browser.",
      "body": "Challenge flows leave the application and later return through user-controlled navigation. An open redirect or trusted amount in query parameters turns authentication plumbing into a phishing or payment-integrity weakness.\n\n- Construct return URLs from server configuration and a small route allowlist; do not accept a full return URL from the browser.\n- Carry only an opaque checkout or continuation reference and recover customer, order, amount, and provider identity from server storage.\n- Expire continuation references according to payment lifetime and require the current user or guest secret to own the checkout.\n- Make the return handler safe to call repeatedly and prevent it from performing the charge, creating an order, or trusting success text from the issuer page.\n\nSee /src/payments for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Request exemptions without depending on them",
      "summary": "Provide accurate risk and transaction context, but keep every flow capable of handling an issuer-requested challenge.",
      "body": "An exemption or frictionless preference is not a guarantee. The issuer or provider can still require authentication based on regulation, risk, card, amount, or account state.\n\n- Send truthful customer, transaction, and recurring-payment context through supported provider fields; do not misclassify a payment merely to avoid challenge.\n- Model authentication-required as a normal recoverable state on every eligible card flow.\n- Keep off-session and recurring agreements tied to the provider's mandate or credential framework and handle authentication-required recovery with the customer.\n- Measure challenge, abandonment, exemption, authorization, and recovery outcomes by market without logging prohibited card or authentication data.\n\nSee /src/checkout for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/checkout",
      "title": "Authentication and authorization are separate payment states",
      "summary": "Represent challenge progress separately from whether funds were authorized, captured, failed, cancelled, or require later action.",
      "body": "A cardholder can complete authentication and still have authorization declined, while an authorization can require capture or later confirmation. One boolean cannot describe the state machine.\n\n- Model pending authentication, action required, processing, authorized, captured, failed, cancelled, and ambiguous outcomes with allowed transitions.\n- Display instructions from server-owned state and provider-safe client data, then refresh authoritative status after any action.\n- Do not reserve inventory or services indefinitely while authentication is abandoned; use an expiry and resume policy tied to the checkout.\n- Keep order and fulfillment state separate from the payment attempt so a replacement attempt can pay the same order without duplicating it.\n\nSee /src/payments for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/payments",
      "title": "Authentication evidence belongs to provider records",
      "summary": "Store references and outcome fields needed for support and compliance without retaining sensitive challenge payloads or card authentication secrets.",
      "body": "Payment providers and issuers hold the detailed authentication exchange. Application storage usually needs attribution and outcome, not raw protocol messages or browser challenge content.\n\n- Store provider payment and authentication references, outcome category, timestamps, amount, currency, and order relationship needed for reconciliation.\n- Do not log or persist raw card numbers, cryptograms, challenge frames, secret client values, or full provider payloads by default.\n- Restrict access to payment-authentication evidence and define retention from support, dispute, and legal requirements.\n- Use provider dashboards or APIs for detailed investigation and correlate through stable references rather than copying sensitive data into general observability.\n\nSee /tests/payments for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-3ds-sca-payment-flow",
      "summary": "Exercise frictionless, challenged, abandoned, delayed, failed, repeated, and asynchronous payment authentication outcomes.",
      "body": "---\nname: test-3ds-sca-payment-flow\ndescription: Verify a 3DS, SCA, or card-authentication change before production rollout.\n---\n\n# Test 3ds Sca Payment Flow\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Test frictionless approval, issuer challenge, challenge failure, authorization decline, processing delay, cancellation, timeout, and unsupported client conditions.\n2. Refresh, close, reopen, use browser back, repeat the return route, and complete authentication in another tab while preserving one order and attempt.\n3. Replay duplicate and out-of-order provider events and compare return-page status with authoritative server status.\n4. Attempt wrong user, expired continuation, modified amount, modified currency, wrong provider account, and arbitrary return destination inputs.\n5. Verify inventory expiry, customer recovery, replacement payment attempt, final fulfillment, and reconciliation for every terminal and ambiguous outcome.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "3ds",
        "sca",
        "payments",
        "authentication",
        "testing"
      ]
    }
  ]
};
