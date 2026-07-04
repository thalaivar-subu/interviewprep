# Binary Tree Pattern Notes

## When to use it

Any problem operating on a plain (not necessarily sorted) binary tree.
The split that matters is **BFS vs DFS**:

- **BFS** (level order, via a queue) when the problem is about
  *levels* — per-level averages, right-side view, zigzag order,
  connecting siblings.
- **DFS** (recursion, via the call stack) when the problem is about
  *paths* or *subtree properties* — depth, balance, same-tree checks,
  lowest common ancestor, inverting the tree.

See [`bfs/`](bfs) and [`dfs/`](dfs) for the two template styles.

## Template (BFS, level by level)

```js
function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length) {
        const levelSize = queue.length;
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

## Template (DFS, recursive)

```js
function dfs(node) {
    if (!node) return baseCase;
    const left = dfs(node.left);
    const right = dfs(node.right);
    return combine(node, left, right);
}
```

## Complexity

**O(n) time** for a full traversal either way. Space is **O(n)** for
BFS (queue can hold a whole level, up to n/2 nodes) and **O(h)** for DFS
(recursion depth = tree height, O(log n) balanced / O(n) skewed).

## Problems in this folder

- [`bfs/`](bfs) — level order, zigzag, right side view, symmetric tree, etc.
- [`dfs/`](dfs) — max depth, balanced check, invert, LCA, same tree, etc.
- [`cbtinpostorder.js`](cbtinpostorder.js) / [`cbtpreinorder.js`](cbtpreinorder.js) — build a tree from two traversal orders.
- [`inordertraversal.js`](inordertraversal.js) (LC 94)
- [`nextrightpointers.js`](nextrightpointers.js) (LC 116) — BFS-flavored, O(1) space using existing next pointers.
