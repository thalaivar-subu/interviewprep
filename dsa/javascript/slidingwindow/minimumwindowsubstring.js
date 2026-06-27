/**
76. Minimum Window Substring
Solved
Hard
Topics
premium lock icon
Companies
Hint
Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".

The testcases will be generated such that the answer is unique.

 

Example 1:

Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.
Example 2:

Input: s = "a", t = "a"
Output: "a"
Explanation: The entire string s is the minimum window.
Example 3:

Input: s = "a", t = "aa"
Output: ""
Explanation: Both 'a's from t must be included in the window.
Since the largest window of s only has one 'a', return empty string.
 

Constraints:

m == s.length
n == t.length
1 <= m, n <= 105
s and t consist of uppercase and lowercase English letters.
 

Follow up: Could you find an algorithm that runs in O(m + n) time?
 */
/**
 * https://leetcode.com/problems/minimum-window-substring/
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function (s, t) {
    let map = new Map();
    for (let x of t) map.set(x, (map.get(x) || 0) + 1);
    let l = 0; let r = 0;
    let length = Number.MAX_SAFE_INTEGER;
    let count = map.size;
    let minWindow = "";
    while (r < s.length) {
        let rightLetter = s[r];
        if (map.has(rightLetter)) {
            map.set(rightLetter, map.get(rightLetter) - 1);
            if (map.get(rightLetter) === 0) count--;
        }
        r++;

        while (count === 0) {
            if (r - l < length) {
                length = r - l;
                minWindow = s.slice(l, r)
            }
            let leftLetter = s[l];
            if (map.has(leftLetter)) {
                map.set(leftLetter, map.get(leftLetter) + 1);
                if (map.get(leftLetter) > 0) count++;
            }
            l++;
        }
    }
    return minWindow
};
console.log(minWindow("ADOBECODEBANC", "ABC"))