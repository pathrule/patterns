import type { Pattern } from "../types.js";

export const kubernetesHelm: Pattern = {
  "slug": "kubernetes-helm",
  "version": "1.0.0",
  "name": "Kubernetes + Helm",
  "tagline": "Ship workloads that Kubernetes can schedule, restart, drain, and scale without dropping requests.",
  "description": "A generated Kubernetes manifest usually deploys and usually survives a demo. What it lacks is everything the cluster needs to treat the workload correctly: requests so the scheduler can place it, three probes with different jobs, a disruption budget so a node drain does not take the service down, a security context so the container is not root, and a shutdown path that stops accepting traffic before it exits. Audits of public Helm charts keep finding the same two gaps, missing disruption budgets and missing resource requests, which is exactly what this bundle refuses to ship without.",
  "category": "Infra",
  "icon": "ship-wheel",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-08-24",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-24",
      "note": "First release."
    }
  ],
  "metaTitle": "Kubernetes and Helm pattern for AI agents",
  "metaDescription": "Kubernetes pattern for AI coding agents: resource requests, three probes, disruption budgets, hardened security contexts, and Helm charts without secrets.",
  "problem": "AI agents generate Kubernetes manifests with no resource requests, one probe copied into all three slots, a latest image tag, a root container, and no disruption budget or graceful shutdown.",
  "audience": "Platform and backend teams running services on Kubernetes with Helm",
  "prevents": [
    "Deploying a container with no resource requests, so the scheduler cannot place it sanely",
    "Using the same endpoint for liveness and readiness and restarting pods during a slow start",
    "Draining a node and taking every replica of a service with it",
    "Running as root with a writable root filesystem and a mutable latest tag"
  ],
  "appliesTo": {
    "paths": [
      "/k8s",
      "/charts",
      "/deploy"
    ],
    "stacks": [
      "kubernetes",
      "k8s",
      "helm",
      "containers",
      "devops"
    ],
    "packages": []
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/k8s",
      "title": "Every container declares resource requests and limits",
      "summary": "Requests reflect steady-state usage so the scheduler can place the pod, memory limit equals request, and CPU limits are used deliberately.",
      "body": "Requests are what the scheduler reserves; limits are what the kernel enforces. A container with neither is scheduled blind and evicted first when the node is under pressure.\n\n- Set a CPU and memory request on every container, including init and sidecar containers, based on observed steady-state usage rather than a guess.\n- Set the memory limit equal to the request for anything you care about. Memory is not compressible: exceeding the limit is an OOM kill, and a request far below the limit means the pod is in the Burstable class and gets evicted early.\n- Be deliberate with CPU limits. A limit throttles the container at the boundary, which shows up as latency spikes rather than load. For latency-sensitive services, prefer a solid request and a generous or absent limit.\n- Give a namespace a ResourceQuota and LimitRange so a missing request is caught by the cluster, not discovered during an incident.\n- Revisit the numbers with real data (a vertical autoscaler in recommend mode, or your metrics) instead of copying them between services.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/k8s",
      "title": "Use all three probes, each for its own job",
      "summary": "Startup probes cover slow boots, readiness gates traffic, liveness restarts a wedged process, and readiness never checks a dependency you do not control.",
      "body": "The three probes answer three different questions, and copying one endpoint into all three slots produces restart loops during deploys.\n\n- `startupProbe` covers initialisation: while it is failing, liveness and readiness are suspended, so a slow-booting app is not killed before it is up. Give it a generous `failureThreshold`.\n- `readinessProbe` decides whether the pod receives traffic. It should check that this process can serve a request right now (caches warm, migrations applied, worker pool started).\n- `livenessProbe` decides whether to restart the process. It must only fail when a restart genuinely fixes things: a deadlock, an unrecoverable state. A liveness probe that checks the database restarts every pod during a database blip and turns a partial outage into a total one.\n- Keep probe endpoints cheap, dependency-light, and unauthenticated within the cluster. No probe should run a query per call.\n- Tune `periodSeconds`, `timeoutSeconds`, and thresholds so a transient hiccup does not remove capacity, and make readiness fail fast so shutdown drains quickly.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/k8s",
      "title": "Survive disruption: budgets, spread, and graceful shutdown",
      "summary": "More than one replica, a PodDisruptionBudget that a drain can still satisfy, spread across nodes and zones, and a preStop hook that drains connections.",
      "body": "Nodes are drained for upgrades constantly. A workload that cannot tolerate that is a workload that has an outage on every cluster maintenance window.\n\n- Run at least two replicas for anything serving traffic, and set a `PodDisruptionBudget` (`minAvailable` or `maxUnavailable`) that keeps enough capacity while still allowing a drain to make progress. A budget that blocks every eviction is worse than none: it stalls upgrades.\n- Spread replicas with `topologySpreadConstraints` across nodes and, where available, zones, so one node or zone loss is not the whole service.\n- Set `rollingUpdate` `maxUnavailable` and `maxSurge` intentionally, together with the readiness probe, so a bad rollout stops before it replaces every pod.\n- Handle SIGTERM: fail readiness immediately, finish in-flight requests, then exit. Add a short `preStop` sleep so the endpoints controller removes the pod from the load balancer before the process stops accepting connections, and set `terminationGracePeriodSeconds` longer than your slowest request.\n- For batch and queue workers, make shutdown mean \"stop taking new work and finish the current item\", and make the work idempotent so a kill mid-item is safe.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/k8s",
      "title": "Harden the pod: non-root, read-only, no capabilities, pinned image",
      "summary": "Containers run as a non-root user with a read-only root filesystem and dropped capabilities, and images are pinned to an immutable tag or digest.",
      "body": "A container defaults to more privilege than it needs, and a mutable tag means you cannot say what is running.\n\n- Set `securityContext` with `runAsNonRoot: true`, an explicit `runAsUser`/`runAsGroup`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, and `capabilities.drop: [\"ALL\"]`. Mount an `emptyDir` for the paths that genuinely need to be writable.\n- Never `privileged: true`, never host network, PID, or IPC namespaces, and no host path mounts outside a deliberate, reviewed infrastructure workload.\n- Pin images to an immutable tag or a digest and set `imagePullPolicy: IfNotPresent` with that pin. `:latest` makes rollbacks meaningless and two replicas can silently run different code.\n- Give each workload its own ServiceAccount with only the RBAC it needs, and disable the token mount (`automountServiceAccountToken: false`) when the pod does not call the API server.\n- Restrict traffic with NetworkPolicies: default deny in the namespace, then allow the specific flows. Enforce the whole set with Pod Security Admission or a policy engine so the next manifest cannot skip it.\n\nSee the docker-containers pattern for how the image itself is built, and supply-chain-security for provenance.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/charts",
      "title": "Keep charts declarative, versioned, and free of secrets",
      "summary": "Values carry configuration with sane defaults, secrets come from a secret manager, chart versions bump on every change, and upgrades are atomic.",
      "body": "A Helm chart is the deployable contract for a service. Treated casually, it becomes a template nobody can render safely.\n\n- No secret values in `values.yaml` or in a committed values file. Reference an existing Secret, or generate it from a secret manager (External Secrets, Secrets Store CSI, sealed secrets). Charts are shared and end up in artifact registries.\n- Give every value a documented default that produces a working, safe deployment, and validate inputs with `values.schema.json` so a typo fails at install rather than at runtime.\n- Bump the chart `version` on every change and set `appVersion` to the image tag. An unversioned chart makes rollback a guess.\n- Deploy with `helm upgrade --install --atomic --timeout`, so a failed rollout rolls back instead of leaving half the replicas on new code. Run `helm template` and a policy check (kubeconform, conftest, or your admission policies) in CI.\n- Do not hand-edit live resources: `kubectl edit` on a chart-managed object is drift that the next upgrade will either revert or fight. Change the chart.\n- Add a checksum annotation on the pod template for mounted ConfigMaps and Secrets so a config change actually triggers a rollout.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/k8s",
      "title": "Configuration, secrets, and how a change reaches a pod",
      "summary": "ConfigMaps and Secrets are versioned inputs; mounted files update in place, environment variables do not, and neither restarts a pod on its own.",
      "body": "Config delivery in Kubernetes is subtle in exactly one way: what happens to a running pod when the config changes.\n\n- A Secret or ConfigMap consumed as environment variables is read once at start. Changing it does nothing until the pod restarts, so a rollout must be triggered (the standard trick is a checksum annotation on the pod template).\n- The same object mounted as a volume is updated in place after a short delay, which only helps if the application re-reads the file. Decide which behaviour you want and implement it deliberately.\n- Keep secret material out of the manifest tree. Pull it from a manager at deploy time or sync it into the cluster, and let RBAC decide who can read the Secret object.\n- Separate genuinely environment-specific values (replicas, hostnames, resource sizes) from application configuration, so promoting a release does not require editing application settings.\n- Keep the whole desired state in git and let a controller reconcile it (GitOps) rather than applying from a laptop, so the cluster and the repo cannot disagree silently.\n\nSee /charts for the chart rules and the secrets-env-management pattern for storage and rotation."
    },
    {
      "kind": "memory",
      "nodePath": "/k8s",
      "title": "Scaling: autoscalers only work with honest requests",
      "summary": "The horizontal autoscaler scales on a signal you choose, requests decide scheduling, and the cluster autoscaler can only help if pods are schedulable.",
      "body": "Autoscaling failures are almost always upstream of the autoscaler.\n\n- Scale on the metric that reflects saturation for the workload: CPU for compute-bound services, queue depth or requests per second for I/O-bound ones (through custom or external metrics). CPU utilisation is measured against the request, so a wrong request makes the target meaningless.\n- Set `minReplicas` above one for availability, a `maxReplicas` you can actually afford, and stabilisation windows so the autoscaler does not oscillate. Scale up fast, scale down slowly.\n- The cluster autoscaler adds nodes when pods are pending. Pods pend because of requests, affinity, or topology constraints, so overly strict constraints look like an autoscaler that does not work.\n- Do not run a horizontal and a vertical autoscaler on the same resource metric; they fight. Use vertical recommendations to set requests, then scale horizontally.\n- For bursty batch work, prefer a queue plus workers that scale on depth over a fixed deployment sized for the peak, and use priority classes so batch work yields to interactive traffic.\n\nSee /k8s for the requests rule that all of this depends on."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "k8s-production-readiness",
      "summary": "Gate a workload before its first production deploy or before a manifest change ships.",
      "body": "---\nname: k8s-production-readiness\ndescription: Production readiness gate for a Kubernetes workload: resources, probes, disruption tolerance, security context, config delivery, and observability. Run before the first production deploy and before merging manifest or chart changes.\n---\n\n# Kubernetes production readiness\n\n## Scheduling\n- [ ] CPU and memory requests set on every container, from observed usage.\n- [ ] Memory limit equals request; CPU limit chosen deliberately.\n- [ ] Namespace has a ResourceQuota and LimitRange.\n\n## Health\n- [ ] Startup, readiness, and liveness probes are distinct and cheap.\n- [ ] Liveness does not check external dependencies.\n- [ ] Readiness fails immediately on SIGTERM.\n\n## Disruption\n- [ ] At least two replicas for serving workloads.\n- [ ] PodDisruptionBudget allows a drain to complete while keeping capacity.\n- [ ] `topologySpreadConstraints` spread replicas across nodes and zones.\n- [ ] `preStop` and `terminationGracePeriodSeconds` drain in-flight requests.\n\n## Security\n- [ ] `runAsNonRoot`, explicit user, `readOnlyRootFilesystem`, `capabilities.drop: [ALL]`, no privilege escalation.\n- [ ] No privileged mode, host namespaces, or host path mounts.\n- [ ] Image pinned to an immutable tag or digest.\n- [ ] Dedicated ServiceAccount, minimal RBAC, token mount off if unused.\n- [ ] NetworkPolicy default-deny plus explicit allows.\n\n## Configuration\n- [ ] No secrets in chart values or committed files.\n- [ ] Config change triggers a rollout (checksum annotation) or is re-read at runtime.\n- [ ] Chart version bumped; `helm upgrade --atomic` used.\n\n## Operations\n- [ ] Logs go to stdout as structured lines.\n- [ ] Metrics and traces are exported, and dashboards and alerts exist.\n- [ ] A rollback command is written down and has been tested once.\n",
      "skillTags": [
        "kubernetes",
        "helm",
        "production-readiness",
        "devops",
        "reliability"
      ]
    }
  ]
};
