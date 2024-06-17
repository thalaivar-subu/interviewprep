/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/invert-binary-tree/
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
Input: root = [2,1,3]
Output: [2,3,1]
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function(root) {
    const helper = (node) => {
        if(node == null) return null;
        const leftNode = helper(node.left);
        const rightNode = helper(node.right);
        node.left = rightNode;
        node.right = leftNode;
        return node;
    }   
    return helper(root);
};