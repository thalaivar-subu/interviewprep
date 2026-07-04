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
/**
 * @param {string} num
 * @param {number} k
 * @return {string}
 * O(n) time, O(n) space
 */
var removeKdigits = function (s, k) {
    // Increasing order Stack
    const stack = [];
    for (let i = 0; i < s.length; i++) {
        let num = parseInt(s.charAt(i));
        // Idea is to remove k times if decreasing order or something
        while (k > 0 && stack.length > 0 && stack[stack.length - 1] > num) {
            // Pop element and decrement k
            stack.pop();
            k--;
        }
        stack.push(num);
    }
    // handle increasing order ? 12345
    while (k > 0) {
        stack.pop();
        k--;
    }
    // Number is to remove leading zero - butNumber has a range after that
    // we get Infiinty - 1 test case fail :(
    // return stack.length > 0 ? "" + Number(stack.join("")) : "0";
    let leadingZeroCount = 0;
    while(stack.length > 0 && stack[leadingZeroCount] === 0) leadingZeroCount++;
    let result = stack.slice(leadingZeroCount).join("");
    return result.length > 0 ? result : "0";
};
