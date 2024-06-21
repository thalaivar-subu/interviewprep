/**
 * @param {string} s
 * @param {string} t
 * @return {string}
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