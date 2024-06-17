/**
 * // Definition for a Node.
 * function Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */

/**
 * https://leetcode.com/problems/populating-next-right-pointers-in-each-node/description/
Input: root = [1,2,3,4,5,6,7]
Output: [1,#,2,3,#,4,5,6,7,#]
Explanation: Given the above perfect binary tree (Figure A), your function should populate each next pointer to point to its next right node, just like in Figure B. The serialized output is in level order as connected by the next pointers, with '#' signifying the end of each level.
Example 2:
Input: root = []
Output: []
 * @param {Node} root
 * @return {Node}
 */
var connect = function(root) {
    if(root == null) return null;
    let leftMost = root;
    while(leftMost.left){
        let current = leftMost;
        while(current){
            current.left.next = current.right;
            if(current.next) current.right.next = current.next.left;
            current = current.next;
        }
        leftMost = leftMost.left;
    }
    return root;
};