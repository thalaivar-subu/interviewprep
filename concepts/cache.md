# Cache Stampede
- get by productId ABC123, this product is not in cache
- if(cache miss) query db -> set in cache -> return response
- if 1000 requests by ABC123 -> 1000 duplicate queries

Fixed with LOCK, setNX

# Cache Avalanche
- Abc123, ABC34-----ABCNNN. All cached at 12:01PM
- 1hr cache, 13.01PM - all expires.
- Now every call hits DB, a spike

Fixed with TTL + Random(1..2)

#  Multi Service Coordination
- SETNX orderID
-- Place Order
-- Payment
-- Send Mail

No Duplicate Calls - like if use double clicks pay button

Idempotency -> Performing the same operation multiple times has the same effect as performing it once.