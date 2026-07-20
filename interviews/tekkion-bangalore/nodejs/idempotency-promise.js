'use strict';

/**
 * APPROACH 1 - Promise-based idempotency manager (Node.js).
 *
 * submit() returns a Promise immediately; callers coalesce by awaiting the SAME Promise object
 * shared from the in-flight entry - resolution is delivered via the JS microtask queue (Promise
 * .then chains), never by polling or a setTimeout(check-again) loop.
 *
 * IMPORTANT (why no explicit lock is needed here, unlike Java/Go):
 * Node.js runs your JS on a single thread. Synchronous code always runs to completion before the
 * event loop can switch to another callback - so as long as the "check cache, then insert" step
 * in submit() below never `await`s anything in between, it is impossible for two "concurrent"
 * callers to both observe the key as absent. That's the whole atomic-claim story here: no
 * putIfAbsent, no mutex - just "don't yield between the check and the insert."
 *
 * Run: node idempotency-promise.js
 */

class ConflictError extends Error {
  constructor(key) {
    super(`Conflict: idempotency key '${key}' is IN_PROGRESS with a different payload`);
    this.name = 'ConflictError';
  }
}

class IdempotencyManagerPromise {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.cache = new Map(); // key -> entry
  }

  // processor: (payload) => Promise<result>
  submit(key, payload, processor) {
    const existing = this.cache.get(key);

    // ATOMIC CLAIM: this whole block is synchronous - no `await` between the .get() above and the
    // .set() below - so from the event loop's point of view it is a single, uninterruptible step.
    if (existing === undefined) {
      const entry = { key, payload, status: 'IN_PROGRESS', result: undefined, error: undefined };
      // The "deferred" pattern: create a Promise whose resolve/reject we can call later, from
      // inside _run(), once the processor actually finishes. This IS the coalescing mechanism -
      // every caller that attaches to this entry gets the SAME Promise object back.
      entry.promise = new Promise((resolve, reject) => {
        entry._resolve = resolve;
        entry._reject = reject;
      });
      this.cache.set(key, entry);
      this._run(entry, processor);
      return entry.promise;
    }

    return this._attach(existing, payload);
  }

  _attach(entry, payload) {
    if (entry.status === 'COMPLETED' || entry.status === 'FAILED') {
      return entry.promise; // cache hit - memoized, processor never re-invoked
    }
    // status === 'IN_PROGRESS'
    if (entry.payload !== payload) {
      return Promise.reject(new ConflictError(entry.key)); // reject immediately, do not wait
    }
    // Coalescing: return the SAME promise the winner is holding. No re-lookup of `this.cache`
    // happens after this - which is why eviction racing a long job is harmless: this promise
    // settles independently of whether its cache entry still exists.
    return entry.promise;
  }

  async _run(entry, processor) {
    try {
      const result = await processor(entry.payload);
      entry.result = result;
      entry.status = 'COMPLETED';
      entry._resolve(result); // NO POLLING: wakes every awaiter via the microtask queue
    } catch (err) {
      entry.error = err;
      entry.status = 'FAILED';
      entry._reject(err);
    } finally {
      // TTL clock starts now (completion time), not at submission time. setTimeout here is a
      // one-shot delayed callback registered with the event loop's timer phase - decoupled from
      // any "processing pool" (Node has none; this callback doesn't block anything else running).
      setTimeout(() => {
        // Conditional delete: only remove if this exact entry object is still mapped under `key`,
        // so a newer entry that reused the key after this one was already evicted is never deleted.
        if (this.cache.get(entry.key) === entry) {
          this.cache.delete(entry.key);
        }
      }, this.ttlMs);
    }
  }
}

module.exports = { IdempotencyManagerPromise, ConflictError };

// ------------------------------------------------------------------------------------- demo ----
if (require.main === module) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function coalescingConcurrent() {
    console.log('=== 1) 1000 "concurrent" (interleaved, single-threaded) requests coalesce onto ONE execution ===');
    const manager = new IdempotencyManagerPromise(5000);
    let executions = 0;
    const processor = async (payload) => {
      executions++;
      await sleep(300); // simulated downstream work, NOT a wait/poll loop
      return `charged:${payload}`;
    };

    const n = 1000;
    // All n submit() calls happen synchronously, back-to-back, in this loop - before any of them
    // has a chance to resolve. That's the closest single-threaded JS gets to "1000 concurrent
    // callers": maximal interleaving of the async work, zero interleaving of the synchronous claim.
    const promises = [];
    for (let i = 0; i < n; i++) {
      promises.push(manager.submit('order-key-1', 'order-1:99.99', processor));
    }
    const results = await Promise.all(promises);
    const distinct = new Set(results).size;
    console.log(`processor executions = ${executions} (expected 1)`);
    console.log(`distinct results among ${n} callers = ${distinct} (expected 1)`);
  }

  async function conflictingPayloadRejected() {
    console.log('\n=== 2) Conflicting payload on an IN_PROGRESS key is rejected ===');
    const manager = new IdempotencyManagerPromise(5000);
    const slowProcessor = async () => {
      await sleep(500);
      return 'done';
    };

    const first = manager.submit('order-key-2', 'order-2:10.0', slowProcessor);
    const conflicting = manager.submit('order-key-2', 'order-2:999.0', slowProcessor); // still IN_PROGRESS

    try {
      await conflicting;
      console.log('FAIL: expected ConflictError');
    } catch (err) {
      console.log('Rejected as expected:', err.message);
    }
    await first;
  }

  async function memoizedCacheHit() {
    console.log('\n=== 3) Post-completion call returns instantly, processor not re-invoked ===');
    const manager = new IdempotencyManagerPromise(5000);
    let executions = 0;
    const processor = async () => {
      executions++;
      return 'ok';
    };

    await manager.submit('order-key-3', 'order-3:42.0', processor);
    const start = process.hrtime.bigint();
    const cached = await manager.submit('order-key-3', 'order-3:42.0', processor);
    const elapsedMicros = Number(process.hrtime.bigint() - start) / 1000;
    console.log(`result=${cached}, executions=${executions} (expected 1), elapsed=${elapsedMicros.toFixed(1)}us`);
  }

  async function longJobOutlivesTtl() {
    console.log('\n=== 4) Long job outliving the TTL: in-flight waiters unaffected by eviction ===');
    const ttlMs = 200; // stands in for "5 minutes", compressed for a runnable demo
    const manager = new IdempotencyManagerPromise(ttlMs);
    let executions = 0;
    const jobDurationMs = 1000; // stands in for "6 minutes" (> ttlMs)
    const processor = async () => {
      executions++;
      await sleep(jobDurationMs);
      return 'long-job-result';
    };

    const first = manager.submit('order-key-4', 'order-4:7.0', processor);

    const waiterCount = 300; // stands in for "999 identical requests"
    const waiters = [];
    for (let i = 0; i < waiterCount; i++) {
      waiters.push(manager.submit('order-key-4', 'order-4:7.0', processor));
    }
    const results = await Promise.all(waiters);
    await first;
    const distinct = new Set(results).size;
    console.log(`waiters=${waiterCount}, processor executions=${executions} (expected 1), distinct results=${distinct}`);

    // Job finished after the TTL window had already elapsed, so eviction fires almost immediately
    // after completion. Give the eviction timer time to actually run.
    await sleep(ttlMs + 150);

    // A genuinely NEW request after eviction is a cache miss and legitimately reprocesses.
    const afterEviction = await manager.submit('order-key-4', 'order-4:7.0', processor);
    console.log(`post-eviction resubmit result=${afterEviction}, executions now=${executions} (expected 2)`);
  }

  (async () => {
    await coalescingConcurrent();
    await conflictingPayloadRejected();
    await memoizedCacheHit();
    await longJobOutlivesTtl();
    console.log('\nAll promise-based Node demos completed.');
  })();
}
