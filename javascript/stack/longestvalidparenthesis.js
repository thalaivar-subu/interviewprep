/**
 * @param {string} s
 * @return {number}
 */
var longestValidParentheses = function (s) {
    let stack = [-1], count = 0
    for (let i = 0; i < s.length; i++)
        if (s[i] === '(') stack.push(i)
        else if (stack.length === 1) stack[0] = i; // if not '(' resetting stack[0]
        else {
            stack.pop();
            count = Math.max(count, i - stack[stack.length - 1])
        }
    return count
};