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
      "title": "No live secret enters git history",
      "summary": "Plaintext env files are gitignored before the first commit; only example or encrypted env files are tracked.",
      "body": "A file containing a live credential must never be committed, and the ignore rules must exist before the first commit, not after the first leak.\n\n- Add `.env`, `.env.*`, and `.env.local` to `.gitignore`, then explicitly un-ignore the files you DO want tracked: `!.env.example` and, if you use dotenvx, `!.env.production` (the encrypted artifact). Keep `.env.keys` ignored always.\n- Track only `.env.example` with placeholder values, or an encrypted file where the decryption key lives outside the repo. With dotenvx, `dotenvx encrypt` writes the `DOTENV_PUBLIC_KEY` plus ciphertext into the committed `.env` and the matching `DOTENV_PRIVATE_KEY` into the never-committed `.env.keys`; with sops, the data key is held by KMS/age, not the repo.\n- Run gitleaks at the gate, not just in CI. As of v8.19.0 the `protect` and `detect` subcommands are deprecated; the current pre-commit invocation is `gitleaks git --pre-commit --staged --redact --no-banner` (wire it into a Lefthook or Husky `pre-commit` hook), and CI runs `gitleaks dir .` (or `gitleaks git` for history).\n- Encryption is not a license to relax this rule: an attacker with the decryption key gets everything, so the private key is itself a top-tier secret and never lives in the repo.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Server secrets never cross into the client bundle",
      "summary": "Read secrets only in server code; only intentionally public-prefixed vars ship to the browser.",
      "body": "Anything bundled for the browser is world-readable, so a server secret referenced from a client-reachable module is a public secret the moment you build.\n\n- Read secrets only in server code (route handlers, server actions, API layers, background jobs). A secret imported into a React/Vue/Svelte component that renders client-side WILL be inlined into the bundle by the bundler, even if the code path looks server-only.\n- Treat any value behind a public prefix (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, `EXPO_PUBLIC_`) as published. Never put a real secret behind one to \"make it work\" on the client.\n- Validate the whole environment once at startup with a typed schema (for example `zod` or `@t3-oss/env-nextjs`) that separates server vars from client vars, so a missing or misnamed secret fails the build instead of surfacing as a runtime `undefined`.\n- Never log a secret, return it in a response body, or send it to an analytics/error tracker. Redact before it reaches any sink.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "CI authenticates via OIDC, not stored static keys",
      "summary": "Pipelines federate to a short-lived cloud role instead of storing long-lived access keys as secrets.",
      "body": "A long-lived cloud key stored as a CI secret is the highest-value, lowest-rotation credential most teams hold. Federate instead so the credential is minted per run and expires on its own.\n\n- Grant the job `permissions: id-token: write` and exchange GitHub's OIDC JWT for a role. For AWS use `aws-actions/configure-aws-credentials` with `role-to-assume` and no `aws-access-key-id`/`aws-secret-access-key`. GCP and Azure have equivalent workload-identity federation actions.\n- The minted credential is short-lived (AWS STS defaults to up to 1 hour) and scoped to exactly the IAM role's trust policy. There is no static key in the environment to leak or rotate.\n- Lock the IAM trust policy to your `repo:org/name`, and constrain on `ref`/`environment` claims so only the intended branch or protected environment can assume the role. Note the immutable `sub` subject-claim rollout for new repositories landing June 18, 2026 and pin your trust condition to claims that survive it.\n- Use platform-native OIDC for app-to-cloud calls too (for example Vercel exposes `VERCEL_OIDC_TOKEN`, TTL ~60 min, cached ~45 min) so deployed functions never carry a static cloud key either.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Secret storage tiers: local, CI, production",
      "summary": "Where secrets live and how they reach the app at each stage, with no plaintext handed around.",
      "body": "Secrets flow through three tiers, each with its own source of truth, so no plaintext credential is ever shared by hand or pasted into chat.\n\n- Local: developers keep an uncommitted `.env.local`, or pull from the team store with a CLI (`doppler run --`, `infisical run --`, `vault read`, or `vercel env pull`). New keys are shared through the store, never over Slack/email. With dotenvx, devs run `dotenvx run -- <cmd>` which decrypts the committed `.env` using the `.env.keys` private key.\n- CI: the pipeline authenticates with GitHub OIDC to assume a short-lived cloud role rather than holding static keys (see /.github/workflows). dotenvx users keep an environment-scoped `DOTENV_PRIVATE_KEY_CI` in the CI secret store as the single bootstrap secret.\n- Production: a managed store (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, or the platform env UI) injects values at runtime; or set `DOTENV_PRIVATE_KEY_PRODUCTION` ahead of `dotenvx run --` so the encrypted `.env` is decrypted in memory at boot. Prefer Vault dynamic secrets, which mint per-request credentials with a built-in TTL and auto-revoke, so there is effectively nothing to rotate.\n\nSee /src for the runtime read and client-bundle rules, and /.github/workflows for the OIDC pipeline wiring.",
      "skillTags": []
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Rotation, least privilege, and leaked-secret response",
      "summary": "Lifetime and scoping defaults for every credential, plus the rotate-then-scrub runbook when one leaks.",
      "body": "Every credential is scoped narrowly and has a known expiry, so a leak has a small blast radius and a short window. When one does leak, order of operations matters.\n\nDefaults for every new credential:\n- Issue a distinct key per service or consumer; never share one key across apps, so revocation is surgical instead of a fleet-wide outage.\n- Grant least privilege: scope to the exact resources and actions needed, read-only where possible.\n- Prefer dynamic or OIDC short-lived credentials so rotation is automatic. For unavoidable static keys, schedule rotation (for example AWS Secrets Manager rotation for RDS) and alert before expiry.\n- Keep audit logging on at the store so every access (who, when, what) is traceable, and revoke immediately on offboarding.\n\nWhen a secret is exposed (committed, logged, or pasted), in this order:\n1. Rotate first. The secret is compromised the instant it leaves the trust boundary; assume it is already scraped. Revoke the old credential at the provider and issue a new one before anything else.\n2. Then scrub history (`git filter-repo` or BFG) and force-push, and purge it from any build logs, artifacts, and error trackers. Deleting the commit or rewriting history alone does NOT uncompromise the secret, which is why rotation comes first.\n3. Check the provider's audit log for use during the exposure window, and rotate any credential that was derivable from the leaked one.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "secrets-env-management-review",
      "summary": "Pre-merge checklist to confirm no secret leaks and env handling is sound.",
      "body": "---\nname: secrets-env-management-review\ndescription: Review checklist for any change that touches secrets, env vars, CI credentials, or config. Run before merging to confirm no credential leaks into git, logs, or the client bundle.\n---\n\n# Secrets & environment management review\n\n- [ ] No plaintext secret is added to a tracked file; `.env`, `.env.*`, and `.env.local` are in `.gitignore`, with explicit `!.env.example` (and `!.env.production` only if it is the encrypted dotenvx artifact).\n- [ ] `.env.keys` (or any sops/age private key) is gitignored and not present in the diff.\n- [ ] Only `.env.example` (placeholders) or an encrypted file (dotenvx/sops, key stored outside the repo) is committed; no decryption key is in the repo.\n- [ ] gitleaks runs at the pre-commit gate via `gitleaks git --pre-commit --staged --redact` and in CI via `gitleaks dir .`; the diff passes a secret scan. (Do not use the deprecated `protect`/`detect` subcommands.)\n- [ ] Secrets are read server-side only; nothing sensitive is referenced from client-reachable modules or exposed via a public prefix (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, `EXPO_PUBLIC_`).\n- [ ] Env is validated at startup with a typed schema that separates server and client vars, so a missing or misnamed var fails the build.\n- [ ] No secret value is logged, returned in a response, or sent to analytics/error tracking.\n- [ ] CI uses `id-token: write` + OIDC role assumption (no `aws-access-key-id` etc. stored as secrets); the IAM trust policy is locked to the repo and ref/environment.\n- [ ] Production reads secrets from a managed store or decrypts at runtime, not from a baked-in build artifact.\n- [ ] Each new credential is least-privilege, distinct per consumer, and has a rotation policy or short TTL.\n- [ ] Any previously exposed secret was rotated FIRST, then scrubbed from history and logs (not just deleted).\n",
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
