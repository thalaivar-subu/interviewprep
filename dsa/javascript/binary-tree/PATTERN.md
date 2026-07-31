# Binary Tree Pattern Notes

## When to use it

Any problem operating on a plain (not necessarily sorted) binary tree.
The split that matters is **BFS vs DFS**:

- **BFS** (level order, via a queue) when the problem is about
  *levels* — per-level averages, right-side view, zigzag order,
  connecting siblings. → [`bfs/PATTERN.md`](bfs/PATTERN.md)
- **DFS** (recursion, via the call stack) when the problem is about
  *paths* or *subtree properties* — depth, balance, same-tree checks,
  lowest common ancestor, inverting the tree. → [`dfs/PATTERN.md`](dfs/PATTERN.md)

If the tree is a **BST**, the sorted-order property usually beats both;
see [`../binary-search-tree/PATTERN.md`](../binary-search-tree/PATTERN.md).

## Traversal orders

Where you do the work relative to the recursive calls is the traversal
order. Three problems in this folder hinge on the distinction, so name
it before you write:

| Order | Sequence | Reach for it when |
|---|---|---|
| **Preorder** | root, left, right | Information flows **down** (depth, path so far); serializing; copying |
| **Inorder** | left, root, right | BSTs — inorder visits a BST in sorted order |
| **Postorder** | left, right, root | You need **both children's answers** first — the default for subtree properties |

The generic DFS template below is implicitly **postorder**.

```js
function dfs(node) {
    if (!node) return baseCase;
    const left = dfs(node.left);
    const right = dfs(node.right);
    return combine(node, left, right);      // work happens after both calls
}
```

Iterative inorder with an explicit stack — the standard follow-up to
LC 94, and what to reach for when recursion depth is a concern:

```js
const stack = [];
let node = root;
const out = [];

while (node || stack.length) {
    while (node) { stack.push(node); node = node.left; }   // dive down the left spine
    node = stack.pop();
    out.push(node.val);                                     // visit
    node = node.right;                                      // then the right subtree
}
return out;
```

## Template (BFS, level by level)

```js
function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length) {
        const levelSize = queue.length;     // freeze before pushing children
        const level = [];
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}
```

Three other BFS shapes (flat, pairwise, both-ends deque) are in
[`bfs/PATTERN.md`](bfs/PATTERN.md).

## Template (build a tree from two traversals)

You need **two** traversals to reconstruct a tree, and one of them must
be inorder. The mechanic is always the same:

1. One traversal hands you the **root** (preorder's first element,
   postorder's last).
2. Find that value in **inorder**; everything left of it is the left
   subtree, everything right of it is the right subtree.
3. Recurse on the two halves.

**From preorder + inorder** (LC 105) — `cbtpreinorder.js`:

```js
var buildTree = function (preorder, inorder) {
    if (!preorder.length || !inorder.length) return null;

    const root = new TreeNode(preorder[0]);          // preorder FIRST = root
    const mid  = inorder.indexOf(root.val);          // split point

    root.left  = buildTree(preorder.slice(1, mid + 1), inorder.slice(0, mid));
    root.right = buildTree(preorder.slice(mid + 1),    inorder.slice(mid + 1));

    return root;
};
```

The `preorder.slice(1, mid + 1)` bound is the fiddly part: the left
subtree has `mid` nodes, so it occupies the `mid` entries right after
the root.

**From inorder + postorder** (LC 106) — `cbtinpostorder.js`. Two
inversions, and both are easy to miss:

```js
var buildTree = function (inorder, postorder) {
    if (!inorder.length) return null;

    const root = new TreeNode(postorder.pop());      // postorder LAST = root
    const mid  = inorder.indexOf(root.val);

    root.right = buildTree(inorder.slice(mid + 1), postorder);   // RIGHT FIRST
    root.left  = buildTree(inorder.slice(0, mid),  postorder);

    return root;
};
```

- The root comes off the **end** (`pop()`), not the front.
- **Right must be built before left.** Postorder is `left, right, root`,
  so consuming it backwards gives `root, right, left` — every `pop()`
  the right subtree needs must happen before the left subtree starts
  taking values. Swap the two lines and the tree comes out mirrored.

Both versions are **O(n²)** because of `indexOf` and `slice` at every
node. The O(n) version passes index ranges instead of slicing and
pre-builds a `value → index` map for inorder — worth mentioning if
asked, but the slice version is what you want on a whiteboard.

## Template (O(1)-space level linking)

`nextrightpointers.js` (LC 116). The trick: once level `k` is fully
linked, you can walk it left-to-right using the `next` pointers you
just built, and link level `k+1` as you go — **no queue at all**.

```js
var connect = function (root) {
    if (root == null) return null;

    let leftMost = root;
    while (leftMost.left) {                     // stop above the leaf level
        let current = leftMost;

        while (current) {                       // walk this level via next
            current.left.next = current.right;                         // within a parent
            if (current.next) current.right.next = current.next.left;   // across parents

            current = current.next;
        }

        leftMost = leftMost.left;               // drop to the next level
    }
    return root;
};
```

Two links per node: the easy one between siblings, and the cross-parent
one that only exists when `current.next` does. This works because the
tree is **perfect** — every node has both children or neither. For LC
117 (any binary tree) you need a dummy head to track the next level's
first node, since children may be missing.

## Complexity

**O(n) time** for a full traversal either way. Space is **O(n)** for
BFS (queue can hold a whole level, up to n/2 nodes) and **O(h)** for DFS
(recursion depth = tree height, O(log n) balanced / O(n) skewed).

Prefer DFS when levels don't matter — O(h) beats O(n) space. And watch
for the accidental quadratic: calling a recursive helper *inside* a
recursive traversal is O(n·h), not O(n). See
[`dfs/PATTERN.md`](dfs/PATTERN.md) → sentinel return.

## Problems in this folder

- [`bfs/PATTERN.md`](bfs/PATTERN.md) — 7 problems (LC 101, 102, 103, 107, 199, 637, plus level-order successor).
- [`dfs/PATTERN.md`](dfs/PATTERN.md) — 8 problems (LC 100, 104, 110, 114, 226, 236, 543, 993).
- [`inordertraversal.js`](inordertraversal.js) (LC 94 Binary Tree Inorder Traversal) — recursive inorder; the iterative stack version is above.
- [`cbtpreinorder.js`](cbtpreinorder.js) (LC 105 Construct Binary Tree from Preorder and Inorder) — root from the **front** of preorder, split inorder at it.
- [`cbtinpostorder.js`](cbtinpostorder.js) (LC 106 Construct Binary Tree from Inorder and Postorder) — root from the **end** of postorder; build **right before left**.
- [`nextrightpointers.js`](nextrightpointers.js) (LC 116 Populating Next Right Pointers) — O(1) space, links each level using the previous level's `next` pointers.
