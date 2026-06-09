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
      "title": "Remote state with native locking only",
      "summary": "Every root module uses an encrypted, versioned S3 backend with use_lockfile.",
      "body": "State lives in a remote backend with locking, encryption, and versioning. Never local, never unlocked.\n\n- Configure the `s3` backend with `use_lockfile = true` (GA since Terraform 1.11); do not add a `dynamodb_table` lock, that path is deprecated.\n- Enable bucket versioning and SSE-KMS (`encrypt = true` plus a customer-managed `kms_key_id`) so state is recoverable and encrypted at rest.\n- Give each environment its own state `key` and isolated IAM access; never share one state file across `dev`, `staging`, and `prod`.\n- Never commit `terraform.tfstate` or `*.tfstate.backup`; treat state as a secret and keep it out of git."
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Plan-gated, OIDC-authenticated CI",
      "summary": "CI authenticates via OIDC and applies only a reviewed plan artifact.",
      "body": "The pipeline runs `terraform plan`, saves it as an artifact, and applies that exact plan after approval.\n\n- Use `terraform plan -out=tfplan` then `terraform apply tfplan`; never re-plan at apply time, the applied change must match what was reviewed.\n- Authenticate to the cloud with short-lived OIDC tokens (GitHub Actions `id-token: write`), never long-lived static access keys in secrets.\n- Scope the apply role to least privilege, and prefer a read-only identity for `plan` and a separate write identity for `apply`.\n- Gate `apply` on a manual approval or protected environment so a human signs off on the plan before infrastructure changes.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/infra/modules",
      "title": "Module and provider versioning conventions",
      "summary": "How we pin, structure, and version reusable modules and providers.",
      "body": "Reusable infrastructure is composed from versioned modules with pinned providers.\n\n- Pin every provider in `required_providers` with `~>` constraints and commit `.terraform.lock.hcl` so every run and teammate resolves identical versions.\n- Set `required_version` to the supported Terraform line (1.15.x as of mid-2026; 1.13 is EOL); bump deliberately, not implicitly.\n- Source registry and git modules with an explicit `version` or pinned `?ref=` tag, never a floating `main` branch.\n- Keep modules small and single-purpose with typed `variables.tf`, `outputs.tf`, and a README; root modules in `/infra/environments` only wire modules together."
    },
    {
      "kind": "memory",
      "nodePath": "/infra",
      "title": "Secrets and tagging conventions",
      "summary": "Keep secrets out of state and tag every resource consistently.",
      "body": "Sensitive values never land in state, and every resource carries a consistent tag set.\n\n- Use write-only arguments (e.g. `password_wo` with `password_wo_version`) and `ephemeral` resources/values (Terraform 1.11+) for passwords and tokens so they never persist to state or plan files.\n- Source secrets at apply time from a secrets manager (AWS Secrets Manager / SSM Parameter Store) data sources; do not hardcode them in `*.tfvars` or commit them.\n- Apply a baseline tag set via the AWS provider `default_tags` block: `Environment`, `Owner`, `ManagedBy = \"terraform\"`, and `CostCenter`.\n- Mark sensitive outputs and variables `sensitive = true`, and remember that flag hides values from logs but does not encrypt or remove them from state."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "terraform-iac-review",
      "summary": "Pre-merge checklist for any Terraform change.",
      "body": "---\nname: terraform-iac-review\ndescription: Pre-merge review checklist for Terraform / IaC changes covering remote state, locking, versioning, secrets, tagging, and plan-gated CI. Use before merging any Terraform PR.\n---\n\n# Terraform / IaC review\n\n- [ ] Remote `s3` backend configured with `use_lockfile = true`, no deprecated DynamoDB lock\n- [ ] State bucket has versioning enabled and SSE-KMS encryption (`encrypt = true` + `kms_key_id`)\n- [ ] Each environment uses an isolated state `key`; no state files committed to git\n- [ ] `required_version` and all `required_providers` are pinned; `.terraform.lock.hcl` is committed\n- [ ] Modules sourced with an explicit `version` or pinned `?ref=`, never a floating branch\n- [ ] No secrets in `*.tfvars`, code, or state; write-only / ephemeral args used for passwords and tokens\n- [ ] Sensitive variables and outputs marked `sensitive = true`\n- [ ] `default_tags` applies the baseline tag set (`Environment`, `Owner`, `ManagedBy`, `CostCenter`)\n- [ ] CI runs `terraform plan -out=tfplan` and applies that exact artifact after approval\n- [ ] Cloud auth uses short-lived OIDC tokens with a least-privilege role, no static keys\n- [ ] `terraform validate` and `terraform fmt -check` pass; a security scan (tfsec/Checkov/Trivy) is clean\n",
      "skillTags": [
        "terraform",
        "iac",
        "aws",
        "ci",
        "review"
      ]
    }
  ]
};
