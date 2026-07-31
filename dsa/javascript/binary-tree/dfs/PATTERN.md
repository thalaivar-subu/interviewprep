# Binary Tree DFS Pattern Notes

## When to use it

DFS when the question is about **paths or subtree properties** rather
than levels: depth, balance, "does this subtree contain X", lowest
common ancestor, comparing two trees, rewriting pointers.

The generic shape — recurse left, recurse right, combine — is in
[`../PATTERN.md`](../PATTERN.md). This file covers the six shapes that
the generic template does **not** produce, and they're the ones that
actually come up.

## Traversal order — say it out loud before you write

Where you do the work relative to the recursive calls *is* the traversal
order, and several problems here hinge on it:

```js
const dfs = (node) => {
    if (!node) return;

    visit(node);      // ← PREORDER   (root, left, right)
    dfs(node.left);
    visit(node);      // ← INORDER    (left, root, right)
    dfs(node.right);
    visit(node);      // ← POSTORDER  (left, right, root)
};
```

- **Preorder** — you need the parent's information before descending
  (passing depth down, serializing, copying a tree).
- **Inorder** — BST problems, because inorder visits a BST in sorted
  order. See [`../../binary-search-tree/PATTERN.md`](../../binary-search-tree/PATTERN.md).
- **Postorder** — you need results from **both children** before you can
  answer for this node. **This is the default for subtree properties**,
  and the `combine(node, left, right)` template is implicitly postorder.

Iterative inorder, the standard follow-up to LC 94 — push left spine,
pop, visit, go right:

```js
const stack = [];
let node = root;
const out = [];

while (node || stack.length) {
    while (node) { stack.push(node); node = node.left; }   // dive left
    node = stack.pop();
    out.push(node.val);                                     // visit
    node = node.right;                                      // then right
}
```

## Template (return one thing, accumulate another)

**The most reusable DFS idiom there is.** The value a node needs to
report to its parent is often *not* the value you're solving for. Return
the former; track the latter in a closure variable.

`diameter.js` (LC 543): a node reports its **height** upward, but the
answer is the longest path *through* some node.

```js
var diameterOfBinaryTree = function (root) {
    let diameter = 0;                                  // the answer lives here

    const helper = (node) => {
        if (node == null) return 0;

        const leftHeight = helper(node.left);
        const rightHeight = helper(node.right);

        diameter = Math.max(diameter, leftHeight + rightHeight + 1);  // through this node

        return Math.max(leftHeight, rightHeight) + 1;  // what the PARENT needs
    };

    helper(root);
    return diameter - 1;                               // nodes → edges
};
```

Two separate quantities, one traversal. The same idiom solves LC 124
(max path sum: return the best *one-armed* path, accumulate the best
two-armed one), LC 687, LC 1372.

> Note the `- 1`: this counts **nodes** on the path, LeetCode wants
> **edges**. Decide which you're counting before you write the base case.

## Template (sentinel return — two answers in one value)

When a check needs both "is it valid?" and "what's the measurement?",
return the measurement and reserve an impossible value for invalid.

`balancedbinarytree.js` (LC 110): return the height, or `-1` meaning
"a subtree below here is already unbalanced".

```js
const height = (node) => {
    if (!node) return 0;

    const left = height(node.left);
    if (left === -1) return -1;                     // short-circuit up

    const right = height(node.right);
    if (right === -1) return -1;

    if (Math.abs(left - right) > 1) return -1;      // this node fails

    return 1 + Math.max(left, right);
};

return height(root) !== -1;
```

**This is the trap the template exists to prevent.** The file in this
folder computes `getHeight(left)` and `getHeight(right)` at *every*
node, re-walking each subtree once per ancestor — **O(n²)** on a skewed
tree. The sentinel version is a single **O(n)** pass. Whenever you catch
yourself calling a recursive helper from inside another recursive
traversal, ask whether one pass can carry both facts.

## Template (found-node propagation)

Return the node itself as the signal, and let `null` mean "not in this
subtree". Where **both** children come back non-null, you're standing on
the answer.

`lca.js` (LC 236):

```js
var lowestCommonAncestor = function (root, p, q) {
    if (root == null) return null;
    if (root === p || root === q) return root;      // found one — stop here

    const left  = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);

    if (left && right) return root;                 // split point = LCA
    return left ? left : right;                     // pass the hit upward
};
```

Why returning early at `root === p` is correct even if `q` is below it:
if `q` is in `p`'s subtree, then `p` *is* the LCA (a node is its own
descendant), and the parent sees exactly one non-null child. Both cases
fall out of the same three lines.

## Template (depth as a parameter)

Postorder carries information **up**. When you need information to flow
**down** — the current depth, the path so far, a running sum — pass it as
an argument.

`iscousins.js` (LC 993) needs both a node's depth and its parent:

```js
const level = (node, target, depth) => {
    if (node == null) return 0;                     // 0 = "not found"
    if (node === target) return depth;

    const left = level(node.left, target, depth + 1);
    if (left !== 0) return left;                    // found on the left

    return level(node.right, target, depth + 1);
};
```

Note the convention: `0` doubles as "not found" **and** as the root's
own depth, which is why the initial call passes `0`... and why the root
can never be reported. Fine here (the root has no cousins) but exactly
the kind of thing to state explicitly rather than discover in a failing
test. `-1` is the safer sentinel in general.

The same problem also wants "do these two share a parent", which is a
plain search over parent-child triples:

```js
const isSibling = (node, x, y) =>
    node != null && (
        (node.left === x && node.right === y) ||
        (node.left === y && node.right === x) ||
        isSibling(node.left, x, y) || isSibling(node.right, x, y)
    );
```

Cousins = **same depth, different parent**.

## Template (dual-tree parallel recursion)

Recurse on **two nodes at once**, in lockstep. Get the three base cases
right and the recursive step is one line.

`samtree.js` (LC 100):

```js
var isSameTree = function (p, q) {
    if (!p && !q) return true;                      // both empty → equal
    if (!p || !q) return false;                     // one empty → differ

    return p.val === q.val
        && isSameTree(p.left,  q.left)
        && isSameTree(p.right, q.right);
};
```

Change *which children you pair up* and you get a different problem —
pairing `p.left` with `q.right` gives mirror-image checking (LC 101,
solved with BFS in [`../bfs/PATTERN.md`](../bfs/PATTERN.md), but this
recursion is the shorter answer):

```js
const isMirror = (a, b) =>
    (!a && !b) || (a && b && a.val === b.val
        && isMirror(a.left,  b.right)               // outer pair
        && isMirror(a.right, b.left));              // inner pair
```

Also LC 572 (subtree of another tree) = `isSameTree` called at every
node.

## Template (in-place rewiring)

Not DFS at all — a pointer-manipulation loop that happens to live in
this folder. Worth its own section because the technique (**thread the
tree by splicing subtrees onto rightmost nodes**) recurs in Morris
traversal.

`flattenbinarytree.js` (LC 114) — flatten to a right-skewed list in
**O(1) space**:

```js
let current = root;

while (current) {
    if (current.left) {
        let rightmost = current.left;
        while (rightmost.right) rightmost = rightmost.right;   // rightmost of left subtree

        rightmost.right = current.right;    // hang the old right subtree off it
        current.right   = current.left;     // left subtree becomes the right one
        current.left    = null;
    }
    current = current.right;                // walk into what we just spliced
}
```

The rightmost node of the left subtree is exactly the node that
*precedes* `current.right` in preorder — that's why splicing there
preserves the order. The recursive version is easier to write but costs
O(h) stack; this is the one worth memorizing.

## Complexity

**O(n) time** for any single full traversal, **O(h) space** for the call
stack — O(log n) balanced, **O(n) on a skewed tree** (the case
interviewers ask about).

Watch for the accidental quadratic: calling a recursive helper *inside*
a recursive traversal makes it **O(n·h)** = O(n²) skewed. `balancedbinarytree.js`
as written and `iscousins.js` (which runs four separate traversals) are
both examples. The one-pass rewrites are in the templates above.

`flattenbinarytree.js` is **O(n) time, O(1) space** — the inner
rightmost-walk looks quadratic but each edge is traversed at most twice.

## Problems in this folder

- [`maxdepth.js`](maxdepth.js) (LC 104 Maximum Depth) — the canonical postorder combine, `1 + max(l, r)`.
- [`invertbinarytree.js`](invertbinarytree.js) (LC 226 Invert Binary Tree) — postorder swap.
- [`diameter.js`](diameter.js) (LC 543 Diameter of Binary Tree) — **return height, accumulate diameter**; converts nodes→edges at the end.
- [`balancedbinarytree.js`](balancedbinarytree.js) (LC 110 Balanced Binary Tree) — **sentinel return**; the file uses the O(n²) recompute, see the template for the O(n) one-pass version.
- [`lca.js`](lca.js) (LC 236 Lowest Common Ancestor) — **found-node propagation**; both children non-null ⇒ this is the LCA.
- [`iscousins.js`](iscousins.js) (LC 993 Cousins in Binary Tree) — **depth as a parameter** plus a parent/sibling check.
- [`samtree.js`](samtree.js) (LC 100 Same Tree) — **dual-tree parallel recursion**, three base cases.
- [`flattenbinarytree.js`](flattenbinarytree.js) (LC 114 Flatten Binary Tree to Linked List) — **in-place rewiring** via the rightmost node of the left subtree; O(1) space.

Related, one level up: [`../inordertraversal.js`](../inordertraversal.js)
(LC 94), [`../cbtpreinorder.js`](../cbtpreinorder.js) (LC 105) and
[`../cbtinpostorder.js`](../cbtinpostorder.js) (LC 106) — see
[`../PATTERN.md`](../PATTERN.md) for tree construction from traversals.
