import type { Pattern } from "../types.js";

export const supplyChainSecurity: Pattern = {
  "slug": "supply-chain-security",
  "version": "1.0.0",
  "name": "Software Supply Chain Security",
  "tagline": "Stop a poisoned dependency from running in your build, CI, and production.",
  "description": "A defense baseline against the supply chain attacks that hit the npm ecosystem hard in 2025 and 2026. Software Supply Chain Failures entered the OWASP Top 10 at A03:2025 because most of these compromises run through a dependency's install script before anyone reads the code. This pattern commits the lockfile and installs from it, neutralizes lifecycle scripts, adds a publish cooldown so freshly-compromised versions are never pulled, and treats every dependency change as a reviewed event with provenance.",
  "category": "Security",
  "icon": "package-check",
  "color": "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Software Supply Chain Security pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for software supply chain security: commit the lockfile and install frozen, disable dependency install scripts, add a publish cooldown, pin and review dependencies with provenance, tuned for AI coding agents.",
  "problem": "AI agents run npm install in CI, leave install scripts enabled, and add freshly-published dependencies, exactly the path recent supply chain attacks use to execute code.",
  "audience": "Teams hardening their dependency pipeline against supply chain compromise",
  "prevents": [
    "Running npm install in CI so a tampered lockfile or floating range pulls a malicious version",
    "Leaving postinstall scripts enabled so a compromised package executes on install",
    "Adding a dependency version minutes after publish, inside the attack window",
    "Bumping dependencies with no review, provenance check, or audit"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/.github/workflows"
    ],
    "stacks": [
      "npm",
      "pnpm",
      "node",
      "ci"
    ],
    "packages": [
      "pnpm",
      "npm"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Commit the lockfile and install frozen everywhere but intentional updates",
      "summary": "Commit package-lock.json / pnpm-lock.yaml and install with npm ci or pnpm install --frozen-lockfile in CI and prod; only a deliberate dependency change may rewrite the lock.",
      "body": "The lockfile is the exact set of versions and hashes you reviewed. An install that is free to rewrite it can silently swap in a different package than the one you vetted.\n\n- Commit the lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) and treat it as reviewed source. A lockfile diff is part of code review, not noise to ignore.\n- In CI and production builds, install with `npm ci` or `pnpm install --frozen-lockfile`. These fail if the lockfile and manifest disagree, instead of resolving new versions on the fly.\n- Use plain `npm install` / `pnpm add` only in a developer's intentional dependency change, then commit the resulting lockfile change for review.\n- Pin to exact versions for the dependencies you care about most, and scrutinize any pull request that widens a range or rewrites large parts of the lockfile.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Disable dependency lifecycle scripts by default",
      "summary": "Block automatic postinstall/preinstall script execution for dependencies; allow-list only the few packages that genuinely need to build.",
      "body": "Most compromised packages execute their payload from an install lifecycle script the moment they land, before any of your code runs. Turning that automatic execution off removes the primary attack path.\n\n- Block dependency install scripts by default. With pnpm v10+, dependency `postinstall`/`preinstall` scripts do not run automatically; explicitly allow-list the few packages that legitimately need to build (via `onlyBuiltDependencies` / `pnpm approve-builds`). With npm, run CI installs with `--ignore-scripts` and opt specific packages back in deliberately.\n- Opt OUT of scripts as the default and opt specific dependencies back IN, never the reverse. The default posture should be that a new or updated dependency cannot run code on install.\n- Review what each allow-listed package's build script actually does before approving it; a build step is still arbitrary code execution.\n- Your own project's scripts are fine to run; the rule is about untrusted dependency code executing automatically.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Add a publish cooldown before adopting new versions",
      "summary": "Do not install a dependency version until it has been public for a cooldown window (e.g. a day); most compromises are caught and unpublished within hours.",
      "body": "Supply chain attacks have a short half-life: a malicious version is usually detected and pulled within hours to a day. Refusing to install brand-new versions sidesteps almost the entire attack window for free.\n\n- Enforce a minimum age before a newly-published version is installable. With pnpm, set `minimumReleaseAge` (pnpm v11 defaults to 1440 minutes / one day); for other tooling, hold automated bumps until a version has aged.\n- Do not chase the latest patch the minute it ships. There is rarely a reason to be the first installer of a version; there is often a reason not to be.\n- Configure dependency-update bots (Dependabot / Renovate) with a cooldown / stabilityDays setting so automated PRs respect the same window.\n- Make exceptions explicit and reviewed: a genuine zero-day fix may justify bypassing the cooldown, but that is a conscious decision, not the default.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/.github/workflows",
      "title": "Verify provenance and audit dependencies in CI",
      "summary": "Run dependency auditing and provenance/signature checks as a CI gate, and pin GitHub Actions to commit SHAs, not floating tags.",
      "body": "CI is itself part of the supply chain, and it is the right place to catch a known-bad dependency before it ships.\n\n- Run an audit step (`npm audit` / `pnpm audit`, plus a scanner like Dependabot, Snyk, or osv-scanner) as a gate, and prefer packages published with provenance/signature attestations so you can verify where an artifact was built.\n- Pin third-party GitHub Actions to a full commit SHA, not a moving tag like `@v4`. A tag can be re-pointed at malicious code; a SHA cannot. This is the same supply chain risk one layer up.\n- Give CI tokens and publish credentials the least privilege they need, scope them per workflow, and never expose registry or cloud secrets to a step that runs untrusted dependency code.\n- Generate or consume an SBOM where practical so you can answer \"are we affected\" quickly when the next ecosystem-wide compromise is announced.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Dependency policy: add, update, and respond",
      "summary": "How we adopt and update dependencies: cooldown window, who reviews a lockfile change, and the first move when an ecosystem compromise is announced.",
      "body": "Adding a dependency is adding code you did not write to your trust boundary. We treat it with that weight.\n\n- Before adding a dependency, weigh whether it is worth a new trust relationship: check maintenance, maintainer count, download trend, and whether a small amount of first-party code would do instead. Fewer dependencies is a smaller attack surface.\n- A dependency add or bump is a reviewed change: the PR shows the lockfile diff, the reviewer sanity-checks the version age (cooldown) and that no unexpected transitive packages or scripts came along.\n- When an ecosystem-wide compromise is announced, the first move is to check the lockfile (and SBOM) for the affected package and version range, not to panic-upgrade everything. Pinned, frozen installs make that answer precise.\n- Keep credentials that could publish or deploy out of any environment that runs untrusted dependency code, and rotate them if a compromise touches your tree.\n\nSee /.github/workflows for the CI provenance/audit rule and / for the frozen-install, scripts, and cooldown rules."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "dependency-change-review",
      "summary": "Checklist to run when adding, updating, or auditing a dependency, and when responding to a supply chain alert.",
      "body": "---\nname: dependency-change-review\ndescription: Checklist for adding or updating a dependency and for responding to a supply chain compromise alert. Run on every dependency PR and when an ecosystem attack is announced.\n---\n\n# Dependency change review\n\n## Adding or updating a dependency\n- [ ] The dependency is actually needed; first-party code or an existing dep would not do the job more safely.\n- [ ] The exact version has cleared the publish cooldown (not installed within the just-published window).\n- [ ] The PR includes the lockfile diff; no unexpected transitive packages or new install scripts appeared.\n- [ ] Maintenance signals checked: active maintenance, reasonable maintainer set, expected download trend.\n- [ ] If the package needs a build/install script, it is explicitly allow-listed and its script was reviewed.\n\n## CI / build posture\n- [ ] CI installs with `npm ci` / `pnpm install --frozen-lockfile`; no `npm install` in CI.\n- [ ] Dependency install scripts are disabled by default; only allow-listed packages build.\n- [ ] `audit` / scanner gate runs; GitHub Actions pinned to commit SHAs, not tags.\n- [ ] CI/publish tokens are least-privilege and not exposed to steps running dependency code.\n\n## Responding to a supply chain alert\n- [ ] Search the lockfile/SBOM for the affected package and version range before changing anything.\n- [ ] Confirm whether the bad version was ever installed (frozen installs make this precise).\n- [ ] Rotate any credentials reachable from an environment that ran the compromised package.\n- [ ] Pin to a known-good version and document the incident.\n",
      "skillTags": [
        "supply-chain",
        "security",
        "dependencies",
        "npm",
        "ci",
        "security-review"
      ]
    }
  ]
};
