# Redis
- Stored in RAM
- If system goes down and comes back snapshot is restored
- Faster than Disk
- Can have multiple shards
- Supports TTL (expiration) for automatic key eviction.

- Atomic even if multi shards for one key

### Redis `SETNX` Atomicity

- `SETNX lock:123 processing` is **always atomic** because the key belongs to exactly **one Redis primary** (even in a Redis Cluster).
- Redis executes commands sequentially on the primary, so only one client can successfully set the key.
- **Single-key commands** (`SETNX`, `INCR`, `HSET`) are atomic.
- **Multi-key operations** across different shards (e.g., `SETNX lock:A` + `SETNX lock:B`) are **not globally atomic**.

### Multi Shard
Node.js Service
      |
      v
Hash the key
      |
      v
Find the Redis shard/node
      |
      v
Send command to that node
      |
      v
That Redis node executes commands one at a time


### Lua Script

const Redis = require("ioredis");
const redis = new Redis();

const script = `
local count = redis.call("ZCARD", KEYS[1])

if count < tonumber(ARGV[1]) then
    redis.call("ZADD", KEYS[1], ARGV[2], ARGV[3])
    redis.call("EXPIRE", KEYS[1], ARGV[4])
    return 1
end

return 0
`;

const allowed = await redis.eval(
    script,
    1,                  // number of keys
    "rate:user123",     // KEYS[1]
    100,                // ARGV[1] limit
    Date.now(),         // ARGV[2] score
    crypto.randomUUID(),// ARGV[3] member
    60                  // ARGV[4] expiry seconds
);

console.log(allowed); // 1 = allowed, 0 = blocked