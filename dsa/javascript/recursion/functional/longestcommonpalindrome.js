/**
516. Longest Palindromic Subsequence
Solved
Medium
Topics
premium lock icon
Companies
Given a string s, find the longest palindromic subsequence's length in s.

A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.

 

Example 1:

Input: s = "bbbab"
Output: 4
Explanation: One possible longest palindromic subsequence is "bbbb".
Example 2:

Input: s = "cbbd"
Output: 2
Explanation: One possible longest palindromic subsequence is "bb".
 

Constraints:

1 <= s.length <= 1000
s consists only of lowercase English letters.
 */
/**
 * https://leetcode.com/problems/longest-palindromic-subsequence/
 * @param {string} s
 * @return {number}
 * O(2^n) time worst case (no memoization), O(n) recursion space
 */
var longestPalindromeSubseq = function (s) {
    const dfs = (left, right) => {
        if (left > right) return 0;
        if (left === right) return 1;
        let count = 0;
        if (s[left] === s[right]) {
            count = 2 + dfs(left + 1, right - 1);
        } else {
            count = Math.max(dfs(left, right - 1), dfs(left + 1, right))
        }
        return count;
    }
    return dfs(0, s.length - 1);
};