/**
 * https://leetcode.com/problems/remove-k-digits/
 * 
Given string num representing a non-negative integer num, and an integer k, return the smallest possible integer after removing k digits from num.
Example 1:
Input: num = "1432219", k = 3
Output: "1219"
Explanation: Remove the three digits 4, 3, and 2 to form the new number 1219 which is the smallest.
Example 2:
Input: num = "10200", k = 1
Output: "200"
Explanation: Remove the leading 1 and the number is 200. Note that the output must not contain leading zeroes.
Example 3:
Input: num = "10", k = 2
Output: "0"
Explanation: Remove all the digits from the number and it is left with nothing which is 0.
Constraints:
1 <= k <= num.length <= 105
num consists of only digits.
num does not have any leading zeros except for the zero itself.
 * @param {string} num
 * @param {number} k
 * @return {string}
 */
// A Monotonically Increasing Stack is a stack where elements are placed in increasing order from the bottom to the top
var removeKdigits = function (num, k) {
    // compare first and last if last while inserting if stack last > c pop else append
    let stack = [];
    for (let i = 0; i < num.length; i++) {
        let c = parseInt(num.charAt(i))
        while (k > 0 && stack.length && stack[stack.length - 1] > c) {
            k--;
            stack.pop();
        }
        stack.push(c);
    }
    while (k > 0) {
        stack.pop();
        k--;
    }
    let nonZeroIndex = 0;
    while (nonZeroIndex < stack.length && stack[nonZeroIndex] === 0) {
        nonZeroIndex++;
    }
    const result = stack.slice(nonZeroIndex).join("");
    return result.length === 0 ? "0" : result;
}
