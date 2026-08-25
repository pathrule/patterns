import type { Pattern } from "../types.js";

export const awsEcsFargate: Pattern = {
  "slug": "aws-ecs-fargate",
  "version": "1.0.0",
  "name": "AWS ECS and Fargate",
  "tagline": "Operate ECS services with bounded tasks, IAM roles, networking, health, deployment, and Fargate capacity.",
  "description": "ECS and Fargate remove host management but retain task definition, network, IAM, load-balancer, health, shutdown, secret, image, autoscaling, and deployment-overlap decisions that determine whether a service is safe and recoverable. This pattern constrains task identity and graceful lifecycle while recording task-definition, network, capacity, and rollout ownership decisions and providing a deployment verification workflow. It differs from Kubernetes and Lambda by focusing on ECS services, task definitions, awsvpc networking, task and execution roles, load-balancer draining, and Fargate resource shapes.",
  "category": "Infra",
  "icon": "ship",
  "color": "bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "AWS ECS Fargate pattern for AI coding agents",
  "metaDescription": "AWS ECS and Fargate task definitions, IAM roles, networking, health checks, graceful shutdown, autoscaling, secrets, and deployment verification.",
  "problem": "AI agents often grant the execution role application permissions, expose tasks publicly without need, use one health check for startup and readiness, or ignore old-new task overlap during deploy.",
  "audience": "Platform teams operating container services and jobs on Amazon ECS with Fargate or mixed capacity",
  "prevents": [
    "Giving application code infrastructure deployment credentials",
    "Running private service tasks with public network exposure",
    "Killing requests before load-balancer draining completes",
    "Exhausting databases when autoscaling tasks multiply pools"
  ],
  "appliesTo": {
    "paths": [
      "/infra/ecs",
      "/deploy",
      "/ops/runbooks"
    ],
    "stacks": [
      "aws",
      "ecs",
      "fargate",
      "containers",
      "cloud"
    ],
    "packages": [
      "@aws-sdk/client-ecs"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra/ecs",
      "title": "Separate execution and task IAM roles",
      "summary": "Give ECS infrastructure pull and logging access through the execution role, and grant application permissions only to the task role.",
      "body": "The agent that starts a task needs registry, secret injection, and logging permissions, while application code needs domain-specific AWS access. Combining them exposes infrastructure capabilities inside the container.\n\n- Keep the execution role limited to the actions ECS needs to start and report the task.\n- Attach least-privilege application permissions to the task role and scope resources, actions, conditions, and account boundaries.\n- Do not place long-lived AWS access keys in environment variables or images; use the task-role credential path.\n- Test denied actions from inside the running task and review role use through audit logs before expanding policy.\n\nSee /deploy for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/deploy",
      "title": "Drain traffic and work before task termination",
      "summary": "Coordinate load-balancer deregistration, readiness, container stop signal, application shutdown, and stop timeout.",
      "body": "During service replacement, old tasks can receive traffic until targets drain. If the container exits immediately on termination, active requests or consumers fail even though the deployment controller is operating normally.\n\n- Make readiness fail before or as shutdown begins so new requests stop reaching the task.\n- Handle the container stop signal in the application, stop intake, drain active requests or jobs, and close dependencies in order.\n- Set target deregistration and task stop timeouts from measured maximum ordinary work, with a bounded forced path for stuck operations.\n- Test rolling deployment with slow requests, keep-alive connections, queue work, and dependency closure while old and new tasks overlap.\n\nSee /ops/runbooks for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/infra/ecs",
      "title": "A task definition revision is an immutable release input",
      "summary": "Version image digest, resources, ports, health, environment, secrets, logging, roles, and platform settings together.",
      "body": "A mutable image tag or console-edited task definition makes two tasks in the same service appear equivalent while running different bytes or configuration.\n\n- Reference an immutable image digest or release identity and retain the source revision and build provenance.\n- Declare CPU, memory, architecture, ephemeral storage, ports, health checks, logging, roles, environment, and secret references in versioned infrastructure.\n- Register a new revision for every meaningful change and deploy it through the same review and rollback path.\n- Compare the running task definition and image digest with the intended release after deployment instead of trusting service update success alone.\n\nSee /deploy for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/infra/ecs",
      "title": "Task networking follows least exposure",
      "summary": "Place tasks in private network paths unless they must accept direct public traffic, and constrain security groups by service relationship.",
      "body": "With task-level networking, every task receives an interface and security boundary. Public addressing or broad security-group rules multiply exposure as the service scales.\n\n- Use private subnets and controlled egress for tasks behind a public or internal load balancer unless direct public addressing is a product requirement.\n- Allow inbound from the exact load-balancer or caller security group and service port, not broad network ranges.\n- Constrain outbound access to required destinations where architecture supports it and provide private endpoints for AWS services with heavy or sensitive traffic.\n- Account for one interface and IP per task in subnet capacity and deployment overlap before autoscaling into address exhaustion.\n\nSee /ops/runbooks for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/infra/ecs",
      "title": "Autoscaling is bounded by downstream capacity",
      "summary": "Scale from demand signals that reflect work while capping task concurrency against database, queue, API, subnet, and account limits.",
      "body": "Adding tasks multiplies connection pools and outgoing calls. CPU can fall while a shared database or remote API becomes the real bottleneck, causing retries and further scale-out.\n\n- Choose service metrics tied to request, queue, or latency demand and validate their behavior during dependency slowdown.\n- Multiply per-task database pools and client concurrency by maximum tasks and rolling-deployment overlap.\n- Set minimum, maximum, cooldown, and deployment percentages with subnet IP, load-balancer, quota, and cost capacity in mind.\n- Use backpressure and admission limits inside tasks so autoscaling is not the only defense against sudden load or a failing dependency.\n\nSee /infra/ecs for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-ecs-service-deployment",
      "summary": "Validate an ECS task revision through identity, network, health, drain, capacity, rollback, and runtime evidence.",
      "body": "---\nname: verify-ecs-service-deployment\ndescription: Deploy or revise an ECS or Fargate service safely.\n---\n\n# Verify Ecs Service Deployment\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Resolve the task definition, immutable image, platform, roles, secrets, logging, CPU, memory, ports, health, and network settings from the reviewed release.\n2. Launch a small deployment and verify task placement, image identity, application readiness, target registration, denied IAM actions, and required egress.\n3. Exercise slow and failing requests, dependency loss, task stop, container crash, health failure, and log delivery while old and new tasks overlap.\n4. Watch deployment progress, target health, restarts, latency, errors, saturation, connection pools, subnet capacity, and downstream limits.\n5. Rollback to the prior task revision on acceptance failure and confirm old tasks become healthy before stopping investigation safeguards.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "aws",
        "ecs",
        "fargate",
        "deployment",
        "verification"
      ]
    }
  ]
};
