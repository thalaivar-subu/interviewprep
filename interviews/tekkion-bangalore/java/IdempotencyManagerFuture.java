import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

/**
 * APPROACH 1 - Future/promise-based idempotency manager (non-blocking caller).
 *
 * submit() returns immediately with a CompletableFuture; callers who want to block can call
 * .get()/.join() on it, but nothing inside this class ever blocks a thread to "check" progress -
 * completion is pushed to every waiter via CompletableFuture's internal callback chain.
 *
 * Run: javac IdempotencyManagerFuture.java && java IdempotencyManagerFuture
 */
public class IdempotencyManagerFuture<T> {

    private enum Status { IN_PROGRESS, COMPLETED, FAILED }

    private static final class Entry<T> {
        final String key;
        final Object payload;
        // This future IS the coordination mechanism: every caller that coalesces onto this key
        // gets a reference to this exact object and never needs to touch `cache` again.
        final CompletableFuture<T> future = new CompletableFuture<>();
        volatile Status status = Status.IN_PROGRESS;
        volatile T result;
        volatile Throwable error;

        Entry(String key, Object payload) {
            this.key = key;
            this.payload = payload;
        }
    }

    public static final class ConflictException extends RuntimeException {
        public ConflictException(String key) {
            super("Conflict: idempotency key '" + key + "' is IN_PROGRESS with a different payload");
        }
    }

    private final ConcurrentHashMap<String, Entry<T>> cache = new ConcurrentHashMap<>();
    private final ExecutorService processingPool;
    // Dedicated to eviction only - a slow/backed-up processingPool can never delay an eviction,
    // and a burst of evictions can never starve processing.
    private final ScheduledExecutorService evictionScheduler;
    private final long ttlMillis;

    public IdempotencyManagerFuture(long ttlMillis) {
        this.ttlMillis = ttlMillis;
        this.processingPool = Executors.newCachedThreadPool(daemonFactory("idempotency-worker"));
        this.evictionScheduler = Executors.newSingleThreadScheduledExecutor(daemonFactory("idempotency-evictor"));
    }

    private static ThreadFactory daemonFactory(String prefix) {
        return r -> {
            Thread t = new Thread(r, prefix);
            t.setDaemon(true);
            return t;
        };
    }

    public CompletableFuture<T> submit(String key, Object payload, Function<Object, T> processor) {
        Entry<T> fresh = new Entry<>(key, payload);

        // ATOMIC CLAIM. putIfAbsent is the single compare-and-swap point in this class: under N
        // concurrent callers racing on the same new key, exactly one thread's `fresh` entry
        // becomes the map value (putIfAbsent returns null to that thread); every other thread gets
        // that same winning Entry back and falls into attach() instead of scheduling a second run.
        Entry<T> winnerOrExisting = cache.putIfAbsent(key, fresh);

        if (winnerOrExisting == null) {
            processingPool.submit(() -> run(fresh, processor));
            return fresh.future;
        }
        return attach(winnerOrExisting, payload);
    }

    private CompletableFuture<T> attach(Entry<T> entry, Object payload) {
        if (entry.status == Status.COMPLETED) {
            return CompletableFuture.completedFuture(entry.result); // cache hit - memoized
        }
        if (entry.status == Status.FAILED) {
            return CompletableFuture.failedFuture(entry.error); // cache hit - memoized error
        }
        if (!Objects.equals(entry.payload, payload)) {
            return CompletableFuture.failedFuture(new ConflictException(entry.key)); // reject, don't wait
        }
        // Coalescing: hand back the SAME future the winner (or earlier waiters) already hold. No
        // re-lookup of `cache` happens after this line for this caller - which is exactly why
        // eviction racing with a long-running job is harmless: this future will still be completed
        // by run(), whether or not its map entry still exists by then.
        return entry.future;
    }

    private void run(Entry<T> entry, Function<Object, T> processor) {
        try {
            T result = processor.apply(entry.payload);
            entry.result = result;
            entry.status = Status.COMPLETED;
            entry.future.complete(result); // NO POLLING: this is what wakes every waiter, immediately
        } catch (Throwable t) {
            entry.error = t;
            entry.status = Status.FAILED;
            entry.future.completeExceptionally(t);
        } finally {
            // TTL clock starts now (completion time), not at submission time.
            evictionScheduler.schedule(() -> {
                // Conditional remove: only deletes if this exact Entry is still mapped under `key`,
                // so it can never evict a newer entry that a post-eviction request already installed.
                cache.remove(entry.key, entry);
            }, ttlMillis, TimeUnit.MILLISECONDS);
        }
    }

    public void shutdown() {
        processingPool.shutdown();
        evictionScheduler.shutdown();
    }

    // ---------------------------------------------------------------- demo ----

    public static void main(String[] args) throws Exception {
        coalescing1000Concurrent();
        conflictingPayloadRejected();
        memoizedCacheHit();
        longJobOutlivesTtl();
        System.out.println("\nAll IdempotencyManagerFuture demos completed.");
    }

    private static void coalescing1000Concurrent() throws Exception {
        System.out.println("=== 1) 1000 concurrent identical requests coalesce onto ONE execution ===");
        IdempotencyManagerFuture<String> manager = new IdempotencyManagerFuture<>(5000);
        AtomicInteger executions = new AtomicInteger();
        String payload = "order-1:99.99";

        Function<Object, String> processor = p -> {
            executions.incrementAndGet();
            sleepQuietly(300); // simulated downstream work, NOT a wait/poll loop
            return "charged:" + p;
        };

        int n = 1000;
        // Must have >= n threads: every task blocks on go.await() before returning.
        ExecutorService callers = Executors.newFixedThreadPool(n);
        CountDownLatch allQueued = new CountDownLatch(n);
        CountDownLatch go = new CountDownLatch(1);
        List<CompletableFuture<String>> futures = new CopyOnWriteArrayList<>();

        for (int i = 0; i < n; i++) {
            callers.submit(() -> {
                allQueued.countDown();
                try {
                    go.await(); // hold every caller thread at the gate to maximize the race window
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                futures.add(manager.submit("order-key-1", payload, processor));
            });
        }
        allQueued.await();
        go.countDown(); // release all n threads at once
        callers.shutdown();
        callers.awaitTermination(15, TimeUnit.SECONDS);

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        long distinct = futures.stream().map(CompletableFuture::join).distinct().count();
        System.out.println("processor executions = " + executions.get() + " (expected 1)");
        System.out.println("distinct results among " + n + " callers = " + distinct + " (expected 1)");
        manager.shutdown();
    }

    private static void conflictingPayloadRejected() {
        System.out.println("\n=== 2) Conflicting payload on an IN_PROGRESS key is rejected ===");
        IdempotencyManagerFuture<String> manager = new IdempotencyManagerFuture<>(5000);
        Function<Object, String> slowProcessor = p -> {
            sleepQuietly(500);
            return "done";
        };

        CompletableFuture<String> first = manager.submit("order-key-2", "order-2:10.0", slowProcessor);
        sleepQuietly(50); // test-sequencing only: ensure `first` is IN_PROGRESS before racing it
        CompletableFuture<String> conflicting = manager.submit("order-key-2", "order-2:999.0", slowProcessor);

        try {
            conflicting.join();
            System.out.println("FAIL: expected ConflictException");
        } catch (Exception e) {
            System.out.println("Rejected as expected: " + e.getCause());
        }
        first.join();
        manager.shutdown();
    }

    private static void memoizedCacheHit() {
        System.out.println("\n=== 3) Post-completion call returns instantly, processor not re-invoked ===");
        IdempotencyManagerFuture<String> manager = new IdempotencyManagerFuture<>(5000);
        AtomicInteger executions = new AtomicInteger();
        Function<Object, String> processor = p -> {
            executions.incrementAndGet();
            return "ok";
        };

        manager.submit("order-key-3", "order-3:42.0", processor).join();
        long start = System.nanoTime();
        String cached = manager.submit("order-key-3", "order-3:42.0", processor).join();
        long elapsedMicros = (System.nanoTime() - start) / 1000;

        System.out.println("result=" + cached + ", executions=" + executions.get()
                + " (expected 1), elapsed=" + elapsedMicros + "us");
        manager.shutdown();
    }

    private static void longJobOutlivesTtl() {
        System.out.println("\n=== 4) Long job outliving the TTL: in-flight waiters unaffected by eviction ===");
        long ttlMillis = 200; // stands in for "5 minutes", compressed so the demo finishes quickly
        IdempotencyManagerFuture<String> manager = new IdempotencyManagerFuture<>(ttlMillis);
        AtomicInteger executions = new AtomicInteger();
        long jobDurationMillis = 1000; // stands in for "6 minutes" (> ttlMillis)

        Function<Object, String> processor = p -> {
            executions.incrementAndGet();
            sleepQuietly(jobDurationMillis);
            return "long-job-result";
        };

        CompletableFuture<String> first = manager.submit("order-key-4", "order-4:7.0", processor);
        sleepQuietly(50); // let it claim IN_PROGRESS before waiters pile on

        int waiterCount = 300; // stands in for "999 identical requests"
        List<CompletableFuture<String>> waiters = new ArrayList<>();
        for (int i = 0; i < waiterCount; i++) {
            waiters.add(manager.submit("order-key-4", "order-4:7.0", processor));
        }
        CompletableFuture.allOf(waiters.toArray(new CompletableFuture[0])).join();
        first.join();

        long distinct = waiters.stream().map(CompletableFuture::join).distinct().count();
        System.out.println("waiters=" + waiterCount + ", processor executions=" + executions.get()
                + " (expected 1), distinct results=" + distinct);

        // Job finished after the TTL window had already elapsed, so eviction fires almost
        // immediately after completion. Give the eviction scheduler time to actually run.
        sleepQuietly(ttlMillis + 150);

        // A genuinely NEW request after eviction is a cache miss and legitimately reprocesses.
        String afterEviction = manager.submit("order-key-4", "order-4:7.0", processor).join();
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
