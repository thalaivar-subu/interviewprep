# DSA — JavaScript

Interview-prep solutions organized by pattern, not by LeetCode topic tag.
Every folder has a `PATTERN.md` explaining when to reach for that
technique, a template, and complexity notes — read that first if the
pattern is unfamiliar, then look at the solved problems for worked
examples.

All problems listed below are solved (a working implementation exists).

| Folder | Pattern | Problems |
|---|---|---|
| [`arrays`](arrays/PATTERN.md) | Direct scan / in-place array manipulation | 9 |
| [`binary`](binary/PATTERN.md) | Bit manipulation | 2 |
| [`binary-search`](binary-search/PATTERN.md) | Binary search (classic + search-on-answer) | 7 |
| [`binary-search-tree`](binary-search-tree/PATTERN.md) | BST invariant + in-order traversal | 4 |
| [`binary-tree`](binary-tree/PATTERN.md) | Tree BFS ([`bfs/`](binary-tree/bfs)) and DFS ([`dfs/`](binary-tree/dfs)) | 19 |
| [`dp`](dp/PATTERN.md) | Dynamic programming (top-down memo / bottom-up tabulation) | 11 |
| [`graph`](graph/PATTERN.md) | Flood fill / unweighted BFS grid | 2 |
| [`graph-shortest-path`](graph-shortest-path/PATTERN.md) | Weighted shortest path (Dijkstra) | 0 |
| [`greedy`](greedy/PATTERN.md) | Locally-optimal choice, sort + single pass | 8 |
| [`hashing`](hashing/PATTERN.md) | Hashmap/set lookups (complement, frequency) | 0 |
| [`heap`](heap/PATTERN.md) | Min/max-heap for repeated top-k access | 2 |
| [`intervals`](intervals/PATTERN.md) | Merge / insert / overlap on `[start, end]` ranges | 3 |
| [`linked-list`](linked-list/PATTERN.md) | Fast/slow pointers, in-place reversal | 9 |
| [`math`](math/PATTERN.md) | Number theory, sieve, base conversion | 3 |
| [`matrix`](matrix/PATTERN.md) | In-place 2D grid transformation | 2 |
| [`monotonic-deque`](monotonic-deque/PATTERN.md) | Sliding window max/min via a deque of indices | 1 |
| [`prefix-sum`](prefix-sum/PATTERN.md) | Running sum + hashmap for subarray sums | 4 |
| [`recursion`](recursion/PATTERN.md) | [`backtracking/`](recursion/backtracking), [`basics/`](recursion/basics), [`decision-tree/`](recursion/decision-tree), [`functional/`](recursion/functional) | 31 |
| [`sliding-window`](sliding-window/PATTERN.md) | [`dynamic-length-window/`](sliding-window/dynamic-length-window), [`fixed-length-window/`](sliding-window/fixed-length-window) | 11 |
| [`sort`](sort/PATTERN.md) | Sorting algorithms implemented from scratch | 4 |
| [`stack`](stack/PATTERN.md) | Monotonic stack (next/previous greater or smaller) | 5 |
| [`topological-sort`](topological-sort/PATTERN.md) | Dependency ordering on a directed graph (Kahn's algorithm) | 0 |
| [`trie`](trie/PATTERN.md) | Prefix tree for prefix/autocomplete queries | 0 |
| [`two-pointers`](two-pointers/PATTERN.md) | Converging or same-direction index pairs | 1 |
| [`union-find`](union-find/PATTERN.md) | Disjoint Set Union for incremental connectivity | 0 |

**138 solved problems across 25 patterns** (5 patterns — `trie`,
`union-find`, `topological-sort`, `hashing`, `graph-shortest-path` — are
newly scaffolded with just a `PATTERN.md` each; no starter solutions
were added on purpose, add problems to them one at a time as you learn
the pattern).

## Known gaps / imbalances

- **`graph/` is thin (2 problems)** relative to its interview weight —
  it currently only covers unweighted flood-fill/BFS-grid. Weighted
  shortest-path and topological sort now live in their own folders
  ([`graph-shortest-path/`](graph-shortest-path/PATTERN.md),
  [`topological-sort/`](topological-sort/PATTERN.md)), but general graph
  traversal (DFS on adjacency lists, bipartite checks, cycle detection
  on generic graphs) is still missing. Left unfilled deliberately rather
  than padded with weak problems — worth prioritizing next.
- **`binary-tree/` (19) vs `graph/` (2)** is a large imbalance in the
  other direction; not fixed by trimming `binary-tree/`, since all 19
  are legitimate distinct problems.
- **`two-pointers/` is down to 1 problem** (`3sum.js`) after
  `buysellstocks.js` and `needlehaystack.js` were moved out for being
  mis-categorized (neither used a real converging-pointer technique).
  Worth adding a couple of genuine two-pointer problems (e.g. container
  with most water, sort colors) to round this folder out.
