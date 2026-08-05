// Rate Limiter -- lean reference implementation of the 5 algorithms in "1 - Algorithms.txt".
// No Redis here (none running in this environment -- no redis-server, no live Docker daemon) --
// logic lives directly in each class, same shape as the pseudocode there, using
// ConcurrentHashMap.compute() as the in-memory stand-in for "one atomic Lua script".
//
// RUN: cd "interviewprep/design/Rate Limiter" && java RateLimiterDemo.java   (Java 11+, no build step)
//
// Design patterns, and where each one is:
//   Strategy    - RateLimiter interface + the 5 implementations. Swap the algorithm, caller unchanged.
//   Factory     - RateLimiterFactory.create(type, ...) picks the concrete Strategy.
//   Decorator   - LoggingRateLimiter wraps ANY RateLimiter with logging, touches no algorithm class.
//   Chain of
//   Responsibility - ChainedRateLimiter runs several limiters in sequence (IP limit -> user limit ->
//                    endpoint limit, as "1 - Algorithms.txt" describes under "layered is normal").
//   Singleton   - not coded here, but this is where it'd go in a real app: one RateLimiterFactory
//                 instance per JVM, since it's stateless and every caller shares it.

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.LongSupplier;

// ---- Strategy -------------------------------------------------------------

interface RateLimiter {
    boolean allow(String key);
}

// ---- Factory ----------------------------------------------------------------

enum RateLimiterType { FIXED_WINDOW, SLIDING_LOG, SLIDING_COUNTER, TOKEN_BUCKET, LEAKY_BUCKET }

final class RateLimiterFactory {
    // clock defaults to real time; tests pass a fake one (see main) to control window boundaries
    // without sleeping -- a LongSupplier is enough, no custom Clock interface needed.
    static RateLimiter create(RateLimiterType type, int limit, long windowMs, LongSupplier clock) {
        return switch (type) {
            case FIXED_WINDOW    -> new FixedWindowLimiter(limit, windowMs, clock);
            case SLIDING_LOG     -> new SlidingLogLimiter(limit, windowMs, clock);
            case SLIDING_COUNTER -> new SlidingCounterLimiter(limit, windowMs, clock);
            case TOKEN_BUCKET    -> new TokenBucketLimiter(limit, windowMs, clock);
            case LEAKY_BUCKET    -> new LeakyBucketLimiter(limit, windowMs, clock);
        };
    }

    static RateLimiter create(RateLimiterType type, int limit, long windowMs) {
        return create(type, limit, windowMs, System::currentTimeMillis);
    }
}

// ---- 1. Fixed Window Counter ------------------------------------------------

final class FixedWindowLimiter implements RateLimiter {
    private record State(long slot, int count) {}

    private final int limit;
    private final long windowMs;
    private final LongSupplier clock;
    private final Map<String, State> state = new ConcurrentHashMap<>();

    FixedWindowLimiter(int limit, long windowMs, LongSupplier clock) {
        this.limit = limit; this.windowMs = windowMs; this.clock = clock;
    }

    public boolean allow(String key) {
        long slot = clock.getAsLong() / windowMs;
        State s = state.compute(key, (k, v) ->
            (v == null || v.slot() != slot) ? new State(slot, 1) : new State(slot, v.count() + 1));
        return s.count() <= limit;
    }
}

// ---- 2. Sliding Window Log ---------------------------------------------------

final class SlidingLogLimiter implements RateLimiter {
    private final int limit;
    private final long windowMs;
    private final LongSupplier clock;
    private final Map<String, Deque<Long>> log = new ConcurrentHashMap<>();

    SlidingLogLimiter(int limit, long windowMs, LongSupplier clock) {
        this.limit = limit; this.windowMs = windowMs; this.clock = clock;
    }

    public boolean allow(String key) {
        long now = clock.getAsLong(), cutoff = now - windowMs;
        boolean[] ok = {false};
        log.compute(key, (k, d) -> {
            Deque<Long> dq = d == null ? new ArrayDeque<>() : d;
            while (!dq.isEmpty() && dq.peekFirst() <= cutoff) dq.pollFirst();   // evict expired
            if (ok[0] = dq.size() < limit) dq.addLast(now);
            return dq;
        });
        return ok[0];
    }
}

// ---- 3. Sliding Window Counter -----------------------------------------------

final class SlidingCounterLimiter implements RateLimiter {
    private record State(long slot, int curr, int prev) {}

    private final int limit;
    private final long windowMs;
    private final LongSupplier clock;
    private final Map<String, State> state = new ConcurrentHashMap<>();

    SlidingCounterLimiter(int limit, long windowMs, LongSupplier clock) {
        this.limit = limit; this.windowMs = windowMs; this.clock = clock;
    }

    /** Test hook only -- lets a demo reproduce a specific (prev, curr) pair without N real calls. */
    void seed(String key, long slot, int curr, int prev) { state.put(key, new State(slot, curr, prev)); }

    public boolean allow(String key) {
        long now = clock.getAsLong();
        long slot = now / windowMs;
        double elapsed = (now % windowMs) / (double) windowMs;
        boolean[] ok = {false};
        state.compute(key, (k, s) -> {
            int curr = 0, prev = 0;
            if (s != null && s.slot() == slot) { curr = s.curr(); prev = s.prev(); }
            else if (s != null && s.slot() == slot - 1) { prev = s.curr(); }
            ok[0] = prev * (1 - elapsed) + curr < limit;                       // interpolated estimate
            return new State(slot, ok[0] ? curr + 1 : curr, prev);
        });
        return ok[0];
    }
}

// ---- 4. Token Bucket ----------------------------------------------------------

final class TokenBucketLimiter implements RateLimiter {
    private record Bucket(double tokens, long lastMs) {}

    private final double capacity, refillPerSec;
    private final LongSupplier clock;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    TokenBucketLimiter(int capacity, long windowMs, LongSupplier clock) {
        this.capacity = capacity;
        this.refillPerSec = capacity * 1000.0 / windowMs;
        this.clock = clock;
    }

    public boolean allow(String key) { return allow(key, 1); }

    public boolean allow(String key, int cost) {
        long now = clock.getAsLong();
        boolean[] ok = {false};
        buckets.compute(key, (k, b) -> {
            double tokens = b == null ? capacity
                : Math.min(capacity, b.tokens() + (now - b.lastMs()) / 1000.0 * refillPerSec);   // lazy refill
            if (ok[0] = tokens >= cost) tokens -= cost;
            return new Bucket(tokens, now);
        });
        return ok[0];
    }
}

// ---- 5. Leaky Bucket ------------------------------------------------------------

final class LeakyBucketLimiter implements RateLimiter {
    private record Bucket(double queued, long lastMs) {}

    private final double capacity, leakPerSec;
    private final LongSupplier clock;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    LeakyBucketLimiter(int capacity, long windowMs, LongSupplier clock) {
        this.capacity = capacity;
        this.leakPerSec = capacity * 1000.0 / windowMs;
        this.clock = clock;
    }

    public boolean allow(String key) {
        long now = clock.getAsLong();
        boolean[] ok = {false};
        buckets.compute(key, (k, b) -> {
            double queued = b == null ? 0
                : Math.max(0, b.queued() - (now - b.lastMs()) / 1000.0 * leakPerSec);   // lazy drain
            if (ok[0] = queued + 1 <= capacity) queued += 1;
            return new Bucket(queued, now);
        });
        return ok[0];
    }
}

// ---- Decorator ------------------------------------------------------------------

/** Wraps any RateLimiter with logging. The algorithm classes above know nothing about this. */
final class LoggingRateLimiter implements RateLimiter {
    private final RateLimiter delegate;
    private final String name;

    LoggingRateLimiter(RateLimiter delegate, String name) { this.delegate = delegate; this.name = name; }

    public boolean allow(String key) {
        boolean allowed = delegate.allow(key);
        System.out.println("  [" + name + "] " + key + " -> " + (allowed ? "ALLOW" : "DENY"));
        return allowed;
    }
}

// ---- Chain of Responsibility ------------------------------------------------------

/** Every link must allow; short-circuits on the first denial. Models layered limits. */
final class ChainedRateLimiter implements RateLimiter {
    private final List<RateLimiter> chain;
    ChainedRateLimiter(RateLimiter... chain) { this.chain = List.of(chain); }

    public boolean allow(String key) {
        for (RateLimiter link : chain) if (!link.allow(key)) return false;
        return true;
    }
}

// ---- Demo / verification ---------------------------------------------------------

public class RateLimiterDemo {

    public static void main(String[] args) throws Exception {
        boundaryBurstFixedVsSlidingLog();
        slidingWindowCounterWorkedExample();
        tokenBucketBurstAndWeightedCost();
        leakyBucketConstantDrain();
        decoratorAndChain();
        concurrencyNoOverAdmission();
        System.out.println("\nALL CHECKS PASSED");
    }

    // Fake clock: no interface, just a mutable long behind a method reference.
    static AtomicLong fakeNow(long start) { return new AtomicLong(start); }

    static void boundaryBurstFixedVsSlidingLog() {
        System.out.println("\n-- Fixed Window's 2x boundary burst, vs Sliding Log --");
        AtomicLong clock = fakeNow(0);
        RateLimiter fixed = RateLimiterFactory.create(RateLimiterType.FIXED_WINDOW, 5, 60_000, clock::get);
        RateLimiter log = RateLimiterFactory.create(RateLimiterType.SLIDING_LOG, 5, 60_000, clock::get);

        clock.set(59_000);
        int fixedEnd = burst(fixed, "u1", 5);
        int logEnd = burst(log, "u2", 5);

        clock.set(61_000);   // crosses the 60s boundary
        int fixedStart = burst(fixed, "u1", 5);
        int logStart = burst(log, "u2", 5);

        check(fixedEnd + fixedStart == 10, "fixed window: 10 admitted within 2s (limit 5/60s) -- the burst");
        check(logEnd + logStart == 5, "sliding log: only 5 admitted across the same boundary");
    }

    static void slidingWindowCounterWorkedExample() {
        System.out.println("\n-- Sliding Window Counter, notes' worked example (prev=84, curr=36, elapsed=0.25) --");
        long windowMs = 60_000;
        AtomicLong clock = fakeNow(100 * windowMs + 15_000);   // 15s into window 100 -> elapsed = 0.25
        SlidingCounterLimiter rl = new SlidingCounterLimiter(100, windowMs, clock::get);
        rl.seed("u1", 100, 36, 84);

        check(rl.allow("u1"), "estimate 84*0.75 + 36 = 99 < 100 -> allowed");
        check(!rl.allow("u1"), "next pushes estimate to 100 -> denied");
    }

    static void tokenBucketBurstAndWeightedCost() {
        System.out.println("\n-- Token Bucket: burst, lazy refill, weighted cost --");
        AtomicLong clock = fakeNow(0);
        TokenBucketLimiter rl = new TokenBucketLimiter(10, 10_000, clock::get);   // 10 cap, 1/sec refill

        check(burst(rl, "u1", 10) == 10, "full capacity spendable as an instant burst");
        check(!rl.allow("u1"), "11th denied -- empty");
        clock.addAndGet(1000);
        check(rl.allow("u1"), "1 token back after 1s (lazy refill, no timer thread)");

        clock.addAndGet(0);
        check(rl.allow("u2", 3) && rl.allow("u2", 7), "cost=3 then cost=7 drain a fresh 10-token bucket exactly");
        check(!rl.allow("u2"), "bucket now empty");
    }

    static void leakyBucketConstantDrain() {
        System.out.println("\n-- Leaky Bucket: overflow drop + constant drain --");
        AtomicLong clock = fakeNow(0);
        LeakyBucketLimiter rl = new LeakyBucketLimiter(5, 5000, clock::get);   // cap 5, 1/sec leak

        check(burst(rl, "u1", 5) == 5, "queue fills to capacity");
        check(!rl.allow("u1"), "6th dropped -- full");
        clock.addAndGet(2000);
        check(burst(rl, "u1", 2) == 2, "2 slots freed after 2s at 1/sec");
        check(!rl.allow("u1"), "3rd still denied -- only 2 had leaked");
    }

    static void decoratorAndChain() {
        System.out.println("\n-- Decorator (logging) + Chain of Responsibility (layered limits) --");
        AtomicLong clock = fakeNow(0);
        RateLimiter ipLimit = new LoggingRateLimiter(
            RateLimiterFactory.create(RateLimiterType.FIXED_WINDOW, 100, 60_000, clock::get), "ip");
        RateLimiter userLimit = new LoggingRateLimiter(
            RateLimiterFactory.create(RateLimiterType.TOKEN_BUCKET, 2, 60_000, clock::get), "user");

        RateLimiter layered = new ChainedRateLimiter(ipLimit, userLimit);   // IP limit -> user limit
        check(layered.allow("k"), "1st passes both links");
        check(layered.allow("k"), "2nd passes both links");
        check(!layered.allow("k"), "3rd denied by the user link -- chain short-circuits");
    }

    static void concurrencyNoOverAdmission() throws Exception {
        System.out.println("\n-- Concurrency: 200 threads, limit 20, real clock --");
        RateLimiter rl = RateLimiterFactory.create(RateLimiterType.TOKEN_BUCKET, 20, 3_600_000);   // real clock

        ExecutorService pool = Executors.newFixedThreadPool(50);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger allowed = new AtomicInteger();
        var futures = new java.util.ArrayList<java.util.concurrent.Future<?>>();
        for (int i = 0; i < 200; i++) {
            futures.add(pool.submit(() -> {
                try { start.await(); if (rl.allow("hot")) allowed.incrementAndGet(); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }));
        }
        start.countDown();
        for (var f : futures) f.get();
        pool.shutdown();

        check(allowed.get() == 20, "exactly 20 of 200 concurrent requests admitted (got " + allowed.get()
            + ") -- compute() keeps the read-modify-write atomic per key");
    }

    static int burst(RateLimiter rl, String key, int attempts) {
        int n = 0;
        for (int i = 0; i < attempts; i++) if (rl.allow(key)) n++;
        return n;
    }

    static void check(boolean condition, String claim) {
        if (!condition) throw new AssertionError("FAILED: " + claim);
        System.out.println("  ok - " + claim);
    }
}
