/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {number[]} inorder
 * @param {number[]} postorder
 * @return {TreeNode}
 * https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/
Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]
Output: [3,9,20,null,null,15,7]
Example 2:
Input: inorder = [-1], postorder = [-1]
Output: [-1]
 */
var buildTree = function(inorder, postorder) {
    if(!inorder.length) return null;
    let root = new TreeNode(postorder.pop());
    let mid = inorder.indexOf(root.val);
    root.right = buildTree(inorder.slice(mid+1), postorder);
    root.left = buildTree(inorder.slice(0, mid), postorder);
    return root;
};