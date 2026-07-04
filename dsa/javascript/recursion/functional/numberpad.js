/**
 * could represent. Return the answer in any order.

A mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.


 

Example 1:

Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
Example 2:

Input: digits = "2"
Output: ["a","b","c"]
 

Constraints:

1 <= digits.length <= 4
digits[i] is a digit in the range ['2', '9'].
 * @param {string} digits
 * @return {string[]}
 * https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/
 * O(4^n * n) time (up to 4 letters/digit, string concat costs n), O(n) recursion space
 */
var letterCombinations = function (digits) {
    if (digits.length === 0) {
        return [];
    }
    let result = [];
    const map = new Map([
        ["2", "abc"],
        ["3", "def"],
        ["4", "ghi"],
        ["5", "jkl"],
        ["6", "mno"],
        ["7", "pqrs"],
        ["8", "tuv"],
        ["9", "wxyz"],
    ])
    const generateCombinations = (p, up) => {
        if (!up.length) {
            result.push(p)
            return
        }
        let currentDigit = up.charAt(0);
        let letters = map.get(currentDigit)
        for (let i = 0; i < letters.length; i++) {
            generateCombinations(p + letters[i], up.substring(1))
        }
    }
    generateCombinations("", digits)
    return result;
};
letterCombinations("23")