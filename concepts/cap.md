# CAP

CA	Single-node MySQL or PostgreSQL	Not partition tolerant. If the network splits, it effectively becomes unavailable.	Restore connectivity or restart the failed node.
CP	Apache ZooKeeper, etcd	Minority partition rejects requests to keep data consistent.	Once the partition heals, followers catch up from the leader and serve requests again.
AP	Apache Cassandra, Amazon DynamoDB	Both sides continue accepting reads/writes, so different nodes may temporarily have different values.	After the partition heals, replicas synchronize using anti-entropy/read repair, and conflicts are resolved (often last-write-wins or application-specific logic).
Easy example

CP (Bank account)

User transfers ₹1000.
Network partition occurs.
One data center rejects the request rather than risk an incorrect balance.
After recovery, replicas synchronize, and the transfer can be retried safely.

AP (WhatsApp "last seen" or likes)

User updates their status in one region.
Another region still shows the old value during the partition.
Users still get responses (high availability).
After recovery, replicas sync and everyone eventually sees the latest status.

CA (Single database)

A standalone PostgreSQL server in one data center.
No network partition between replicas because there are no replicas.
If the server or network fails, the application cannot continue until it comes back.
Interview one-liner

Banking systems usually prefer CP because correctness is more important than availability. Social media feeds, likes, and presence information often prefer AP because temporary inconsistency is acceptable, but the service should stay available.