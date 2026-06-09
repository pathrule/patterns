import type { Pattern } from "../types.js";

export const authSessionsJwtOauth: Pattern = {
  "slug": "auth-sessions-jwt-oauth",
  "version": "1.0.0",
  "name": "Auth (Sessions, JWT, OAuth)",
  "tagline": "Build authentication that resists XSS, CSRF, and token replay by default.",
  "description": "A backend auth pattern covering the decisions agents get wrong: when to use server sessions versus JWTs, how to store tokens safely in httpOnly cookies, and how to wire OAuth/OIDC with PKCE. It encodes 2026 OWASP guidance on Argon2id password hashing, refresh token rotation, and CSRF defense so generated auth code is secure on the first pass.",
  "category": "Backend",
  "icon": "key-round",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Auth (Sessions, JWT, OAuth) pattern for AI coding agents",
  "metaDescription": "A Pathrule pattern that teaches AI coding agents secure auth: session vs JWT tradeoffs, httpOnly cookies, OAuth/OIDC with PKCE, Argon2id hashing, CSRF, and token rotation.",
  "problem": "AI agents reach for localStorage JWTs, weak password hashing, and missing CSRF defenses, shipping auth that breaks under XSS and token replay.",
  "audience": "Backend and full-stack teams building Node, TypeScript, or Python services that own login, sessions, and OAuth flows.",
  "prevents": [
    "Storing access or refresh tokens in localStorage where XSS can steal them",
    "Hashing passwords with fast or unsalted algorithms like SHA-256 or MD5",
    "Skipping refresh token rotation and CSRF protection on cookie-based auth"
  ],
  "appliesTo": {
    "paths": [
      "/src/auth",
      "/src/middleware",
      "/src/routes"
    ],
    "stacks": [
      "node",
      "typescript",
      "express",
      "fastify",
      "oidc"
    ],
    "packages": [
      "argon2",
      "jose",
      "openid-client",
      "oauth4webapi",
      "csrf-csrf"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Never store auth tokens in localStorage",
      "summary": "Session and refresh tokens must live in httpOnly cookies; never in web storage or non-httpOnly cookies.",
      "body": "Any token that authenticates a request must be set as an httpOnly cookie so JavaScript cannot read it and XSS cannot exfiltrate it.\n\n- Set the session or refresh cookie with `httpOnly`, `secure`, `sameSite: 'lax'` (or `strict` for high-value actions), and the `__Host-` name prefix.\n- Never write access tokens, refresh tokens, or session IDs to `localStorage`, `sessionStorage`, or non-httpOnly cookies.\n- Keep access tokens short-lived (15 to 60 minutes) and refresh tokens long-lived (7 to 14 days) so a stolen access token expires quickly.\n- If a short-lived access token must reach the browser for direct API calls, hold it in memory only — never in persistent storage.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Default to server sessions; use JWT only when statelessness is required",
      "summary": "Opaque server sessions are revocable and carry no payload to leak; choose JWT only when cross-service stateless verification is genuinely needed.",
      "body": "Choosing the wrong token model is an architectural mistake that is expensive to reverse. The safer default is always an opaque session.\n\n- Default to opaque server sessions stored in Redis or Postgres, returned to the browser as an httpOnly cookie. They are instantly revocable, carry no payload to leak, and are the simplest model to reason about.\n- Reach for JWTs only when you genuinely need stateless verification across services or edge runtimes. Accept that revocation requires a denylist or very short TTLs.\n- A signed JWT cannot be invalidated before expiry. Keep access token TTL at 15 to 60 minutes and pair with a rotating refresh token to limit the blast radius of a leaked token.\n- Never put secrets, passwords, PII, or sensitive authorization claims in a JWT payload; it is base64, not encrypted, and is readable by anyone who holds it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Hash passwords with Argon2id, never fast hashes",
      "summary": "Use Argon2id at OWASP 2026 parameters; bcrypt at cost 12+ only as a legacy runtime fallback.",
      "body": "Passwords must be hashed with a memory-hard algorithm so offline cracking remains expensive even with modern hardware.\n\n- Default to Argon2id via the `argon2` package using OWASP 2026 minimums: 19 MiB memory, 2 iterations, parallelism 1. Tune upward if your hardware allows without exceeding p95 login latency.\n- Use bcrypt at cost factor 12 or higher only when Argon2 is unavailable in the target runtime.\n- Never use `md5`, `sha1`, `sha256`, or any unsalted or single-round hash for passwords.\n- Compare passwords using the library's built-in `verify` so the work factor and salt are read from the stored hash. Never write your own comparison.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/middleware",
      "title": "Protect cookie-based auth from CSRF",
      "summary": "SameSite plus a double-submit CSRF token on every state-changing request; pure JWT-in-header APIs that never use cookies can skip this.",
      "body": "The browser sends auth cookies automatically on every matching request, including cross-site ones that SameSite alone does not fully cover in all scenarios. Every state-changing endpoint needs an explicit CSRF defense.\n\n- Set `sameSite: 'lax'` as the baseline; upgrade to `strict` on sensitive write flows.\n- Add a double-submit cookie token (for example `csrf-csrf`) validated on every unsafe method (POST, PUT, PATCH, DELETE). Pure stateless JWT-in-Authorization-header APIs that never use cookies do not need this.\n- Verify `Origin` or `Referer` on state-changing requests as defense in depth.\n- Treat GET, HEAD, and OPTIONS as safe; never mutate state inside them.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/auth",
      "title": "OAuth/OIDC: PKCE, token rotation, and replay detection",
      "summary": "Authorization Code + PKCE, validate all OIDC claims, rotate refresh tokens on every use with atomic replay detection.",
      "body": "Third-party login and delegated access must follow RFC 9700 (OAuth 2.0 Security BCP). Older tutorials recommend flows that are now deprecated or insecure.\n\n- Always use the Authorization Code flow with PKCE, even for confidential clients. The implicit and resource-owner password grants are deprecated and absent from RFC 9700. Use `openid-client` or `oauth4webapi` instead of hand-rolling the flow.\n- Validate the `state` parameter on callback to prevent CSRF. Before trusting any OIDC claim, verify the `id_token` signature, `iss`, `aud`, and `nonce`.\n- Rotate refresh tokens on every use: issue a new refresh token and immediately invalidate the consumed one. If a consumed token is replayed, revoke the entire token family for that user.\n- Make rotation atomic with a database transaction or a compare-and-swap lock so concurrent refresh requests cannot mint two valid tokens for one client session.\n- Store OAuth tokens server-side under the same httpOnly cookie session, never in localStorage. The browser only needs the session cookie; the token exchange and storage live on the server."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "auth-sessions-jwt-oauth-review",
      "summary": "Pre-merge checklist for any auth, session, JWT, or OAuth change.",
      "body": "---\nname: auth-sessions-jwt-oauth-review\ndescription: Use before merging any authentication change covering sessions, JWTs, OAuth/OIDC, password storage, cookies, CSRF, and token rotation. Run every item against the diff.\n---\n\n# Auth (Sessions, JWT, OAuth) review\n\n- [ ] Tokens and session IDs are stored in httpOnly, secure, SameSite cookies with a `__Host-` prefix, never in localStorage or sessionStorage.\n- [ ] Session vs JWT choice is justified: opaque server sessions by default, JWT only when stateless cross-service verification is required.\n- [ ] Access tokens are short-lived (15 to 60 min); no secrets, passwords, or PII are in a JWT payload.\n- [ ] Passwords are hashed with Argon2id at OWASP 2026 parameters (19 MiB, 2 iterations, parallelism 1), or bcrypt cost 12+ only as a documented runtime fallback.\n- [ ] No fast or unsalted hash (md5, sha1, sha256) is used for passwords anywhere.\n- [ ] Cookie-based endpoints enforce CSRF protection (SameSite + double-submit token) on all state-changing methods.\n- [ ] OAuth uses Authorization Code + PKCE; implicit and password grants are absent.\n- [ ] OIDC `id_token` signature, `iss`, `aud`, and `nonce` are verified before trusting any claim. `state` is validated against CSRF.\n- [ ] Refresh tokens rotate on every use with replay detection that revokes the token family; rotation is atomic.\n- [ ] Auth failures return generic messages and do not leak whether the user or password was wrong.\n",
      "skillTags": [
        "auth",
        "security",
        "jwt",
        "oauth",
        "oidc",
        "sessions",
        "csrf",
        "password-hashing"
      ]
    }
  ]
};
