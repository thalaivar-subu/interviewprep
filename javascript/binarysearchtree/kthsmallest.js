/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/kth-smallest-element-in-a-bst/
Input: root = [3,1,4,null,2], k = 1
Output: 1
Input: root = [5,3,6,2,4,null,null,1], k = 3
Output: 3
 * @param {TreeNode} root
 * @param {number} k
 * @return {number}
 */

var kthSmallest = function(root, k) {
    let count = 0;
    const helper = (root, k) => {
        if(root == null) return null;
        let leftNode = helper(root.left, k);
        if(leftNode) return leftNode;
        count++;
        if(k == count) return root;
        return helper(root.right, k);
    }
    return helper(root, k).val;
};