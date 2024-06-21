/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isBalanced = function (root) {
    if (!root) return true;
    const leftHeight = getHeight(root.left);
    const rightHeight = getHeight(root.right);
    if (Math.abs(leftHeight - rightHeight) > 1) return false;
    return isBalanced(root.left) && isBalanced(root.right);
};

const getHeight = (node) => {
    if (!node) return 0;
    const leftHeight = getHeight(node.left);
    const rightHeight = getHeight(node.right);
    return 1 + Math.max(leftHeight, rightHeight)
}
