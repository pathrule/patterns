import type { Pattern } from "../types.js";

export const webSecurity: Pattern = {
  "slug": "web-security",
  "version": "1.0.0",
  "name": "Web Security (OWASP)",
  "tagline": "Build web apps that deny by default, distrust every input, and ship secure headers.",
  "description": "A baseline against the risks at the top of the OWASP Top 10:2025. Broken Access Control is still the number one application security risk, and Security Misconfiguration and Injection sit right behind it. This pattern enforces server-side authorization on every request, treats all input as hostile, defends against XSS and CSRF, and ships a secure-by-default configuration with the right response headers. It is the app-security layer that sits above your authentication, not a replacement for it.",
  "category": "Security",
  "icon": "shield-check",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Web Security (OWASP) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for OWASP web security: server-side deny-by-default access control, input validation against injection, XSS and CSRF defenses, and secure response headers, tuned for AI coding agents.",
  "problem": "AI agents enforce access control in the UI, trust request input, build SQL by string concatenation, and ship apps with default configs and no security headers.",
  "audience": "Web teams hardening application security beyond authentication",
  "prevents": [
    "Checking permissions only in the client while the API authorizes nothing",
    "Building SQL or shell commands by string concatenation of user input",
    "Rendering unescaped user content or trusting it as HTML",
    "Shipping default configs, verbose errors, and no security headers"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/app",
      "/api"
    ],
    "stacks": [
      "web",
      "node",
      "http"
    ],
    "packages": []
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Enforce access control on the server, deny by default",
      "summary": "Authorize every request server-side against the authenticated identity and the specific resource; the UI hiding a button is not access control.",
      "body": "Broken Access Control is the #1 risk on the OWASP Top 10:2025 because it is so easy to get wrong: the UI hides an action, but the endpoint behind it never checks who is calling.\n\n- Authorize on the server for every request, checking the authenticated identity against the specific resource and action. Client-side checks are UX, not security; an attacker calls your API directly.\n- Deny by default: a route with no explicit authorization should reject, not allow. Make \"forbidden unless permitted\" the framework default, not a check each handler must remember to add.\n- Enforce object-level authorization (does THIS user own THIS record), not just \"is logged in\". Most access-control bugs are reading or mutating someone else's id (IDOR), so never trust an id from the request as proof of ownership.\n- Check authorization on the server even for actions the UI does not expose. Hidden is not protected.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Treat all input as hostile; parameterize and escape",
      "summary": "Validate input against a schema at the boundary, use parameterized queries (never string-built SQL/commands), and escape output for its context.",
      "body": "Injection stays near the top of the OWASP list because untrusted input keeps reaching an interpreter, whether SQL, a shell, or a template.\n\n- Validate and normalize input at the boundary against an explicit schema (allow-list what is valid; reject the rest). Validate type, length, format, and range, not just presence.\n- Use parameterized queries / prepared statements or a query builder for every database call. Never build SQL (or NoSQL filters, shell commands, LDAP queries) by concatenating user input. An ORM does not save you if you drop to a raw string with interpolation.\n- Escape output for the context it lands in (HTML, attribute, URL, JS, SQL). The same string is dangerous in one context and harmless in another.\n- Never pass user input to a shell, `eval`, dynamic `require`, or a file path without strict validation; treat path and command construction as injection surfaces too.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Defend against XSS and CSRF",
      "summary": "Render user content as text (never trusted HTML), and protect state-changing requests with SameSite cookies plus anti-CSRF tokens or origin checks.",
      "body": "Cross-site scripting and cross-site request forgery are the two ways the browser itself becomes the attacker's tool against your authenticated user.\n\n- Render user-supplied content as text by default; let the framework escape it. Reach for a raw-HTML escape hatch (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) only with input sanitized by a vetted sanitizer, never with raw user input.\n- Set a Content-Security-Policy that restricts script sources; it is the backstop that limits damage when an XSS slips through.\n- Protect state-changing requests against CSRF: set session cookies `SameSite=Lax` or `Strict`, `HttpOnly`, and `Secure`, and add anti-CSRF tokens or strict origin/referer checks for unsafe methods. A token-in-header API (not cookie-auth) is less exposed but still validate the origin.\n- Store session tokens in `HttpOnly` cookies so script cannot read them; do not stash auth tokens in `localStorage` where an XSS can exfiltrate them.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Secure-by-default configuration and headers",
      "summary": "Ship hardened defaults: security response headers, no verbose errors or stack traces to clients, least-privilege config, and nothing sensitive in logs.",
      "body": "Security Misconfiguration jumped to #2 on the OWASP Top 10:2025. The fix is boring and high-leverage: a hardened default config the whole app inherits.\n\n- Send the core security headers: `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, a sane `Referrer-Policy`, and `X-Frame-Options`/`frame-ancestors`. A helmet-style middleware sets these in one place.\n- Do not leak internals to clients: return generic error messages, never stack traces, framework versions, or raw exception text in a response. Log the detail server-side, behind the API.\n- Disable what you do not use: debug endpoints, directory listing, default accounts and sample routes, permissive CORS (`*` with credentials), and verbose modes in production.\n- Keep secrets and PII out of logs and error payloads, and default new config to the least-privilege, most-restrictive setting rather than the most convenient one.\n\nSee /src for the access-control and input-validation rules; see /app for the XSS/CSRF rule. For credentials, see the secrets-env-management and auth-sessions-jwt-oauth patterns; for dependency risk, supply-chain-security."
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Threat-model the request: where to check what",
      "summary": "A request crosses trust boundaries (network, auth, authorization, data); know which check belongs at which boundary so none is skipped.",
      "body": "Most web vulnerabilities are a missing check at a boundary the request crossed. Knowing the boundaries makes the checks systematic instead of ad hoc.\n\n- At the edge: TLS/HSTS, rate limiting and abuse protection, request size limits, and CORS scoping. This is where you reject obviously hostile or excessive traffic.\n- At authentication: establish who the caller is (see the auth pattern for sessions/JWT/OAuth). Authentication answers \"who\", not \"may they\".\n- At authorization: for every resource and action, check that THIS identity may do THIS thing to THIS object. This is the layer most often missing and the OWASP #1.\n- At the data boundary: validate and normalize input before it reaches a query, an interpreter, or storage; escape on the way out. Trust nothing that came from the client, including ids, headers, and hidden fields.\n- Assume any single layer can fail and add defense in depth, so one missing check is not a full compromise.\n\nSee /src for the access-control and input rules and /src for the secure-config memory."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "web-security-review",
      "summary": "Pre-merge OWASP-oriented security checklist for any endpoint or view that handles auth, input, or output.",
      "body": "---\nname: web-security-review\ndescription: OWASP-oriented security review checklist. Run before merging any endpoint, view, or config change that handles authentication, authorization, user input, or output.\n---\n\n# Web security review (OWASP Top 10:2025)\n\n## Access control (A01)\n- [ ] Every endpoint authorizes on the server against the authenticated identity; no UI-only checks.\n- [ ] Object-level ownership is verified; an id from the request is never trusted as proof of access (no IDOR).\n- [ ] Routes deny by default; a missing authorization check rejects rather than allows.\n\n## Injection & input (A05)\n- [ ] Input validated/normalized against a schema at the boundary (allow-list).\n- [ ] All DB access is parameterized; no SQL/NoSQL/shell/LDAP built by string concatenation.\n- [ ] No user input reaches a shell, eval, dynamic require, or unvalidated file path.\n\n## XSS / CSRF\n- [ ] User content rendered as text; raw-HTML sinks only with a vetted sanitizer.\n- [ ] CSP restricts script sources; state-changing requests protected by SameSite cookies + tokens/origin checks.\n- [ ] Session tokens in HttpOnly+Secure cookies; no auth tokens in localStorage.\n\n## Configuration (A02)\n- [ ] Security headers set (CSP, HSTS, nosniff, Referrer-Policy, frame-ancestors).\n- [ ] No stack traces / versions / internal errors returned to clients; secrets and PII kept out of logs.\n- [ ] Debug endpoints, default accounts, permissive CORS, and verbose modes disabled in production.\n",
      "skillTags": [
        "security",
        "owasp",
        "access-control",
        "xss",
        "csrf",
        "security-review"
      ]
    }
  ]
};
