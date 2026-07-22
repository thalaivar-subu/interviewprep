/**
1143. Longest Common Subsequence
Solved
Medium
Topics
premium lock icon
Companies
Hint
Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, "ace" is a subsequence of "abcde".
A common subsequence of two strings is a subsequence that is common to both strings.

 

Example 1:

Input: text1 = "abcde", text2 = "ace" 
Output: 3  
Explanation: The longest common subsequence is "ace" and its length is 3.
Example 2:

Input: text1 = "abc", text2 = "abc"
Output: 3
Explanation: The longest common subsequence is "abc" and its length is 3.
Example 3:

Input: text1 = "abc", text2 = "def"
Output: 0
Explanation: There is no such common subsequence, so the result is 0.
 

Constraints:

1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.
 */
/**
 * https://leetcode.com/problems/longest-common-subsequence/description/
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 * O(2^(m+n)) time worst case (no memoization), O(m+n) recursion space
 */
var longestCommonSubsequence = function (text1, text2) {
    const dfs = (i, j) => {
        if (i === text1.length || j === text2.length) return 0;

        let longest = 0;
        if (text1[i] === text2[j]) {
            longest = 1 + dfs(i + 1, j + 1);
        } else {
            longest = Math.max(dfs(i + 1, j), dfs(i, j + 1))
        }
        return longest;

    }
    return dfs(0, 0);
}


/*
Bro, this is the easiest way to think about converting memoization → DP.

Step 1: What are the changing variables?

Your recursive state is:

dfs(i, j)

So your DP table will be:

dp[i][j]

which means:

LCS of text1[i...] and text2[j...]

Step 2: Base case

Your recursion says:

if (i == text1.length || j == text2.length)
    return 0;

So in DP,

dp[m][*] = 0
dp[*][n] = 0

where

m = text1.length
n = text2.length

That's why we create:

const dp = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));

The extra row and column are the base cases.

Step 3: Convert recursive formula

Recursive:

if (text1[i] === text2[j]) {
    return 1 + dfs(i + 1, j + 1);
}

return Math.max(
    dfs(i + 1, j),
    dfs(i, j + 1)
);

DP:

if (text1[i] === text2[j]) {
    dp[i][j] = 1 + dp[i + 1][j + 1];
} else {
    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
}

Exactly the same equation.

Step 4: Which direction?

Notice every state depends on:

(i+1, j)
(i, j+1)
(i+1, j+1)

So those values must already exist.

That means we fill from bottom-right to top-left.

for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {

    }
}
Final DP
var longestCommonSubsequence = function (text1, text2) {
    const m = text1.length;
    const n = text2.length;

    const dp = Array(m + 1)
        .fill(0)
        .map(() => Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (text1[i] === text2[j]) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    return dp[0][0];
};
🔥 A trick that works for almost every recursion → DP conversion
Identify the state (dfs(i, j) → dp[i][j]).
Copy the base case into the DP table.
Copy the recurrence exactly.
Determine the fill order by looking at dependencies.
Depends on i+1 → iterate i backwards.
Depends on i-1 → iterate i forwards.
Depends on both → choose an order where dependencies are already computed.

Once you get comfortable with these four steps, you'll be able to convert most memoized recursive solutions to bottom-up DP.
*/