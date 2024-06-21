/**
 * @param {string} s
 * @return {number}
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
o(N)
 */
var lengthOfLongestSubstring = function (s) {
    let charSet = new Set();
    let l = 0;
    let r = 0;
    let result = 0;
    while (r < s.length) {
        while (charSet.has(s[r])) {
            charSet.delete(s.charAt(l++));
        }
        charSet.add(s[r]);
        result = Math.max(result, charSet.size);
        r++;
    }
    return result;
};