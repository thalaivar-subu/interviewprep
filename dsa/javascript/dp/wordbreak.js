/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 * 
 * https://leetcode.com/problems/word-break/description/
Example 1:

Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
Explanation: Return true because "leetcode" can be segmented as "leet code".
Example 2:

Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
Explanation: Return true because "applepenapple" can be segmented as "apple pen apple".
Note that you are allowed to reuse a dictionary word.
Example 3:

Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: false
 */
var wordBreak = function (s, wordDict) {
    let memo = {};
    let wordSet = new Set(wordDict);
    return dfs(s, wordSet, memo);
};

function dfs(s, wordSet, memo) {
    if (s in memo) return memo[s];
    if (wordSet.has(s)) return true;
    for (let i = 1; i < s.length; i++) {
        let prefix = s.substring(0, i);
        if (wordSet.has(prefix) && dfs(s.substring(i), wordSet, memo)) {
            memo[s] = true;
            return true;
        }
    }
    memo[s] = false;
    return false;
}