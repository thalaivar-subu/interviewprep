# Kafka — Production Mental Model

> One rule to carry through the whole doc:
> **Kafka is a durable log, not a queue.** Nothing is popped, nothing is
> deleted on read, nobody is pushed to. Consumers pull and remember a
> number. Almost every "weird Kafka behaviour" falls out of that.

---

## 1. The 60-second model

```
                    TOPIC: order-update-events
        ┌─────────────────────────────────────────────────┐
        │ P0: [0][1][2][3][4][5] ──> append only          │
        │ P1: [0][1][2][3]                                │
        │ P2: [0][1][2][3][4][5][6][7]                    │
        └─────────────────────────────────────────────────┘

  Producer ──send──> Leader replica of P1 ──replicates──> Follower replicas
                                                          (on other brokers)

  Consumer ──poll──> reads from offset N, processes, commits N
                     (message stays in the log either way)
```

| Term | What it actually is |
|---|---|
| **Broker** | One Kafka server process. A cluster is N brokers. |
| **Topic** | A logical name. Purely a container for partitions. |
| **Partition** | The real thing. An append-only log file. **Unit of ordering and unit of parallelism.** |
| **Replica** | A *copy of one partition* living on a different broker. |
| **Leader** | The one replica that serves writes/reads for that partition. |
| **Follower** | The other replicas of the same partition. They only replicate. |
| **ISR** | In-Sync Replicas — the replicas currently caught up with the leader. |
| **Offset** | Position of a record inside **one partition**. Monotonic, per-partition. |
| **Consumer group** | A named set of consumers that split the partitions of a topic between them. |

Metadata/leader election: old Kafka used ZooKeeper, modern Kafka uses **KRaft** (Kafka runs its own Raft quorum). Nothing else in this doc changes.

---

## 2. Partition vs. replica — the confusion worth killing

> *"Producer pushes to leader, leader gives to follower, followers have replicas — is each follower a partition?"*

**No.** A follower is not a partition. A follower is *the same partition, copied*.

```
Topic: orders, partitions=3, replication.factor=3

           Broker-1        Broker-2        Broker-3
 P0        LEADER          follower        follower     <- 3 copies of ONE partition
 P1        follower        LEADER          follower
 P2        follower        follower        LEADER
```

- **partitions = 3** → three *different* logs, three different slices of your data, three parallel lanes.
- **replication.factor = 3** → each of those logs exists on 3 brokers for durability.
- Total partition-replicas on disk = 3 × 3 = 9. Distinct data = 3 partitions.

Two independent knobs, two independent purposes:

| Knob | Buys you | Does NOT buy you |
|---|---|---|
| `partitions` | Throughput, consumer parallelism | Durability |
| `replication.factor` | Durability, HA on broker loss | Throughput |

Leaders are spread across brokers on purpose, so every broker does write work.
By default **all reads and writes go to the leader**; followers are passive
(the one exception is rack-aware "fetch from closest replica", used to cut
cross-AZ cost, not to add throughput).

**So: if Kafka is being bombarded, adding followers does nothing. Add partitions.** (§8)

### Counting replicas correctly (the off-by-one everyone makes)

> **`replication.factor` counts the leader.** RF=3 means 3 copies *total* —
> 1 leader + 2 followers. Not 1 leader + 3 followers.

| RF | Leader | Followers | Copies on disk | Minimum brokers | Survives |
|---|---|---|---|---|---|
| **1** | 1 | **0** | 1 | 1 | nothing — broker dies, partition is gone |
| **2** | 1 | 1 | 2 | 2 | 1 broker loss (but see minISR below) |
| **3** | 1 | **2** | 3 | 3 | 1 broker loss with writes still flowing ✅ |

`RF=0` is not a thing — the minimum is 1, and RF=1 *is* "leader only, no follower".
Also: `RF ≤ number of brokers`. You can't have 3 copies on 2 machines.

### `replication.factor` vs `min.insync.replicas` — different things

This is the pair you merged into one number:

- **`replication.factor`** = static config. *How many copies exist.* Set at topic creation.
- **ISR (in-sync replicas)** = runtime set. *How many copies are currently caught up.* Shrinks and grows on its own as brokers lag or recover (`replica.lag.time.max.ms`, default 30s, decides who falls out).
- **`min.insync.replicas`** = a **write-admission threshold**, not a count of anything that exists. With `acks=all`, if the ISR has fewer members than this, the broker **rejects the write** (`NotEnoughReplicasException`) instead of accepting it with weak durability.

```
RF=3, min.insync.replicas=2

all healthy      ISR = {L, F1, F2}  size 3 >= 2  -> writes accepted
1 broker down    ISR = {L, F1}      size 2 >= 2  -> writes accepted  ✅ this is the point
2 brokers down   ISR = {L}          size 1 <  2  -> writes REJECTED, topic goes read-only
```

That last line is a feature. Kafka refuses to accept data it can't make durable, rather than acking a write that one crash would erase.

**Scoring your three statements:**

| Your statement | Verdict |
|---|---|
| 3 partitions, RF=3/minISR=2 → 3 groups of `[leader + 2 followers]`, one leader per broker | ✅ **Exactly right** |
| 3 partitions, "1" → 3 leaders + 1 follower each | ❌ RF=1 = leader only, **zero** followers. Leader+1 follower is RF=**2** |
| 3 partitions, "0" → 3 leaders, no follower | ❌ RF=0 is invalid. The no-follower case **is** RF=1 |

### What followers actually do while the leader is alive

> *"They just copy, nobody consumes from them, they only matter when the leader dies?"*

**Broadly yes — but they are not idle spectators.** Three things happen continuously:

1. **They fetch.** Each follower runs its own fetch loop against the leader, exactly like a consumer would, and appends to its own copy of the log.
2. **They gate every `acks=all` write.** The producer's ack does not return until the ISR followers have the record. Followers are directly in the write latency path — a slow follower slows your producer.
3. **They set the high watermark.** The HW is the highest offset replicated across *all* ISR members, and **consumers can only read up to the HW**. So followers control what is even visible to consumers. Un-replicated data at the head of the leader's log is invisible by design — that's what stops you reading a record that a failover would erase.

What they do **not** do: serve consumer traffic. All client reads and writes go to the leader. The one exception is **rack-aware follower fetching** (`client.rack` + `RackAwareReplicaSelector`), where a consumer reads from the closest replica — that exists to cut cross-AZ data transfer cost, **not** to add throughput. Adding replicas never adds read capacity.

### Leader election — what happens when a leader dies

Every cluster has one **controller** (a broker elected via the KRaft quorum; ZooKeeper did this in older versions). The controller owns partition metadata and picks leaders.

```
broker-2 dies (holds the leader for P1)
   -> controller notices (session/heartbeat loss)
   -> controller picks a new leader for P1 FROM THE ISR ONLY
   -> new leader announced in cluster metadata
   -> clients get NOT_LEADER_OR_FOLLOWER, refresh metadata, retry against the new leader
   -> total blip: usually sub-second to a few seconds, per partition
```

Things worth knowing:

- **Only ISR members are eligible.** That's the entire durability guarantee — a promoted replica already has every acked record.
- **Preferred leader.** The first broker in a partition's assigned replica list is the "preferred" leader. After a failed broker recovers, `auto.leader.rebalance.enable=true` (default) migrates leadership back so leaders stay evenly spread — otherwise one broker ends up leading everything and becomes a hotspot. You can also trigger it manually (`kafka-leader-election.sh --election-type PREFERRED`).
- **Graceful shutdown ≠ crash.** `controlled.shutdown.enable=true` (default) makes a broker hand off its leaderships *before* exiting, so a planned restart or rolling upgrade costs almost no unavailability. A hard kill skips this and you eat the full election.
- **Unclean leader election** (`unclean.leader.election.enable`, default **false**): if the ISR is empty, do you promote an out-of-sync replica? `false` = the partition stays **offline** until an ISR member returns (choose consistency). `true` = it comes back immediately and **silently loses every record the stale replica never received** (choose availability). Keep it false; flipping it is an explicit, documented, incident-time decision.
- **Producers and consumers self-heal.** Neither is configured with a leader — they fetch metadata, get redirected on `NOT_LEADER_OR_FOLLOWER`, and retry. This is why a well-tuned producer needs `delivery.timeout.ms` comfortably above your election time.
- **KRaft matters here.** Metadata is a replicated log the brokers already follow, so failover of a cluster with tens of thousands of partitions takes seconds rather than the minutes ZooKeeper-era clusters needed.

> The actual selection algorithms, why partition leaders are **not** elected by
> vote, and how this compares to Raft/Paxos/Bully → **§14**.

---

## 3. Consumer groups — how work is split

> *"Each consumer worker reads from one partition?"*

Yes, and the assignment rule is the single most important operational fact in Kafka:

> **Within one consumer group, each partition is owned by exactly one
> consumer. One consumer may own many partitions. A partition is never
> shared by two consumers of the same group.**

```
Topic orders, 4 partitions

group=billing-service, 2 pods          group=analytics, 4 pods
  pod-A -> P0, P1                        pod-1 -> P0
  pod-B -> P2, P3                        pod-2 -> P1
                                         pod-3 -> P2
                                         pod-4 -> P3

Both groups read EVERY message independently. Groups don't compete.
```

Consequences to internalise:

- **`group.id` is the identity.** Same `group.id` = split the work. Different `group.id` = each gets a full copy. That's how one `order-update-events` topic feeds billing, search-indexing, and analytics with zero coordination.
- **Consumers > partitions ⇒ idle consumers.** 10 pods on a 4-partition topic = 4 working, 6 doing nothing. Partition count is a **hard ceiling** on consumer parallelism.
- **Ordering is per-partition only.** Records with the same key → same partition → strictly ordered. Across partitions there is no global order, ever.
- **Keying is how you get ordering where it matters.** `key = orderId` guarantees all events for one order land in one partition and are processed in sequence.

### Rebalance — when assignments move
Triggered by: a consumer joining/leaving, a pod redeploying, a missed heartbeat, a `max.poll.interval.ms` breach, or a partition-count change.

- **Eager** (legacy `RangeAssignor`/`RoundRobin`): stop-the-world, everyone drops everything and re-joins.
- **Cooperative sticky** (`CooperativeStickyAssignor`, the modern default): only the moving partitions are revoked. **Use this.**
- **Static membership** (`group.instance.id`): a pod restarting with the same ID reclaims its partitions without triggering a rebalance. Essential for rolling deploys in k8s.

---

## 4. Offsets — who stores what

> *"We don't pop like SQS, right? And everyone seems to have an offset."*

Correct — nothing is popped. `poll()` is a **read at a cursor**, not a dequeue. Retention alone deletes data (§10).

There are four numbers, and mixing them up is the source of most "lag" confusion:

| Offset | Lives where | Meaning |
|---|---|---|
| **Log end offset (LEO)** | Broker | Next offset the leader will write. The head of the log. |
| **High watermark (HW)** | Broker | Highest offset replicated to all ISR. **Consumers can only read up to here** — that's why un-replicated data is invisible. |
| **Position** | Consumer, in memory | Where this consumer will read next. Advances on every `poll()`. |
| **Committed offset** | Broker, in the internal `__consumer_offsets` topic | "This group has finished everything below N." Survives restarts. |

```
consumer lag = log end offset − committed offset      <- the metric you page on
```

- **Position advances the moment you poll. Committed offset advances only when you commit.** The gap between them is exactly where duplicates come from (§7).
- On restart / rebalance, a consumer resumes from the **committed** offset, not its old in-memory position.
- No committed offset yet? `auto.offset.reset` decides: `latest` (skip history, default) or `earliest` (replay everything). Getting this wrong on a new service is a classic first-day incident — either you silently miss traffic or you replay 7 days of it into prod.
- **Never use the Kafka offset as a business idempotency key.** It changes on replay, on topic recreation, on partition change. Use `orderId` / `requestId`.

---

## 5. Producer flow — acks + idempotency

```
producer.send(key, value)
   -> partitioner picks partition (hash(key) % partitions, or sticky-batch if key is null)
   -> record appended to an in-memory batch (linger.ms / batch.size)
   -> batch sent to the LEADER of that partition
   -> leader writes to its log
   -> followers fetch and replicate
   -> broker acks according to `acks`
```

| `acks` | Broker waits for | Loss risk | Use |
|---|---|---|---|
| `0` | nothing | **High** — fire and forget | Metrics you don't mind losing |
| `1` | leader's own write | **Real** — leader can die before replicating | Legacy/analytics only |
| `all` (`-1`) | all in-sync replicas | Very low | **Everything that matters** |

> ⚠️ **`acks=all` alone is not durability.** If `min.insync.replicas=1`, "all in-sync replicas" can mean *one* replica when followers fall behind — you're back to `acks=1` silently. The real durable combo is:
> ```properties
> replication.factor=3
> min.insync.replicas=2     # topic-level; broker rejects writes if ISR < 2
> acks=all
> ```
> RF=3 + minISR=2 tolerates one broker down and still accepts writes; two down and the topic goes read-only rather than lying to you.

### Idempotent producer (`enable.idempotence=true`, default in modern clients)
The broker tags each producer with a **producer ID + per-partition sequence number** and drops any re-delivery of a sequence it already wrote.

✅ Handles: ack lost on the network · request timeout + retry · internal SDK retries · transient broker hiccup.
❌ Does **not** handle: producer app restart (new producer ID), two services emitting the same business event, anything on the consumer side.

It also preserves ordering under retry — which `max.in.flight.requests` > 1 would otherwise break (idempotence keeps ordering safe up to 5 in-flight).

---

## 6. Consumer flow — commit + transactions

```
while (true) {
  records = consumer.poll(timeout)     // batch, e.g. 500 records
  for (r : records) process(r)         // your DB write / API call
  consumer.commitSync()                // AFTER processing == at-least-once
}
```

**Turn off `enable.auto.commit`.** Auto-commit fires on a timer against your
*polled* position, so it can commit records you haven't processed yet →
silent message loss on crash. Commit explicitly, after work succeeds.

| Guarantee | Commit timing | You lose | You get duplicates | Use |
|---|---|---|---|---|
| At-most-once | **before** processing | on crash ✔ | never | best-effort telemetry |
| **At-least-once** | **after** processing | never | on crash/rebalance ✔ | **the default for everything real** |
| Exactly-once (Kafka txn) | inside a transaction | never | never — *within Kafka* | Kafka→Kafka pipelines only |

### Transactions (real "exactly-once")
```java
producer.initTransactions();            // transactional.id set, fences zombies via epoch
producer.beginTransaction();
producer.send(outputRecord);
producer.sendOffsetsToTransaction(offsets, consumerGroupMetadata);  // offset commit joins the txn
producer.commitTransaction();
```
Consumers must set `isolation.level=read_committed` to hide aborted records.

**The hard boundary:** a Kafka transaction covers *Kafka reads, Kafka writes,
and the offset commit* — atomically. It cannot cover your Postgres row or a
Stripe call. Kafka has no rollback lever on systems it doesn't own.

**So for Kafka → external system, exactly-once does not exist.** What you build instead:

```sql
-- the event carries a business idempotency key, not an offset
INSERT INTO payments (payment_id, amount, ...) VALUES ($1, $2, ...)
ON CONFLICT (payment_id) DO NOTHING;        -- or DO UPDATE for an upsert
```

> **at-least-once delivery + idempotent write = effectively-once outcome.**
> You are not preventing the duplicate *delivery* (structurally you can't);
> you are making the duplicate *processing* a no-op.

Where the true two-system atomicity matters, use the **transactional outbox**: write the business row and an `outbox` row in the *same DB transaction*, and let CDC (Debezium) publish the outbox to Kafka. That's how you avoid "DB committed but Kafka publish failed" — the dual-write problem.

---

## 7. Duplicate vs. loss — the failure matrix

> *"Consumer side is loss, producer side is duplicate?"*
> Not quite — **both sides can do both.** It depends entirely on config.

| # | Scenario | Result |
|---|---|---|
| 1 | `acks=0/1`, leader dies before replicating | **LOSS** — the ack was a lie |
| 2 | `acks=all` + `minISR=2`, leader dies | Safe. Follower with the data is promoted |
| 3 | Producer ack lost on the network, producer retries, idempotence **on** | Safe — broker dedups by (producerId, seq) |
| 4 | Same, idempotence **off** | **DUPLICATE** in the log |
| 5 | Producer app crashes and restarts mid-flight | **DUPLICATE possible** — new producer ID, dedup window is per-session |
| 6 | `unclean.leader.election=true` and an out-of-sync replica is promoted | **LOSS** — keep this `false` (it is, by default) |
| 7 | Consumer commits **before** processing, then crashes | **LOSS** |
| 8 | Consumer processes, then crashes **before** commit | **DUPLICATE** — the classic case |
| 9 | Rebalance lands mid-batch before the commit | **DUPLICATE** — same cause, different trigger |
| 10 | Consumer down longer than `retention.ms` | **LOSS** — the data aged out; on restart `auto.offset.reset` silently jumps you forward |
| 11 | Kafka→Kafka with transactions | Neither |
| 12 | Kafka→external DB/API | **DUPLICATE possible** — fix in the DB, not in Kafka |

Rows 8, 9 and 12 are not Kafka misbehaving. They are the *price* of never losing a message. Pay it, and dedup in the DB.

---

## 8. Scaling — "Kafka is filling up, what do I increase?"

Diagnose first. `consumer lag` rising means **produce rate > consume rate**. The fix depends on which wall you hit:

| Symptom | Real cause | Fix |
|---|---|---|
| Lag rising, consumer pods at low CPU, #pods == #partitions | **Partition-bound** — no more lanes to hand out | **Add partitions**, then add pods |
| Lag rising, pods pegged at 100% CPU | Processing too slow per record | Optimise the handler; batch DB writes; add pods *if* partitions allow |
| Lag rising, pods idle waiting on I/O | Slow downstream (DB/API) | Async/batch the downstream, raise `max.poll.records`, or parallelise inside the consumer |
| Lag on **one** partition only | **Hot key / skew** — one tenant or one `orderId` dominates | Re-key (`tenantId#bucket`), or use a custom partitioner |
| Pods idle and lag high, more pods than partitions | You over-scaled the wrong knob | Adding pods does nothing. Add partitions |
| Broker disk filling, consumers healthy | Retention too long / no compaction | Tune `retention.ms`, `retention.bytes`, tiered storage |

**Order of operations:** partitions → consumer instances → per-consumer concurrency (last, because it breaks in-order processing and complicates commits — only do it with per-key ordering preserved).

Adding **brokers** is a separate axis: it buys storage, network capacity and leader spread, not consumer parallelism. New brokers get no existing partitions automatically — you must run a **partition reassignment** to move data onto them.

### Changing partition count on a live topic

> *"If I increase partitions mid-flight, how does it redistribute?"*

```bash
kafka-topics.sh --alter --topic order-update-events --partitions 12
```

Three things you must know:

1. **Existing data does not move.** Old records stay in their original partitions. Only *new* records use the new count. There is no rebalancing of the log.
2. **Key→partition mapping changes.** `hash(key) % partitions` — going 6 → 12 sends existing keys to different partitions. **Per-key ordering is broken across the change**: `orderId=X` history sits in P3 while new events go to P9, and two consumers may process them concurrently. For an ordering-sensitive topic this is a correctness event, not a config tweak.
3. **You cannot decrease partitions.** Ever. The only path down is: create a new topic, migrate consumers, drop the old one.

Because of #2 and #3, the production practice is **over-partition up front**. Pick partitions for your 12–24-month peak, not today's load; idle partitions cost very little, a mid-life repartition costs a migration.

Rough sizing: `partitions ≈ max(target_throughput / per_partition_throughput, peak_consumer_count)`, then round up. Don't go wild either — every partition costs file handles, memory, replication traffic, and lengthens leader election on broker failure.

---

## 9. Creating the topic

> *"We declare partitions and replicas at creation time?"* — yes.

```bash
kafka-topics.sh --create \
  --topic order-update-events \
  --partitions 12 \
  --replication-factor 3 \
  --config min.insync.replicas=2 \
  --config retention.ms=604800000 \        # 7 days
  --config cleanup.policy=delete \
  --config compression.type=producer
```

- `replication-factor` **can** be changed later (via a reassignment plan), `partitions` can only go **up**, and never back down.
- Turn **off** `auto.create.topics.enable` in production. Auto-creation gives you a typo'd topic with default partitions and RF=1 — a silent single point of data loss.
- Naming convention that survives: `<domain>.<entity>.<event>.<version>` → `orders.order.updated.v1`.

---

## 10. Retention, compaction, DLQ

### Retention — deletion is time/size based, never consumption based
```properties
retention.ms=604800000        # default 7 days
retention.bytes=-1            # per-partition size cap; -1 = unlimited
segment.ms=604800000          # segments roll before they can be deleted
```
A consumer that's down for longer than retention **loses data permanently** and, worse, resets forward silently. Alert on `lag_time`, not just lag count. Tiered storage (KIP-405 / Confluent) lets you keep months in object storage cheaply.

### Compaction — keep the latest value per key, forever
```properties
cleanup.policy=compact        # or "compact,delete"
```
Turns a topic into a replayable key→latest-value snapshot. This is what powers CDC topics, config topics, and Kafka Streams state stores.

### DLQ — not a Kafka feature
Unlike SQS, Kafka has **no built-in dead-letter queue and no redelivery counter**. You build it:

```
consume ──> process ──┬── ok ────────────────> commit
                      └── fail ──> retry (bounded, with backoff)
                                     └── still failing ──> produce to orders.dlq
                                                            (+ headers: original topic,
                                                             partition, offset, exception,
                                                             stack, attempt count)
                                     ──> commit offset either way, so the partition moves on
```

- **Always commit after routing to the DLQ.** If you don't, the partition is blocked forever behind one bad record.
- **Poison pill:** a record that fails *deserialization* kills the consumer before your handler runs, and it restarts onto the same record — an infinite crash loop that halts the partition. Fix with a safe deserializer wrapper (Spring Kafka's `ErrorHandlingDeserializer`) that routes the bad bytes straight to the DLQ.
- **Retry topics** (`orders.retry.5s` → `orders.retry.1m` → `orders.dlq`) give backoff without blocking the main partition — Spring Kafka's `@RetryableTopic` implements this pattern.
- Blocking in-place retries stall the partition and eventually breach `max.poll.interval.ms` → rebalance → duplicate. Bound them tightly.

---

## 11. Production baseline (copy this)

**Producer**
```properties
acks=all
enable.idempotence=true
max.in.flight.requests.per.connection=5
retries=2147483647
delivery.timeout.ms=120000        # the real bound; retries alone is not
linger.ms=10                      # small wait = far better batching = big throughput win
batch.size=65536
compression.type=zstd             # or lz4; 3-5x network+disk savings, cheap CPU
```

**Consumer**
```properties
group.id=billing-service
group.instance.id=billing-pod-3          # static membership: no rebalance on restart
enable.auto.commit=false                 # commit AFTER processing
isolation.level=read_committed           # if upstream uses transactions
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
max.poll.records=500
max.poll.interval.ms=300000              # must exceed worst-case batch processing time
session.timeout.ms=45000
heartbeat.interval.ms=3000
auto.offset.reset=earliest               # decide deliberately, per service
```

**Topic**
```properties
replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false
```

**DB**
```sql
UNIQUE(request_id)   -- + INSERT ... ON CONFLICT DO NOTHING
```

**Must-have alerts:** consumer lag (count *and* time), under-replicated partitions, offline partitions, ISR shrink rate, rebalance rate, DLQ depth, disk usage per broker.

---

## 12. Incidents that happen everywhere

These are the ones that actually page people. Each is a config mismatch, not a Kafka bug.

**1. The rebalance storm.**
Processing a batch takes longer than `max.poll.interval.ms` → broker declares the consumer dead → rebalance → the new owner reprocesses the same batch → also times out → loop. Lag climbs while every pod looks "busy". *Fix:* lower `max.poll.records`, raise `max.poll.interval.ms`, use cooperative sticky + static membership.

**2. The message-size mismatch.**
`max.request.size` (producer) > `max.message.bytes` (broker/topic) > `fetch.max.bytes` (consumer), set inconsistently. The producer publishes fine; the consumer can never fetch that record and stalls the partition forever. *Fix:* keep all three aligned, and keep payloads small — put blobs in S3 and publish the pointer (claim-check pattern).

**3. The hot partition.**
Keying by `tenantId` when one tenant is 60% of traffic. Eleven partitions idle, one at 100%, lag pinned to that one. *Fix:* composite key (`tenantId#hash(orderId)%N`) or a custom partitioner. This is the single most common scaling surprise in multi-tenant systems.

**4. The `auto.offset.reset` surprise.**
New consumer group in prod with `earliest` → replays 7 days into a downstream that isn't ready. Or `latest` → silently skips the backlog you were meant to drain. Decide per service; never leave it to the default by accident.

**5. Unclean leader election.**
Someone flips `unclean.leader.election.enable=true` during an outage to restore availability. An out-of-sync replica becomes leader and committed records vanish. It trades durability for uptime — an explicit, documented decision, never a reflex.

**6. Rolling deploys thrashing the group.**
Ten pods restarting in sequence = ten rebalances, each pausing the whole group. *Fix:* static membership + cooperative sticky; the group barely notices.

**7. The dual-write.**
`db.save(order); kafka.send(event);` — the process dies between the two lines. DB has the order, Kafka doesn't; downstream never learns. Not a Kafka problem, and no `acks` setting fixes it. *Fix:* transactional outbox + CDC.

**8. Retention expiry during a long outage.**
Consumer down over a weekend, `retention.ms=86400000`. Monday it restarts and resets forward — no error, no alert, just a permanent hole in the data. *Fix:* alert on lag *time*, size retention for your worst-case recovery window.

### Patterns from the big shops — and what acks they actually run

The headline finding from every published architecture: **nobody runs one global
durability setting.** They run **tiers**, and route each topic to the tier its
data deserves. Paying `acks=all` for click telemetry is as wrong as paying
`acks=1` for payments.

| Shop | Tier | Typical posture | Why |
|---|---|---|---|
| **LinkedIn** | Tracking / metrics clusters (the bulk of volume) | `acks=1`, idempotence off, RF=2 | Throughput-first. Losing a fraction of page-view events is cheaper than the latency and cost of full replication. They **measure** loss instead of preventing it — see Kafka Audit below |
| | Change-capture / queuing clusters | `acks=all`, `min.insync.replicas=2`, RF=3 | Database change streams feed real systems; a dropped change is a permanently wrong downstream |
| **Uber** | Logging / analytics tier | `acks=1`, loss tolerated and budgeted | Explicitly documented as a lossy tier |
| | Trips, payments, dispatch | `acks=all`, `minISR=2`, RF=3, idempotent producer | Money and state. Paired with app-level dedup keys, not Kafka transactions, because the sinks are external |
| **Netflix (Keystone)** | Fronting ingest clusters, ~trillions of events/day | `acks=1`, RF=2, no producer transactions | Publicly described as **lossy by design**. At that volume, a fraction of a percent of loss during a failover is an accepted trade for cost and latency. They run separate *normal* and *priority* fronting clusters and route by topic importance |
| **Most fintech / order systems** | Everything | `acks=all`, `minISR=2`, RF=3, `enable.idempotence=true`, at-least-once consumer + `UNIQUE(business_id)` | The §11 baseline. This is where you should sit by default |

Treat the exact numbers as illustrative — configs drift with every re-platform, and
idempotence is on by default in modern clients regardless. The **tiering decision**
is the part that's stable and the part interviewers are actually probing.

Three practices worth stealing outright:

- **Audit instead of assume (LinkedIn's Kafka Audit, Uber's Chaperone).** Emit produced-count and consumed-count per topic per time bucket, reconcile them continuously. This is the *only* way to detect silent loss — neither the producer nor the consumer can see it alone, and it's what makes a deliberate `acks=1` tier defensible instead of reckless.
- **Never let apps talk to brokers directly (Netflix's fronting proxy, Uber's REST proxy).** An ingest layer in front of Kafka lets you throttle bad clients, reroute during broker trouble, and change cluster topology without redeploying hundreds of producers.
- **Automate the balancing (LinkedIn's Cruise Control).** Partition and leader distribution skews constantly as brokers come and go. Manual reassignment doesn't scale past a few dozen brokers.

Common thread: **the things that hurt at scale are the ones that are hard to change after the fact** — partition count, key choice, retention, and which durability tier a topic was born into. Spend your design time there.

---

## 13. Golden rules

1. **Duplicates > lost messages.** A duplicate you can dedup; a lost message is gone.
2. **The industry default is: idempotent producer + `acks=all`/`minISR=2` + at-least-once consumer + idempotent DB write.** Reach for transactions only for Kafka→Kafka.
3. **Partitions for throughput, replicas for durability.** Never confuse them.
4. **Key choice = ordering guarantee = hot-spot risk.** It's the highest-leverage decision you make.
5. **Over-partition up front.** You can't go down, and going up breaks per-key ordering.
6. **Kafka's job ends at "durably stored and readable".** Correctness of side effects is your application's job.

```
Need replay / history / many independent readers?   -> Kafka
Need routing, priorities, per-message TTL, RPC?     -> RabbitMQ
Already on AWS, just need a simple queue?           -> SQS
```

| | **Kafka** | **RabbitMQ** | **AWS SQS** |
|---|---|---|---|
| **Model** | Distributed append-only log | Broker with smart routing | Hosted queue |
| **After consume** | Retained, replayable | Deleted on ack | Deleted (≤14d retention) |
| **Delivery** | Pull (poll at an offset) | Push to consumer | Pull (receive + delete) |
| **Ordering** | Per-partition, guaranteed | Per-queue, single consumer | FIFO queues only |
| **Multiple readers** | First-class (consumer groups) | Exchanges & bindings | SNS fan-out in front |
| **DLQ / retries** | Build it yourself | Built-in | Built-in (redrive policy) |
| **Throughput** | Millions/sec | Tens of thousands/sec | Elastic, per-message cost |
| **Best for** | Event streams, source of truth, replay | Task queues, complex routing | Background jobs, zero ops |

# Kafka Quick Notes

### Broker
- Broker = One Kafka server/node.
- Cluster = Multiple brokers.

### Topic & Partition
- Topic → Multiple partitions.
- Partition → 1 Leader + N Followers (Replicas).

### Broker Failure
- Leader fails → ISR follower becomes new Leader.
- Follower fails → Leader continues serving.
- Broker returns → Replica syncs and rejoins ISR.

### Producer Safety
- `acks=1` → Possible data loss.
- `acks=all` + `min.insync.replicas>=2` → No acknowledged data loss.

### Client SDK
- Maintains cluster metadata.
- On leader change, refreshes metadata automatically.
- Retries failed requests.

### Common Errors
- `NotLeaderOrFollower` → Broker is no longer leader/follower for that partition.
- `LeaderNotAvailable` → Leader election in progress.
- `UnknownTopicOrPartition` → Topic/partition doesn't exist (or stale metadata).

> Usually, the Kafka client handles these automatically by refreshing metadata and retrying.

### Consumer Groups
- Different `group.id` → Same data, separate offsets.
- Same `group.id` → Shared offsets, partitions distributed.

### Production
- ✅ 3 Brokers
- ✅ RF = 3
- ✅ `acks=all`
- ✅ `min.insync.replicas=2`

Kafka uses LZ4/Zstd

# Kafka Leader Election (Short)

### Normal Leader Election
- If Leader broker fails, Kafka Controller elects a new Leader from the **ISR (In-Sync Replicas)**.
- Fast failover (typically milliseconds to a few seconds).

Example:
Leader(B1) ❌
Followers: B2, B3 (ISR)

→ B2 becomes new Leader ✅

---

### Preferred Leader Election
- Kafka tries to move leadership back to the **preferred replica** (usually the first replica) for balanced load after the original broker recovers.

---

### Unclean Leader Election
- If **no ISR exists**, Kafka can elect an **out-of-sync replica** (if `unclean.leader.election.enable=true`).
- ✅ Restores availability.
- ❌ May lose committed data.
- **Usually disabled in production.**