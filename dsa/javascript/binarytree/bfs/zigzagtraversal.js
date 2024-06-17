/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[20,9],[15,7]]
Example 2:
Input: root = [1]
Output: [[1]]
Example 3:
Input: root = []
Output: []
 * @param {TreeNode} root
 * @return {number[][]}
 */
var zigzagLevelOrder = function(root) {
    //bfs - normal, rev, normal rev
    if(!root) return [];
    let queue = [root];
    let result = [];
    let flag = true;
    while(queue.length){
        let levelSize = queue.length;
        let levelValues = [];
        for(let i=0;i<levelSize;i++){
            let currentNode;
            if(flag){
                // normal order
                currentNode = queue.shift()
                if(currentNode.left) queue.push(currentNode.left);
                if(currentNode.right) queue.push(currentNode.right);
            } else {
                // reverse order
                currentNode = queue.pop();
                if(currentNode.right) queue.unshift(currentNode.right);
                if(currentNode.left) queue.unshift(currentNode.left);
            }
            levelValues.push(currentNode.val);
        }
        flag = !flag;
        result.push(levelValues);
    }
    return result;
};