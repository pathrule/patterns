import type { Pattern } from "../types.js";

export const dockerContainers: Pattern = {
  "slug": "docker-containers",
  "version": "1.0.0",
  "name": "Docker & Containers",
  "tagline": "Ship small, secure, cache-friendly container images by default.",
  "description": "A ready-to-use bundle of rules, memories, and a review checklist for authoring production Dockerfiles. It encodes 2026 best practices: multi-stage builds, non-root minimal runtimes, BuildKit cache mounts, a tight .dockerignore, and meaningful healthchecks so your agent stops generating bloated, root-running images.",
  "category": "Infra",
  "icon": "container",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Docker & Containers pattern for AI coding agents",
  "metaDescription": "Teach your AI coding agent to write production Dockerfiles: multi-stage builds, non-root minimal images, BuildKit cache mounts, .dockerignore, and healthchecks.",
  "problem": "AI agents tend to emit single-stage, root-running, uncached Dockerfiles that are large, slow to build, and insecure in production.",
  "audience": "Backend and platform teams shipping containerized services to production",
  "prevents": [
    "Single-stage images that bake build tools and dev dependencies into the runtime",
    "Containers that run as root because no USER directive was set",
    "Cache-busting layer order that forces a full dependency reinstall on every code change"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/docker",
      "/deploy"
    ],
    "stacks": [
      "docker",
      "buildkit",
      "containers",
      "ci-cd"
    ],
    "packages": []
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Use multi-stage builds with a minimal non-root runtime",
      "summary": "Every production Dockerfile must end in a slim, non-root final stage.",
      "body": "Split build and runtime into separate stages so build tools never reach the final image.\n\n- Build in a full stage (for example `node:22` or `golang:1.24`), then `COPY --from=build` only the artifacts into a minimal final stage like `-slim`, `alpine`, or a `distroless` `:nonroot` image.\n- Create and switch to a non-root user with an explicit UID and add a `USER` directive before `CMD`; copy artifacts with `COPY --chown` so they are owned correctly.\n- Pin base images by major version or digest; never ship `latest` to production.",
      "scopeType": "file_type",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Keep build context small and cache-ordered",
      "summary": "Maintain a .dockerignore and order layers stable-to-volatile.",
      "body": "Order Dockerfile instructions so rarely changing layers come first and the build context stays tiny.\n\n- Commit a `.dockerignore` that excludes `node_modules`, `.git`, build output, secrets, and local env files so they are never sent to the builder.\n- Copy the dependency manifest (`package.json`, `go.mod`, `requirements.txt`) and install before `COPY . .`, so a code change does not invalidate the dependency layer.\n- Use BuildKit cache mounts for package managers, for example `RUN --mount=type=cache,target=/root/.npm npm ci`, with `sharing=locked` for apt.",
      "scopeType": "file_type",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Healthchecks must use exec form and match the runtime",
      "summary": "Pick a healthcheck the final image can actually run.",
      "body": "Add a `HEALTHCHECK` so the orchestrator knows when the container is ready, but match it to the runtime you shipped.\n\n- Use the JSON exec form, for example `HEALTHCHECK CMD [\"node\", \"healthcheck.js\"]`; the shell form fails on `distroless` images that have no shell.\n- `curl` and `wget` are absent from `distroless` and minimal images, so ship a tiny in-language probe instead of shelling out.\n- Tune `--interval`, `--timeout`, `--start-period`, and `--retries` to the service: fast checks for latency-critical APIs, slower checks for background workers.",
      "skillTags": []
    },
    {
      "kind": "memory",
      "nodePath": "/deploy",
      "title": "BuildKit and CI cache strategy for fast rebuilds",
      "summary": "Combine layer cache, cache mounts, and a registry cache backend.",
      "body": "BuildKit is the default builder; layer order plus cache mounts plus a remote cache backend is what cuts CI times by 70 to 85 percent.\n\n- Layer cache is all-or-nothing per instruction; cache mounts (`--mount=type=cache`) persist a package store across builds so only new deps download when a manifest changes.\n- In CI, push and pull a registry cache with `--cache-to type=registry` and `--cache-from` so ephemeral runners reuse prior layers.\n- The dependency-first layout and a tight `.dockerignore` are the two highest-leverage changes; add multi-stage and cache backends on top.",
      "skillTags": []
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "docker-containers-review",
      "summary": "Pre-merge checklist for any new or changed Dockerfile.",
      "body": "---\nname: docker-containers-review\ndescription: Review checklist for production Dockerfiles covering multi-stage builds, non-root runtime, layer caching, .dockerignore, and healthchecks. Run before merging any Dockerfile change.\n---\n\n# Docker & Containers review\n\n- [ ] Dockerfile uses multi-stage builds; the final stage contains only runtime artifacts, no build tools or dev dependencies.\n- [ ] Base images are pinned by major version or digest, not `latest`.\n- [ ] A non-root user is created with an explicit UID and a `USER` directive precedes `CMD`/`ENTRYPOINT`.\n- [ ] Artifacts are copied with `COPY --chown` so the non-root user owns them.\n- [ ] Dependency manifests are copied and installed before `COPY . .` to preserve the dependency cache layer.\n- [ ] A `.dockerignore` excludes `node_modules`, `.git`, build output, secrets, and local env files.\n- [ ] BuildKit cache mounts are used for package managers (with `sharing=locked` for apt).\n- [ ] A `HEALTHCHECK` is defined in JSON exec form and uses a probe the final image can actually run.\n- [ ] No secrets are baked into layers via `ARG`/`ENV`; build secrets use `--mount=type=secret`.\n- [ ] CI build pushes/pulls a registry cache (`--cache-to` / `--cache-from`) for fast rebuilds.\n",
      "skillTags": [
        "docker",
        "containers",
        "buildkit",
        "ci-cd",
        "security"
      ]
    }
  ]
};
