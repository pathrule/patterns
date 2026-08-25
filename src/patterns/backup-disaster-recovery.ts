import type { Pattern } from "../types.js";

export const backupDisasterRecovery: Pattern = {
  "slug": "backup-disaster-recovery",
  "version": "1.0.0",
  "name": "Backup and Disaster Recovery",
  "tagline": "Define recovery objectives, isolate backups, prove restores, and rehearse service recovery under pressure.",
  "description": "Backup and disaster recovery are proven by restoring a usable service within agreed data-loss and downtime objectives, not by a dashboard showing successful copy jobs. This bundle defines RPO and RTO, immutable isolation, encryption and access, dependency-complete recovery, validation, failover, and game-day procedures. Unlike Postgres Schema, it owns recoverability across the whole workload rather than database structure.",
  "category": "Infra",
  "icon": "archive-restore",
  "color": "bg-red-500/10 text-red-600 dark:bg-red-400/15 dark:text-red-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Backup disaster recovery for AI coding agents",
  "metaDescription": "Business-defined RPO and RTO, isolated immutable backups, restore validation, dependency-complete runbooks, failover drills, and recovery evidence.",
  "problem": "Agents configure backup schedules but never prove that data, keys, configuration, dependencies, and operator access can restore a functioning service on time.",
  "audience": "Teams responsible for production data durability, continuity, and disaster recovery",
  "prevents": [
    "Successful backup jobs that produce unusable restores",
    "Attackers or operators deleting primary data and its backups together",
    "Recovery plans missing keys, identities, configuration, or external dependencies"
  ],
  "appliesTo": {
    "paths": [
      "/infra/backups",
      "/runbooks",
      "/scripts"
    ],
    "stacks": [
      "backup",
      "disaster-recovery",
      "rpo",
      "rto"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/infra/backups",
      "title": "Set backup policy from workload RPO and retention",
      "summary": "Backup frequency, retention, immutability, replication, and validation derive from business-approved data-loss and evidence needs.",
      "body": "Backup frequency, retention, immutability, replication, and validation derive from business-approved data-loss and evidence needs. A daily schedule chosen by convention can violate the workload's recovery point objective or retain sensitive data longer than policy allows. Enforce this boundary in /infra/backups so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Inventory authoritative stores, object data, queues where replay is impossible, configuration, keys, and control-plane state required for recovery.\n- Set recovery point objective, retention tiers, legal holds, deletion behavior, and regional isolation per data class.\n- Monitor successful capture, age of the latest restorable point, replication lag, retention enforcement, and validation outcomes.\n- Keep replication distinct from backup because corruption or deletion can replicate immediately.\n\nVerification: Measure the actual newest recoverable point for each data class after delayed jobs, corruption, deletion, and regional isolation scenarios; compare it with the approved RPO.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/infra/backups",
      "title": "Isolate backup authority from production compromise",
      "summary": "Backup copies, deletion controls, encryption keys, and restore roles use separate trust boundaries and tightly audited access.",
      "body": "Backup copies, deletion controls, encryption keys, and restore roles use separate trust boundaries and tightly audited access. An administrator, ransomware event, or compromised production role can erase recovery if it controls both the primary system and every backup copy. Enforce this boundary in /infra/backups so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Use separate accounts, projects, vaults, or equivalent boundaries for protected copies and restrict production roles to creating backups without deleting them.\n- Enable immutable or locked retention where supported and protect policy changes with independent approval.\n- Separate backup encryption and recovery key access from routine workload credentials while preserving an emergency access path.\n- Alert on deletion attempts, retention changes, disabled jobs, unusual restores, and changes to recovery identities.\n\nVerification: Compromise a test production administrator and attempt to list, decrypt, shorten retention, overwrite, and delete protected copies; confirm independent controls and alerts hold.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/runbooks",
      "title": "A recovery is complete only after service validation",
      "summary": "Restore procedures rebuild dependencies, apply deletion state, verify integrity, and prove user-facing behavior before traffic returns.",
      "body": "Restore procedures rebuild dependencies, apply deletion state, verify integrity, and prove user-facing behavior before traffic returns. A database that starts is not a recovered product when objects, keys, identity, DNS, configuration, queues, or downstream reconciliation are missing. Enforce this boundary in /runbooks so invalid work stops before it reaches another subsystem or creates an externally visible side effect.\n\n- Define dependency order and the source of truth for infrastructure, configuration, secrets, certificates, data, indexes, caches, queues, and integrations.\n- Restore into an isolated environment, apply migrations and deletion tombstones, then run integrity and application-level acceptance checks.\n- Reconcile asynchronous work and external systems before enabling writes or sending delayed notifications.\n- Measure from declared disaster to validated service and record data loss against RTO and RPO, including manual waits.\n\nVerification: Run the documented procedure with primary systems unavailable and no unstated operator access; verify representative reads, writes, identities, objects, jobs, and external effects.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/runbooks",
      "title": "RPO and RTO describe business loss, not product features",
      "summary": "Storage durability, snapshot frequency, and failover mode are implementation choices, while acceptable data loss and downtime come from product and operational impact.",
      "body": "Storage durability, snapshot frequency, and failover mode are implementation choices, while acceptable data loss and downtime come from product and operational impact. Record objectives per workload and critical journey, including the point from which time starts and the evidence that ends recovery.\n\nInclude detection, decision, access, infrastructure provisioning, data transfer, validation, DNS or traffic change, and backlog processing in RTO measurement. Resolve conflicts between cost and objective explicitly with the business owner. Review objectives when data volume, dependency graph, regions, or customer commitments change. Keep the decision explicit at /runbooks; moving it into an incidental caller makes behavior depend on which route happened to execute first.\n\nSee /infra/backups for protection policy and the disaster recovery drill for measured evidence. That related boundary consumes this decision and carries the evidence that proves it still holds."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-backup-restore",
      "summary": "Restore a representative backup into isolation and verify data integrity, security, application behavior, and recovery timing.",
      "body": "---\nname: test-backup-restore\ndescription: Restore a representative backup into isolation and verify data integrity, security, application behavior, and recovery timing.\n---\n\n# Test Backup Restore\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Select a recovery point without advance notice, record its age, and provision an isolated target using the documented recovery identities and infrastructure path.\n2. Restore every registered data class, configuration, key, object, and index dependency, then apply migrations, retention state, and deletion tombstones.\n3. Run integrity checks plus representative authenticated reads, writes, searches, jobs, exports, and cross-store reconciliation without contacting production users.\n4. Measure achieved data loss and elapsed recovery, destroy the isolated environment safely, and create owned fixes for every manual step or failed objective.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "backup",
        "restore",
        "disaster-recovery",
        "testing"
      ]
    },
    {
      "kind": "skill",
      "nodePath": "/runbooks",
      "title": "run-disaster-recovery-game-day",
      "summary": "Run a controlled disaster scenario through declaration, failover or restore, validation, communication, and return to normal.",
      "body": "---\nname: run-disaster-recovery-game-day\ndescription: Run a controlled disaster scenario through declaration, failover or restore, validation, communication, and return to normal.\n---\n\n# Run Disaster Recovery Game Day\n\nRun this procedure whenever the governed surface changes or its operational evidence becomes stale.\n\n1. Choose a credible failure, safety boundaries, observers, abort conditions, target RPO and RTO, and systems that must remain untouched.\n2. Declare the event without handing responders hidden implementation answers, then follow the real command, access, communication, and recovery runbooks.\n3. Measure detection, decision, provisioning, data recovery, validation, traffic shift, backlog, and customer communication while recording workarounds and unsafe assumptions.\n4. Return to normal safely, reconcile data and external effects, publish a blameless exercise report, and track measurable fixes through the next drill.\n\nRecord the decision, failed checks, and follow-up owner with the change. A successful run leaves reproducible evidence that another reviewer can inspect without repeating the investigation from memory.",
      "skillTags": [
        "disaster-recovery",
        "game-day",
        "operations",
        "resilience"
      ]
    }
  ]
};
