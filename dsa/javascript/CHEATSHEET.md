# DSA Cheatsheet — one page, 33 patterns

Night-before recap. Each row: **what the problem says → what you reach for → the one thing that breaks it.**
Deep dive for any row is its folder's `PATTERN.md`.

## Pick the pattern from the sentence

```
"contiguous / subarray / substring"        -> sliding window   (subsequence => NOT a window, that's DP)
"sorted"  or  "find smallest x such that"  -> binary search     (search the ANSWER, not just the array)
"pair sums to / two indices"               -> hashing (unsorted) | two pointers (sorted)
"sum/count of a range"                     -> prefix sum
"next greater / previous smaller"          -> monotonic stack
"max in every window of size k"            -> monotonic deque
"top k / kth largest / running median"     -> heap
"all combinations / permutations / paths"  -> backtracking      (collect)
"how many ways / min cost / can you reach" -> DP                (return a value)
"levels / depth / shortest steps"          -> BFS
"path / subtree property / LCA"            -> DFS
"prerequisites / ordering"                 -> topological sort
"groups merging as edges arrive"           -> union-find
"prefix of a word"                         -> trie
"minimum X to cover Y" + sortable          -> greedy
"[start,end] pairs"                        -> intervals (sort first)
```

## Arrays & strings

| Pattern | Trigger | Move | Cost | ⚠ Gotcha |
|---|---|---|---|---|
| [arrays](arrays/PATTERN.md) | none of the below fit | direct scan / in-place write | O(n), O(1) | catch-all — if you're nesting loops, another pattern applies |
| [two-pointers](two-pointers/PATTERN.md) | sorted pair-sum, palindrome, in-place compaction | converge from ends, **or** slow/fast same direction | O(n), O(1) | 3Sum is O(n²) — the sort + inner scan, not O(n) |
| [sliding-window](sliding-window/PATTERN.md) | contiguous subarray/substring | update window state, don't recompute | O(n) | **subsequence ≠ subarray** — a window can't skip elements |
| ↳ [fixed-length](sliding-window/fixed-length-window/PATTERN.md) | "of size k" — k **given** | evaluate all n−k+1 windows | O(n), O(k) | delete zero-count keys or `map.size` comparison breaks |
| ↳ [dynamic-length](sliding-window/dynamic-length-window/PATTERN.md) | "longest/shortest such that P" — k **solved for** | `right` always moves; `left` only on invalid | O(n) amortized | inner `while` looks quadratic — `left` never resets, so it isn't |
| [prefix-sum](prefix-sum/PATTERN.md) | sum/count over ranges | `sum(i..j) = P[j] − P[i−1]` → hashmap finds the pair | O(n), O(n) | seed `map.set(0, 1)` or you miss subarrays starting at index 0 |
| [hashing](hashing/PATTERN.md) | "seen before?", "count/index of" | Map/Set, one pass instead of nested loops | O(n), O(n) | **look up before you insert**, else an element matches itself |
| [intervals](intervals/PATTERN.md) | list of `[start,end]` | sort by **start** to merge, by **end** for min-removals | O(n log n) | `<` vs `<=`: does touching at an endpoint count as overlap? |
| [stack](stack/PATTERN.md) | next/previous greater or smaller | monotonic stack of **indices** | O(n), O(n) | pop while the new element beats the top — direction decides `>` vs `<` |
| [monotonic-deque](monotonic-deque/PATTERN.md) | max/min in **every** window | deque of indices, pop both ends | O(n), O(k) | store **indices not values** — you must evict by position |
| [matrix](matrix/PATTERN.md) | rotate / transpose / validate blocks | transpose, then reverse each row = 90° CW | O(n²), O(1) | block id = `Math.floor(r/3)*3 + Math.floor(c/3)` |

## Search, sort, selection

| Pattern | Trigger | Move | Cost | ⚠ Gotcha |
|---|---|---|---|---|
| [binary-search](binary-search/PATTERN.md) | sorted, **or** monotonic false→true predicate | halve the range | O(log n), O(1) | it searches an **answer range** too, not only arrays |
| [sort](sort/PATTERN.md) | implement/compare a sort | know the table cold | see file | stability + in-place are what get asked, not the code |
| [heap](heap/PATTERN.md) | "kth largest", "top k", merge k lists, running median | k-sized heap, not a full sort | O(n log k), O(k) | min-heap for kth **largest** (evict the smallest) — inverted |
| [greedy](greedy/PATTERN.md) | "minimum X to cover Y", sortable by one key | sort, then one scan | O(n log n) | the code is trivial; **proving the greedy choice is safe** is the work |

## Trees

| Pattern | Trigger | Move | Cost | ⚠ Gotcha |
|---|---|---|---|---|
| [binary-tree](binary-tree/PATTERN.md) | any plain binary tree | pick BFS or DFS by the question | O(n) | choosing by habit instead of by "levels vs paths" |
| ↳ [bfs](binary-tree/bfs/PATTERN.md) | *level, depth, row, nearest, side view* | queue, batch by level size | O(n), O(w) | `queue.shift()` is O(n) in JS → use a head index |
| ↳ [dfs](binary-tree/dfs/PATTERN.md) | *path, subtree, LCA, compare two trees* | recurse L, recurse R, combine | O(n), O(h) | **O(n) stack on a skewed tree** — the case they ask about |
| [binary-search-tree](binary-search-tree/PATTERN.md) | BST invariant stated | prune half at each node | O(h) | **in-order traversal of a BST is sorted** — the trick behind kth-smallest |
| [trie](trie/PATTERN.md) | prefixes over a **set** of words | char-per-node tree | O(L) per op | O(L) is independent of how many words are stored — that's the point |

## Graphs

| Pattern | Trigger | Move | Cost | ⚠ Gotcha |
|---|---|---|---|---|
| [graph](graph/PATTERN.md) | nodes + edges, **or a 2D grid** | flood fill / multi-source BFS | O(V+E), O(m·n) | **a grid is a graph** — that's the one people miss |
| [topological-sort](topological-sort/PATTERN.md) | prerequisites, dependency order | Kahn: indegree 0 → queue | O(V+E) | if the output is shorter than V, there's a **cycle** |
| [union-find](union-find/PATTERN.md) | groups merging as edges arrive | find + union with path compression | ~O(1) amortized | **you need path compression AND union by rank** — one alone isn't enough |

## Recursion & DP

Full combine rule: [recursion/PATTERN.md](recursion/PATTERN.md) → *question 4*.

| Pattern | Trigger | Move | Cost | ⚠ Gotcha |
|---|---|---|---|---|
| [recursion](recursion/PATTERN.md) | self-similar: solve(n) → solve(n−1) | pick the sub-pattern below | nodes × work | loop start `0` / `i` / `i+1` decides permutations vs combinations |
| ↳ [basics](recursion/basics/PATTERN.md) | one call, result flows back | recursion as a loop | O(depth) | no TCO in JS — the stack is real |
| ↳ [backtracking](recursion/backtracking/PATTERN.md) | "return **all** …" | choose → explore → **un-choose** | O(n·2ⁿ) / O(n·n!) | push a **copy** `[...cur]`; the live array is about to be mutated |
| ↳ [decision-tree](recursion/decision-tree/PATTERN.md) | take/skip per element, one aggregate answer | memoized take vs skip | O(states × work) | state = everything about the past that changes the future, nothing more |
| ↳ [functional](recursion/functional/PATTERN.md) | one number over exponential choices | write the recurrence, add a `Map` | O(states × work) | the memo **is** the algorithm, not an optimisation |
| ↳ [array-partitions](recursion/array-partitions/PATTERN.md) | split into **contiguous** groups, cost per group | try each group length ≤ k | O(n·k) | groups are adjacent — this is not subset DP |
| [dp](dp/PATTERN.md) | overlapping subproblems + optimal substructure | tabulate the same recurrence | O(states × work) | fill order follows the dependency: needs `i+1` → loop backwards |

### The combine rule (recursion, memorise this)

```
"list all"      -> COLLECT  push([...cur]) at leaf, return void
"how many"      -> COUNT    +      leaf 1     dead 0         no +1 on edges
"fewest / min"  -> MIN      min    leaf 0     dead Infinity  +1 on the edge
"longest / max" -> MAX      max    leaf 0     dead 0         +k on the edge
"can you"       -> BOOLEAN  ||     leaf true  dead false     short-circuits
```

Leaf value = the honest answer to the empty problem. Dead-branch value = the **identity** of the combine.
A `+` on the recursive call ⇒ edge-focused (min/max); no `+` ⇒ leaf-focused (collect/count/boolean).

## Number tricks

| Pattern | Trigger | Move | Cost | ⚠ Gotcha |
|---|---|---|---|---|
| [math](math/PATTERN.md) | primes, base/radix, digits | sieve; a composite has a factor ≤ √n | O(n log log n) | Roman numeral bounds make it O(1) — say so |
| [binary](binary/PATTERN.md) | set bits, XOR, no `+` allowed | `n & (n−1)` clears the lowest set bit | O(1) (32-bit) | XOR of all elements finds the unique one — pairs cancel |

## Things true everywhere

- **`queue.shift()` is O(n) in JS.** Any BFS is secretly O(n²) unless you use a head index. Bites `bfs/`, `topological-sort/`, `graph/`.
- **Sorting first is allowed** and usually costs nothing you weren't already paying (greedy, intervals, 3Sum, dup-skipping).
- **Objects/arrays as Map keys compare by identity.** Serialise: `` `${r},${c}` `` or `r * cols + c`.
- **State the space cost too.** Recursion is O(depth) stack even when it "uses no extra memory".
- If the brute force is a nested loop over pairs, a **hashmap or two pointers** almost always collapses it to one pass.
