/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
    if(s.length%2!==0) return false;
    const map = new Map([
        ["(", ")"],
        ["{", "}"],
        ["[", "]"],
    ]);
    const stack = []; // push and pop
    for (let i = 0; i < s.length; i++) {
        let c = s.charAt(i)
        if (map.has(c)) stack.push(map.get(c))
        else {
            if (stack[stack.length-1] === c) stack.pop()
            else return false;
        }
    }
    return stack.length === 0;
};