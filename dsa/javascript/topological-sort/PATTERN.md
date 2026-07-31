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

## Which direction does the edge go?

**The most common bug in LC 207/210, and worth getting right before you
write anything else.** The input is `prerequisites[i] = [a, b]`, meaning
*"to take course `a` you must first take `b`"*. So `b` comes first, and
the edge runs **`b → a`**:

```js
for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);      // prereq → course  (b → a)
    inDegree[course]++;            // `course` is blocked by one more thing
}
```

Read it as: **in-degree counts unmet prerequisites**, and a course is
ready exactly when that count hits zero. Get the direction backwards and
you produce a perfectly valid topological order — of the reversed graph.
The cycle check still passes, so the bug is silent on the sample cases.

Sanity check with `[[1, 0]]`: course 1 needs course 0, so the only valid
order is `[0, 1]`. `inDegree[1] === 1`, `inDegree[0] === 0`, so 0 is
enqueued first. ✓

## Cycle detection is free

`order.length === numNodes` is the whole test. If a cycle exists, every
node in it permanently has in-degree ≥ 1 (each is blocked by the next),
so none is ever enqueued and the order comes up short.

That means **LC 207 is just LC 210 with a boolean return** — same code,
`return order.length === numNodes` instead of `return order`.

## Variant (lexicographically smallest order)

When several nodes have in-degree 0, Kahn's picks arbitrarily. To get
the smallest valid order, swap the queue for a **min-heap**:

```js
const pq = new MinHeap();
for (let i = 0; i < numNodes; i++) if (inDegree[i] === 0) pq.push(i);

while (pq.size()) {
    const node = pq.pop();          // smallest ready node, not the oldest
    order.push(node);
    for (const nei of adj[node]) if (--inDegree[nei] === 0) pq.push(nei);
}
```

O((V + E) log V). See [`../heap/PATTERN.md`](../heap/PATTERN.md).

## Variant (DFS with three-colour cycle detection)

The other standard formulation. Post-order DFS produces a **reverse**
topological order, and a "currently on the stack" marker catches cycles:

```js
const WHITE = 0, GRAY = 1, BLACK = 2;      // unvisited / in progress / done
const color = new Array(numNodes).fill(WHITE);
const order = [];

const dfs = (u) => {
    color[u] = GRAY;

    for (const v of adj[u]) {
        if (color[v] === GRAY) return false;              // back edge → cycle
        if (color[v] === WHITE && !dfs(v)) return false;
    }

    color[u] = BLACK;
    order.push(u);                                        // post-order
    return true;
};

for (let i = 0; i < numNodes; i++) {
    if (color[i] === WHITE && !dfs(i)) return [];         // cycle found
}
return order.reverse();                                   // ← post-order is reversed
```

**GRAY vs BLACK is the entire point.** Reaching a GRAY node means you've
looped back onto the current path — a cycle. Reaching a BLACK node just
means you've been there before via a different route, which is fine. A
single boolean `visited` array can't tell those apart, and that
confusion is the usual reason a hand-rolled cycle detector reports false
positives.

Kahn's is easier to get right and gives cycle detection for free; the
DFS version is better when you also need the recursion (e.g. building
the order during another traversal).

## Complexity

**O(V + E) time and space** — every node and edge is visited once.

The min-heap variant is O((V + E) log V). Note `queue.shift()` is O(n)
in JS, so the plain version is technically O(V² + E) — use a head index
if it matters.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Course
Schedule LC 207, Course Schedule II LC 210).

Both are the template above verbatim; LC 207 returns the boolean, LC 210
returns the order. LC 269 Alien Dictionary is the interesting next one —
you have to *derive* the edges by comparing adjacent words character by
character before you can sort at all.
