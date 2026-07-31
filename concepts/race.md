# Race Conditions — Cheatsheet

Context: N concurrent requests read-check-then-write the same resource
(classic: decrementing shared stock/inventory) → lost updates / overselling.

## In-process (single instance only)

**1. ConcurrentHashMap + synchronized/Futures**
`synchronized(locks.computeIfAbsent(productId, k -> new Object())) { ... }`
JVM-local mutual exclusion — dies the moment you run more than one instance, since each JVM has its own lock table.

## DB-level (works across instances — the default answer)

**2. Unique constraint (insert-time dedup)**
`ALTER TABLE orders ADD CONSTRAINT uq_order UNIQUE (product_id, idempotency_key);`
The second concurrent insert for the same key fails/no-ops at the DB — turns a race into a guaranteed single winner.

**3. Conditional update (no version column needed)**
`UPDATE inventory SET qty = qty - 1 WHERE product_id = 42 AND qty > 0;`
Check `rowsAffected` — the row-level atomicity does check-then-act in one step, no read-modify-write gap.

**4. Optimistic locking via version column**
`UPDATE inventory SET qty=qty-1, version=version+1 WHERE id=42 AND version=7;`
`rowsAffected = 0` means someone else won — re-read and retry. Best for read-heavy/low-contention.

**5. Pessimistic locking (SELECT FOR UPDATE)**
`SELECT qty FROM inventory WHERE id=42 FOR UPDATE;` (inside a transaction)
Blocks every other transaction on that row until commit — correct but serializes contention; see [locks.md](locks.md).

**6. Insert-then-select-if-not-exists**
`INSERT INTO processed_requests(id) VALUES ($1) ON CONFLICT DO NOTHING;`
Solves "have I already handled this exact request" (idempotency), **not** "safely decrement a shared counter" — different problem than #2-5.

## Redis

**7. SETNX as a distributed lock**
`SET lock:product:42 <owner> NX PX 5000`
Only one caller acquires it; others poll/retry or fail fast. Needs a TTL (crashed holder can't lock forever) and ideally a fencing token (delayed holder shouldn't act after expiry).

**8. Redis DECR as the atomic counter (no separate lock)**
`DECR stock:product:42` → if result `< 0`, `INCR` back and reject.
Redis is single-threaded per shard, so `DECR` is atomic across every one of your N app instances — the operation *is* the lock.

## Kafka

**9. Partition-key serialization**
`producer.send(topic, key=productId, value=orderRequest)`
Same product always lands on the same partition, consumed in order by one consumer → kills the *concurrency* race, but the API becomes async.

**10. Still need idempotent DB writes downstream**
`INSERT ... ON CONFLICT (request_id) DO NOTHING` in the consumer
Kafka orders and serializes; it does **not** dedupe. At-least-once delivery can redeliver — see [kafka.md](kafka.md).

---

## Real-world use cases

**Flipkart/Amazon flash sale (Big Billion Days, ₹1 iPhone drop)**
Thousands of requests hit the same product the instant the sale opens → classic overselling race.
Combo: **#8** Redis `DECR` as the live stock counter (atomic across all pods, no lock needed) + **#3** conditional `WHERE qty > 0` DB update as the source-of-truth fallback if Redis and DB drift + **#2** unique constraint on `(user_id, product_id)` so one user can't win two units in a retry storm + a queue/waiting-room (Kafka/SQS, like **#9**) in front to throttle the request spike itself rather than let it all hit the DB at once.

**Redbus/BookMyShow seat selection**
Two users click the same seat within the same second; whoever "confirms" second should see it's gone, not double-book it.
Combo: **soft lock** — `SET seat:123 <userId> NX EX 300` (**#7**) the moment a seat is selected, so it's held (greyed out for others) while the user fills payment details, then on payment success a **hard commit** via **#2** `UNIQUE(show_id, seat_no)` in the booking table is the real guarantee — if the Redis hold expired or was never checked, the DB constraint still rejects a duplicate insert. Two layers: Redis for UX (fast "seat taken" feedback), DB constraint for correctness.

**IRCTC Tatkal booking**
Same seat-lock idea as Redbus, but at 50-100x the concurrency in a 1-second window at 10/11 AM — the bottleneck shifts from "which pattern" to "how do you not fall over."
Combo: virtual waiting room / rate limiter in front (queue requests, like **#9**, so the DB only ever sees a manageable trickle) + short-TTL Redis hold per seat (**#7**) + `UNIQUE(train_id, seat_no, journey_date)` (**#2**) as final arbiter + an **idempotency key per booking attempt** (**#6**, keyed on a client-generated request ID) so a user's network retry during the chaos doesn't generate two PNRs for the same request.

**UPI/bank transfer — client retries a timed-out request**
User's app doesn't get a response (network blip) and retries the transfer; naively this double-debits.
Combo: **#6** idempotency key — the client sends a `request_id` it generated before the first attempt; server does `INSERT ... ON CONFLICT (request_id) DO NOTHING` and returns the *original* result on the retry, never processing the transfer twice. This is the same shape as Kafka's consumer-dedup problem (**#10**) — "at-least-once delivery, effectively-once effect."

**Uber/Ola driver-ride assignment**
Two nearby drivers' apps both try to accept the same ride request at once — only one should win.
Combo: **#3**-style conditional update — `UPDATE rides SET driver_id=$1, status='ASSIGNED' WHERE id=$2 AND status='PENDING'`. Whoever's update actually affects a row wins; the DB's row-level atomicity is the entire mechanism, no separate lock needed. (Redis `SETNX` on the ride ID, **#7**, is a common alternative when assignment logic lives outside the DB, e.g. in a matching service.)

**Coupon/promo code — "one redemption per user"**
User double-taps "Apply Coupon" or the request retries.
Combo: **#2** `UNIQUE(user_id, coupon_id)` on the redemptions table — simplest possible fix, no locking of any kind needed since it's a pure insert-dedup problem, same family as **#6**.

---

## Confirming your notes

Your list (ConcurrentHashMap → DB unique constraint → versioned/conditional
update → insert-then-select caveat → Redis SETNX+poll) is all correct.
Two refinements:

- **#6 caveat is right** — insert-then-select-if-not-exists is for "did I
  already process this," not for decrementing a counter.
- **#7 (SETNX+poll) is right**, and the part people forget is the **TTL**
  — without it a crashed holder locks the resource forever. Polling also
  needs backoff/max-retries or you get a thundering herd.

## Is Redis actually distributed, and how does single-threaded fix the race?

Yes, Redis Cluster shards keys across nodes by hash slot — it *is*
horizontally distributed. But for any **single key**, exactly one node
owns it, and that node processes commands one at a time on its single
event-loop thread. So `DECR stock:product:42` or `SET lock:... NX` is
atomic **per key** no matter how many app instances fire it — the race
is resolved by Redis's command queue, not by your app code. Different
keys run in parallel across shards, which is where the scaling comes
from. Single-threaded ≠ single-node: it means "no two commands on the
same key interleave," exactly the guarantee you need.

## Kafka: it's a single API call — how does async help, and doesn't the duplicate hole still exist?

Both instincts are right:

- It genuinely makes the API async. Either the client gets a fast
  `202 Accepted` and the real result arrives later (webhook/poll/socket),
  or the API layer fakes sync via request-reply over Kafka (correlation
  ID + response topic). You're trading an instant DB round trip for
  guaranteed-ordered, decoupled processing — worth it when contention,
  not latency, is the bottleneck.
- Partition key + `acks=all` + idempotent producer only guarantee the
  **producer→broker** hop (ordering + no duplicate writes on retry).
  They say nothing about the **consumer** crashing after processing but
  before committing the offset — that redelivers the same message
  (row 7 in [kafka.md](kafka.md)'s failure table). So exactly like the
  DB pattern above, the consumer's write still needs to be idempotent
  (`ON CONFLICT DO NOTHING` on a request/event ID, or the conditional
  `WHERE qty > 0` update) so a redelivery is a safe no-op. Kafka solves
  the *concurrency* race; it does not solve *duplicate delivery* — those
  are two separate problems and production systems need both fixes
  together.
