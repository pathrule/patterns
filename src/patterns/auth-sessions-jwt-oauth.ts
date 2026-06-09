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
      "summary": "Session and refresh tokens must live in httpOnly cookies, never web storage.",
      "body": "Any token that authenticates a request must be set as an httpOnly cookie so JavaScript cannot read it and XSS cannot exfiltrate it.\n\n- Set the session or refresh cookie with `httpOnly`, `secure`, `sameSite: 'lax'` (or `strict` for high-value actions), and the `__Host-` name prefix.\n- Never write access tokens, refresh tokens, or session ids to `localStorage`, `sessionStorage`, or non-httpOnly cookies.\n- Keep access tokens short lived (15 to 60 minutes) and refresh tokens long lived (7 to 14 days) so a stolen access token expires fast.\n- If a short-lived access token must reach the browser for API calls, hold it in memory only, never in persistent storage."
    },
    {
      "kind": "rule",
      "nodePath": "/src/auth",
      "title": "Hash passwords with Argon2id, never fast hashes",
      "summary": "Use Argon2id at OWASP parameters; bcrypt cost 12+ only as a legacy fallback.",
      "body": "Passwords must be hashed with a memory-hard algorithm so offline cracking stays expensive.\n\n- Default to Argon2id via the `argon2` package using OWASP 2026 minimums: 19 MiB memory, 2 iterations, parallelism 1, then tune upward to your hardware.\n- Use bcrypt at cost factor 12 or higher only when Argon2 is unavailable in the runtime.\n- Never use `md5`, `sha1`, `sha256`, or any unsalted or single-round hash for passwords.\n- Compare with the library's built-in `verify` so the work factor and salt are read from the stored hash; never roll your own comparison."
    },
    {
      "kind": "rule",
      "nodePath": "/src/middleware",
      "title": "Protect cookie-based auth from CSRF",
      "summary": "Cookie sessions need SameSite plus a double-submit CSRF token on state changes.",
      "body": "Because the browser sends auth cookies automatically, every state-changing request needs an explicit CSRF defense.\n\n- Set `sameSite: 'lax'` as the baseline and `strict` on sensitive POST/PUT/PATCH/DELETE flows; SameSite alone is not a complete defense.\n- Add a double-submit cookie token (for example `csrf-csrf`) validated on every unsafe method; pure stateless JWT-in-header APIs that never use cookies can skip this.\n- Verify `Origin` or `Referer` on state-changing requests as defense in depth.\n- Treat `GET`, `HEAD`, and `OPTIONS` as safe and never mutate state in them.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/auth",
      "title": "Sessions vs JWT: pick the right model",
      "summary": "Default to server sessions; reach for JWT only when statelessness is required.",
      "body": "Choosing between server-side sessions and JWTs is the first auth decision and the one agents most often get wrong.\n\n- Default to opaque server sessions stored in Redis or Postgres with an httpOnly cookie. They are revocable instantly, carry no payload to leak, and are simplest to reason about.\n- Reach for JWTs only when you genuinely need stateless verification across services or edge runtimes, and accept that revocation requires a denylist or very short TTLs.\n- A signed JWT cannot be invalidated before expiry, so keep access token TTL low (15 to 60 min) and pair it with a rotating refresh token.\n- Do not put secrets or PII in a JWT payload; it is base64, not encrypted, and is readable by anyone holding it."
    },
    {
      "kind": "memory",
      "nodePath": "/src/auth",
      "title": "OAuth/OIDC and refresh token rotation",
      "summary": "Use Authorization Code + PKCE and rotate refresh tokens with replay detection.",
      "body": "For third-party login and delegated access, follow RFC 9700 (OAuth 2.0 Security BCP) rather than older tutorials.\n\n- Always use the Authorization Code flow with PKCE, even for confidential clients; the implicit and password grants are deprecated. Use `openid-client` or `oauth4webapi` rather than hand-rolling the flow.\n- Validate the `state` parameter against CSRF and validate the OIDC `id_token` signature, `iss`, `aud`, and `nonce` before trusting any claim.\n- Rotate refresh tokens on every use: issue a new refresh token and invalidate the old one. If a consumed token is replayed, revoke the entire token family.\n- Make rotation atomic with a DB transaction or lock so concurrent refreshes cannot mint two valid tokens for one client."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "auth-sessions-jwt-oauth-review",
      "summary": "Pre-merge checklist for any auth, session, JWT, or OAuth change.",
      "body": "---\nname: auth-sessions-jwt-oauth-review\ndescription: Use before merging any authentication change covering sessions, JWTs, OAuth/OIDC, password storage, cookies, CSRF, and token rotation. Run every item against the diff.\n---\n\n# Auth (Sessions, JWT, OAuth) review\n\n- [ ] Tokens and session ids are stored in httpOnly, secure, SameSite cookies with a `__Host-` prefix, never in localStorage or sessionStorage.\n- [ ] Passwords are hashed with Argon2id at OWASP 2026 parameters (19 MiB, 2 iterations, parallelism 1), or bcrypt cost 12+ only as a documented fallback.\n- [ ] No fast or unsalted hash (md5, sha1, sha256) is used for passwords anywhere.\n- [ ] Session vs JWT choice is justified: opaque server sessions by default, JWT only when stateless verification is required.\n- [ ] Access tokens are short lived (15 to 60 min); JWTs carry no secrets or PII in the payload.\n- [ ] OAuth uses Authorization Code + PKCE; implicit and password grants are absent.\n- [ ] OAuth `state` is validated and the OIDC `id_token` signature, `iss`, `aud`, and `nonce` are verified before trusting claims.\n- [ ] Refresh tokens rotate on every use with replay detection that revokes the token family; rotation is atomic.\n- [ ] Cookie-based endpoints enforce CSRF protection (SameSite plus double-submit token) on all state-changing methods.\n- [ ] Auth failures return generic messages and do not leak whether the user or password was wrong.\n",
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
