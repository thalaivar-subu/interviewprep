# Graph Pattern Notes

## When to use it

Anything with **nodes and connections** — explicitly (an adjacency list,
an edge list) or implicitly. The implicit case is the one that catches
people out: **a 2D grid is a graph**, where each cell is a node and its
up/down/left/right neighbours are its edges. Every problem currently in
this folder is grid-shaped.

Pick your traversal by what the question asks:

| Question | Use |
|---|---|
| "How many groups / regions / islands?" | **DFS flood fill** — one traversal per unvisited start |
| "Fewest steps / minimum time to reach …" | **BFS** — the first time you reach a node is via a shortest path |
| "…starting from *all* of these at once" | **Multi-source BFS** — seed the queue with every source |
| "Find a path spelling / satisfying X" | **Backtracking DFS** — mark, recurse, **un-mark** |
| Edges have weights | **Dijkstra** with a min-heap priority queue (no folder here yet) |
| Dependencies / ordering | Kahn's → [`../topological-sort/PATTERN.md`](../topological-sort/PATTERN.md) |
| Incremental connectivity, "are these connected?" | DSU → [`../union-find/PATTERN.md`](../union-find/PATTERN.md) |

**DFS vs BFS in one line:** BFS finds shortest paths on **unweighted**
graphs; DFS doesn't, but it's shorter to write and uses O(depth) space.
If the word "shortest" or "minimum steps" appears, use BFS.

## The two grid boilerplates

Every grid problem needs these; write them once and stop thinking about
them.

```js
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // up, down, left, right

const inBounds = (r, c) => r >= 0 && r < grid.length && c >= 0 && c < grid[0].length;
```

Add `[-1,-1], [-1,1], [1,-1], [1,1]` for 8-directional problems. Check
bounds **before** indexing — `grid[-1][0]` throws, whereas `grid[-1]` is
merely `undefined`.

## Template (DFS flood fill / connected components)

Scan every cell; each time you find an unvisited one that qualifies,
that's **one new component** — then flood the whole thing so you never
count it again.

```js
let count = 0;

for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === "1") {
            count++;            // a new component starts here
            dfs(grid, r, c);    // consume all of it
        }
    }
}
return count;

const dfs = (grid, r, c) => {
    if (!inBounds(r, c) || grid[r][c] === "0") return;

    grid[r][c] = "0";           // mark visited by MUTATING the grid

    dfs(grid, r - 1, c);
    dfs(grid, r + 1, c);
    dfs(grid, r, c - 1);
    dfs(grid, r, c + 1);
};
```

`numofislands.js` (LC 200). Two notes:

- **Marking by mutation** (`grid[r][c] = "0"`) replaces a `visited` set —
  O(1) space instead of O(m·n). Legal only if you're allowed to destroy
  the input; if not, keep a parallel `visited` array and say so.
- **Nothing is ever un-marked.** That's what distinguishes flood fill
  from backtracking below, and it's why flood fill is O(m·n) total: each
  cell is entered at most once across the entire run.

## Template (multi-source BFS with level counting)

`rottenoranges.js` (LC 994). "Minutes until everything rots" is a
shortest-path question with **many simultaneous starts**. The trick:
seed the queue with *all* sources before the loop, then process one
whole level per time unit.

```js
const queue = [];
let fresh = 0;

for (let r = 0; r < grid.length; r++) {           // 1. seed ALL sources
    for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === 2) queue.push([r, c]);
        else if (grid[r][c] === 1) fresh++;        // 2. count what must be reached
    }
}
if (fresh === 0) return 0;                         // nothing to do

let minutes = 0;

while (queue.length && fresh > 0) {
    const size = queue.length;                     // 3. one level = one minute

    for (let i = 0; i < size; i++) {
        const [row, col] = queue.shift();

        for (const [dr, dc] of directions) {
            const nr = row + dr, nc = col + dc;
            if (!inBounds(nr, nc) || grid[nr][nc] !== 1) continue;

            grid[nr][nc] = 2;                      // mark on ENQUEUE, not dequeue
            fresh--;
            queue.push([nr, nc]);
        }
    }
    minutes++;
}

return fresh === 0 ? minutes : -1;                 // 4. unreachable → -1
```

Four things generalize:

- **Seed every source first.** This is what makes it multi-source; you
  are effectively adding a virtual super-source at distance 0 from all
  of them.
- **`const size = queue.length` before the inner loop**, exactly as in
  [`../binary-tree/bfs/PATTERN.md`](../binary-tree/bfs/PATTERN.md) — one
  batch is one time step.
- **Mark visited when you enqueue**, not when you dequeue. Otherwise the
  same cell can be enqueued by several neighbours in the same round.
- **Count the targets up front** so the "did we reach everything?" check
  at the end is O(1) instead of another full scan.

## Template (backtracking DFS on a grid)

`word-search.js` (LC 79). This is **not** flood fill, and the difference
matters: you're looking for a *path*, so a cell used by a failed attempt
must become available again.

```js
const dfs = (r, c, index) => {
    if (index === word.length) return true;                       // matched everything
    if (!inBounds(r, c) || board[r][c] !== word[index]) return false;

    const temp = board[r][c];
    board[r][c] = '#';                                            // mark — no revisits on THIS path

    const found = dfs(r + 1, c, index + 1) || dfs(r - 1, c, index + 1)
               || dfs(r, c + 1, index + 1) || dfs(r, c - 1, index + 1);

    board[r][c] = temp;                                           // UN-mark — the whole difference
    return found;
};

for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
        if (dfs(r, c, 0)) return true;
```

The `board[r][c] = temp` restore is what makes this backtracking. Drop
it and cells consumed by a dead-end branch stay blocked, and you'll
report `false` for words that exist. The extra `index` parameter is
standard: it tracks how far into the target you've matched.

This is really a [`../recursion/backtracking/`](../recursion/backtracking/PATTERN.md)
problem wearing a grid costume — see that folder's 2D-board template.

## Technique (trie-backed board DFS)

`word-search-2.js` (LC 212) — find **all** words from a dictionary on the
board. The naive approach is LC 79 in a loop, which is what the file
currently does:

> **Heads-up: the implementation in this folder will TLE on LC 212.**
> It runs a full board search per word — O(words × m × n × 4^L) with
> `words` up to 3·10⁴. Read it as an LC 79 example, not as the answer.

The real solution walks the board **once**, carrying a trie node
alongside the position, so all words are matched in parallel and dead
prefixes prune instantly:

```js
// build a trie of all words; each node has children + an optional `word` at terminals
const dfs = (r, c, node) => {
    const ch = board[r][c];
    const next = node.children[ch];
    if (!next) return;                       // ← prefix prune: no word starts this way

    if (next.word) { result.push(next.word); next.word = null; }   // dedupe by clearing

    board[r][c] = '#';
    for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc] !== '#') dfs(nr, nc, next);
    }
    board[r][c] = ch;
};
```

The pruning is the point: at each step you consult the trie instead of a
single word, so a prefix shared by 500 words is explored once. Clearing
`next.word` after a hit avoids duplicates without a `Set`. The trie
itself is in [`../trie/PATTERN.md`](../trie/PATTERN.md).

## Complexity

| Technique | Time | Space |
|---|---|---|
| Flood fill (LC 200) | **O(m·n)** — each cell entered once | O(m·n) recursion worst case |
| Multi-source BFS (LC 994) | **O(m·n)** | O(m·n) queue |
| Backtracking DFS (LC 79) | **O(m·n·4^L)** — `L` = word length | O(L) recursion |
| Trie-backed DFS (LC 212) | **O(m·n·4^L)** worst, far less with pruning | O(total chars) for the trie |

The flood-fill and BFS bounds are linear because **nothing is
un-marked** — each cell is processed once. Backtracking un-marks, so it
pays the exponential branching factor; that's the price of searching
paths rather than regions.

DFS recursion on a grid can be O(m·n) deep (a snake-shaped region), so
on a 300×300 board it will blow the stack — use an explicit stack or BFS
if that's a concern.

## Problems in this folder

- [`numofislands.js`](numofislands.js) (LC 200 Number of Islands) — **DFS flood fill**; marks visited by mutating the grid to `"0"`.
- [`rottenoranges.js`](rottenoranges.js) (LC 994 Rotting Oranges) — **multi-source BFS** with level-batched minute counting; `fresh > 0` at the end ⇒ `-1`.
- [`word-search.js`](word-search.js) (LC 79 Word Search) — **backtracking DFS** with mark-and-restore. Really a [`../recursion/backtracking/`](../recursion/backtracking/PATTERN.md) problem.
- [`word-search-2.js`](word-search-2.js) (LC 212 Word Search II) — currently LC 79 in a loop, which **will TLE**; the intended solution is the trie-backed DFS above, and belongs with [`../trie/`](../trie/PATTERN.md).

### Not yet covered here

General (non-grid) graph traversal is a real gap in this folder — DFS
over an adjacency list, cycle detection on a directed graph
(white/gray/black colouring), and bipartite checking (2-colouring via
BFS) all have no example. Left unfilled deliberately rather than padded;
worth adding next. Weighted shortest paths, topological ordering, and
connectivity live in their own folders, linked in the table above.
