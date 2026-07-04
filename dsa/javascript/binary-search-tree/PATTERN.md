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

## Complexity

**O(h) time and space** for search/insert where `h` is the tree height
(O(log n) balanced, O(n) worst case skewed). Traversal-based problems
(validate, kth smallest, build from sorted array) are **O(n) time**.

## Problems in this folder

- [`bst.js`](bst.js) — the BST class itself (insert + in-order traversal).
- [`kthsmallest.js`](kthsmallest.js) (LC 230)
- [`sortedtobst.js`](sortedtobst.js) (LC 108)
- [`validatebst.js`](validatebst.js) (LC 98)
