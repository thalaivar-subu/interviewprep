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
 * O(h + k) time worst case O(n), O(h) recursion space
 */

var kthSmallest = function(root, k) {
    let count = 0;
    const helper = (root) => {
        if(root == null) return;
        const left = helper(root.left);
        if(left) return left;
        count++;
        if(k === count) return root;
        return helper(root.right);
    }
    return helper(root).val;
};