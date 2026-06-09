import type { Pattern } from "../types.js";

export const terraformIac: Pattern = {
  "slug": "terraform-iac",
  "version": "1.0.0",
  "name": "Terraform / IaC",
  "tagline": "Ship Terraform with locked remote state, pinned versions, and a plan-gated CI pipeline.",
  "description": "A guardrail bundle for teams managing infrastructure as code with Terraform 1.11+ on AWS. It enforces remote state with native S3 locking, pinned providers and modules, secrets kept out of state via write-only arguments, and a CI pipeline that always reviews a plan before apply. Built so AI agents make the same safe choices a senior platform engineer would.",
  "category": "Infra",
  "icon": "cloud-cog",
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
  "metaTitle": "Terraform / IaC pattern for AI coding agents | Pathrule",
  "metaDescription": "Pathrule rules, memories, and a review skill that keep AI agents shipping safe Terraform: locked remote state, pinned versions, plan-gated CI, and no secrets in state.",
  "problem": "AI agents and rushed PRs ship Terraform with unlocked state, drifting versions, secrets baked into state, and applies that never matched a reviewed plan.",
  "audience": "Platform, DevOps, and SRE teams running Terraform 1.11+ against AWS",
  "prevents": [
    "Concurrent applies corrupting unlocked remote state",
    "Secrets and tokens persisted in plaintext inside the state file",
    "Applying changes in CI that were never reviewed as a plan"
  ],
  "appliesTo": {
    "paths": [
      "/infra",
      "/infra/modules",
      "/infra/environments",
      "/.github/workflows"
    ],
    "stacks": [
      "terraform",
      "opentofu",
      "aws",
      "iac",
      "github-actions"
    ],
    "packages": []
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra",
      "title": "Remote state with native S3 locking only",
      "summary": "Every root module uses an encrypted, versioned S3 backend with use_lockfile and an isolated state key per environment.",
      "body": "State lives in a remote backend with locking, encryption, and versioning. Never local, never unlocked, never shared across environments.\n\n- Configure the `s3` backend with `use_lockfile = true` (GA since Terraform 1.11; shipped experimentally in 1.10). Do not add a `dynamodb_table` lock to new backends; that argument is deprecated and slated for removal in a future minor version. The only reason to keep both set is a temporary migration off DynamoDB.\n- Enable bucket versioning and server-side encryption: set `encrypt = true`, and for a customer-managed key add `kms_key_id` (the apply role needs `kms:Encrypt`, `kms:Decrypt`, and `kms:GenerateDataKey` on that key). Versioning is what lets you recover from a corrupted or truncated state push.\n- Give each environment its own state `key` and isolated IAM access. One state file shared across `dev`, `staging`, and `prod` means a single bad apply can take down everything.\n- Never commit `terraform.tfstate` or `*.tfstate.backup`. State holds resource attributes and any non-ephemeral sensitive values in plaintext; treat it as a secret and keep it out of git.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra",
      "title": "Keep secrets out of state with write-only and ephemeral values",
      "summary": "Passwords and tokens use write-only arguments or ephemeral resources so they never persist to state or plan files.",
      "body": "Sensitive values must never be readable in the state file or a saved plan. `sensitive = true` only hides values from CLI output; it does not remove or encrypt them in state. Use the mechanisms that actually keep them out.\n\n- For resource inputs (DB passwords, API tokens), use write-only arguments (the `_wo` form, e.g. `password_wo`) paired with their `_wo_version` companion (e.g. `password_wo_version`). The value is sent to the provider during apply and then discarded; only the version number is stored in state. GA since Terraform 1.11.\n- For values you fetch or generate at apply time, use `ephemeral` resources and `ephemeral` variables/outputs (Terraform 1.10+ / 1.11). Ephemeral data is never written to state or plan.\n- Source secrets at apply time from a secrets manager via data/ephemeral resources (AWS Secrets Manager, SSM Parameter Store). Do not hardcode them in `*.tfvars`, locals, or anything committed to git.\n- If a secret has already touched state in this repo, treat it as compromised: rotate it and clean history; do not assume `sensitive = true` protected it.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Plan-gated, OIDC-authenticated CI",
      "summary": "CI applies only the exact reviewed plan artifact and authenticates with short-lived OIDC tokens.",
      "body": "The pipeline runs `terraform plan`, saves it as an artifact, and applies that exact plan after approval. The applied change must equal what a human reviewed.\n\n- Use `terraform plan -out=tfplan`, then `terraform apply tfplan`. Never re-plan at apply time; a fresh plan can diverge from the reviewed one (drift, new provider versions, changed data sources).\n- Authenticate to the cloud with short-lived OIDC tokens. In GitHub Actions set `permissions: id-token: write` and assume a role; do not store long-lived static access keys in repo secrets.\n- Use a read-only identity for `plan` and a separate write-scoped identity for `apply`, each least-privilege and ideally per-environment. Restrict dangerous actions (`iam:PassRole`, destructive APIs) on the apply role.\n- Gate `apply` on a GitHub protected environment with required reviewers, so the workflow pauses for human sign-off on the plan before any infrastructure changes.\n- Post the `plan` output as a PR comment so the diff is reviewed like code.\n- Run `terraform validate`, `terraform fmt -check`, and a static security scan (Trivy IaC or Checkov) on every PR; fail the build on any high-severity misconfiguration finding.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/infra/modules",
      "title": "Module and provider versioning conventions",
      "summary": "How we pin, structure, and version reusable modules and providers.",
      "body": "Reusable infrastructure is composed from versioned modules with pinned providers, so every run and teammate resolves identical versions.\n\n- Pin every provider in `required_providers` with a `~>` constraint and commit `.terraform.lock.hcl`. The lock file is what guarantees reproducible provider versions and checksums across machines and CI.\n- Set `required_version` to a supported Terraform line. As of mid-2026 that is the 1.15.x series (1.15.5 is current); 1.13 reached EOL in April 2026. Bump deliberately in a dedicated PR, not as an implicit side effect.\n- Source registry and git modules with an explicit `version` or a pinned `?ref=<tag-or-sha>`. Never point a module at a floating `main` branch; a downstream commit will silently change your infrastructure.\n- Keep modules small and single-purpose with typed `variables.tf`, `outputs.tf`, and a README. Root modules in `/infra/environments` only wire modules together and hold the backend config; they should contain little to no raw resource logic."
    },
    {
      "kind": "memory",
      "nodePath": "/infra",
      "title": "Resource tagging convention",
      "summary": "Every resource carries a consistent baseline tag set via default_tags.",
      "body": "Consistent tags are how we attribute cost, find owners during an incident, and distinguish managed from manual resources.\n\n- Apply a baseline tag set through the AWS provider `default_tags` block rather than tagging each resource by hand: `Environment`, `Owner`, `ManagedBy = \"terraform\"`, and `CostCenter`.\n- `ManagedBy = \"terraform\"` lets you safely identify and avoid manually mutating Terraform-owned resources, and helps cleanup tooling skip them.\n- Per-resource tags merge on top of `default_tags`; use them only for resource-specific keys (e.g. `Role`, `Backup`), not to re-declare the baseline.\n- Some resource types (e.g. Auto Scaling groups) do not inherit `default_tags` cleanly; verify the plan shows the baseline tags on every resource and add explicit tags where the provider does not propagate them."
    },
    {
      "kind": "memory",
      "nodePath": "/infra",
      "title": "Terraform vs OpenTofu: know which one this repo runs",
      "summary": "The fork has diverged on license, version line, and state encryption; pick one per repo and do not mix.",
      "body": "This stack covers both Terraform and OpenTofu. They share HCL and most provider behavior but have diverged enough that advice for one can be wrong for the other. Confirm which binary CI and contributors actually run before applying version- or feature-specific guidance.\n\n- License and versions differ. HashiCorp Terraform is BSL-licensed; its 2026 line is 1.15.x. OpenTofu is the Linux Foundation MPL-2.0 fork and has its own version numbering and release cadence, so a `required_version` constraint that fits one will not necessarily fit the other.\n- State encryption: OpenTofu has built-in client-side state and plan encryption (configured via an `encryption` block / key providers), which Terraform does not offer natively. If this repo is OpenTofu, prefer that over relying solely on S3 SSE.\n- Feature parity is not guaranteed. Write-only arguments, ephemeral values, and `use_lockfile` exist on the Terraform side per the version notes here; verify the equivalent is supported in your OpenTofu version before assuming the same syntax and GA status.\n- Pick one tool per repo and pin it in CI (the `setup-terraform` vs `setup-opentofu` action). Do not let some contributors run `terraform` and others `tofu` against the same state; subtle state and plan-format differences will bite you."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "terraform-iac-review",
      "summary": "Pre-merge checklist for any Terraform / OpenTofu change.",
      "body": "---\nname: terraform-iac-review\ndescription: Pre-merge review checklist for Terraform / OpenTofu IaC changes covering remote state, locking, versioning, secrets, tagging, and plan-gated CI. Use before merging any IaC PR.\n---\n\n# Terraform / IaC review\n\n## State and backend\n- [ ] Remote `s3` backend configured with `use_lockfile = true`; no new `dynamodb_table` lock (deprecated)\n- [ ] State bucket has versioning enabled and encryption set (`encrypt = true`, plus `kms_key_id` for CMK)\n- [ ] Each environment uses an isolated state `key`; no `*.tfstate` / `*.tfstate.backup` committed to git\n\n## Versioning\n- [ ] `required_version` targets a supported line (1.15.x in mid-2026); `.terraform.lock.hcl` is committed\n- [ ] Every provider pinned with `~>` in `required_providers`\n- [ ] Modules sourced with an explicit `version` or pinned `?ref=`, never a floating branch\n- [ ] Tool is consistent (Terraform vs OpenTofu) and matches the CI setup action\n\n## Secrets\n- [ ] No secrets in `*.tfvars`, locals, code, or state\n- [ ] Passwords/tokens use write-only (`_wo` + `_wo_version`) or `ephemeral` resources/values\n- [ ] `sensitive = true` used for output hygiene, but not relied on as state protection\n\n## Tagging\n- [ ] `default_tags` applies the baseline set (`Environment`, `Owner`, `ManagedBy`, `CostCenter`)\n- [ ] Resource types that do not inherit `default_tags` (e.g. ASGs) tagged explicitly\n\n## CI\n- [ ] CI runs `terraform plan -out=tfplan` and applies that exact artifact after approval (no re-plan at apply)\n- [ ] Cloud auth uses short-lived OIDC tokens with a least-privilege role; no static keys in secrets\n- [ ] `apply` gated on a protected environment with required reviewers; plan posted to the PR\n- [ ] `terraform validate` and `terraform fmt -check` pass; a security scan (Trivy or Checkov) is clean\n",
      "skillTags": [
        "terraform",
        "opentofu",
        "iac",
        "aws",
        "ci",
        "review"
      ]
    }
  ]
};
