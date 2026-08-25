import type { Pattern } from "../types.js";

export const linuxSystemdServices: Pattern = {
  "slug": "linux-systemd-services",
  "version": "1.0.0",
  "name": "Linux Services with systemd",
  "tagline": "Run Linux services with explicit users, dependencies, restart policy, signals, logs, limits, and hardening.",
  "description": "A long-running process needs an operating-system contract for identity, environment, startup ordering, readiness, shutdown, restart, resource limits, filesystem access, logging, and recovery after host reboot. This pattern constrains service identity, restart behavior, and secret loading; it records dependency and logging ownership and provides a unit verification and rollout procedure. It differs from Docker by focusing on host-native process supervision and cgroup policy rather than image construction and container orchestration.",
  "category": "Infra",
  "icon": "power",
  "color": "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "systemd Linux service pattern for AI agents",
  "metaDescription": "systemd service users, dependencies, restart policy, signals, environment, journald logs, cgroup limits, hardening, verification, and rollout. In production.",
  "problem": "AI agents often daemonize under systemd, run as root, depend on network-online as a substitute for retry logic, or create restart loops that hide permanent configuration failure.",
  "audience": "Infrastructure teams operating host-native application processes, workers, gateways, or internal agents",
  "prevents": [
    "Granting a service unnecessary root and filesystem access",
    "Forking away from the supervisor and losing process identity",
    "Restarting a permanently invalid configuration forever",
    "Killing work without honoring the application's shutdown contract"
  ],
  "appliesTo": {
    "paths": [
      "/deploy/systemd",
      "/ops/runbooks",
      "/src"
    ],
    "stacks": [
      "systemd",
      "linux",
      "services",
      "operations",
      "cgroups"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/deploy/systemd",
      "title": "Run one foreground process under a dedicated identity",
      "summary": "Let systemd own process lifecycle and grant the service only the user, groups, paths, capabilities, and devices it needs.",
      "body": "A supervised service should not fork into the background or write a PID file unless its protocol requires that legacy model. Running as root turns any application defect into host-wide authority.\n\n- Start the application in foreground mode and choose the service type that matches its actual readiness and notification behavior.\n- Create a dedicated non-login user and group and grant ownership only to required state, cache, log, socket, and configuration paths.\n- Use filesystem, capability, syscall, namespace, and device hardening from measured needs, then verify startup and runtime under the restrictions.\n- Set an explicit working directory and executable path; do not depend on an interactive shell profile or caller's current directory.\n\nSee /src for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy/systemd",
      "title": "Make restart policy classify failure",
      "summary": "Restart transient crashes with bounded delay while allowing invalid configuration and deliberate stops to remain visible.",
      "body": "An unconditional rapid restart can consume CPU, flood logs, and hide a permanent error behind an apparently active unit. The policy should distinguish recoverable process loss from operator action and bad configuration.\n\n- Choose restart conditions that match the application and exclude clean deliberate shutdown and known permanent configuration exits.\n- Add a delay and start-rate limit so repeated failure enters a visible failed state instead of a hot loop.\n- Validate configuration in a pre-start step or separate command and fail before replacing the healthy process where deployment permits it.\n- Alert on restart count, failed state, and time since last successful readiness rather than treating process presence as service health.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy/systemd",
      "title": "Load secrets without exposing them in unit text or process arguments",
      "summary": "Reference protected credential or environment sources and keep secret values out of repositories, status output, and command lines.",
      "body": "Unit files are commonly readable and process arguments are observable. Embedding credentials directly in ExecStart or committed environment directives broadens access and leaks them into diagnostics.\n\n- Use the platform's credential mechanism or a root-managed protected file with narrow service access for secret material.\n- Pass secret file descriptors or paths where supported instead of values in command-line flags.\n- Keep non-secret configuration separate from credentials so ordinary unit review and version control remain safe.\n- Rotate credentials through a staged reload or restart procedure and verify old material is no longer readable by the service.\n\nSee /src for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/deploy/systemd",
      "title": "Startup ordering is not dependency readiness",
      "summary": "Use unit relationships for lifecycle ordering and make the application retry or fail clearly when remote dependencies are not ready.",
      "body": "After and Wants describe unit activation relationships, while network or another service being started does not prove its DNS, port, schema, leader, or data is ready for this application.\n\n- Declare hard local dependencies only when the service cannot operate at all without their unit lifecycle.\n- Let the application use bounded retry and backoff for remote services and expose a readiness signal that reflects its own usable state.\n- Avoid using a broad network-online target as a substitute for robust reconnect behavior; networks can disappear after startup too.\n- Design service startup to tolerate host reboot ordering and dependency restarts without requiring manual unit sequencing.\n\nSee /src for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/runbooks",
      "title": "journald is the structured service event stream",
      "summary": "Write process logs to standard streams with stable fields and let the supervisor attach unit, process, boot, and host identity.",
      "body": "Writing ad hoc log files from the service duplicates rotation and permission concerns and loses supervisor metadata. Standard streams keep lifecycle and application evidence queryable together.\n\n- Emit one structured event per line with level, event name, correlation identity, and bounded fields while excluding secrets and unnecessary personal data.\n- Use journald fields and unit filters to separate services, boots, priorities, and time windows during diagnosis.\n- Set retention and forwarding from host capacity and compliance requirements instead of relying on unlimited local disk.\n- Keep start, readiness, signal, shutdown, dependency, and fatal configuration events explicit so service lifecycle is reconstructable.\n\nSee /deploy/systemd for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-systemd-service",
      "summary": "Validate unit syntax, permissions, hardening, startup, failure, restart, shutdown, logging, and reboot behavior.",
      "body": "---\nname: verify-systemd-service\ndescription: Verify a new or changed systemd unit before broad host rollout.\n---\n\n# Verify Systemd Service\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Render and verify the unit and drop-ins, inspect dependency relationships and effective properties, and confirm referenced files and users exist.\n2. Start under the dedicated identity with hardening enabled and exercise required filesystem, network, socket, device, and capability operations.\n3. Send the configured stop signal during active work and prove readiness drops, intake stops, work drains, and the timeout produces an observable forced path.\n4. Trigger clean exit, crash, invalid configuration, missing dependency, secret denial, and rate-limited restart and verify each final state.\n5. Reboot a representative host and confirm ordering, recovery, logs, resource limits, health signals, and rollback to the prior unit or binary.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "systemd",
        "linux",
        "service",
        "operations",
        "verification"
      ]
    }
  ]
};
