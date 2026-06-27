/**
3. Longest Substring Without Repeating Characters
Solved
Medium
Topics
premium lock icon
Companies
Hint
Given a string s, find the length of the longest substring without duplicate characters.

 

Example 1:

Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3. Note that "bca" and "cab" are also correct answers.
Example 2:

Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
Example 3:

Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
 */
/**
 * https://leetcode.com/problems/longest-substring-without-repeating-characters/
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    let charSet = new Set();
    let r = 0;
    let l = 0;

    let max = 0;
    // Move right pointer, when duplicate in right move left pointer and clear set
    while (r < s.length) {
        while (charSet.has(s.charAt(r))) {
            charSet.delete(s.charAt(l++));
        }
        charSet.add(s.charAt(r));
        max = Math.max(max, charSet.size)
        r++;
    }
    return max;
};