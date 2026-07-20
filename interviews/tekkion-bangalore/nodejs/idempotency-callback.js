'use strict';

/**
 * APPROACH 2 - "Traditional" Node.js idempotency manager: plain error-first callbacks, no
 * Promises/async-await anywhere (the pre-ES2015 Node style). Coalescing is done by queuing every
 * waiter's callback in an array and invoking each one directly when processing finishes - the
 * direct analogue of Java's wait()/notifyAll() or Go's sync.Cond.Broadcast(), just expressed as
 * "call every pending function" instead of waking parked threads (Node has none to wake - the
 * `waiters` array of callbacks IS what "IN_PROGRESS coalescing" means here).
 *
 * Same single-threaded-JS argument as idempotency-promise.js: the atomic claim below needs no
 * lock because the check-then-insert is synchronous and Node never preempts synchronous code.
 *
 * Run: node idempotency-callback.js
 */

class ConflictError extends Error {
  constructor(key) {
    super(`Conflict: idempotency key '${key}' is IN_PROGRESS with a different payload`);
    this.name = 'ConflictError';
  }
}

class IdempotencyManagerCallback {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.cache = new Map(); // key -> entry
  }

  // processor: (payload, cb) => void, where cb: (err, result) => void   [traditional Node style]
  // callback:  (err, result) => void
  submit(key, payload, processor, callback) {
    const existing = this.cache.get(key);

    // ATOMIC CLAIM: synchronous check-then-insert - nothing can interleave inside this call.
    if (existing === undefined) {
      const entry = {
        key,
        payload,
        status: 'IN_PROGRESS',
        result: undefined,
        error: undefined,
        waiters: [callback], // the winner's own callback is just the first entry in this queue
      };
      this.cache.set(key, entry);
      processor(entry.payload, (err, result) => this._onSettled(entry, err, result));
      return;
    }

    this._attach(existing, payload, callback);
  }

  _attach(entry, payload, callback) {
    if (entry.status === 'COMPLETED') {
      process.nextTick(() => callback(null, entry.result)); // cache hit - memoized
      return;
    }
    if (entry.status === 'FAILED') {
      process.nextTick(() => callback(entry.error)); // cache hit - memoized error
      return;
    }
    // status === 'IN_PROGRESS'
    if (entry.payload !== payload) {
      process.nextTick(() => callback(new ConflictError(entry.key))); // reject immediately, no wait
      return;
    }
    // Coalescing: no re-lookup of `this.cache` from here on - just append to the waiters array
    // that belongs to THIS entry. Even if the entry is later evicted from the map, this array
    // reference keeps living and _onSettled() below still walks it.
    entry.waiters.push(callback);
  }

  _onSettled(entry, err, result) {
    entry.status = err ? 'FAILED' : 'COMPLETED';
    entry.error = err;
    entry.result = result;

    // NO POLLING: every waiting caller's callback is invoked directly, right here, the instant
    // processing finishes - not discovered by anyone re-checking the map on a timer.
    const waiters = entry.waiters;
    entry.waiters = [];
    for (const cb of waiters) {
      process.nextTick(() => cb(err, result));
    }

    // TTL clock starts now (completion time), not at submission time.
    setTimeout(() => {
      if (this.cache.get(entry.key) === entry) {
        this.cache.delete(entry.key);
      }
    }, this.ttlMs);
  }
}

module.exports = { IdempotencyManagerCallback, ConflictError };

// ------------------------------------------------------------------------------------- demo ----
if (require.main === module) {
  function coalescingConcurrent(done) {
    console.log('=== 1) 1000 "concurrent" (interleaved, single-threaded) requests coalesce onto ONE execution ===');
    const manager = new IdempotencyManagerCallback(5000);
    let executions = 0;
    const processor = (payload, cb) => {
      executions++;
      setTimeout(() => cb(null, `charged:${payload}`), 300); // simulated downstream work
    };

    const n = 1000;
    let remaining = n;
    const results = [];
    for (let i = 0; i < n; i++) {
      // All n submit() calls fire synchronously, back-to-back, in this loop.
      manager.submit('order-key-1', 'order-1:99.99', processor, (err, result) => {
        results.push(result);
        if (--remaining === 0) {
          const distinct = new Set(results).size;
          console.log(`processor executions = ${executions} (expected 1)`);
          console.log(`distinct results among ${n} callers = ${distinct} (expected 1)`);
          done();
        }
      });
    }
  }

  function conflictingPayloadRejected(done) {
    console.log('\n=== 2) Conflicting payload on an IN_PROGRESS key is rejected ===');
    const manager = new IdempotencyManagerCallback(5000);
    const slowProcessor = (payload, cb) => setTimeout(() => cb(null, 'done'), 500);

    manager.submit('order-key-2', 'order-2:10.0', slowProcessor, () => {});
    manager.submit('order-key-2', 'order-2:999.0', slowProcessor, (err) => {
      if (err instanceof ConflictError) {
        console.log('Rejected as expected:', err.message);
      } else {
        console.log('FAIL: expected ConflictError, got', err);
      }
      setTimeout(done, 500); // let the first call finish before moving on
    });
  }

  function memoizedCacheHit(done) {
    console.log('\n=== 3) Post-completion call returns instantly, processor not re-invoked ===');
    const manager = new IdempotencyManagerCallback(5000);
    let executions = 0;
    const processor = (payload, cb) => {
      executions++;
      process.nextTick(() => cb(null, 'ok'));
    };

    manager.submit('order-key-3', 'order-3:42.0', processor, () => {
      const start = process.hrtime.bigint();
      manager.submit('order-key-3', 'order-3:42.0', processor, (err, cached) => {
        const elapsedMicros = Number(process.hrtime.bigint() - start) / 1000;
        console.log(`result=${cached}, executions=${executions} (expected 1), elapsed=${elapsedMicros.toFixed(1)}us`);
        done();
      });
    });
  }

  function longJobOutlivesTtl(done) {
    console.log('\n=== 4) Long job outliving the TTL: in-flight waiters unaffected by eviction ===');
    const ttlMs = 200; // stands in for "5 minutes", compressed for a runnable demo
    const manager = new IdempotencyManagerCallback(ttlMs);
    let executions = 0;
    const jobDurationMs = 1000; // stands in for "6 minutes" (> ttlMs)
    const processor = (payload, cb) => {
      executions++;
      setTimeout(() => cb(null, 'long-job-result'), jobDurationMs);
    };

    manager.submit('order-key-4', 'order-4:7.0', processor, () => {});

    const waiterCount = 300; // stands in for "999 identical requests"
    let remaining = waiterCount;
    const results = [];
    for (let i = 0; i < waiterCount; i++) {
      manager.submit('order-key-4', 'order-4:7.0', processor, (err, result) => {
        results.push(result);
        if (--remaining === 0) afterWaiters();
      });
    }

    function afterWaiters() {
      const distinct = new Set(results).size;
      console.log(`waiters=${waiterCount}, processor executions=${executions} (expected 1), distinct results=${distinct}`);

      // Job finished after the TTL window had already elapsed, so eviction fires almost
      // immediately after completion. Give the eviction timer time to actually run.
      setTimeout(() => {
        // A genuinely NEW request after eviction is a cache miss and legitimately reprocesses.
        manager.submit('order-key-4', 'order-4:7.0', processor, (err, afterEviction) => {
          console.log(`post-eviction resubmit result=${afterEviction}, executions now=${executions} (expected 2)`);
          done();
        });
      }, ttlMs + 150);
    }
  }

  coalescingConcurrent(() => {
    conflictingPayloadRejected(() => {
      memoizedCacheHit(() => {
        longJobOutlivesTtl(() => {
          console.log('\nAll traditional callback-based Node demos completed.');
        });
      });
    });
  });
}
