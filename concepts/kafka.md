# Kafka — Production Mental Model

## Architecture (30-second refresher)
- Topic = collection of partitions. Partition = append-only log file.
- Producer/Consumer talk to Brokers. Leader partition handles reads/writes, followers replicate.
- Old Kafka → ZooKeeper (metadata + leader election). New Kafka → KRaft (Kafka manages its own metadata).

---

## THE CORE INSIGHT

**There are two completely independent acknowledgment loops.** Nothing
connects them. This is the fact that makes everything else in this file
make sense.

```
Producer  --send-->  Broker  <--pull--  Consumer
    ^                   |                   |
    |                   |                   v
 acks=0/1/all       (just stores it     commits offset
 (producer's ack     in the log,        (consumer's own
  loop - about        doesn't push       ack loop - about
  "did the broker     or track           "have I finished
  durably store       consumers at      with this message")
  my write?")          all)
```

- **Loop 1 (producer → broker):** "did my write make it into the log
  durably?" Controlled by `acks`. Nothing to do with consumers.
- **Loop 2 (broker → consumer):** Kafka does **not** push messages or
  track "did the consumer finish." The consumer **pulls**, processes, and
  then tells Kafka "I'm done with everything up to offset N" by
  committing. Kafka has no idea whether your DB write, your API call, or
  anything else you did with that message actually succeeded.

Because of Loop 2, there is a real gap between **"consumer read the
message"** and **"consumer finished doing something with it and told
Kafka."** Anything that crashes or reshuffles inside that gap causes the
same message to be delivered again. That's not a malfunction — it's the
literal definition of **at-least-once delivery**, and it's the standard,
correct, industry-default setup (see Golden Rule at the bottom).

**So: even when nothing is "wrong" — no crash, no network blip, no bug —
duplicates are still possible**, because commit-after-processing is a
two-step operation (process, then commit) and Kafka can't make those two
steps atomic with whatever your consumer did. The fix is not "prevent the
duplicate delivery" (you structurally can't, without giving up
at-least-once) — the fix is **make reprocessing harmless** by pushing a
uniqueness constraint down to the DB. See "How the DB actually stops the
duplicate" below.

---

## Failure-mode walkthrough

| # | Scenario | What actually happens | Duplicate? | Lost? |
|---|---|---|---|---|
| 1 | Producer app crashes **before** `send()` is even called | Nothing was sent. Retry is an application-level concern (e.g. user resubmits the form). | No | Depends on your app |
| 2 | Producer sends, broker writes it, but the **ack reply is lost on the network** on the way back | Producer doesn't know it succeeded → retries. With `enable.idempotence=true`, broker recognizes the same (producerId, sequence#) and drops the duplicate write. | **No** (idempotent producer) | No |
| 3 | Producer app **crashes and restarts** after an in-flight send whose ack it never saw | New process = new producer session = new producer ID. Idempotence dedup only works *within* a producer session, so the broker sees this as a brand-new write if the original one also eventually lands. | **Possible** | No |
| 4 | `acks=1`: leader writes the message, acks the producer, then the **leader dies before replicating** to followers | Consumers now read from a new leader that never got the message. The ack the producer received was a lie. | No | **Yes** — this is exactly why `acks=1` is unsafe for anything you can't afford to lose |
| 5 | `acks=all`: leader writes, waits for all in-sync replicas to confirm, *then* acks | Message survives leader failure — a replica gets promoted and already has it. | No | No |
| 6 | Consumer reads a message, **crashes before processing it** | Offset was never committed → message is re-delivered on restart/rebalance → processed exactly once for real. | No | No |
| 7 | Consumer reads, **processes it (writes to DB / calls an API), then crashes before committing the offset** | On restart, Kafka has no record you finished → same message is handed to a consumer again → your DB write / API call happens **again**. | **Yes — this is the classic case** | No |
| 8 | **Consumer group rebalance** mid-processing (a pod redeploys, misses a heartbeat, autoscaling adds a consumer) | Partition gets reassigned before the old consumer's commit lands → the new owner reprocesses the same message. | **Yes** | No |
| 9 | Kafka Streams / any Kafka-to-Kafka pipeline, with transactions enabled | Read + write + offset-commit happen as one atomic unit. | No | No |
| 10 | Any pipeline that ends outside Kafka (a DB write, an external API call) | Kafka transactions **cannot** cover this. Kafka has no rollback lever for your Postgres table or your payment gateway. | **Possible** | No |

Rows 3, 7, and 8 are the ones people call "Kafka gave me a duplicate" —
none of them are Kafka misbehaving; all three are the direct, expected
cost of guaranteeing no message loss.

---

## How the DB actually stops the duplicate

Kafka's contract stops at "you will receive this message at least once."
Turning "at least once delivered" into "effectively once applied" is an
**application/DB-layer job**, not a Kafka feature:

```sql
-- every event carries a business idempotency key
-- (paymentId, requestId, eventId - something the caller controls,
--  not a Kafka offset, which resets/replays and isn't safe to key on)

CREATE TABLE payments (
  payment_id UUID PRIMARY KEY,   -- the idempotency key
  ...
);

INSERT INTO payments (payment_id, ...) VALUES ($1, ...)
ON CONFLICT (payment_id) DO NOTHING;
-- or ON CONFLICT (payment_id) DO UPDATE ... for an upsert
```

First delivery: row gets inserted, side effect happens once.
Second delivery (duplicate from row 3/7/8 above): the `INSERT` is a
no-op (or a harmless overwrite of the same values). **The final state of
the DB is correct no matter how many times Kafka redelivers the
message.** That's the whole trick — you're not preventing the duplicate
delivery, you're making the duplicate *processing* a no-op.

This is why "exactly-once" is slightly misleading marketing industry-wide:
what you actually get is **at-least-once delivery + idempotent
processing = effectively-once outcome**.

---

## Producer ack config (Loop 1 reference)

| Config | Broker ACK behavior | Duplicate risk | Loss risk |
|---|---|---|---|
| `acks=0` | Doesn't wait for any ack | No | **Yes** — fire and forget |
| `acks=1` | Leader acks after its own write only | Possible on retry | Possible — leader can die before replicating (row 4 above) |
| `acks=all` + `enable.idempotence=true` | Waits for all in-sync replicas | No (within a producer session) | Very unlikely |

**Client App** = your Producer/Consumer SDK usage (Java/Node/Python client).
**Broker** = the Kafka server. **Leader** = the leader replica of a partition.

### Idempotent producer handles
✅ Network timeout after send · ✅ ACK packet lost in transit · ✅ SDK's own internal retries · ✅ Transient broker hiccup causing a retry

### Idempotent producer does NOT handle
❌ App restarted (new producer ID, row 3) · ❌ Two different producer apps independently emitting the "same" business event · ❌ Consumer-side duplicate processing (rows 7-8) · ❌ Duplicate rows in your database

---

## Consumer delivery guarantees (Loop 2 reference)

| Type | Offset commit timing | Protects against | Doesn't protect against | Typical use |
|---|---|---|---|---|
| At Most Once | Before processing | Duplicate processing | Message loss on crash | Best-effort analytics |
| At Least Once | After processing | Message loss | Duplicate processing on crash/rebalance (rows 7-8) | Orders, payments — pair with idempotent DB writes |
| Kafka Exactly Once | Offset commit + produce, in one Kafka transaction | Duplicate Kafka-to-Kafka writes | Anything outside Kafka (external DB/API side effects) | Kafka Streams, Kafka-to-Kafka ETL |

Kafka transactions cover **Kafka → Kafka** (read a topic, write to
another topic, commit the offset, all atomically). They do **not** cover
**Kafka → external system** (Kafka → your DB, Kafka → a third-party API)
— there's no way for Kafka to roll back a side effect it doesn't own.

---

## Production setup (the industry-default combo)

Producer
```properties
acks=all
enable.idempotence=true
```

Consumer
```text
At-least-once: commit the offset AFTER processing succeeds, never before.
```

DB (idempotency key on whatever the business calls the event, not the Kafka offset)
```sql
UNIQUE(request_id)
-- INSERT ... ON CONFLICT DO NOTHING
-- or ON CONFLICT DO UPDATE for an upsert
```

DLQ (dead-letter topic for messages that keep failing processing)
```text
booking-topic-dlq
```

---

## Use cases

- **Payments** → idempotent producer + at-least-once consumer + `UNIQUE(payment_id)`
- **Bookings/Orders** → idempotent producer + at-least-once consumer + `UNIQUE(request_id)`
- **Analytics** → `acks=1` + at-most-once (occasional loss is cheaper than the complexity of preventing it)
- **Kafka-to-Kafka ETL** → exactly-once via Kafka transactions
- **ETL into a DB/warehouse** → at-least-once + UPSERT/MERGE on load

---

## Golden rule

**Duplicates > lost messages.** When in doubt, favor at-least-once and
push the dedup responsibility to the DB — a duplicate row you can filter
is recoverable; a message you never got is not.

Industry-standard combo: **idempotent producer + at-least-once consumer
+ idempotent DB writes.**

```
Need replay/history?                       -> Kafka
Need routing/priorities/RPC?               -> RabbitMQ
Already on AWS, just need a simple queue?  -> SQS
```

---

## Kafka vs. the alternatives

| Category | Apache Kafka | RabbitMQ | AWS SQS |
|---|---|---|---|
| **Model** | Distributed log. Append-only stream. | Message broker. Smart routing & queues. | Hosted queue. Simple FIFO or standard. |
| **After consume** | Kept. Replayable for days/weeks/forever. | Deleted. Gone once acked. | Deleted. Up to 14 days retention. |
| **Throughput** | Millions of events/sec per cluster. | Tens of thousands/sec, smart routing. | Effectively unlimited, per-message cost. |
| **Multiple readers** | First-class. N independent consumer groups. | Via exchanges & bindings. | Fan-out via SNS in front of SQS. |
| **Ordering** | Per-partition, guaranteed. | Per-queue, single consumer. | FIFO queues only. |
| **Best for** | Event streams, analytics, source of truth. | Task queues, complex routing, RPC. | Background jobs in AWS, zero ops. |
