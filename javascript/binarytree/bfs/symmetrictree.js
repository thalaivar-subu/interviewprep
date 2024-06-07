/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/symmetric-tree/
Input: root = [1,2,2,3,4,4,3]
Output: true
Input: root = [1,2,2,null,3,null,3]
Output: false
 * @param {TreeNode} root
 * @return {boolean}
 */
var isSymmetric = function(root) {
    // traverse left and right by adding it in queue and check for invalid conditions
    let queue = [root.left, root.right];
    while(queue.length){
        let left = queue.shift();
        let right = queue.shift();
        if(left == null && right == null) continue;
        if(left == null || right == null) return false;
        if(left.val!=right.val) return false;
        // push in order of comparison leftleft/rightright
        queue.push(left.left)
        queue.push(right.right)
        queue.push(left.right)
        queue.push(right.left)
    }
    return true;
};