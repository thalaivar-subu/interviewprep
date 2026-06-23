# ACID BASE

# ACID
Atomicity, Consistency, Isolation, Durability
Low Availability, High Latency

## Isolation

Dirty Read
T1: Read balance = 200   ← T2 updated but not committed
T2: Rollback
T1 read invalid data ❌
Non-Repeatable Read
T1: Read balance = 100
T2: Update balance = 200 and Commit
T1: Read balance = 200
Same row, different value ❌
Phantom Read
T1: SELECT * FROM orders WHERE amount > 100; -- 5 rows
T2: INSERT order(amount=150); Commit
T1: SELECT * FROM orders WHERE amount > 100; -- 6 rows
Extra row appeared ❌
READ_UNCOMMITTED
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
// Nothing prevented
// Dirty Reads       ✅ Possible
// Non-Repeatable    ✅ Possible
// Phantom Reads     ✅ Possible


READ_COMMITTED
@Transactional(isolation = Isolation.READ_COMMITTED)
// Dirty Reads       ❌ Prevented
// Non-Repeatable    ✅ Possible
// Phantom Reads     ✅ Possible


REPEATABLE_READ
@Transactional(isolation = Isolation.REPEATABLE_READ)
// Dirty Reads       ❌ Prevented
// Non-Repeatable    ❌ Prevented
// Phantom Reads     ✅ Possible (SQL standard)
// MySQL InnoDB prevents many phantom reads using next-key locking


SERIALIZABLE
@Transactional(isolation = Isolation.SERIALIZABLE)
// Dirty Reads       ❌ Prevented
// Non-Repeatable    ❌ Prevented
// Phantom Reads     ❌ Prevented
# BASE
Basically Available Soft State - Eventual Consistency
11AM 1 insert to node A, 11.10 AM node B will get updated automatically Without Input - Soft State
High Availability, Low Latency
