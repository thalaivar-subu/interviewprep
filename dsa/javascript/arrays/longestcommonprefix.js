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
/*
After sorting strings lexicographically, the longest common prefix of all strings is the same as the common prefix of the first and last strings.
 */
var longestCommonPrefix = function(strs) {
    strs.sort();
    let first = strs[0];
    let last = strs[strs.length - 1];
    let result = "";
    let i =0;
    while(i<first.length && i<last.length){
        if(first[i] === last[i]){
            result+=first[i];
            i++;
        } else break;
    }
    return result;
};