import type { Pattern } from "../types.js";

export const emailDeliverySmtp: Pattern = {
  "slug": "email-delivery-smtp",
  "version": "1.0.0",
  "name": "Email Delivery and SMTP",
  "tagline": "Treat email as an authenticated, asynchronous delivery system with feedback and privacy boundaries.",
  "description": "Sending an email is not the same as delivering it. Production mail crosses queue retries, provider acceptance, SMTP responses, domain authentication, reputation, recipient feedback, template rendering, unsubscribe policy, and sensitive-data boundaries. This pattern constrains idempotent enqueueing, authenticated sender identity, recipient policy, and content safety; it records bounce and provider-event ownership and supplies delivery and domain-change procedures. It complements background jobs and notification code by focusing on mail-specific identity, deliverability, feedback loops, message headers, and the operational distinction between accepted, delivered, bounced, complained, and suppressed.",
  "category": "Backend",
  "icon": "mail-check",
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
  "metaTitle": "Email delivery and SMTP pattern for AI agents",
  "metaDescription": "Email queue identity, SPF, DKIM, DMARC, bounce and complaint handling, suppression, templates, privacy, retries, and deliverability operations. In production.",
  "problem": "AI agents often retry without a stable message key, treat provider acceptance as delivery, ignore hard bounces and complaints, or put secrets and personal data into logs and tracking URLs.",
  "audience": "Product and platform teams sending transactional, account, lifecycle, or operational email",
  "prevents": [
    "Sending the same transactional message twice after a worker retry",
    "Continuing to send to hard-bounced or complaining recipients",
    "Breaking domain authentication during a provider or DNS change",
    "Leaking personal or secret values through logs and links"
  ],
  "appliesTo": {
    "paths": [
      "/src/email",
      "/src/workers",
      "/ops/email"
    ],
    "stacks": [
      "email",
      "smtp",
      "dkim",
      "dmarc",
      "deliverability"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/workers",
      "title": "Give every logical email a stable idempotency key",
      "summary": "Deduplicate enqueue and provider submission by business event, recipient, template version, and intended delivery occurrence.",
      "body": "Queues and providers can retry after timeouts or ambiguous responses. A worker that creates a new message identity on every attempt can send duplicate password links, invoices, or alerts.\n\n- Construct a stable logical key from the domain event and recipient, adding an occurrence or template version only when the product intends a distinct message.\n- Store message state before provider submission and return the prior provider identifier or terminal outcome when the same key is processed again.\n- Separate retry attempts from logical messages so delivery history preserves one intent with several transport attempts.\n- For bulk or scheduled mail, generate recipient-level identities and checkpoint progress; do not make one failure replay every recipient.\n\nSee /src/email for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/ops/email",
      "title": "Authenticate the exact sending domains and streams",
      "summary": "Align visible From identity, envelope domain, DKIM signing, SPF authorization, and DMARC policy for each provider and environment.",
      "body": "Mailbox providers evaluate domain identity and reputation across several signals. A valid SMTP credential does not prove that the chosen domain authorizes or aligns with the sender.\n\n- Inventory transactional, marketing, support, and test streams and assign approved From, return-path, and signing domains without sharing production reputation with uncontrolled environments.\n- Publish SPF authorization without creating duplicate records or exceeding lookup behavior, and remove providers when they no longer send.\n- Enable DKIM with managed or rotated selectors and verify signatures on received messages, not only provider-console status.\n- Introduce DMARC reporting and policy in stages, reviewing legitimate sources and alignment before moving to stronger enforcement.\n\nSee /ops/email for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/email",
      "title": "Enforce suppression, consent, and message classification before send",
      "summary": "Decide transactional versus promotional purpose, check recipient state, and preserve mandatory security communication without bypassing legal or reputation controls.",
      "body": "Unsubscribe, complaint, bounce, consent, and account-security policies differ by message purpose. A generic send function that ignores classification can either suppress critical account mail or continue unwanted promotional delivery.\n\n- Classify templates and domain events at definition time and require the classification in the send command.\n- Check hard-bounce, complaint, global suppression, product subscription, and jurisdiction-specific consent state before provider submission.\n- Keep transactional messages limited to the requested service purpose; adding promotional content can change the applicable policy and recipient expectation.\n- Provide one reviewed override path for legally or operationally required communication and record why the suppression decision was bypassed.\n\nSee /src/workers for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/email",
      "title": "Provider acceptance is one delivery state",
      "summary": "Model queued, submitted, accepted, delivered where observable, deferred, bounced, complained, and suppressed outcomes separately.",
      "body": "An API success or SMTP acceptance means the provider took responsibility for the message, not that the mailbox accepted or displayed it. Product behavior must not treat all later outcomes as success.\n\n- Store provider message identity and correlate signed provider events to the logical email without trusting an arbitrary callback payload.\n- Classify temporary deferrals separately from permanent recipient or policy failures and cap automatic retries by the provider contract.\n- Move hard bounces and complaints into suppression promptly while retaining enough reason and timestamp data for support and reputation work.\n- Expose delivery status to product workflows only at the confidence they need; for example, account recovery may offer another channel without claiming the recipient read the mail.\n\nSee /src/workers for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/email",
      "title": "Templates are versioned data contracts",
      "summary": "Render from validated variables, keep text and HTML alternatives, and bind links to short-lived server-side actions.",
      "body": "A template change can break rendering, accessibility, localization, tracking, or the security meaning of a link even when the send API remains unchanged. Treat the template and variable schema as one versioned contract.\n\n- Validate required variables and types before enqueue so workers do not discover a missing value after the business transaction has committed.\n- Generate text and HTML alternatives from the same semantic content and test escaping, long values, localization, and client-safe layout.\n- Put opaque, bounded, expiring tokens in action links and resolve state on the server; do not embed secrets, personal records, or authorization decisions in query strings.\n- Record template version with the logical message so support can reproduce what the recipient was sent without retaining unnecessary rendered personal content.\n\nSee /ops/email for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-email-delivery-flow",
      "summary": "Test enqueue, rendering, provider submission, authentication, feedback events, suppression, retries, and privacy as one flow.",
      "body": "---\nname: verify-email-delivery-flow\ndescription: Verify an email type or provider integration before production rollout.\n---\n\n# Verify Email Delivery Flow\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Generate representative messages for success, duplicate event, missing variable, invalid address, suppressed recipient, and provider timeout using stable logical keys.\n- [ ] Inspect received headers for From, return path, DKIM, SPF, DMARC alignment, Message-ID, list headers where relevant, and unintended environment leakage.\n- [ ] Replay signed accepted, deferred, bounced, complained, and malformed provider events and confirm state transitions are idempotent and attributable.\n- [ ] Render text and HTML in representative clients with long localized content, images disabled, dark mode, and assistive technology expectations.\n- [ ] Search logs, traces, metrics, URLs, and dead-letter payloads for message bodies, tokens, email addresses, and other data the observability contract excludes.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "email",
        "smtp",
        "deliverability",
        "testing",
        "webhooks"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "rotate-email-sending-domain",
      "summary": "Move a sending domain or provider through DNS, authentication, warmup, feedback, and rollback without losing reputation signals.",
      "body": "---\nname: rotate-email-sending-domain\ndescription: Change an email provider, sending subdomain, DKIM selector, return path, or DMARC policy.\n---\n\n# Rotate Email Sending Domain\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Inventory every legitimate sender, stream, domain, provider credential, DNS record, webhook, suppression source, and application configuration involved.\n2. Publish and verify new SPF, DKIM, return-path, and tracking records while keeping old records active for mail still in flight.\n3. Send controlled traffic through the new path, inspect authentication and feedback events, and increase volume only while bounce, complaint, and deferral signals remain healthy.\n4. Synchronize suppression and unsubscribe state before moving recipients; never warm a new provider by resending to addresses the old provider suppressed.\n5. Retain rollback capability until queued mail and feedback on the old path drain, then remove obsolete credentials and DNS authorization deliberately.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "email",
        "dns",
        "dkim",
        "migration",
        "operations"
      ]
    }
  ]
};
