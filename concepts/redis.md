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