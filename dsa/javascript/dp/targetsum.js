/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * https://leetcode.com/problems/target-sum/description/
 */
var findTargetSumWays = function (nums, target) {
    let dp = new Map();
    const backTrack = (index, total) => {
        let cacheKey = `${index}-${total}`;
        if (index === nums.length) return total === target ? 1 : 0;
        if (dp.has(cacheKey)) return dp.get(cacheKey);
        dp.set(cacheKey, backTrack(index + 1, total + nums[index]) + backTrack(index + 1, total - nums[index]));
        return dp.get(cacheKey);
    }
    return backTrack(0, 0);
};