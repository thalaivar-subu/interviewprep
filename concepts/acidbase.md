# ACID BASE

# ACID
Atomicity, Consistency, Isolation, Durability
Low Availability, High Latency

## Isolation Levels
- Read Uncomitted - balnce is 100, t1 updates to 0 then rolls back, t2 would have read balance as 0 - Dirty Read
- Read Comitted - balance is 100, t1 updates to 80, t2 first read 100 inside transaction when it reads again it will get 80 - Non Repeatable Read
- Repeatable Read - U read once, all good, what if range quries like `select orders price >100` initially 5 rows, but 6 rows would have come - Phantom Read
- Serializable - pretend every transactions 1 by 1, modern systems have MVCC, so if it suspects conflict, 1 is rolled back

# BASE
Basically Available Soft State - Eventual Consistency
11AM 1 insert to node A, 11.10 AM node B will get updated automatically Without Input - Soft State
High Availability, Low Latency
