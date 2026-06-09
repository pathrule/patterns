import type { Pattern } from "../types.js";

export const secretsEnvManagement: Pattern = {
  "slug": "secrets-env-management",
  "version": "1.0.0",
  "name": "Secrets & Environment Management",
  "tagline": "Keep secrets out of git, inject them at runtime, and rotate them automatically.",
  "description": "A pattern bundle for handling API keys, tokens, and credentials safely across local development, CI, and production. It enforces .env hygiene, pushes teams toward a managed secret store with runtime injection and OIDC, and ships a review checklist so no credential ever lands in source control or a build log.",
  "category": "Infra",
  "icon": "lock-keyhole",
  "color": "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Secrets & Environment Management for AI Coding Agents",
  "metaDescription": "Rules, memories, and a review checklist that keep AI coding agents from committing secrets, teach safe .env hygiene, secret managers, OIDC, and credential rotation.",
  "problem": "Secrets keep leaking into commits, build logs, and client bundles because there is no enforced convention for where credentials live or how they reach runtime.",
  "audience": "Backend and platform teams shipping services with API keys, database credentials, and CI/CD pipelines.",
  "prevents": [
    "Committing a real .env file or hardcoded API key to git history",
    "Leaking server-side secrets into a client bundle via the wrong env prefix",
    "Long-lived static cloud keys sitting in CI with no rotation or expiry"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/.github/workflows",
      "/src",
      "/config"
    ],
    "stacks": [
      "node",
      "docker",
      "github-actions",
      "aws",
      "vault"
    ],
    "packages": [
      "@dotenvx/dotenvx",
      "dotenv",
      "gitleaks"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Never commit plaintext secrets",
      "summary": "Real credentials never enter the repo; only encrypted or example files are tracked.",
      "body": "No file containing a live secret may be committed, and `.gitignore` must block every plaintext env file before the first commit.\n\n- Add `.env`, `.env.*`, and `.env.local` to `.gitignore`; track only `.env.example` with placeholder values.\n- Commit secrets only when encrypted at rest, for example a `dotenvx`-encrypted `.env` or a `sops`-encrypted file where the decryption key lives outside the repo.\n- Run `gitleaks` as a pre-commit hook and in CI so a staged secret is blocked before it reaches the remote.\n- If a secret is ever pushed, treat it as compromised: rotate it immediately, then scrub history. Removing the commit is not enough.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Keep server secrets out of the client bundle",
      "summary": "Only explicitly public-prefixed vars cross into client code; read secrets server-side only.",
      "body": "Anything bundled for the browser is public, so server secrets must never be referenced from client-reachable modules.\n\n- Read secrets only in server code (route handlers, server actions, API layers, background jobs), never in components that ship to the client.\n- Expose values to the client only through an intentional public prefix such as `NEXT_PUBLIC_`, `VITE_`, or `PUBLIC_`, and assume anything prefixed that way is world-readable.\n- Validate the full env at startup with a typed schema (for example `zod`) so a missing or misnamed secret fails fast instead of surfacing as a runtime `undefined`.\n- Never log a secret value or echo it into an error message, response body, or analytics event.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Secret storage tiers: local, CI, production",
      "summary": "Where secrets live and how they reach the app at each stage.",
      "body": "Secrets flow through three tiers, and each has a distinct source of truth so no plaintext credential is shared by hand.\n\n- Local: developers keep an uncommitted `.env.local`, or pull from the team store with a CLI such as `doppler run`, `infisical run`, or `vault`. Share new keys via the store, never over chat.\n- CI: the pipeline authenticates with GitHub OIDC to mint a short-lived cloud role instead of holding static keys. Vercel and similar platforms issue OIDC tokens with roughly a 60-minute TTL, so the long-lived key never exists in the environment.\n- Production: a managed store (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, or the platform env UI) injects values at runtime. Prefer Vault dynamic secrets, which mint per-request credentials with a built-in TTL and auto-revoke, so there is nothing to rotate.\n\nSee /.github/workflows for the OIDC pipeline wiring and /src for the runtime read and validation rules."
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Rotation and least-privilege defaults",
      "summary": "Lifetime, scoping, and revocation expectations for every credential.",
      "body": "Every credential is scoped narrowly and has a known expiry, so a leak has a small blast radius and a short window.\n\n- Issue a distinct key per service or consumer; never share one key across apps, which makes revocation surgical instead of a fleet-wide outage.\n- Grant least privilege: scope each key to the exact resources and actions it needs, read-only where possible.\n- Set a rotation policy. Prefer dynamic or OIDC short-lived credentials so rotation is automatic; for unavoidable static keys, schedule rotation (for example AWS Secrets Manager rotation for RDS) and alert before expiry.\n- Keep audit logging on at the store so every access (who, when, what) is traceable, and revoke immediately on offboarding or suspected exposure."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "secrets-env-management-review",
      "summary": "Pre-merge checklist to confirm no secret leaks and env handling is sound.",
      "body": "---\nname: secrets-env-management-review\ndescription: Review checklist for any change that touches secrets, env vars, CI credentials, or config. Run before merging to confirm no credential leaks into git, logs, or the client bundle.\n---\n\n# Secrets & environment management review\n\n- [ ] No plaintext secret is added to a tracked file; `.env`, `.env.*`, and `.env.local` are in `.gitignore`.\n- [ ] Only `.env.example` (placeholder values) or an encrypted env file (`dotenvx`/`sops`, key stored outside the repo) is committed.\n- [ ] `gitleaks` runs as a pre-commit hook and in CI, and the diff passes a secret scan.\n- [ ] Secrets are read server-side only; nothing sensitive is exposed via a public prefix (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`).\n- [ ] Env is validated at startup with a typed schema so missing or misnamed vars fail fast.\n- [ ] No secret value is logged, returned in a response, or sent to analytics.\n- [ ] CI authenticates via OIDC for short-lived cloud roles instead of storing long-lived static keys.\n- [ ] Production reads secrets from a managed store with runtime injection, not a baked-in build artifact.\n- [ ] Each new credential is least-privilege, distinct per consumer, and has a rotation policy or short TTL.\n- [ ] Any previously exposed secret has been rotated, not just deleted from history.\n",
      "skillTags": [
        "secrets",
        "env",
        "security",
        "ci-cd",
        "rotation"
      ]
    }
  ]
};
