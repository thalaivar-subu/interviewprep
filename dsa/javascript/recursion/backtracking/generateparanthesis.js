/**
22. Generate Parentheses
Medium
Topics
premium lock icon
Companies
Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

 

Example 1:

Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]
Example 2:

Input: n = 1
Output: ["()"]
 

Constraints:

1 <= n <= 8
 */
/**
 * https://leetcode.com/problems/generate-parentheses/description/
 * @param {number} n
 * @return {string[]}
 * O(4^n / sqrt(n)) time (Catalan number bound), O(n) recursion space
 */
var generateParenthesis = function (n) {
    const result = [];

    const backTrack = (current, open, close) => {
        if (current.length === 2 * n) {
            result.push(current);
            return;
        }

        if (open < n) {
            backTrack(current + "(", open + 1, close);
        }

        if (close < open) {
            backTrack(current + ")", open, close + 1);
        }
    };

    backTrack("", 0, 0);
    return result;
};