/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/maximum-depth-of-binary-tree/submissions/1279327108/
Input: root = [3,9,20,null,null,15,7]
Output: 3
Example 2:
Input: root = [1,null,2]
Output: 2
 
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
    if(root == null) return 0;
    let left = maxDepth(root.left);
    let right = maxDepth(root.right);
    let depth = Math.max(left, right) + 1;
    return depth;
};