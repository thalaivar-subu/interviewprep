/**
 * 
 * Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

Open brackets must be closed by the same type of brackets.
Open brackets must be closed in the correct order.
Every close bracket has a corresponding open bracket of the same type.
 

Example 1:

Input: s = "()"

Output: true

Example 2:

Input: s = "()[]{}"

Output: true

Example 3:

Input: s = "(]"

Output: false

Example 4:

Input: s = "([])"

Output: true

Example 5:

Input: s = "([)]"

Output: false

 

Constraints:

1 <= s.length <= 104
s consists of parentheses only '()[]{}'.

https://leetcode.com/problems/valid-parentheses/description/
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
    const map = new Map([
        ["{", "}"],
        ["(", ")"],
        ["[", "]"],
    ])
    const stack = [];
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i);
        if (map.has(c)) stack.push(map.get(c));
        else if (stack.pop() !== c) return false;
    }
    return stack.length === 0;
};