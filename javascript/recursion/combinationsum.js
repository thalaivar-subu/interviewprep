/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function (candidates, target) {
    let result = [];
    const helper = (index, arr, target) => {
        if (target < 0) return
        if (target === 0) result.push([...arr]);
        for (let i = index; i < candidates.length; i++) {
            let candidate = candidates[i]
            arr.push(candidate)
            helper(i, arr, target - candidate)
            arr.pop()
        }
    }
    helper(0, [], target);
    return result;
};