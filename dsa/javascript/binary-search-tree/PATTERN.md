# Binary Search Tree Pattern Notes

## When to use it

Whenever the tree has the BST invariant — everything in the left
subtree is smaller, everything in the right subtree is bigger — you can
exploit it to prune half the tree at every step, same idea as binary
search on an array. An **in-order traversal of a BST visits nodes in
sorted order**, which is the key trick behind several of these problems
(kth smallest, validating a BST).

## Template (BST insert)

```js
function insert(node, value) {
    if (node == null) return new Node(value);
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    return node;
}
```

## Template (validate using a min/max range)

```js
function isValidBST(node, min = -Infinity, max = Infinity) {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
}
```

## Template (validate using in-order predecessor)

The other standard way to validate, and the one that follows directly
from "in-order visits a BST in sorted order": walk in order, keep the
**previously visited node**, and assert each value is strictly greater.

```js
let prev = null;

const inorder = (node) => {
    if (!node) return true;

    if (!inorder(node.left)) return false;      // left subtree failed

    if (prev !== null && prev.val >= node.val) return false;   // not increasing
    prev = node;                                                // ← the whole state

    return inorder(node.right);
};
```

Use whichever you find easier to get right. The range version passes
constraints **down**; this one carries state **across** the traversal.
Both are O(n) with O(h) stack.

## Template (in-order with a counter and early exit)

`kthsmallest.js` (LC 230). Since in-order yields sorted order, the k-th
node visited is the answer. Two mechanics beyond a plain traversal: an
**external counter**, and **propagating the found node back up** so the
recursion stops instead of finishing the walk.

```js
let count = 0;

const helper = (node) => {
    if (node == null) return null;

    const left = helper(node.left);
    if (left) return left;                 // ← already found below; bubble it up

    count++;
    if (count === k) return node;          // this is the k-th smallest

    return helper(node.right);
};

return helper(root).val;
```

`if (left) return left` is what makes this early-exit rather than a full
traversal — it's the same found-node propagation used by LCA in
[`../binary-tree/dfs/PATTERN.md`](../binary-tree/dfs/PATTERN.md). Best
case O(k), worst case O(n).

If the tree is modified often and this query is frequent, the standard
follow-up is to store a **subtree size** on each node, which makes it
O(h).

## Template (build a balanced BST from a sorted array)

`sortedtobst.js` (LC 108). The middle element becomes the root, which
splits the remainder into two equal halves — that's what guarantees
balance. Recurse on **index ranges**, never on array slices:

```js
const helper = (start, end) => {
    if (start > end) return null;                    // empty range

    const mid = Math.floor(start + (end - start) / 2);
    const node = new TreeNode(nums[mid]);

    node.left  = helper(start, mid - 1);
    node.right = helper(mid + 1, end);

    return node;
};

return helper(0, nums.length - 1);
```

Passing indices keeps it **O(n) time / O(log n) space**; slicing at each
level would copy the array `log n` times for O(n log n). The height is
`⌈log₂(n+1)⌉` by construction, since each side gets at most one more
element than the other.

## Complexity

**O(h) time and space** for search/insert where `h` is the tree height
(O(log n) balanced, O(n) worst case skewed). Traversal-based problems
(validate, kth smallest, build from sorted array) are **O(n) time**.

| Problem | Time | Space |
|---|---|---|
| Insert / search | O(h) | O(h) |
| Validate (either method) | O(n) | O(h) |
| Kth smallest | O(k) best, **O(n)** worst | O(h) |
| Sorted array → BST | **O(n)** | O(log n) |

## Problems in this folder

- [`bst.js`](bst.js) — the BST class itself (insert + in-order traversal). A data-structure implementation, not a problem.
- [`validatebst.js`](validatebst.js) (LC 98 Validate Binary Search Tree) — **min/max range** passed down. (The file seeds with `Number.MIN_SAFE_INTEGER`/`MAX_SAFE_INTEGER` where the template uses `±Infinity`; equivalent within LC's ±2³¹ constraints, but `±Infinity` is the safer habit.)
- [`kthsmallest.js`](kthsmallest.js) (LC 230 Kth Smallest Element in a BST) — in-order + external counter + found-node propagation for early exit.
- [`sortedtobst.js`](sortedtobst.js) (LC 108 Convert Sorted Array to BST) — recurse on **index ranges**, mid as root.

Not covered here (no example in the folder yet): BST **delete** (three
cases, the two-children case replaces with the in-order successor),
**LCA of a BST** (walk down comparing `root.val` against both `p` and
`q` — if they straddle, you're at the LCA), and in-order successor.

Related: [`../binary-tree/PATTERN.md`](../binary-tree/PATTERN.md) for
general tree traversal, and [`../binary-search/PATTERN.md`](../binary-search/PATTERN.md)
for the same halving idea on an array.
