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

## The two return values that solve most problems

Almost every union-find problem is one of these two lines:

### `union` returning `false` ⇒ a cycle

If `find(a) === find(b)` before the union, `a` and `b` were already
connected — so the edge you're adding closes a cycle. That *is* LC 684
Redundant Connection:

```js
for (const [a, b] of edges) {
    if (!uf.union(a, b)) return [a, b];   // first edge that connects an already-connected pair
}
```

### A component counter ⇒ "how many groups"

Start at `n` components and **decrement on every successful union**.
That's LC 547 Number of Provinces, LC 323, LC 200-by-DSU:

```js
class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
        this.count = n;                    // ← every node starts alone
    }

    union(a, b) {
        const rootA = this.find(a), rootB = this.find(b);
        if (rootA === rootB) return false;

        // ...attach by rank as above...
        this.count--;                      // ← two groups became one
        return true;
    }
}
```

Then the answer is just `uf.count`. Never recount by scanning the parent
array — that's O(n·α) and easy to get wrong (you'd have to count
`find(i) === i`, not `parent[i] === i`).

## Grids: flatten 2D coordinates to 1D

Union-find is indexed by integers, so a grid cell `(r, c)` needs an id:

```js
const id = (r, c) => r * cols + c;         // cols, not rows
const uf = new UnionFind(rows * cols);

for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== '1') continue;

        if (r + 1 < rows && grid[r + 1][c] === '1') uf.union(id(r, c), id(r + 1, c));
        if (c + 1 < cols && grid[r][c + 1] === '1') uf.union(id(r, c), id(r, c + 1));
    }
}
```

**Multiply by the number of columns**, since that's the row stride —
`r * rows + c` is the classic mistake and only works on square grids.
Checking just *down* and *right* is sufficient: every adjacency gets
visited once from its upper-left member. The same flattening appears in
[`../matrix/PATTERN.md`](../matrix/PATTERN.md) for Sudoku block ids.

Note the counter needs adjusting on grids — start it at the number of
`'1'` cells rather than `rows * cols`, or subtract the water cells at
the end.

## DSU vs. DFS for connected components

Both answer "how many groups". Pick by how the input arrives:

| | Use DFS/BFS | Use union-find |
|---|---|---|
| Graph given up front, static | ✅ simpler | works, more code |
| Edges **arrive one at a time** | ✗ re-traverse per query | ✅ this is the whole point |
| Interleaved "connect" and "are they connected?" queries | ✗ | ✅ |
| You need the actual members of each group | ✅ | awkward |
| Detecting the *first* edge that creates a cycle | awkward | ✅ one line |

## Complexity

With path compression + union by rank, both `find` and `union` are
**amortized O(α(n))** — effectively constant. Space is **O(n)**.

`α` is the inverse Ackermann function; it's below 5 for any `n` you can
store, so treating these as O(1) is fine. **You need both optimizations**
— path compression alone gives O(log n) amortized, and neither gives
O(n) worst case on a degenerate chain.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Number of
Provinces LC 547, Redundant Connection LC 684).

Both are covered above: LC 684 is the `union` returns `false` line, LC
547 is the component counter. LC 200 Number of Islands already has a
DFS solution in [`../graph/numofislands.js`](../graph/numofislands.js)
and would make a good side-by-side if you add the DSU version here.
