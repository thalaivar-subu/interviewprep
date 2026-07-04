/**
72. Edit Distance
Attempted
Medium
Topics
premium lock icon
Companies
Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.

You have the following three operations permitted on a word:

Insert a character
Delete a character
Replace a character
 

Example 1:

Input: word1 = "horse", word2 = "ros"
Output: 3
Explanation: 
horse -> rorse (replace 'h' with 'r')
rorse -> rose (remove 'r')
rose -> ros (remove 'e')
Example 2:

Input: word1 = "intention", word2 = "execution"
Output: 5
Explanation: 
intention -> inention (remove 't')
inention -> enention (replace 'i' with 'e')
enention -> exention (replace 'n' with 'x')
exention -> exection (replace 'n' with 'c')
exection -> execution (insert 'u')
 

Constraints:

0 <= word1.length, word2.length <= 500
word1 and word2 consist of lowercase English letters.
 */
/**
 * https://leetcode.com/problems/edit-distance/submissions/2054452084/
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 * O(3^(m+n)) time worst case (no memoization), O(m+n) recursion space
 */
var minDistance = function (word1, word2) {
    const dfs = (i, j) => {
        if (i === 0) return j;
        if (j === 0) return i;

        if (word1[i-1] === word2[j-1]) return dfs(i - 1, j - 1);
        return 1 + Math.min(
            dfs(i, j - 1),
            dfs(i - 1, j),
            dfs(i - 1, j - 1)
        )
    }
    return dfs(word1.length, word2.length);
};