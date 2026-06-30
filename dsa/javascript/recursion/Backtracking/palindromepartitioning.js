/**
131. Palindrome Partitioning
Solved
Medium
Topics
premium lock icon
Companies
Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.

 

Example 1:

Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]
Example 2:

Input: s = "a"
Output: [["a"]]
 

Constraints:

1 <= s.length <= 16
s contains only lowercase English letters.
 */
/**
 * https://leetcode.com/problems/palindrome-partitioning/description/
 * @param {string} s
 * @return {string[][]}
 */
var partition = function (s) {
    const result = [];
    const backTrack = (start, currentSubstring) => {
        if (start === s.length) {
            result.push([...currentSubstring]);
            return;
        };
        let subString = "";
        for (let i = start; i < s.length; i++) {
            subString += s.charAt(i);
            if (!isPalindrome(subString)) continue;
            currentSubstring.push(subString);
            backTrack(i + 1, currentSubstring)
            currentSubstring.pop();

        }
    }
    backTrack(0, [])
    return result;
};

const isPalindrome = (s) => {
    let l = 0;
    let r = s.length - 1;
    while (l < s.length - 1) {
        if (s.charAt(l) !== s.charAt(r)) return false;
        l++; r--;
    }
    return true;
}