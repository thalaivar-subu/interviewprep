/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 * O(N*M)
 */
var combinationSum = function (candidates, target) {
    let result = [];
    const backtrack = (index, arr, target) => {
        if (target < 0) return
        if (target === 0) result.push([...arr]);
        for (let i = index; i < candidates.length; i++) {
            let candidate = candidates[i]
            arr.push(candidate)
            backtrack(i, arr, target - candidate)
            arr.pop()
        }
    }
    backtrack(0, [], target);
    return result;
};