# DB Replication
https://www.techinterview.org/post/3233474156/system-design-database-replication-primary-replica-synchronous-asynchronous-multi-master-read-replicas-replication-lag/

- Primary-Replica: primary takes all writes, replicas apply the log and serve reads -> scales reads (2 replicas = ~3x read capacity), writes still bottlenecked on primary.

## Sync vs Async
- Async - primary commits + responds immediately, replica catches up after. Low latency, but risk of data loss if primary dies before replica gets the write. Lag: 10-100ms normal, can hit minutes under high throughput.
- Sync - primary waits for replica ack before responding. Zero data loss on failover, but write latency +network RTT (0.5-1ms same DC, 50-200ms cross-region). Blocks primary if the sync replica goes down.
- Semi-sync - waits for just 1 replica ack, not all - durability without full availability risk.

## Replication lag problems
- Read-your-own-writes violation - user doesn't see their own recent write
- Monotonic read violation - refresh shows older data (hit a different, more-lagged replica)
- Stale analytics/search index
- Fix: route a user's own reads to primary right after their write, or pin their session to one replica.

## Multi-master
- Writes accepted on any node (any region) -> main problem is write conflicts. Resolved via last-writer-wins (simplest, lossy), app-level resolution, or CRDTs. Used by Galera, CockroachDB, Cassandra.

### Handling Idempotency
- Acquire Distributed Lock on the key | consensus - common guy handling
- Single Owner - Hash the key - always sends to 1 owner | Consistent Hashing
- Global Unique Constraint | consensus - common guy handling

## Picking one
- Read-heavy, moderate writes -> async primary-replica, 2-3 replicas
- Single-region HA -> semi-sync + auto failover(if primary fails, replica is promoted as primary) + DNS Update
- Multi-region HA -> async cross-region replica, promote on failure
- Active-active writes -> multi-master (accept conflict-resolution complexity)
