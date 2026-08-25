import type { Pattern } from "../types.js";

export const applicationEncryptionKeyManagement: Pattern = {
  "slug": "application-encryption-key-management",
  "version": "1.0.0",
  "name": "Application Encryption and Key Management",
  "tagline": "Design encryption around threat models, authenticated modes, envelope keys, rotation, access, and recovery.",
  "description": "Application encryption fails when teams choose an algorithm without a threat model, reuse nonces, mix key and ciphertext storage, omit integrity, lose encryption context, or rotate keys without a way to read old records and resume interrupted migration. This pattern constrains approved primitives, key separation, context, and error behavior; it records envelope and rotation ownership and supplies a staged key-rotation workflow. It complements secrets management by focusing on data encryption and key hierarchy; secret storage governs access to credentials, while this pattern governs how keys protect persisted or transported application data.",
  "category": "Security",
  "icon": "book-key",
  "color": "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Application encryption pattern for AI agents",
  "metaDescription": "Application encryption threat models, authenticated modes, nonces, envelope keys, context binding, key access, rotation, migration, backup, and recovery.",
  "problem": "AI agents often implement custom crypto, use encryption without authentication, reuse a nonce with the same key, or overwrite the only key before existing ciphertext is migrated.",
  "audience": "Security and backend teams protecting sensitive fields, files, tokens, backups, and tenant data",
  "prevents": [
    "Accepting tampered ciphertext as valid plaintext",
    "Reusing a nonce under the same encryption key",
    "Giving application instances direct master-key material unnecessarily",
    "Making old data unreadable during key rotation"
  ],
  "appliesTo": {
    "paths": [
      "/src/crypto",
      "/src/data",
      "/ops/keys"
    ],
    "stacks": [
      "encryption",
      "key-management",
      "kms",
      "cryptography",
      "security"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/crypto",
      "title": "Use reviewed authenticated-encryption primitives",
      "summary": "Select an approved library and AEAD construction and prohibit custom cipher, padding, tag, and key-derivation designs.",
      "body": "Confidentiality without integrity allows attackers to modify ciphertext and influence decrypted data. Custom composition creates subtle nonce, padding, oracle, and verification failures.\n\n- Use a maintained platform or cryptographic library and an approved authenticated-encryption mode through its high-level API.\n- Generate keys with a cryptographically secure source at the required size and keep encryption, signing, wrapping, and derivation purposes separate.\n- Verify authentication before releasing plaintext or distinguishing detailed failure causes to an untrusted caller.\n- Version the ciphertext envelope with algorithm and key identity so future readers can select the correct reviewed implementation.\n\nSee /ops/keys for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/crypto",
      "title": "Guarantee nonce uniqueness for each key",
      "summary": "Generate or allocate nonces according to the selected construction and never reuse one with the same encryption key.",
      "body": "Nonce reuse can reveal relationships between plaintexts or destroy authentication guarantees even when the key remains secret. A timestamp or per-process counter can collide across restart or scale-out.\n\n- Follow the chosen library's nonce generation or sequencing contract and use a secure random source where that contract expects random uniqueness.\n- Store the nonce with ciphertext; it is normally not secret, but it must match the exact encryption operation.\n- Do not derive nonce solely from time, record count, process ID, or an identifier that can repeat across tenants, retries, restore, or concurrent writers.\n- Treat any suspected reuse under one key as a security incident requiring scope analysis and key replacement, not only regeneration of future nonces.\n\nSee /src/data for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/data",
      "title": "Bind ciphertext to its immutable context",
      "summary": "Authenticate tenant, record, field, schema, and purpose as associated data so encrypted values cannot be moved into another valid location.",
      "body": "Valid ciphertext copied from one row or tenant to another may decrypt successfully unless the encryption operation binds it to the location and purpose the application expects.\n\n- Construct canonical associated data from stable tenant, entity, field, schema, and purpose identifiers that both encryption and decryption can reproduce.\n- Do not include mutable display values or values unavailable during recovery in the binding.\n- Fail closed when context, key identity, tag, or envelope version does not match and preserve only a non-sensitive diagnostic category.\n- Include context migration in schema change plans because renaming or moving an encrypted field can require controlled re-encryption.\n\nSee /src/crypto for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/ops/keys",
      "title": "Keep master keys outside application data and general runtime access",
      "summary": "Use a key-management boundary for wrapping or cryptographic operations and grant applications the narrowest key actions and context.",
      "body": "Storing the master key beside ciphertext defeats separation, while exporting broad key material into every process increases compromise and logging risk.\n\n- Use a managed or protected key service to generate or wrap data keys and restrict access by application identity, environment, tenant or context where supported.\n- Keep plaintext data keys in memory only for the bounded operation and clear references promptly; never log them or write them to temporary files.\n- Separate production, test, backup, and tenant key scopes according to the threat and recovery model.\n- Audit key use, denied operations, policy changes, disablement, deletion scheduling, and unusual decryption patterns without logging protected plaintext.\n\nSee /src/crypto for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/crypto",
      "title": "Envelope encryption creates a rotatable key hierarchy",
      "summary": "Encrypt data with scoped data keys and protect those keys with a versioned wrapping key held by the key-management service.",
      "body": "Encrypting every record directly with one master key couples data operations to the key service and makes key scope and rotation coarse. Envelope encryption separates bulk data encryption from key protection.\n\n- Generate a data key at the appropriate record, file, tenant, batch, or other bounded scope based on blast radius and operational cost.\n- Store ciphertext, nonce, wrapped data key, wrapping-key identity, associated-data schema, and envelope version together.\n- Decrypt by authorizing and unwrapping the data key through the key service, then authenticating ciphertext and context locally.\n- Rotate wrapping keys by rewrapping data keys where policy permits, and rotate data keys by decrypting and re-encrypting the protected data.\n\nSee /ops/keys for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/ops/keys",
      "title": "Key deletion is a data-deletion and recovery decision",
      "summary": "Account for replicas, backups, archives, disaster recovery, legal holds, and rollback before disabling or destroying key material.",
      "body": "Destroying a key can make every protected copy permanently unreadable, including backups needed for incident recovery. Retaining it forever can violate deletion policy.\n\n- Map each key to active ciphertext, replicas, caches, queues, backups, exports, retention, and recovery environments.\n- Use disablement and a review window before irreversible deletion where the key platform supports it.\n- Test disaster recovery with restored ciphertext and the authorized key path before changing retention or rotation policy.\n- Record approvals, owner, scope, date, recovery consequence, and evidence for key disablement and destruction.\n\nSee /src/data for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "rotate-application-encryption-key",
      "summary": "Stage new key identity, write new ciphertext, migrate or rewrap old data, verify, resume, and retire safely.",
      "body": "---\nname: rotate-application-encryption-key\ndescription: Rotate an application encryption, data, wrapping, or key-management key.\n---\n\n# Rotate Application Encryption Key\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Inventory algorithms, key hierarchy, ciphertext envelope versions, contexts, data locations, backups, readers, writers, permissions, and recovery dependencies.\n2. Create the replacement key under approved policy and deploy readers that can decrypt both old and new envelopes before changing writers.\n3. Switch new writes to the replacement identity and migrate old data through idempotent batches with a durable cursor, verification, and bounded load.\n4. Measure remaining old-key ciphertext, decryption failures, context failures, throughput, and backup implications; rehearse interruption and resume.\n5. Disable old use only after active and recoverable copies are accounted for, retain rollback through the approved window, and destroy material only through the irreversible-deletion review.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "encryption",
        "keys",
        "rotation",
        "kms",
        "migration"
      ]
    }
  ]
};
