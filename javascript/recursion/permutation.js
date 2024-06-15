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