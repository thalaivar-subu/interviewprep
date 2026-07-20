// APPROACH 2 - "Traditional" idempotency manager using sync.Mutex + sync.Cond.
//
// This is Go's direct equivalent of Java's synchronized/wait()/notifyAll() monitor idiom: a mutex
// protects an entry's fields, and a condition variable is what a waiter blocks on and what the
// completer broadcasts on. Unlike the future/channel-based approach (go/future), there is no
// channel here at all - just a mutex-guarded map and one Cond per entry.
//
// Run: go run ./go/traditional
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
	payload any
	mu      sync.Mutex // guards everything below, AND is the lock sync.Cond parks/wakes on
	cond    *sync.Cond
	status  status
	result  any
	err     error
}

func newEntry(key string, payload any) *entry {
	e := &entry{key: key, payload: payload, status: inProgress}
	e.cond = sync.NewCond(&e.mu)
	return e
}

var ErrConflict = errors.New("idempotency conflict: key is IN_PROGRESS with a different payload")

type Manager struct {
	mu    sync.Mutex // guards `cache` only - the map-level mutex
	cache map[string]*entry
	ttl   time.Duration
}

func NewManager(ttl time.Duration) *Manager {
	return &Manager{cache: make(map[string]*entry), ttl: ttl}
}

func (m *Manager) Submit(key string, payload any, processor func(any) (any, error)) (any, error) {
	fresh := newEntry(key, payload)

	// ATOMIC CLAIM: check-then-insert under `m.mu` - the manual mutex-guarded-map pattern. Exactly
	// one goroutine ever sees "absent" for a given key and becomes the winner.
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
	e.mu.Lock()
	defer e.mu.Unlock()

	// Once we hold `e`, we never touch `m.cache` again - so eviction racing with a slow job can't
	// affect a goroutine already parked here or already past this point.
	if e.status == inProgress && e.payload != payload {
		return nil, fmt.Errorf("%w: key=%s", ErrConflict, e.key) // reject immediately, no wait
	}

	// NO POLLING: cond.Wait() atomically unlocks e.mu and parks the goroutine until Broadcast() is
	// called, then re-locks e.mu before returning - a true OS-level wait, not a sleep-then-recheck
	// loop. The `for` (not `if`) is the standard defence against spurious wakeups, exactly like
	// Java's `while (status == IN_PROGRESS) entry.wait();` - it re-checks a field after waking, it
	// does not re-poll anything external.
	for e.status == inProgress {
		e.cond.Wait()
	}

	if e.status == failed {
		return nil, e.err
	}
	return e.result, nil
}

func (m *Manager) run(e *entry, processor func(any) (any, error)) {
	result, err := processor(e.payload)

	e.mu.Lock()
	e.result, e.err = result, err
	if err != nil {
		e.status = failed
	} else {
		e.status = completed
	}
	e.cond.Broadcast() // wakes every goroutine parked in cond.Wait() immediately
	e.mu.Unlock()

	// TTL clock starts now (completion time), not submission time. time.AfterFunc runs on its own
	// goroutine from the Go runtime's timer machinery - decoupled from processing goroutines.
	time.AfterFunc(m.ttl, func() {
		m.mu.Lock()
		defer m.mu.Unlock()
		// Conditional delete: only remove if this exact *entry is still mapped to the key, so a
		// newer entry that reused the key after this one was already evicted is never deleted.
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
	fmt.Println("\nAll traditional (mutex+cond) Go demos completed.")
}

func coalescingConcurrent() {
	fmt.Println("=== 1) 1000 concurrent identical requests coalesce onto ONE execution ===")
	m := NewManager(5 * time.Second)
	var executions int32
	var countMu sync.Mutex

	processor := func(p any) (any, error) {
		countMu.Lock()
		executions++
		countMu.Unlock()
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
	var countMu sync.Mutex
	jobDuration := 1000 * time.Millisecond // stands in for "6 minutes" (> ttl)

	processor := func(p any) (any, error) {
		countMu.Lock()
		executions++
		countMu.Unlock()
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
