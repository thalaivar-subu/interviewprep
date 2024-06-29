/**
 * @param {string} s
 * @return {number}
 * Given a string s, find the longest palindromic subsequence's length in s.
A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.
Example 1:
Input: s = "bbbab"
Output: 4
Explanation: One possible longest palindromic subsequence is "bbbb".
Example 2:
Input: s = "cbbd"
Output: 2
Explanation: One possible longest palindromic subsequence is "bb".
 */
var longestPalindromeSubseq = function(s) {
    const n = s.length;
    if (n === 0) return 0;

    // Create a DP table to store lengths of palindromic subsequences
    const dp = Array.from({ length: n }, () => Array(n).fill(0));

    // All substrings of length 1 have a palindromic subsequence of length 1
    for (let i = 0; i < n; i++) {
        dp[i][i] = 1;
    }

    // Build the table
    for (let length = 2; length <= n; length++) {
        for (let i = 0; i <= n - length; i++) {
            const j = i + length - 1;
            if (s[i] === s[j]) {
                dp[i][j] = dp[i + 1][j - 1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
    }

    // The result is the length of the longest palindromic subsequence
    return dp[0][n - 1];
};