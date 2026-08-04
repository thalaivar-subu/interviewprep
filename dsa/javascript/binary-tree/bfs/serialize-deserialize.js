/**
297. Serialize and Deserialize Binary Tree
Solved
Hard
Topics
premium lock icon
Companies
Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.

Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.

Clarification: The input/output format is the same as how LeetCode serializes a binary tree. You do not necessarily need to follow this format, so please be creative and come up with different approaches yourself.

 

Example 1:


Input: root = [1,2,3,null,null,4,5]
Output: [1,2,3,null,null,4,5]
Example 2:

Input: root = []
Output: []
 

Constraints:

The number of nodes in the tree is in the range [0, 104].
-1000 <= Node.val <= 1000
*/

/**
 * Encodes a tree to a single string.
 * https://leetcode.com/problems/serialize-and-deserialize-binary-tree/description/
 * @param {TreeNode} root
 * @return {string}
 */
var serialize = function (root) {
    if (root == null) return "[]";
    const queue = [root];
    const result = [];
    while (queue.length) {
        let levelSize = queue.length;
        for (let i = 0; i < levelSize; i++) {
            const currentNode = queue.shift();
            if (currentNode == null) {
                result.push("null");
                continue;
            }
            result.push(currentNode.val);
            queue.push(currentNode.left);
            queue.push(currentNode.right);
        }
    }
    return `[${result.join(",")}]`;
};


/**
 * Decodes your encoded data to tree.
 *
 * @param {string} data
 * @return {TreeNode}
 */
var deserialize = function (data) {
    if (data === "[]") return null;

    const treeVals = data.slice(1, -1).split(",");
    const root = new TreeNode(Number(treeVals[0]));

    const queue = [root];

    let i = 1;
    while (queue.length && i < treeVals.length) {
        const currentNode = queue.shift();
        if (treeVals[i] != "null") {
            currentNode.left = new TreeNode(Number(treeVals[i]));
            queue.push(currentNode.left)
        }
        i++;
        if (treeVals[i] != "null") {
            currentNode.right = new TreeNode(Number(treeVals[i]));
            queue.push(currentNode.right)
        }
        i++;
    }
    return root;

};

/**
 * Your functions will be called as such:
 * deserialize(serialize(root));
 */