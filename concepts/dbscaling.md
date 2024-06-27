# DB Scaling Concepts
https://aws.amazon.com/what-is/database-sharding/#:~:text=Database%20sharding%20splits%20a%20single,original%20database%27s%20schema%20or%20design

- Horizontal Scalingg
- Vertical Scaling
- Replication
- Partitioning

## Vertical Scaling
- Increase CPU/RAM - cost less, but there is a limit. Complex compared to Horizontal for implementation

## Horizontal Scaling
- Sharding
Spliting rows of a table based on shard key and putting it in new servers
### Methods Of Sharding
 - Range Based Sharding
 - Hashed Sharding - Evenly distributes data. Not distributed on some meaning like color or name, so complexity while adding more shards
 - Directory Based Sharding - Lookup table have color - blue, shard key - a
 ### Shard Key
 - Cardinality, Frequency, Monotonic Change

## Partitioning
 - Sharding distributes data across servers
 - Partitiong in same server.
 ### Horizontal vs Vertical Partitioning
 - Horizontal, partition by rows
 - Vertical, partition by columns

## Replication
 - Exact Copies Of Data. For High Availability

## Views Vs Materialized Views
 - Views - Dynamically combines results but doesn't store
 - Materialized View- Stores the Combination. Configurable based on our needs - Mysql No Support, PostgresqL spport