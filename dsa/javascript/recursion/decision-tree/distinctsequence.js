/*
115. Distinct Subsequences
Attempted
Hard
Topics
premium lock icon
Companies
Given two strings s and t, return the number of distinct subsequences of s which equals t.

The test cases are generated so that the answer fits on a 32-bit signed integer.

 

Example 1:

Input: s = "rabbbit", t = "rabbit"
Output: 3
Explanation:
As shown below, there are 3 ways you can generate "rabbit" from s.
rabbbit
rabbbit
rabbbit
Example 2:

Input: s = "babgbag", t = "bag"
Output: 5
Explanation:
As shown below, there are 5 ways you can generate "bag" from s.
babgbag
babgbag
babgbag
babgbag
babgbag
 

Constraints:

1 <= s.length, t.length <= 1000
s and t consist of English letters.
*/
/**
 * https://leetcode.com/problems/distinct-subsequences/description/
 * @param {string} s
 * @param {string} t
 * @return {number}
 */
var numDistinct = function (s, t) {
    const helper = (i, j) => {
        if (j === t.length) return 1;
        if (i === s.length) return 0;

        let ans = 0;
        if (s[i] === t[j]) {
            // Take this character + Skip this character
            ans = helper(i + 1, j + 1) + helper(i + 1, j);
        } else {
            // Characters don't match, skip current character in s
            ans = helper(i + 1, j);
        }
        return ans;

    }
    return helper(0, 0);
};