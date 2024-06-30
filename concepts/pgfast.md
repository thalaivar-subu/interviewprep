# Postgress Optimization


## Prepared Statements
- Create prepared statement, execute with arguments, avoids parse and planning each time. saves more time
Each session one prepared statement, if session killed again create - all handled by Postgress ORM library

## Indexing
- Small tables sequential scan is fine but large tables indexing is needed.
Index is used to find the conditions, then rows are returned.
- Explain command - if seq, then add index. It will use index scan
Applying index takes more time
- Write performance affects

## Parititioning
- Breaks large table into smaller table, logically grouped acts as single table
`CREATE TABLE A() PARTITION BY RANGE(timestamp)`
Slower Query if scan large number of multiple partitions
We need to manage creation of new partitions with cron job, PG Extensions  pg_partman, pg_cron
No Out of Box Automation

## Copy Command
- Multiple inserts avoid and use copy, mainly with csv and stdin
If any wrong data, full copy fail

## Replicate
- Primary Read/Write, other read replicas.
Increases one more level of complexity
PG Bouncer, PG Pool 2


# Solve PG Weaknes
Time Series Data - Order By Time Stamps - Price Of Stocks

Time Scale DB Extension
We will get PG relations, ACID, transactions and get fast response as well

Trip Data - Hyper Table, Materialized View, Auto Refresh
