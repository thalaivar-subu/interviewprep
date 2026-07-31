# DSA — JavaScript

Interview-prep solutions organized by pattern, not by LeetCode topic tag.
Every folder has a `PATTERN.md` explaining when to reach for that
technique, a template per variant, and complexity notes — read that
first if the pattern is unfamiliar, then look at the solved problems for
worked examples.

The goal for every `PATTERN.md`: **reading it should be enough to solve
every problem in that folder from scratch.** If a problem in a folder
needs a trick the notes don't cover, that's a bug in the notes.

All problems listed below are solved (a working implementation exists).

| Folder | Pattern | Problems |
|---|---|---|
| [`arrays`](arrays/PATTERN.md) | Direct scan / in-place array manipulation | 9 |
| [`binary`](binary/PATTERN.md) | Bit manipulation | 2 |
| [`binary-search`](binary-search/PATTERN.md) | Binary search (classic, boundary, peak, rotated, search-on-answer) | 7 |
| [`binary-search-tree`](binary-search-tree/PATTERN.md) | BST invariant + in-order traversal | 3 (+1 DS) |
| [`binary-tree`](binary-tree/PATTERN.md) | Tree [`bfs/`](binary-tree/bfs/PATTERN.md) (7) and [`dfs/`](binary-tree/dfs/PATTERN.md) (8), plus construction | 19 |
| [`dp`](dp/PATTERN.md) | Dynamic programming — 7 recurrence families | 11 |
| [`graph`](graph/PATTERN.md) | Flood fill, multi-source BFS, grid backtracking | 4 |
| [`graph-shortest-path`](graph-shortest-path/PATTERN.md) | Weighted shortest path (Dijkstra) | 0 |
| [`greedy`](greedy/PATTERN.md) | Locally-optimal choice + exchange arguments | 8 |
| [`hashing`](hashing/PATTERN.md) | Hashmap/set lookups (complement, frequency, grouping) | 0 |
| [`heap`](heap/PATTERN.md) | Min/max-heap for repeated top-k access | 1 (+1 DS) |
| [`intervals`](intervals/PATTERN.md) | Merge / insert / overlap on `[start, end]` ranges | 3 |
| [`linked-list`](linked-list/PATTERN.md) | Fast/slow pointers, dummy head, in-place reversal | 8 (+1 DS) |
| [`math`](math/PATTERN.md) | Number theory, sieve, Roman numerals | 3 |
| [`matrix`](matrix/PATTERN.md) | In-place 2D transformation + block indexing | 2 |
| [`monotonic-deque`](monotonic-deque/PATTERN.md) | Sliding window max/min via a deque of indices | 1 |
| [`prefix-sum`](prefix-sum/PATTERN.md) | Running sum + hashmap; prefix/suffix decomposition | 5 |
| [`recursion`](recursion/PATTERN.md) | [`basics/`](recursion/basics/PATTERN.md) (3), [`backtracking/`](recursion/backtracking/PATTERN.md) (14 + [`array-partitions/`](recursion/backtracking/array-partitions/PATTERN.md) 2), [`decision-tree/`](recursion/decision-tree/PATTERN.md) (5), [`functional/`](recursion/functional/PATTERN.md) (8) | 33 |
| [`sliding-window`](sliding-window/PATTERN.md) | [`fixed-length-window/`](sliding-window/fixed-length-window/PATTERN.md) (3), [`dynamic-length-window/`](sliding-window/dynamic-length-window/PATTERN.md) (4), plus 4 variants at the root | 11 |
| [`sort`](sort/PATTERN.md) | Sorting algorithms implemented from scratch | 4 |
| [`stack`](stack/PATTERN.md) | Monotonic stack, circular arrays, boundary markers | 6 |
| [`topological-sort`](topological-sort/PATTERN.md) | Dependency ordering on a directed graph (Kahn's algorithm) | 0 |
| [`trie`](trie/PATTERN.md) | Prefix tree for prefix/autocomplete queries | 0 |
| [`two-pointers`](two-pointers/PATTERN.md) | Converging or same-direction index pairs | 1 |
| [`union-find`](union-find/PATTERN.md) | Disjoint Set Union for incremental connectivity | 0 |

**141 solved problems across 25 patterns**, plus 3 data-structure
implementations (`linked-list/LL.js`, `heap/minHeap.js`,
`binary-search-tree/bst.js`) which are scaffolding rather than problems.

5 patterns — `trie`, `union-find`, `topological-sort`, `hashing`,
`graph-shortest-path` — are scaffolded with just a `PATTERN.md` each; no
starter solutions were added on purpose, add problems to them one at a
time as you learn the pattern. Each of those notes is written to stand
alone without a worked example.

## Known gaps / imbalances

- **`graph/` still lacks general (non-grid) traversal.** All 4 problems
  are grid-shaped. DFS over an adjacency list, cycle detection on a
  directed graph (white/gray/black colouring), and bipartite checking
  (2-colouring via BFS) have no example — the templates aren't in
  [`graph/PATTERN.md`](graph/PATTERN.md) either. Weighted shortest path
  and topological sort now live in their own folders. Worth prioritizing
  next.
- **`binary-tree/` (19) vs `graph/` (4)** is a large imbalance in the
  other direction; not fixed by trimming `binary-tree/`, since all 19
  are legitimate distinct problems.
- **`two-pointers/` is down to 1 problem** (`3sum.js`) after
  `buysellstocks.js` and `needlehaystack.js` were moved out for being
  mis-categorized (neither used a real converging-pointer technique).
  Its same-direction template has no in-folder example at all — the two
  natural ones live in `arrays/`. Worth adding container-with-most-water
  and sort-colors to round this out.

## Known issues in the solution files

Flagged in the relevant `PATTERN.md` files so the notes don't teach the
wrong thing, but not yet fixed in code:

- **`graph/word-search-2.js` will TLE on LC 212** — it runs a full board
  search per word instead of a trie-backed DFS. Read it as an LC 79
  example; the intended solution is in [`trie/PATTERN.md`](trie/PATTERN.md).
- **`dp/combinationsum4.js` and `recursion/backtracking/combinationsum4.js`
  are byte-identical**, and the file contains no backtracking. Read the
  `dp/` copy.
- **Missing memoization** (each is exponential as written, and each
  needs one line): `recursion/decision-tree/distinctsequence.js` (will
  TLE on LC 115), `recursion/backtracking/array-partitions/efficientcost-workday.js`,
  and `recursion/functional/dicerolls.js` / `dp/buysellstockktimes.js`
  (both have their memo lines commented out).
- **`binary/numof1s.js` uses `>>` where the notes use `>>>`** — the
  signed shift loops forever on a negative input. Harmless for LC 191's
  constraints.
- **`heap/kthlargestelement.js` depends on LeetCode's `MinPriorityQueue`
  global**, which doesn't exist in Node, and `heap/minHeap.js` exports
  nothing — so the two can't be wired together locally.
- **Mislabels**: `recursion/functional/longestcommonpalindrome.js`
  actually solves LC 516 Longest Palindromic *Subsequence*;
  `sliding-window/fixed-length-window/maximumsubarraysumk.js` has an
  LC 560 header saying "kadane's Algorithm" and is not LC 643 either
  (that one returns the max *average*).
- **Misfiled**: 3 of the 4 `sliding-window/` root files are fixed-length;
  `graph/word-search.js` is pure backtracking; `graph/word-search-2.js`
  belongs in `trie/`; `binary-search/twosumsorted.js` is two pointers.
  All are cross-linked from both ends rather than moved.
