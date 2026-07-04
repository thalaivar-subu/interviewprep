# Topological Sort Pattern Notes

## When to use it

Use this whenever a problem describes **dependencies** between tasks
("course B requires course A first") and asks whether a valid order
exists, or to produce one. It's the pattern for **dependency ordering**
on a directed graph — distinct from the flood-fill/BFS-grid patterns in
[`graph/`](../graph/PATTERN.md), which are about undirected connectivity,
not directed prerequisites.

## Kahn's algorithm (BFS, in-degree based)

```js
function topoSort(numNodes, edges) {
    const adj = Array.from({ length: numNodes }, () => []);
    const inDegree = new Array(numNodes).fill(0);

    for (const [from, to] of edges) {
        adj[from].push(to);
        inDegree[to]++;
    }

    const queue = [];
    for (let i = 0; i < numNodes; i++) {
        if (inDegree[i] === 0) queue.push(i);
    }

    const order = [];
    while (queue.length) {
        const node = queue.shift();
        order.push(node);
        for (const nei of adj[node]) {
            if (--inDegree[nei] === 0) queue.push(nei);
        }
    }

    // if order doesn't include every node, there's a cycle -> no valid order
    return order.length === numNodes ? order : [];
}
```

## Complexity

**O(V + E) time and space** — every node and edge is visited once.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Course
Schedule LC 207, Course Schedule II LC 210).
