/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 * Example 1:
https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/description/
Input: haystack = "sadbutsad", needle = "sad"
Output: 0
Explanation: "sad" occurs at index 0 and 6.
The first occurrence is at index 0, so we return 0.
Example 2:

Input: haystack = "leetcode", needle = "leeto"
Output: -1
Explanation: "leeto" did not occur in "leetcode", so we return -1.
 */
var strStr = function (haystack, needle) {
    if (haystack.length < needle.length) return -1;
    for (let i = 0; i <= haystack.length - needle.length; i++) {
        let j = 0;
        while (j < needle.length && needle[j] === haystack[i + j]) j++;
        if (j === needle.length) return i;
    }
    return -1;
};