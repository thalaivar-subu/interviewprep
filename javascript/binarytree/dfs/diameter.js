/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/diameter-of-binary-tree/
Input: root = [1,2,3,4,5]
Output: 3
Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].
Example 2:
Input: root = [1,2]
Output: 1
 * @param {TreeNode} root
 * @return {number}
 */
var diameterOfBinaryTree = function(root) {
    // get left height, get right height. diameter = max(dia, dia=left + right + 1)
    // Since height is found - use dfs - recursion - so edge case first
    let diameter = 0;
    const helper = (node) => {
        if(node == null) return 0;
        let leftHeight = helper(node.left);
        let rightHeight = helper(node.right);
        diameter = Math.max(diameter, leftHeight + rightHeight + 1);
        return Math.max(leftHeight, rightHeight) + 1;
    }
    helper(root);
    return diameter - 1;
};