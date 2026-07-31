# Graph Shortest Path (Weighted) Pattern Notes

## When to use it

Use this when edges have **weights/costs** and you need the shortest
(or minimum-cost) path — distinct from the unweighted BFS in
[`graph/`](../graph/PATTERN.md), where every edge counts as "1 step" and
plain BFS already finds the shortest path. With weights, BFS breaks
down and you need a priority queue to always expand the currently-
cheapest-known node next (Dijkstra's algorithm, for non-negative
weights).

## Template (Dijkstra)

```js
function dijkstra(n, edges, src) {
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [u, v, w] of edges) adj[u].push([v, w]);

    const dist = new Array(n + 1).fill(Infinity);
    dist[src] = 0;

    // simple array-based "priority queue" — swap for a real min-heap for
    // better than O(n) per extract-min on dense graphs
    const visited = new Array(n + 1).fill(false);

    for (let i = 0; i < n; i++) {
        let u = -1;
        for (let node = 1; node <= n; node++) {
            if (!visited[node] && (u === -1 || dist[node] < dist[u])) u = node;
        }
        if (u === -1 || dist[u] === Infinity) break;
        visited[u] = true;

        for (const [v, w] of adj[u]) {
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    }

    return dist;
}
```

## Template (Dijkstra with a real priority queue)

The version to actually write. The heap holds `[distance, node]` pairs,
and the crucial addition is the **stale-entry guard**:

```js
function dijkstra(n, edges, src) {
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [u, v, w] of edges) adj[u].push([v, w]);

    const dist = new Array(n + 1).fill(Infinity);
    dist[src] = 0;

    const pq = new MinHeap();            // ordered by the first tuple element
    pq.push([0, src]);

    while (pq.size()) {
        const [d, u] = pq.pop();

        if (d > dist[u]) continue;       // ← STALE: we already found a better route to u

        for (const [v, w] of adj[u]) {
            const nd = d + w;
            if (nd < dist[v]) {          // relaxation
                dist[v] = nd;
                pq.push([nd, v]);        // push a new entry; never update in place
            }
        }
    }
    return dist;
}
```

**Why the stale guard exists:** a binary heap has no efficient
"decrease-key", so instead of updating an existing entry you push a
*second* entry for the same node at the lower distance. The old one is
still in the heap and will surface later — `d > dist[u]` detects and
discards it. Without this line you re-expand nodes and the complexity
degrades. This is the single most-missed line in a from-memory Dijkstra.

Two more consequences worth stating out loud:

- **Once a node is popped with `d === dist[u]`, its distance is final.**
  That's the greedy invariant, and it's why the algorithm can stop early
  if you only need one target: `if (u === target) return d;`.
- **Non-negative weights only.** A negative edge could improve an
  already-finalized node, breaking the invariant. See Bellman-Ford
  below.

## Reconstructing the path, not just the distance

Record where each improvement came from, then walk backwards:

```js
const prev = new Array(n + 1).fill(-1);

// inside the relaxation:
if (nd < dist[v]) { dist[v] = nd; prev[v] = u; pq.push([nd, v]); }

// afterwards:
const path = [];
for (let at = target; at !== -1; at = prev[at]) path.push(at);
path.reverse();
```

## The relaxation function is the tunable part

This is the generalization that unlocks most Dijkstra variants. The
algorithm never assumes you're summing edge weights — it only needs the
path cost to be **non-decreasing as the path grows**. Swap the combine:

| Combine | Meaning | Problem |
|---|---|---|
| `d + w` | total distance | LC 743 Network Delay Time |
| `Math.max(d, w)` | the worst single edge on the path | **LC 1631 Path With Minimum Effort** |
| `d * w` (probabilities) | product — use a **max**-heap | LC 1514 Path with Maximum Probability |

LC 1631 asks for the route minimizing the *largest* height difference,
so the "distance" to a cell is `max(effort so far, this step's effort)`.
Everything else — the heap, the stale guard, the relaxation check — is
unchanged. If you only remember one thing from this file, make it this.

## When Dijkstra is the wrong tool

| Situation | Use instead |
|---|---|
| All weights equal | Plain **BFS** — [`../graph/PATTERN.md`](../graph/PATTERN.md) |
| Weights are only 0 and 1 | **0-1 BFS**: a deque, push-front on a 0-edge, push-back on a 1-edge. O(V + E) |
| **Negative** edge weights | **Bellman-Ford**: relax all E edges V−1 times, O(V·E). A V-th round that still improves something proves a negative cycle |
| At most `k` edges (LC 787) | Bellman-Ford limited to `k + 1` rounds — Dijkstra's greedy invariant doesn't respect a hop limit |
| All-pairs, small V | Floyd-Warshall, O(V³) |

## Complexity

**O(V^2) time** with the simple array-based "find min" above; **O((V + E) log V) time** with a real binary heap priority queue. Space is
**O(V + E)** for the adjacency list and distance array.

With the stale-entry approach the heap can hold up to `E` entries, so
it's more precisely **O(E log E)** — the same thing, since `E ≤ V²` makes
`log E ≤ 2 log V`.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Network
Delay Time LC 743, Path With Minimum Effort LC 1631).

You'll need a priority queue.
[`../heap/minHeap.js`](../heap/minHeap.js) implements one but exports
nothing and compares raw numbers, so it can't order `[dist, node]` pairs
as-is — either adapt it to compare `a[0] - b[0]`, or inline a small heap
in the solution file. The structure and the index arithmetic are in
[`../heap/PATTERN.md`](../heap/PATTERN.md).
