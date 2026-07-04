// Permutation with duplicates
/**
 * @param {number[]} nums
 * @return {number[][]}
 * O(n!) time, O(n) recursion space
 */
var permuteUnique = function (nums) {
    nums.sort((a, b) => a - b);
    let permutations = [];
    let used = new Array(nums.length).fill(false);
    const generate = (arr) => {
        if (arr.length === nums.length) {
            permutations.push([...arr]);
            return;
        }
        for (let i = 0; i < nums.length; i++) {

            if (used[i]) continue
            if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;

            arr.push(nums[i])
            used[i] = true;
            generate(arr)
            arr.pop();
            used[i] = false;

        }
    }
    generate([])
    return permutations
};
