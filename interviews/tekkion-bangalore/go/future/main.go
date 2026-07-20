// APPROACH 1 - "Future"-style idempotency manager using a channel as the coordination primitive.
//
// Closing a channel is Go's idiom for a broadcast-once "future": every goroutine that later does
// `<-entry.done` (even goroutines that call receive AFTER the channel is closed) unblocks
// immediately with a zero value, instead of blocking forever. That's exactly what CompletableFuture
// / a resolved Promise gives you in other languages - here it's built from a plain channel instead
// of a library type.
//
// Run: go run ./go/future
package main

import (
	"errors"
	"fmt"
	"sync"
	"time"
)

type status int

const (
	inProgress status = iota
	completed
	failed
)

type entry struct {
	key     string
	payload any // compared with `!=` below - must be a comparable type (string, int, a struct of
	// comparable fields, ...); a slice/map/func payload would panic on comparison, same as a Java
	// payload type needing equals()/hashCode() defined.
	done    chan struct{} // closed exactly once, by the winner's goroutine - the "future"
	status  status
	result  any
	err     error
}

var ErrConflict = errors.New("idempotency conflict: key is IN_PROGRESS with a different payload")

type Manager struct {
	mu    sync.Mutex // guards `cache` - Go's map is not safe for concurrent access on its own
	cache map[string]*entry
	ttl   time.Duration
}

func NewManager(ttl time.Duration) *Manager {
	return &Manager{cache: make(map[string]*entry), ttl: ttl}
}

// Submit runs processor(payload) at most once per key and returns its result to every caller
// that coalesces onto the same in-flight or completed key.
func (m *Manager) Submit(key string, payload any, processor func(any) (any, error)) (any, error) {
	fresh := &entry{key: key, payload: payload, done: make(chan struct{})}

	// ATOMIC CLAIM: the whole check-then-insert happens while holding `m.mu`, so no two goroutines
	// can ever both observe "absent" for the same key. This is the direct Go analogue of
	// ConcurrentHashMap.putIfAbsent - a mutex-guarded map, not a lock-free map type.
	m.mu.Lock()
	existing, present := m.cache[key]
	var weAreTheWinner bool
	if !present {
		m.cache[key] = fresh
		weAreTheWinner = true
	}
	m.mu.Unlock()

	if weAreTheWinner {
		go m.run(fresh, processor) // exactly one goroutine ever runs processor for this key
		return m.await(fresh, payload)
	}
	return m.await(existing, payload)
}

func (m *Manager) await(e *entry, payload any) (any, error) {
	// e.payload is written once, before the entry is published into m.cache under m.mu, and never
	// mutated again - so comparing it here from any goroutine is safe without extra locking (the
	// map lock's happens-before edge already covers it). This also means conflicts are rejected
	// before we ever wait, satisfying requirement 2.
	if e.payload != payload {
		return nil, fmt.Errorf("%w: key=%s", ErrConflict, e.key)
	}

	// NO POLLING: receiving from e.done blocks until close(e.done) runs in run() below (an
	// OS-level wakeup), or returns immediately if it's already closed (cache hit - memoized).
	// Per the Go memory model, "a receive from a closed channel happens after the close" - so
	// e.status/e.result/e.err, all written in run() BEFORE close(e.done), are safe to read below
	// without a mutex: the channel receive is what makes those writes visible here. Reading them
	// before this receive (as an earlier draft of this function did) would be a data race.
	<-e.done

	if e.status == failed {
		return nil, e.err
	}
	return e.result, nil
}

func (m *Manager) run(e *entry, processor func(any) (any, error)) {
	result, err := processor(e.payload)
	e.result, e.err = result, err
	if err != nil {
		e.status = failed
	} else {
		e.status = completed
	}
	close(e.done) // wakes every goroutine blocked in `<-e.done` immediately, and every future receive

	// TTL clock starts now (completion time), not submission time. time.AfterFunc runs the
	// callback on its own goroutine from the Go runtime's timer machinery - not on any processing
	// goroutine, and not a sleep-loop.
	time.AfterFunc(m.ttl, func() {
		m.mu.Lock()
		defer m.mu.Unlock()
		// Conditional delete: only remove if this exact *entry is still the one mapped to the key,
		// so a newer entry that reused the key after this one was already evicted is never
		// accidentally deleted.
		if m.cache[e.key] == e {
			delete(m.cache, e.key)
		}
	})
}

// ---------------------------------------------------------------------------------------------
// demo

func main() {
	coalescingConcurrent()
	conflictingPayloadRejected()
	memoizedCacheHit()
	longJobOutlivesTTL()
	fmt.Println("\nAll future-based Go demos completed.")
}

func coalescingConcurrent() {
	fmt.Println("=== 1) 1000 concurrent identical requests coalesce onto ONE execution ===")
	m := NewManager(5 * time.Second)
	var executions int32
	var mu sync.Mutex

	processor := func(p any) (any, error) {
		mu.Lock()
		executions++
		mu.Unlock()
		time.Sleep(300 * time.Millisecond) // simulated downstream work, NOT a wait/poll loop
		return fmt.Sprintf("charged:%v", p), nil
	}

	const n = 1000
	results := make([]any, n)
	var wg, ready sync.WaitGroup
	start := make(chan struct{})
	wg.Add(n)
	ready.Add(n)
	for i := 0; i < n; i++ {
		i := i
		go func() {
			ready.Done()
			<-start // hold every goroutine at the gate to maximize the race window
			defer wg.Done()
			res, _ := m.Submit("order-key-1", "order-1:99.99", processor)
			results[i] = res
		}()
	}
	ready.Wait()
	close(start) // release all 1000 goroutines at once
	wg.Wait()

	distinct := map[any]bool{}
	for _, r := range results {
		distinct[r] = true
	}
	fmt.Printf("processor executions = %d (expected 1)\n", executions)
	fmt.Printf("distinct results among %d callers = %d (expected 1)\n", n, len(distinct))
}

func conflictingPayloadRejected() {
	fmt.Println("\n=== 2) Conflicting payload on an IN_PROGRESS key is rejected ===")
	m := NewManager(5 * time.Second)
	slow := func(p any) (any, error) {
		time.Sleep(500 * time.Millisecond)
		return "done", nil
	}

	go m.Submit("order-key-2", "order-2:10.0", slow)
	time.Sleep(50 * time.Millisecond) // test-sequencing only: ensure it's IN_PROGRESS before racing

	_, err := m.Submit("order-key-2", "order-2:999.0", slow)
	if errors.Is(err, ErrConflict) {
		fmt.Println("Rejected as expected:", err)
	} else {
		fmt.Println("FAIL: expected ErrConflict, got", err)
	}
	time.Sleep(500 * time.Millisecond) // let the first call finish before the process could exit
}

func memoizedCacheHit() {
	fmt.Println("\n=== 3) Post-completion call returns instantly, processor not re-invoked ===")
	m := NewManager(5 * time.Second)
	var executions int
	processor := func(p any) (any, error) {
		executions++
		return "ok", nil
	}

	m.Submit("order-key-3", "order-3:42.0", processor)
	start := time.Now()
	cached, _ := m.Submit("order-key-3", "order-3:42.0", processor)
	elapsed := time.Since(start)

	fmt.Printf("result=%v, executions=%d (expected 1), elapsed=%v\n", cached, executions, elapsed)
}

func longJobOutlivesTTL() {
	fmt.Println("\n=== 4) Long job outliving the TTL: in-flight waiters unaffected by eviction ===")
	ttl := 200 * time.Millisecond // stands in for "5 minutes", compressed for a runnable demo
	m := NewManager(ttl)
	var executions int32
	var mu sync.Mutex
	jobDuration := 1000 * time.Millisecond // stands in for "6 minutes" (> ttl)

	processor := func(p any) (any, error) {
		mu.Lock()
		executions++
		mu.Unlock()
		time.Sleep(jobDuration)
		return "long-job-result", nil
	}

	go m.Submit("order-key-4", "order-4:7.0", processor)
	time.Sleep(50 * time.Millisecond) // let it claim IN_PROGRESS before waiters pile on

	const waiterCount = 300 // stands in for "999 identical requests"
	results := make([]any, waiterCount)
	var wg sync.WaitGroup
	wg.Add(waiterCount)
	for i := 0; i < waiterCount; i++ {
		i := i
		go func() {
			defer wg.Done()
			res, _ := m.Submit("order-key-4", "order-4:7.0", processor)
			results[i] = res
		}()
	}
	wg.Wait()

	distinct := map[any]bool{}
	for _, r := range results {
		distinct[r] = true
	}
	fmt.Printf("waiters=%d, processor executions=%d (expected 1), distinct results=%d\n",
		waiterCount, executions, len(distinct))

	// Job finished after the TTL window had already elapsed, so eviction fires almost immediately
	// after completion. Give the eviction timer time to actually run.
	time.Sleep(ttl + 150*time.Millisecond)

	// A genuinely NEW request after eviction is a cache miss and legitimately reprocesses.
	afterEviction, _ := m.Submit("order-key-4", "order-4:7.0", processor)
	fmt.Printf("post-eviction resubmit result=%v, executions now=%d (expected 2)\n", afterEviction, executions)
}
