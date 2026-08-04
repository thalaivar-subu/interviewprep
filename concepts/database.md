# Database


## Redis
- Key-Value, Stored In RAM, Cache, Pub/Sub, On Top Of Some Persistend Database

## Wide Column
- Cassandra, HBASE - Denormalized - No commments, posts, authors -> users, posts by useers, comments by users
- Same like SQL, but unstructured - CQL - No Joins, Easy to scale up, horizontal scaling
- Time Series, High Write/ Low Read, Historical Records

## SQL
- Table Oriented, Schema, ACID Compliant, Difficult to scale

## Search Engine
- Elastic Search - Similar to document oriented databse but inverted index

## NoSQL
- Mongo Document Oriented, JSON
Nested faster, then join with ref id
Mongo Supports Geo Spatial Queries, Data Aggregation Pipelines 

Clustered Index
Advantages
✅ Very fast range queries (BETWEEN, <, >, ORDER BY)
✅ No extra lookup—leaf nodes contain the actual rows.
✅ Sequential scans are efficient.
✅ Sorting is often avoided because data is already ordered.
Disadvantages
❌ Only one clustered index per table.
❌ Inserts/updates can cause page splits if keys are random.
❌ Changing the clustered key is expensive.
Non-Clustered Index
Advantages
✅ Can create multiple indexes on different columns.
✅ Great for exact lookups (WHERE email = ?).
✅ Doesn't change the physical layout of the table.
✅ Can be a covering index, avoiding table lookups if all required columns are in the index.
Disadvantages
❌ Usually requires an extra lookup to fetch the full row.
❌ Uses additional storage.
❌ Every insert/update/delete must also update the index.
