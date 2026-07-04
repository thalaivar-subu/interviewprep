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

## Complexity

**O(V^2) time** with the simple array-based "find min" above; **O((V + E) log V) time** with a real binary heap priority queue. Space is
**O(V + E)** for the adjacency list and distance array.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Network
Delay Time LC 743, Path With Minimum Effort LC 1631).
