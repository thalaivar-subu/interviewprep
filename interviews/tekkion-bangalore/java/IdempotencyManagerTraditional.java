import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * APPROACH 2 - "Traditional" Java idempotency manager (blocking caller).
 *
 * No CompletableFuture, no CountDownLatch, no ExecutorService for coordination: a plain HashMap
 * guarded by hand with a single mutex (the manual mutex-guarded-map pattern), and each entry's own
 * intrinsic lock used with the classic wait()/notifyAll() monitor idiom (available since Java 1.0).
 * Processing runs on a plain `new Thread()`; eviction uses java.util.Timer (JDK 1.3 API) on its own
 * dedicated background thread, decoupled from processing threads.
 *
 * Run: javac IdempotencyManagerTraditional.java && java IdempotencyManagerTraditional
 */
public class IdempotencyManagerTraditional<T> {

    private enum Status { IN_PROGRESS, COMPLETED, FAILED }

    private static final class Entry<T> {
        final String key;
        final Object payload;
        Status status = Status.IN_PROGRESS;
        T result;
        Throwable error;

        Entry(String key, Object payload) {
            this.key = key;
            this.payload = payload;
        }
    }

    public interface Processor<T> {
        T process(Object payload);
    }

    public static final class ConflictException extends RuntimeException {
        public ConflictException(String key) {
            super("Conflict: idempotency key '" + key + "' is IN_PROGRESS with a different payload");
        }
    }

    public static final class ExecutionFailedException extends RuntimeException {
        public ExecutionFailedException(Throwable cause) {
            super("Idempotent execution failed", cause);
        }
    }

    // Plain HashMap, not ConcurrentHashMap - every access is manually guarded by `lock` below.
    private final Map<String, Entry<T>> cache = new HashMap<>();
    private final Object lock = new Object();
    private final Timer evictionTimer = new Timer("idempotency-evictor", true); // dedicated thread, daemon
    private final long ttlMillis;

    public IdempotencyManagerTraditional(long ttlMillis) {
        this.ttlMillis = ttlMillis;
    }

    public T submit(String key, Object payload, Processor<T> processor) throws InterruptedException {
        Entry<T> entry;
        boolean weAreTheWinner;

        // ATOMIC CLAIM: the whole check-then-insert happens inside one synchronized block, so no
        // two threads can ever both observe "absent" for the same key at once - this is
        // ConcurrentHashMap.putIfAbsent's guarantee, spelled out by hand with a mutex.
        synchronized (lock) {
            Entry<T> existing = cache.get(key);
            if (existing == null) {
                entry = new Entry<>(key, payload);
                cache.put(key, entry);
                weAreTheWinner = true;
            } else {
                entry = existing;
                weAreTheWinner = false;
            }
        }

        if (weAreTheWinner) {
            Entry<T> claimed = entry;
            // Plain Thread, not a pool - deliberately "traditional" dispatch. Exactly one of these
            // is ever created per in-flight key, since every other caller took the else-branch above.
            new Thread(() -> run(claimed, processor), "idempotency-worker-" + key).start();
        }

        return awaitOrAttach(entry, payload);
    }

    private T awaitOrAttach(Entry<T> entry, Object payload) throws InterruptedException {
        // Synchronizes on the ENTRY's own intrinsic lock, not on `lock`/`cache` - once we hold
        // `entry`, this method never touches the map again, so a later eviction of `entry` from
        // `cache` cannot affect a thread already inside this method (or already past it).
        synchronized (entry) {
            if (entry.status == Status.IN_PROGRESS && !Objects.equals(entry.payload, payload)) {
                throw new ConflictException(entry.key); // reject immediately, no wait
            }

            // NO POLLING: wait() parks this thread in the monitor's wait-set at zero CPU cost. It
            // is woken ONLY by entry.notifyAll() in run() below - never by a timeout or a
            // sleep-then-recheck loop. The `while` (not `if`) is the standard defence against
            // spurious wakeups mandated by the JLS; it re-checks a field after being woken, it
            // does not re-poll on a timer.
            while (entry.status == Status.IN_PROGRESS) {
                entry.wait();
            }

            if (entry.status == Status.FAILED) {
                throw new ExecutionFailedException(entry.error);
            }
            return entry.result; // memoized for every caller, including late arrivals
        }
    }

    private void run(Entry<T> entry, Processor<T> processor) {
        T result = null;
        Throwable error = null;
        try {
            result = processor.process(entry.payload);
        } catch (Throwable t) {
            error = t;
        }

        synchronized (entry) {
            entry.result = result;
            entry.error = error;
            entry.status = (error == null) ? Status.COMPLETED : Status.FAILED;
            entry.notifyAll(); // wakes every thread parked in entry.wait() immediately
        }

        // TTL clock starts now (completion time), not at submission time. Runs on the Timer's own
        // dedicated background thread - never on a processing thread.
        evictionTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                synchronized (lock) {
                    // Conditional remove, done by hand: only evict if this exact Entry is still
                    // mapped to the key, so a newer entry that reused the key after this one was
                    // already evicted is never accidentally deleted.
                    if (cache.get(entry.key) == entry) {
                        cache.remove(entry.key);
                    }
                }
            }
        }, ttlMillis);
    }

    public void shutdown() {
        evictionTimer.cancel();
    }

    // ---------------------------------------------------------------- demo ----

    public static void main(String[] args) throws Exception {
        coalescing1000Concurrent();
        conflictingPayloadRejected();
        memoizedCacheHit();
        longJobOutlivesTtl();
        System.out.println("\nAll IdempotencyManagerTraditional demos completed.");
    }

    private static void coalescing1000Concurrent() throws Exception {
        System.out.println("=== 1) 1000 concurrent identical requests coalesce onto ONE execution ===");
        IdempotencyManagerTraditional<String> manager = new IdempotencyManagerTraditional<>(5000);
        AtomicInteger executions = new AtomicInteger();
        String payload = "order-1:99.99";
        Processor<String> processor = p -> {
            executions.incrementAndGet();
            sleepQuietly(300);
            return "charged:" + p;
        };

        int n = 1000;
        ExecutorService callers = Executors.newFixedThreadPool(n);
        CountDownLatch allQueued = new CountDownLatch(n);
        CountDownLatch go = new CountDownLatch(1);
        List<String> results = new CopyOnWriteArrayList<>();

        for (int i = 0; i < n; i++) {
            callers.submit(() -> {
                allQueued.countDown();
                try {
                    go.await();
                    results.add(manager.submit("order-key-1", payload, processor));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        allQueued.await();
        go.countDown();
        callers.shutdown();
        callers.awaitTermination(15, TimeUnit.SECONDS);

        long distinct = results.stream().distinct().count();
        System.out.println("processor executions = " + executions.get() + " (expected 1)");
        System.out.println("distinct results among " + n + " callers = " + distinct + " (expected 1)");
        manager.shutdown();
    }

    private static void conflictingPayloadRejected() throws InterruptedException {
        System.out.println("\n=== 2) Conflicting payload on an IN_PROGRESS key is rejected ===");
        IdempotencyManagerTraditional<String> manager = new IdempotencyManagerTraditional<>(5000);
        Processor<String> slowProcessor = p -> {
            sleepQuietly(500);
            return "done";
        };

        Thread firstCaller = new Thread(() -> {
            try {
                manager.submit("order-key-2", "order-2:10.0", slowProcessor);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        firstCaller.start();
        sleepQuietly(50); // test-sequencing only: ensure the first call is IN_PROGRESS before racing it

        try {
            manager.submit("order-key-2", "order-2:999.0", slowProcessor);
            System.out.println("FAIL: expected ConflictException");
        } catch (ConflictException e) {
            System.out.println("Rejected as expected: " + e.getMessage());
        }
        firstCaller.join();
        manager.shutdown();
    }

    private static void memoizedCacheHit() throws InterruptedException {
        System.out.println("\n=== 3) Post-completion call returns instantly, processor not re-invoked ===");
        IdempotencyManagerTraditional<String> manager = new IdempotencyManagerTraditional<>(5000);
        AtomicInteger executions = new AtomicInteger();
        Processor<String> processor = p -> {
            executions.incrementAndGet();
            return "ok";
        };

        manager.submit("order-key-3", "order-3:42.0", processor);
        long start = System.nanoTime();
        String cached = manager.submit("order-key-3", "order-3:42.0", processor);
        long elapsedMicros = (System.nanoTime() - start) / 1000;

        System.out.println("result=" + cached + ", executions=" + executions.get()
                + " (expected 1), elapsed=" + elapsedMicros + "us");
        manager.shutdown();
    }

    private static void longJobOutlivesTtl() throws InterruptedException {
        System.out.println("\n=== 4) Long job outliving the TTL: in-flight waiters unaffected by eviction ===");
        long ttlMillis = 200; // stands in for "5 minutes", compressed so the demo finishes quickly
        IdempotencyManagerTraditional<String> manager = new IdempotencyManagerTraditional<>(ttlMillis);
        AtomicInteger executions = new AtomicInteger();
        long jobDurationMillis = 1000; // stands in for "6 minutes" (> ttlMillis)
        Processor<String> processor = p -> {
            executions.incrementAndGet();
            sleepQuietly(jobDurationMillis);
            return "long-job-result";
        };

        int waiterCount = 300; // stands in for "999 identical requests", +1 original caller
        ExecutorService callers = Executors.newFixedThreadPool(waiterCount + 1);
        List<String> results = new CopyOnWriteArrayList<>();
        for (int i = 0; i < waiterCount + 1; i++) {
            callers.submit(() -> {
                try {
                    results.add(manager.submit("order-key-4", "order-4:7.0", processor));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        callers.shutdown();
        callers.awaitTermination(15, TimeUnit.SECONDS);

        long distinct = results.stream().distinct().count();
        System.out.println("callers=" + (waiterCount + 1) + ", processor executions=" + executions.get()
                + " (expected 1), distinct results=" + distinct);

        // Job finished after the TTL window had already elapsed, so eviction fires almost
        // immediately after completion. Give the eviction timer time to actually run.
        sleepQuietly(ttlMillis + 150);

        // A genuinely NEW request after eviction is a cache miss and legitimately reprocesses.
        String afterEviction = manager.submit("order-key-4", "order-4:7.0", processor);
        System.out.println("post-eviction resubmit result=" + afterEviction
                + ", executions now=" + executions.get() + " (expected 2)");
        manager.shutdown();
    }

    private static void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
