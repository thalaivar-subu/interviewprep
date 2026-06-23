/**
 * @param {number[]} nums
 * @return {number[][]}
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