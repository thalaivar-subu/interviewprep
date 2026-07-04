# Union-Find (Disjoint Set Union) Pattern Notes

## When to use it

Use union-find whenever a problem is about grouping items into connected
components as edges/relations arrive one at a time — "how many groups
are there," "are these two items in the same group," or "which edge,
once added, first creates a cycle." It's the go-to alternative to a
BFS/DFS-based connected-components scan when the graph is built
incrementally or when you only care about connectivity, not full
traversal.

## Structure

```js
class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // path compression
        }
        return this.parent[x];
    }

    union(a, b) {
        const rootA = this.find(a);
        const rootB = this.find(b);
        if (rootA === rootB) return false; // already connected -> would form a cycle

        // union by rank: attach smaller tree under bigger tree
        if (this.rank[rootA] < this.rank[rootB]) {
            this.parent[rootA] = rootB;
        } else if (this.rank[rootA] > this.rank[rootB]) {
            this.parent[rootB] = rootA;
        } else {
            this.parent[rootB] = rootA;
            this.rank[rootA]++;
        }
        return true;
    }
}
```

## Complexity

With path compression + union by rank, both `find` and `union` are
**amortized O(α(n))** — effectively constant. Space is **O(n)**.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Number of
Provinces LC 547, Redundant Connection LC 684).
