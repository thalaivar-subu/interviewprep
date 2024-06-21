/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
Example 1:
Input: s = "cbaebabacd", p = "abc"
Output: [0,6]
Explanation:
The substring with start index = 0 is "cba", which is an anagram of "abc".
The substring with start index = 6 is "bac", which is an anagram of "abc".
Example 2:
Input: s = "abab", p = "ab"
Output: [0,1,2]
Explanation:
The substring with start index = 0 is "ab", which is an anagram of "ab".
The substring with start index = 1 is "ba", which is an anagram of "ab".
The substring with start index = 2 is "ab", which is an anagram of "ab".
 */
/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */
var findAnagrams = function (s, p) {
    if (p.length > s.length) return [];
    let pMap = new Map(); let sMap = new Map();
    for (let i = 0; i < p.length; i++) {
        pMap.set(p[i], (pMap.get(p[i]) || 0) + 1);
        sMap.set(s[i], (sMap.get(s[i]) || 0) + 1);
    }
    let l = 0; let r = p.length;
    let result = compareMaps(sMap, pMap) ? [0] : [];
    while (r < s.length) {
        sMap.set(s[r], (sMap.get(s[r]) || 0) + 1);
        sMap.set(s[l], (sMap.get(s[l]) || 0) - 1);
        if (sMap.get(s[l]) <= 0) sMap.delete(s[l]);
        l++;
        r++;
        if (compareMaps(sMap, pMap)) result.push(l);
    }
    return result;
};

function compareMaps(map1, map2) {
  if (map1.size !== map2.size) return false;
  for (let key of map1.keys()) {
    if (!map2.has(key) || map1.get(key) !== map2.get(key)) {
      return false;
    }
  }
  return true;
}