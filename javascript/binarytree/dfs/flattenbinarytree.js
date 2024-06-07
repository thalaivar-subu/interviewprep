/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/flatten-binary-tree-to-linked-list/
Input: root = [1,2,5,3,4,null,6]
Output: [1,null,2,null,3,null,4,null,5,null,6]
Example 2:
Input: root = []
Output: []
Example 3:
Input: root = [0]
Output: [0]
 * @param {TreeNode} root
 * @return {void} Do not return anything, modify root in-place instead.
 */
var flatten = function(root) {
    if(root == null) return [];
    let current = root;
    while(current){
        if(current.left){
            let temp = current.left;
            while(temp.right){
                temp = temp.right;
            }
            temp.right = current.right;
            current.right = current.left;
            current.left = null;
        }
        current = current.right;
    }
    return root;
};