/**
 * @param {string[]} strs
 * @return {string}
 * https://leetcode.com/problems/longest-common-prefix/description/

Input: strs = ["flower","flow","flight"]
Output: "fl"
Example 2:

Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.
 */
// Brute Force - O ( M * N)
var longestCommonPrefix = function (strs) {
    let result = "";
    for (let i = 0; i < strs[0].length; i++) {
        for (let j = 1; j < strs.length; j++) {
            if (strs[0][i] !== strs[j][i]) return result;
        }
        result += strs[0][i];
    }
    return result;
};

// Sort and check first and last element
var longestCommonPrefix = function (strs) {
    let result = "";
    strs.sort();
    let n = strs.length - 1;
    let f = strs[0]
    let l = strs[n];
    let i = 0;
    while (i < f.length && i < l.length) {
        if (f[i] === l[i]) {
            result += f[i];
            i++;
        } else break;
    }
    return result;
};