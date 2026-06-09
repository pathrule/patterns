import type { Pattern } from "../types.js";

export const redisCaching: Pattern = {
  "slug": "redis-caching",
  "version": "1.0.0",
  "name": "Redis Caching",
  "tagline": "Cache with Redis so reads get faster without serving stale or inconsistent data.",
  "description": "A practical baseline for caching with Redis. The hard part of caching is never the read path; it is expiry, invalidation, and what happens under concurrency and partial failure. This pattern uses the cache-aside read path, gives every key a TTL, prevents the cache stampede that turns an expiry into a database outage, and picks an invalidation strategy that matches how fresh the data must be. It also says plainly what not to cache.",
  "category": "Backend",
  "icon": "database",
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
  "metaTitle": "Redis Caching pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for Redis caching: cache-aside reads, TTL on every key, stampede prevention, invalidation strategies, and what not to cache, tuned for AI coding agents.",
  "problem": "AI agents add a cache with no TTL, no stampede protection, and no invalidation plan, so reads get fast but data goes stale and an expiry wave can take the database down.",
  "audience": "Backend teams adding a Redis cache in front of a database or expensive computation",
  "prevents": [
    "Caching values forever with no TTL so data goes silently stale",
    "Letting a popular key expire and stampede every request onto the database",
    "Having no invalidation plan, so a write leaves the cache wrong",
    "Caching sensitive or fast-changing data that should never be cached"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/src/cache"
    ],
    "stacks": [
      "redis",
      "node",
      "backend"
    ],
    "packages": [
      "redis",
      "ioredis"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/cache",
      "title": "Give every cached key a TTL",
      "summary": "Set an expiry on every key you cache; a cache without TTL is a second source of truth that drifts from the database forever.",
      "body": "A key with no expiry never self-heals. If invalidation ever misses it, that value is wrong until something happens to overwrite it, which may be never.\n\n- Set a TTL on every cached value (`SET key val EX seconds`, or `EXPIRE`). The TTL is your safety net: even if explicit invalidation fails, the data is wrong for at most one TTL.\n- Choose the TTL from how stale the data may acceptably be, not a global default. Reference data tolerates minutes or hours; data a user just changed tolerates seconds.\n- Do not treat Redis as durable storage. It is a cache: assume any key can vanish at any time (eviction, restart) and the code must fall back to the source of truth cleanly.\n- Add small random jitter to TTLs of related keys so they do not all expire on the same second and stampede together (see the stampede rule).",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/cache",
      "title": "Prevent cache stampedes on hot keys",
      "summary": "When a hot key expires, stop every request from hitting the database at once; use a lock, early recompute, or staggered TTLs.",
      "body": "When a popular key expires, every concurrent request misses at the same instant and slams the database together. That stampede (also called a thundering herd) is how a cache expiry becomes a database outage.\n\n- Serialize the recompute: on a miss for a hot key, let one request acquire a short lock (`SET key val NX EX`) and rebuild the value while the others briefly wait or serve the previous value. Only one query hits the database.\n- Or recompute early: refresh a key before it expires (probabilistic early expiration / background refresh) so it is rarely cold at request time.\n- Stagger expirations with TTL jitter so a batch of related keys does not expire on the same tick.\n- Guard against cache penetration too: a flood of requests for keys that do not exist bypasses the cache entirely. Cache a short-lived negative result (or use a bloom filter) so missing keys do not hammer the database.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src/cache",
      "title": "Cache-aside is the default read path",
      "summary": "Read from cache, fall back to the database on a miss, then populate the cache; the application owns the cache, and a Redis outage degrades to direct DB reads.",
      "body": "We use the cache-aside (lazy-loading) pattern as the default. The application, not Redis, owns the relationship between cache and database.\n\n- Read path: check Redis; on a hit return it; on a miss read the database, write the value to Redis with a TTL, and return it. Only data that is actually requested gets cached.\n- Because the app controls the fallback, a Redis outage degrades to reading the database directly rather than failing the request. Wrap cache reads so a cache error is logged and falls through, never throws to the user.\n- Cache-aside pairs with cache invalidation on write (see the invalidation memory): the write path updates the database and then invalidates or refreshes the affected keys.\n- Use write-through (write cache and DB together) only when you need the cache always warm and can accept the extra write latency; cache-aside is the simpler, more resilient default.\n\nSee /src/cache for the TTL and stampede rules and the invalidation and key-design memories."
    },
    {
      "kind": "memory",
      "nodePath": "/src/cache",
      "title": "Choose an invalidation strategy by required freshness",
      "summary": "Use TTL-only for data that may lag, event-driven invalidation on writes for accuracy, and tag/group invalidation when one change affects many keys.",
      "body": "Cache invalidation is the hard problem; the trick is to match the strategy to how fresh the data must be rather than reaching for the most complex option everywhere.\n\n- TTL-only: simplest and often enough. Let data refresh on its own schedule when a short lag is acceptable. No write-path coupling.\n- Event-driven (write-path) invalidation: when a record changes, invalidate or update the specific keys derived from it. Use this when staleness is user-visible or incorrect. Invalidate the precise keys, not the whole cache.\n- Tag / group invalidation: when one change should drop many related entries (a product update affecting many cached views), group keys under a tag and invalidate the group, rather than deleting entries one by one or flushing everything.\n- Avoid the over-broad flush: dropping all of a record's cached data because one unrelated field changed wastes the cache. Scope invalidation to what actually changed.\n- Prefer delete-then-recompute over update-in-place for derived values; recomputing from the source on the next read avoids subtle write-order races between cache and database.\n\nSee /src/cache for the cache-aside read path and the TTL rule."
    },
    {
      "kind": "memory",
      "nodePath": "/src/cache",
      "title": "Key design, serialization, and round-trips",
      "summary": "Use namespaced, versioned keys, an explicit serialization format, and pipelining/batching to avoid one-command-at-a-time latency.",
      "body": "The mechanics of how you store and fetch keys decide whether the cache is fast and debuggable or a mystery.\n\n- Namespace keys with a stable convention (`entity:id:field`, e.g. `user:42:profile`) so keys are greppable, scopable for invalidation, and collision-free across features. Include a schema version segment so a shape change can invalidate a whole generation at once.\n- Pick one serialization format (JSON for simplicity and debuggability; a compact binary format when size/latency matters) and apply it consistently. Store the minimal data the read path needs, not whole objects.\n- Avoid sending one command per round-trip in a loop; that latency dominates. Use pipelining or `MGET`/multi-key commands to batch reads and writes into fewer round-trips.\n- Do not use `KEYS` in production to find keys to invalidate; it blocks the server. Track the keys you need to invalidate (via tags/sets) or use `SCAN`.\n- What not to cache: secrets, anything per-request and unique, data with hard real-time accuracy requirements, and values cheaper to recompute than to fetch from Redis.\n\nSee /src/cache for the cache-aside and invalidation memories."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "redis-cache-review",
      "summary": "Checklist before adding or changing a Redis cache: TTL, stampede, invalidation, key design, and resilience.",
      "body": "---\nname: redis-cache-review\ndescription: Review checklist for adding or changing a Redis cache. Run before merging any code that reads from or writes to a cache.\n---\n\n# Redis cache review\n\n- [ ] Every cached key has a TTL chosen from acceptable staleness, with small jitter on related keys.\n- [ ] Read path is cache-aside: miss falls back to the source of truth and repopulates with a TTL.\n- [ ] A Redis error logs and falls through to the database; it never throws to the user.\n- [ ] Hot keys are protected from stampede (lock/single-flight, early recompute, or staggered TTL).\n- [ ] Requests for nonexistent keys cannot bypass the cache and hammer the DB (negative caching / bloom filter).\n- [ ] Writes invalidate or refresh the precise affected keys; strategy (TTL-only / event-driven / tag) matches required freshness.\n- [ ] Keys are namespaced and versioned (`entity:id:field`), with one consistent serialization format and minimal stored data.\n- [ ] Multi-key access uses pipelining / MGET, not one command per round-trip; no `KEYS` in production.\n- [ ] Nothing sensitive, per-request-unique, or hard-real-time is cached; Redis is treated as ephemeral, not durable.\n",
      "skillTags": [
        "redis",
        "caching",
        "performance",
        "invalidation",
        "backend",
        "api-review"
      ]
    }
  ]
};
