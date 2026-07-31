# Binary Tree BFS Pattern Notes

## When to use it

BFS when the question is about **levels**: per-level aggregates, the
first node at some depth, the view from one side, connecting nodes
across a level, or shortest depth to something. The queue visits nodes
in non-decreasing depth order, which is the property you're buying.

Recognition cues: the words *level*, *depth*, *row*, *nearest*,
*shallowest*, *right/left side view*, or an output shaped as an array
per level.

If the question is about a path root-to-leaf or a subtree property, use
[`../dfs/PATTERN.md`](../dfs/PATTERN.md) instead.

## The four BFS shapes

Not all BFS is the same loop. Pick by what you need:

| Shape | Use when | Key line |
|---|---|---|
| [Level-batched](#template-level-batched-the-default) | You need per-level grouping | `const levelSize = queue.length` |
| [Flat](#template-flat-queue-no-level-loop) | You need "the next node in BFS order" | no inner loop at all |
| [Pairwise](#template-pairwise--mirror) | Comparing two positions symmetrically | dequeue **two** per iteration |
| [Both-ends deque](#template-both-ends-deque) | Alternating direction per level | `pop()` + `unshift()` on odd levels |

## Template (level-batched — the default)

**Snapshot `queue.length` before the inner loop.** That count is exactly
the current level; the children you push during the loop belong to the
next one. Getting this wrong is the classic BFS bug.

```js
if (!root) return [];
const result = [];
const queue = [root];

while (queue.length) {
    const levelSize = queue.length;      // freeze the boundary
    const level = [];

    for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        level.push(node.val);

        if (node.left)  queue.push(node.left);
        if (node.right) queue.push(node.right);
    }

    result.push(level);
}
return result;
```

Every level-batched problem is one line of change inside the loop:

| Problem | Change |
|---|---|
| LC 102 Level Order | as written |
| LC 107 Bottom-up | `result.unshift(level)` instead of `push` |
| LC 637 Average of Levels | accumulate `sum`, push `sum / levelSize` |
| LC 199 Right Side View | push only when `i === levelSize - 1` |
| LC 111 Min Depth | return the depth counter at the first leaf you dequeue |

## Template (flat queue — no level loop)

When you want "the node that comes **after** this one in BFS order",
don't batch. Keep pushing children, and when you dequeue your target,
whatever is now at the front of the queue is the successor.

`levelordersuccessor.js`:

```js
const queue = [root];

while (queue.length > 0) {
    const node = queue.shift();

    if (node.left)  queue.push(node.left);
    if (node.right) queue.push(node.right);

    if (node === key) break;             // children already enqueued
}

return queue[0];                          // next in BFS order
```

The ordering matters: enqueue the children **before** breaking, or the
successor won't be in the queue yet when the target is the last node of
its level.

## Template (pairwise / mirror)

Push nodes in **pairs** and dequeue **two at a time**. The pairing rule
encodes the relationship you're checking; there's no level loop because
each pair is self-contained.

`symmetrictree.js` (LC 101) — pair each node with its mirror
counterpart:

```js
const queue = [root.left, root.right];

while (queue.length) {
    const left  = queue.shift();
    const right = queue.shift();

    if (left == null && right == null) continue;      // both absent → fine
    if (left == null || right == null) return false;  // one absent → asymmetric
    if (left.val !== right.val) return false;

    queue.push(left.left,  right.right);              // outer pair
    queue.push(left.right, right.left);               // inner pair
}
return true;
```

`(left.left, right.right)` then `(left.right, right.left)` is the mirror
relation. Pair them straight across instead and you get LC 100 Same
Tree. Order the three null checks as shown — `continue` before the
`return false`, or symmetric empty slots fail.

## Template (both-ends deque)

For alternating traversal, you can either build the level normally and
reverse it, or drive the queue from both ends. The file here does the
latter: on "normal" levels take from the front and append children; on
"reversed" levels take from the **back** and prepend children in the
opposite order.

`zigzagtraversal.js` (LC 103):

```js
let leftToRight = true;

while (queue.length) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
        let node;
        if (leftToRight) {
            node = queue.shift();
            if (node.left)  queue.push(node.left);
            if (node.right) queue.push(node.right);
        } else {
            node = queue.pop();                       // from the back
            if (node.right) queue.unshift(node.right); // prepend, right first
            if (node.left)  queue.unshift(node.left);
        }
        level.push(node.val);
    }

    leftToRight = !leftToRight;
    result.push(level);
}
```

The child push order must flip along with the dequeue end — `right`
before `left` when prepending. Simpler alternative if you're deriving
this under time pressure: run the plain level-batched template and
`level.reverse()` on odd levels. Same complexity, one line, harder to
get wrong.

## A note on `shift()`

`Array.prototype.shift()` is **O(n)** in the worst case, so these
templates are technically O(n²) on a wide tree. Fine for interviews and
for LeetCode's limits, and it keeps the code readable. If asked: use a
head pointer instead of shifting —

```js
let head = 0;
while (head < queue.length) {
    const node = queue[head++];
    ...
}
```

— which trades memory (the array never shrinks) for true O(1) dequeue.

## Complexity

**O(n) time** — every node is enqueued and dequeued exactly once (modulo
the `shift()` caveat above).

**O(w) space** where `w` is the maximum level width. For a complete
binary tree the bottom level holds ~n/2 nodes, so this is **O(n)** —
strictly worse than DFS's O(h). That trade is the reason to prefer DFS
when the problem doesn't actually care about levels.

## Problems in this folder

Level-batched:

- [`levelordertraversal.js`](levelordertraversal.js) (LC 102 Binary Tree Level Order Traversal) — the template verbatim.
- [`levelorderbottomup.js`](levelorderbottomup.js) (LC 107 Level Order Traversal II) — `unshift` the level.
- [`averageofeachlevels.js`](averageofeachlevels.js) (LC 637 Average of Levels) — sum ÷ `levelSize`.
- [`rightsideview.js`](rightsideview.js) (LC 199 Binary Tree Right Side View) — keep the node at `i === levelSize - 1`.

Other shapes:

- [`levelordersuccessor.js`](levelordersuccessor.js) (Grokking, no LC) — **flat queue**, answer is `queue[0]` after the target is dequeued.
- [`symmetrictree.js`](symmetrictree.js) (LC 101 Symmetric Tree) — **pairwise/mirror**, dequeue two at a time.
- [`zigzagtraversal.js`](zigzagtraversal.js) (LC 103 Zigzag Level Order Traversal) — **both-ends deque**, alternating per level.

Related, one level up: [`../nextrightpointers.js`](../nextrightpointers.js)
(LC 116) solves a level problem in **O(1) space** by using the `next`
pointers built on the previous level instead of a queue — see
[`../PATTERN.md`](../PATTERN.md).
