# Pessimistic locking
Banking - Data Conflicts Are Frequent,
Prevent Data Inconsistencies
- Shared Lock - Read, No Write
`START TRANSACTION;
SELECT * from accounts WHERE owner_id = 1 FOR SHARE;
//do something
COMMIT;`
- Exclusive Lock - No Read, No Write
`START TRANSACTION;
SELECT * from accounts WHERE owner_id = 1 FOR UPDATE;
// do something
COMMIT;`
- Locking Range Of Rows
`SELECT * FROM user WHERE first_name = 'John' FOR UPDATE`

# Optimistic Locking
Read-Heavy, Low Update Environments:
`UPDATE account SET balance = balance - 70, version = version + 1 WHERE id = 1 AND version = 1`