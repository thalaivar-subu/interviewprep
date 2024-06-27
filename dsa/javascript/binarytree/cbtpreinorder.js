/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {number[]} preorder
 * @param {number[]} inorder
 * @return {TreeNode}
https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]
Example 2:
Input: preorder = [-1], inorder = [-1]
Output: [-1]
 */
var buildTree = function(preorder, inorder) {
    if(!preorder.length || !inorder.length) return null;
    let root = new TreeNode(preorder[0]);
    let mid = inorder.indexOf(root.val);
    root.left = buildTree(preorder.slice(1, mid+1), inorder.slice(0, mid));
    root.right = buildTree(preorder.slice(mid+1), inorder.slice(mid+1));
    return root;
};