/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * 
 * https://leetcode.com/problems/cousins-in-binary-tree/description/
Input: root = [1,2,3,4], x = 4, y = 3
Output: false
Input: root = [1,2,3,null,4,null,5], x = 5, y = 4
Output: true
Input: root = [1,2,3,null,4], x = 2, y = 3
Output: false
 * @param {TreeNode} root
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
var isCousins = function (root, x, y) {
    // find both nodes, then find both levels, then check if siblings
    let node1 = findNode(root, x);
    let node2 = findNode(root, y);

    return (level(root, node1, 0) == level(root, node2, 0)) && (!isSibling(root, node1, node2));
};

const findNode = (node, x) => {
    if (node == null) return null;
    if (node.val == x) return node;
    let n = findNode(node.left, x);
    if (n != null) return n;
    return findNode(node.right, x);
}

const level = (node, x, lev) => {
    if (node == null) return 0;
    if (node == x) return lev;
    let left = level(node.left, x, lev + 1)
    if (left != 0) return left;
    return level(node.right, x, lev + 1)
}

const isSibling = (node, x, y) => {
    if (node == null) return false;
    return (
        (node.left == x && node.right == y)
        || (node.left == y && node.right == x)
        || isSibling(node.left, x, y)
        || isSibling(node.right, x, y)
    )
}