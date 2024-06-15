// https://leetcode.com/problems/integer-to-roman/description/
/*
Example 1:
Input: num = 3749
Output: "MMMDCCXLIX"
Explanation:
3000 = MMM as 1000 (M) + 1000 (M) + 1000 (M)
 700 = DCC as 500 (D) + 100 (C) + 100 (C)
  40 = XL as 10 (X) less of 50 (L)
   9 = IX as 1 (I) less of 10 (X)
Note: 49 is not 1 (I) less of 50 (L) because the conversion is based on decimal places
Example 2:
Input: num = 58
Output: "LVIII"
Explanation:
50 = L
 8 = VIII
Example 3:
Input: num = 1994
Output: "MCMXCIV"
Explanation:
1000 = M
 900 = CM
  90 = XC
   4 = IV
*/
/**
 * @param {number} num
 * @return {string}
 */
var intToRoman = function(num) {
    const map = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    };
    let result = '';
  
    for (key in map) {
      const repeatCounter = Math.floor(num / map[key]);
  
      if (repeatCounter !== 0) {
        result += key.repeat(repeatCounter);
      }
  
      num %= map[key];
  
      if (num === 0) return result;
    }
  
    return result;
  };