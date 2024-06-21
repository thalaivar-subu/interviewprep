/**
 * @param {string} s
 * @param {number} k
 * @return {number}
Example 1:
Input: s = "ABAB", k = 2
Output: 4
Explanation: Replace the two 'A's with two 'B's or vice versa.
Example 2:
Input: s = "AABABBA", k = 1
Output: 4
Explanation: Replace the one 'A' in the middle with 'B' and form "AABBBBA".
The substring "BBBB" has the longest repeating letters, which is 4.
There may exists other ways to achieve this answer too.
 */
var characterReplacement = function (s, k) {
    let l = 0;
    let r = 0;
    let result = 0;
    let map = new Map();
    while (r < s.length) {
        map.set(s[r], (map.get(s[r]) || 0) + 1);
        result = Math.max(map.get(s[r]), result)
        if (r - l + 1 - result > k) {
            map.set(s[l], map.get(s[l]) - 1);
            l++;
        }
        r++;
    }
    return r - l;
};