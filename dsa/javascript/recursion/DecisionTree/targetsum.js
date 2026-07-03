/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * https://leetcode.com/problems/target-sum/description/
 * Example 1:

Input: nums = [1,1,1,1,1], target = 3
Output: 5
Explanation: There are 5 ways to assign symbols to make the sum of nums be target 3.
-1 + 1 + 1 + 1 + 1 = 3
+1 - 1 + 1 + 1 + 1 = 3
+1 + 1 - 1 + 1 + 1 = 3
+1 + 1 + 1 - 1 + 1 = 3
+1 + 1 + 1 + 1 - 1 = 3
Example 2:

Input: nums = [1], target = 1
Output: 1
 
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