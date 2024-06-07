/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * https://leetcode.com/problems/average-of-levels-in-binary-tree/description/
Input: root = [3,9,20,null,null,15,7]
Output: [3.00000,14.50000,11.00000]
Explanation: The average value of nodes on level 0 is 3, on level 1 is 14.5, and on level 2 is 11.
Hence return [3, 14.5, 11].
Input: root = [3,9,20,15,7]
Output: [3.00000,14.50000,11.00000]
 * @param {TreeNode} root
 * @return {number[]}
 */
var averageOfLevels = function (root) {
    // levels - so BFS
    if (!root) return [];
    let result = [];
    let queue = [root];
    while (queue.length > 0) {
        let levelSum = 0;
        let levelSize = queue.length
        for (let i = 0; i < levelSize; i++) {
            let currentNode = queue.shift();
            if (currentNode.left) queue.push(currentNode.left);
            if (currentNode.right) queue.push(currentNode.right);
            levelSum += currentNode.val;
        }
        result.push(levelSum / levelSize);
    }
    return result;
};