# Snapshots (RDB)
- Binary Dump
- Compressed/Optimized
- So a Redis using 8 GB RAM might produce an RDB file of only 2–5 GB, depending on the data..

Typical configuration:

save 900 1
save 300 10
save 60 10000

Meaning:

After 900 sec (15 min) if at least 1 write
After 300 sec (5 min) if at least 10 writes
After 60 sec if at least 10,000 writes

# AOF (Append only FIle)
- Use AOF (Append Only File) if you dont want data loss





RDB → Smaller ✅
Binary snapshot of the entire dataset.
AOF → Larger ❌
PRODUCTION system enables both

### Async Replication
Client → Primary (ACK) → Replica (later)
- Faster writes ✅
- Possible data loss if primary crashes before replica syncs.

### Sync / Quorum Replication
Client → Primary → Replica ACK(s) → Client ACK
- Higher durability ✅
- Higher write latency.

# Compression
How compression reduces size

Compression looks for repeated patterns and stores them more efficiently.

Example:

Original:

aaaaaaaaaaaaaaaaaaaa

Instead of storing 20 a characters, it can represent it as:

20 × 'a'