/**
 * @param {string} digits
 * @return {string[]}
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