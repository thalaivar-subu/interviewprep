# Java CompletableFuture — for people who know JS Promises

The APIs look like Promises. The execution model is completely different, and that difference is where every bug and every interview question lives.

## Mental model first

```
JavaScript                              Java
----------                              ----
ONE thread. Callbacks queued on the     MANY threads. Each stage runs ON a thread
event loop. "async" = "runs later",     from a pool. "async" = "runs elsewhere,
never "runs in parallel".               genuinely in parallel".

  main ──┬─ task ─┐                       pool-1 ── task A ──┐
         │        │  (interleaved)        pool-2 ── task B ──┼─ join
         └────────┴─ callback             pool-3 ── task C ──┘
```

Consequences that follow from this, and they are the whole story:

| | JS Promise | Java CompletableFuture |
|---|---|---|
| Runs on | single event-loop thread | a thread from a pool (default `ForkJoinPool.commonPool()`) |
| Blocking is | impossible (`await` yields) | real — `join()` parks an OS thread |
| Starts executing | eagerly, at construction | eagerly, on submit to the pool |
| Callback thread | always the main thread | *whichever thread completed the previous stage* — non-deterministic |
| Value + error types | untyped (`any`) | `CompletableFuture<T>`, errors are `Throwable` |
| Auto-flattening | yes — `.then` unwraps nested promises | **no** — you must pick `thenApply` vs `thenCompose` |
| ThreadLocal / MDC / SecurityContext | n/a | **does not propagate** across stages |

The last two rows cause most real bugs.

## Cheat sheet

| Java | JavaScript | Returns | Use when |
|---|---|---|---|
| `completedFuture(v)` | `Promise.resolve(v)` | `CF<T>` | you already have the value |
| `failedFuture(e)` | `Promise.reject(e)` | `CF<T>` | you already have the error (Java 9+) |
| `supplyAsync(sup)` | `(async () => v)()` | `CF<T>` | run work off-thread, **returns a value** |
| `runAsync(run)` | `(async () => {})()` | `CF<Void>` | run work off-thread, **no value** |
| `thenApply(fn)` | `.then(v => u)` | `CF<U>` | sync transform |
| `thenCompose(fn)` | `.then(v => promise)` | `CF<U>` | transform that **returns another future** |
| `thenAccept(con)` | `.then(v => {...})` | `CF<Void>` | consume the value, return nothing |
| `thenRun(run)` | `.then(() => {...})` | `CF<Void>` | run after, **ignore** the value |
| `thenCombine(o, fn)` | `Promise.all([a,b]).then(...)` | `CF<V>` | merge **two** futures into one value |
| `allOf(a, b, c)` | `Promise.all([...])` | `CF<Void>` ⚠️ | wait for **all** |
| `anyOf(a, b, c)` | `Promise.race([...])` | `CF<Object>` ⚠️ | first to **settle** |
| `exceptionally(fn)` | `.catch(e => fallback)` | `CF<T>` | recover from failure |
| `handle(bifn)` | `.then(onOk, onErr)` | `CF<U>` | handle **both** outcomes, can transform |
| `whenComplete(bicon)` | `.finally(...)` | `CF<T>` | side effect, **cannot** change the result |
| `join()` | `await` | `T` | block and get value (unchecked exception) |
| `get()` | `await` | `T` | block and get value (checked exceptions) |

⚠️ = behaves meaningfully differently from the JS equivalent. Details below.

---

## 1. Creating

### `completedFuture` / `failedFuture`
Already-settled futures. Mostly for tests, cache hits, and early returns.

```java
CompletableFuture<String> a = CompletableFuture.completedFuture("cached");
CompletableFuture<String> b = CompletableFuture.failedFuture(new IllegalStateException());
```
```js
const a = Promise.resolve("cached");
const b = Promise.reject(new Error());
```

### `supplyAsync` — has a return value
```java
CompletableFuture<User> f = CompletableFuture.supplyAsync(() -> userRepo.findById(id), executor);
```
```js
const f = (async () => userRepo.findById(id))();
```
**Always pass an executor.** The no-arg overload uses `ForkJoinPool.commonPool()`, which is sized to `CPU - 1` and shared by the whole JVM (including parallel streams). One blocking DB call on it starves everything else.

### `runAsync` — no return value
```java
CompletableFuture<Void> f = CompletableFuture.runAsync(() -> auditLog.write(evt), executor);
```
```js
const f = (async () => { auditLog.write(evt); })();
```

Use `supplyAsync` when you need the result, `runAsync` for fire-and-forget side effects.

---

## 2. Transforming

### `thenApply` vs `thenCompose` — the #1 gotcha

JS `.then` auto-flattens: return a value or a promise, it just works. **Java does not.** You choose:

| | callback returns | result |
|---|---|---|
| `thenApply` | a plain value `U` | `CF<U>` ✅ |
| `thenApply` | a future `CF<U>` | `CF<CF<U>>` ❌ nested |
| `thenCompose` | a future `CF<U>` | `CF<U>` ✅ flattened |

```java
// ❌ nested — you now have to join twice
CompletableFuture<CompletableFuture<Order>> bad =
    findUser(id).thenApply(user -> findOrder(user));   // findOrder returns CF<Order>

// ✅ flattened
CompletableFuture<Order> good =
    findUser(id).thenCompose(user -> findOrder(user));

// ✅ thenApply is correct when the callback is genuinely sync
CompletableFuture<String> name = findUser(id).thenApply(User::getName);
```
```js
// JS: .then does both. This is why the distinction feels alien.
const bad  = findUser(id).then(user => findOrder(user));   // already flat
const name = findUser(id).then(user => user.name);
```

> **Remember it as:** `thenApply` = `map`, `thenCompose` = `flatMap`. Identical to `Optional`/`Stream`.

### `thenAccept` vs `thenRun`

Both return `CF<Void>`. The difference is only whether you get the value.

```java
findUser(id).thenAccept(user -> log.info("got {}", user));  // receives the value
findUser(id).thenRun(()      -> log.info("done"));          // no access to it
```
```js
findUser(id).then(user => console.log(user));
findUser(id).then(()   => console.log("done"));
```

| | gets the value? | typical use |
|---|---|---|
| `thenApply` | yes, returns new value | transform |
| `thenAccept` | yes, returns nothing | terminal side effect using the result |
| `thenRun` | **no** | terminal side effect that doesn't care (close, metric, latch) |

`thenRun` is *not* `finally` — it is skipped if the stage failed. `whenComplete` is the real `finally`.

---

## 3. Combining

### `thenCombine` — two futures, one result
Runs both in parallel, merges when both are done.

```java
CompletableFuture<User>    u = supplyAsync(() -> userSvc.get(id), ex);
CompletableFuture<Account> a = supplyAsync(() -> acctSvc.get(id), ex);

CompletableFuture<Profile> p = u.thenCombine(a, (user, acct) -> new Profile(user, acct));
```
```js
const p = Promise.all([userSvc.get(id), acctSvc.get(id)])
                 .then(([user, acct]) => new Profile(user, acct));
```

Siblings: `thenAcceptBoth` (consume both, return void), `runAfterBoth` (ignore both).

### `allOf` vs `Promise.all` ⚠️

**`allOf` returns `CF<Void>` — it does not collect the results.** This surprises everyone coming from JS.

```java
List<CompletableFuture<Item>> futures = ids.stream()
    .map(id -> supplyAsync(() -> fetch(id), ex))
    .toList();

CompletableFuture<List<Item>> all =
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
        .thenApply(v -> futures.stream()
                               .map(CompletableFuture::join)   // safe: all already complete
                               .toList());
```
```js
const all = await Promise.all(ids.map(id => fetch(id)));   // results come back directly
```

Second difference — **failure timing**:

| | on first failure |
|---|---|
| `Promise.all` | rejects **immediately**, doesn't wait for the rest |
| `allOf` | **waits for all** to complete, then completes exceptionally |

So `allOf` gives you slower failure but a guarantee that nothing is still in flight.

### `anyOf` vs `Promise.race` / `Promise.any` ⚠️

```java
CompletableFuture<Object> first = CompletableFuture.anyOf(primary, replica);  // note: Object
```
```js
const first = await Promise.race([primary, replica]);
```

Two catches:
- **Returns `CF<Object>`**, not `CF<T>` — you lose the type and must cast.
- It is `Promise.race` semantics: the first to **settle**, *including a failure*. There is **no built-in equivalent of `Promise.any`** (first to *succeed*, ignoring failures). Build it with `exceptionally` returning a never-completing future, or use a library.

---

## 4. Error handling — `exceptionally` vs `handle` vs `whenComplete`

| Method | Runs on success | Runs on failure | Can change result | Can swallow error | JS analogue |
|---|---|---|---|---|---|
| `exceptionally` | no | yes | yes (recovers) | **yes** | `.catch()` |
| `handle` | yes | yes | yes | **yes** | `.then(onOk, onErr)` |
| `whenComplete` | yes | yes | **no** | **no** | `.finally()` |

```java
// exceptionally — recover with a fallback, same type
findUser(id).exceptionally(e -> User.ANONYMOUS);

// handle — see both outcomes, may change the type
findUser(id).handle((user, err) -> err != null ? "error" : user.getName());   // CF<String>

// whenComplete — observe only. The original result/exception passes straight through.
findUser(id).whenComplete((user, err) -> {
    if (err != null) metrics.increment("user.fetch.fail");
    span.close();
});   // still CF<User>, still fails if it failed
```
```js
findUser(id).catch(e => ANONYMOUS);
findUser(id).then(u => u.name, e => "error");
findUser(id).finally(() => span.close());
```

**Key rule:** `whenComplete` cannot rescue a failure — the exception keeps propagating. If you meant to recover, you need `exceptionally` or `handle`.

### `CompletionException` wrapping
Exceptions thrown inside a stage arrive **wrapped**. Always unwrap:

```java
.exceptionally(e -> {
    Throwable cause = (e instanceof CompletionException) ? e.getCause() : e;
    ...
});
```

---

## 5. Extracting the value — `join` vs `get`

| | `join()` | `get()` |
|---|---|---|
| Throws | `CompletionException` (**unchecked**) | `ExecutionException` + `InterruptedException` (**checked**) |
| Timeout overload | no | `get(5, SECONDS)` ✅ |
| Usable in lambdas/streams | **yes** — no checked exception | awkward — needs try/catch |

```java
String a = future.join();                        // preferred in chains and streams
String b = future.get(5, TimeUnit.SECONDS);      // when you need a timeout
```
```js
const a = await future;   // never blocks a thread — the crucial difference
```

**`await` and `join()` are not equivalent.** `await` yields the event loop; `join()` parks a real OS thread. That's why blocking is free in JS and expensive in Java (pre-virtual-threads).

---

## 6. The `Async` suffix

Every `thenX` has a `thenXAsync` twin. This is not decoration:

| Form | Callback runs on |
|---|---|
| `thenApply(fn)` | the thread that completed the previous stage — **or the calling thread** if it was already complete |
| `thenApplyAsync(fn)` | `ForkJoinPool.commonPool()` |
| `thenApplyAsync(fn, ex)` | your executor ✅ |

So a non-`Async` callback can silently run on a Netty IO thread, a DB driver's callback thread, or your main thread. If the callback does anything slow, use the `Async` form with an explicit executor.

---

## 7. Spring Boot

### Returning a future from a controller

```java
@GetMapping("/orders/{id}")
public CompletableFuture<Order> getOrder(@PathVariable String id) {
    return orderService.findAsync(id);      // servlet thread is released immediately
}
```

Request lifecycle:

```
1. request arrives      → Tomcat thread (http-nio-8080-exec-1) picks it up
2. controller returns CF → Tomcat thread is RELEASED back to the pool  ← the whole point
3. work runs            → your @Async / task executor thread
4. future completes     → Spring dispatches the request back into the container
5. response written     → a Tomcat thread (possibly a different one)
```

Under load this is the win: a slow downstream call no longer holds a scarce container thread hostage. It does **not** make the request faster — only more scalable.

### `@Async` on a service

```java
@Configuration
@EnableAsync                              // required, else @Async is silently ignored
class AsyncConfig {
    @Bean("appExecutor")
    Executor executor() {
        ThreadPoolTaskExecutor e = new ThreadPoolTaskExecutor();
        e.setCorePoolSize(10); e.setMaxPoolSize(50); e.setQueueCapacity(200);
        e.setThreadNamePrefix("app-");
        e.initialize();
        return e;
    }
}

@Service
class OrderService {
    @Async("appExecutor")
    public CompletableFuture<Order> findAsync(String id) {
        return CompletableFuture.completedFuture(repo.findById(id));
    }
}
```

Spring gotchas, all commonly asked:
- **`@Async` is proxy-based** — calling it from another method *in the same class* bypasses the proxy and runs synchronously. Same trap as `@Transactional`.
- **Must be `public`** and return `void`, `Future`, or `CompletableFuture`.
- **Default executor is bad.** Without a configured bean, Spring Boot may fall back to `SimpleAsyncTaskExecutor`, which creates a **new thread per task** — unbounded. Always define your own.
- **Context does not propagate**: `SecurityContextHolder`, MDC (log correlation ids), `@Transactional`, and request-scoped beans are all `ThreadLocal`-based and are **empty on the async thread**. Fix with `DelegatingSecurityContextAsyncTaskExecutor`, an MDC-copying task decorator, or Micrometer `ContextPropagation`.
- **A transaction cannot span threads.** `@Async` + `@Transactional` on the same method does not do what you want.
- Timeout via `spring.mvc.async.request-timeout`.

---

## 8. Java 21 Virtual Threads — this changes the advice

Virtual threads make blocking cheap: a blocked virtual thread **unmounts** from its carrier OS thread instead of parking it. Millions of them are fine.

The entire reason CompletableFuture chaining existed — *"never block a platform thread"* — largely evaporates.

```java
// Before (Java 8-17): async to avoid blocking
CompletableFuture<Profile> p = supplyAsync(() -> userSvc.get(id), ex)
    .thenCombine(supplyAsync(() -> acctSvc.get(id), ex), Profile::new);

// Java 21: just block. On a virtual thread this costs almost nothing.
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {   // preview API
    var user = scope.fork(() -> userSvc.get(id));
    var acct = scope.fork(() -> acctSvc.get(id));
    scope.join().throwIfFailed();
    return new Profile(user.get(), acct.get());
}
```

Enable in Spring Boot 3.2+:
```properties
spring.threads.virtual.enabled=true
```

| Use | Recommendation |
|---|---|
| Plain blocking IO (DB, HTTP) | **Virtual threads.** Simpler, readable stack traces, no pool tuning. |
| Fan-out / parallel calls | **Structured concurrency** (`StructuredTaskScope`) — still preview, so `CompletableFuture` remains the stable choice. |
| Wrapping callback-based APIs | **CompletableFuture** — still the right tool. |
| CPU-bound work | **Platform threads.** Virtual threads give nothing here; you're limited by cores. |

Caveats worth knowing:
- In JDK 21, a virtual thread **pins** its carrier inside a `synchronized` block or a native frame — blocking there blocks a real OS thread. Prefer `ReentrantLock`. (JEP 491 in JDK 24 removed the `synchronized` pinning.)
- Virtual threads don't make anything faster — they raise the concurrency ceiling, nothing more.
- `ThreadLocal` still works but is now per-virtual-thread, so pooling/caching idioms built on it can blow up in memory.

---

## 9. Pitfalls

| # | Pitfall | Fix |
|---|---|---|
| 1 | `join()` in the middle of a chain | Chain with `thenCompose`; block only once, at the very edge |
| 2 | Blocking IO on `commonPool()` | Always pass a dedicated executor to `supplyAsync` |
| 3 | `thenApply` on a future-returning fn → `CF<CF<T>>` | Use `thenCompose` |
| 4 | Exception silently swallowed — no terminal `join`/`handle` | Always terminate the chain with `exceptionally`/`handle`, or `join` it |
| 5 | `whenComplete` used to "catch" an error | It cannot recover; use `exceptionally`/`handle` |
| 6 | `allOf(...)` then expecting results | It's `CF<Void>` — `join()` each future afterwards |
| 7 | `@Async` called from the same class | Proxy bypassed — move to another bean |
| 8 | MDC / SecurityContext missing on async thread | Task decorator or context propagation |
| 9 | Unwrapped `CompletionException` in error handlers | Unwrap `.getCause()` |
| 10 | Unbounded queue on the task executor | Set `queueCapacity` + a `RejectedExecutionHandler` — else OOM under load |

**Golden rule:** stay non-blocking all the way through, and block exactly once at the boundary (or not at all, on virtual threads).

---

## 10. Interview questions

**Q: `thenApply` vs `thenCompose`?**
`map` vs `flatMap`. `thenApply` wraps whatever the callback returns, so returning a future gives `CF<CF<T>>`. `thenCompose` flattens. JS `.then` does both because it auto-unwraps thenables.

**Q: `join()` vs `get()`?**
`get()` throws checked `ExecutionException`/`InterruptedException` and supports a timeout; `join()` throws unchecked `CompletionException` and doesn't. Use `join()` inside lambdas and streams, `get(timeout)` when you need a deadline.

**Q: `Promise.all` vs `allOf`?**
`Promise.all` returns the results array and rejects on the first failure. `allOf` returns `CF<Void>` (you re-join each future yourself) and waits for every future to complete before completing exceptionally.

**Q: `exceptionally` vs `handle` vs `whenComplete`?**
`exceptionally` = recover on failure only. `handle` = runs on both, may transform the type and recover. `whenComplete` = observe both, cannot alter the outcome (the `finally` of the three).

**Q: What thread does a callback run on?**
Non-`Async`: the thread that completed the previous stage, or the caller if it was already complete — non-deterministic. `Async`: the common pool, or the executor you pass. Always pass one.

**Q: Why is `ForkJoinPool.commonPool()` a bad default for IO?**
It's sized `CPU - 1` and shared JVM-wide with parallel streams. A handful of blocking IO calls exhaust it and unrelated work stalls.

**Q: Is CompletableFuture the same as a Promise?**
No. Promises are single-threaded concurrency on an event loop — `await` yields. CompletableFuture is multi-threaded parallelism — `join()` blocks a real thread. Promises auto-flatten; CompletableFuture makes you choose `thenCompose`.

**Q: Do virtual threads make CompletableFuture obsolete?**
Not obsolete, but much less necessary. Blocking is cheap on a virtual thread, so straightforward blocking code is usually preferable. CompletableFuture is still right for wrapping callback APIs and for composing existing async results; structured concurrency is the modern answer for fan-out, though still a preview API.

**Q: How does a Spring controller returning `CompletableFuture` help?**
It releases the servlet container thread while the work runs, so a slow downstream call doesn't hold a scarce Tomcat thread. Throughput and scalability improve; the individual request is not faster.
