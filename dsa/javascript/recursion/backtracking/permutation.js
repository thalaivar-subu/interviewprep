/**
 * @param {number[]} nums
 * @return {number[][]}
 * O(n * n!) time (n! permutations, O(n) includes check each), O(n) recursion space
 */
var permute = function (nums) {
    let permutations = [];
    const generate = (arr) => {
        if (arr.length === nums.length) {
            permutations.push([...arr]);
            return;
        }
        for (let i = 0; i < nums.length; i++) {
            if (!arr.includes(nums[i])) {
                arr.push(nums[i])
                generate(arr)
                arr.pop();
            }
        }
    }
    generate([])
    return permutations
};


console.log(permute(["a", "b", "c"]))

const v = "abc"
const result = [];
// O(n * 2^n) time (2^n subsequences, O(n) includes check each), O(n) recursion space
const subseq = (p, up) => {
    if (!up.length) {
        result.push(p)
        return
    };
    for (let i = 0; i < v.length; i++) {
       if (p.includes(v[i])) continue
       subseq(p + v[i], up.substring(1))
    }
}
subseq("", v)
console.log(result, result.length)