# Kafka Quick Recap

### Architecture
- Topic = collection of partitions
- Partition = append-only log file
- Producer/Consumer talk to Brokers
- Leader handles reads/writes
- Followers replicate
- Old Kafka → ZooKeeper (metadata + leader election)
- New Kafka → KRaft (Kafka manages metadata)

---

### Producer

| Type | Config | Issue | Use Case |
|------|--------|-------|----------|
| At Most Once | acks=0 | Lose msgs | Metrics |
| At Least Once | acks=1/all | Duplicates | Orders/Bookings |
| Producer EOS | acks=all + idempotence | No retry duplicates | Payments |

Idempotence = dedupe retries using PID + Sequence No.

Does NOT handle:
- App restart
- Multiple producers
- Consumer redelivery

---

### Consumer

| Type | Commit | Issue | Use Case |
|------|--------|-------|----------|
| At Most Once | Before process | Message loss | Analytics |
| At Least Once | After process | Duplicates | Orders/Payments |
| Exactly Once | Transactional | Kafka→Kafka only | ETL |

---

### Kafka Transactions

✅ Supported

A -> Consumer -> B


❌ Not Supported

A -> Consumer -> DB

Kafka can't rollback DB.

---

### Production Setup

Producer
```properties
acks=all
enable.idempotence=true
```

Consumer

```text
At Least Once
Commit AFTER processing
```

DB

```sql
UNIQUE(request_id)

-- or

ON CONFLICT DO NOTHING
```

DLQ

```text
booking-topic-dlq
```

---

### Use Cases

Payments
→ Idempotent Producer + At Least Once + UNIQUE(paymentId)

Bookings/Orders
→ Idempotent Producer + At Least Once + UNIQUE(requestId)

Analytics
→ acks=1 + At Most Once

Kafka ETL
→ Exactly Once (Transactions)

ETL to DB/Warehouse
→ At Least Once + UPSERT/MERGE


---

### Golden Rule

Duplicates > Lost Messages


Industry Standard

Idempotent Producer
+
At Least Once Consumer
+
Idempotent DB Writes