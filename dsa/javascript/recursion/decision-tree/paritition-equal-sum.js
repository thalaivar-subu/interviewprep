/*
416. Partition Equal Subset Sum
Attempted
Medium
Topics
premium lock icon
Companies
Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.

 

Example 1:

Input: nums = [1,5,11,5]
Output: true
Explanation: The array can be partitioned as [1, 5, 5] and [11].
Example 2:

Input: nums = [1,2,3,5]
Output: false
Explanation: The array cannot be partitioned into equal sum subsets.
 

Constraints:

1 <= nums.length <= 200
1 <= nums[i] <= 100
*/
/**
 * https://leetcode.com/problems/partition-equal-subset-sum/
 * @param {number[]} nums
 * @return {boolean}
 * O(n * target) time (memoized), O(n * target) space
 */
var canPartition = function (nums) {
    let total = nums.reduce((a, b) => a + b, 0);
    if (total % 2 !== 0) return false
    let target = total / 2;

    const map = new Map();
    const dfs = (index, remaining) => {
        if (index >= nums.length) return false;
        if (remaining === 0) return true;
        if (remaining < 0) return false;
        const cacheKey = `${index}-${remaining}`;
        if (map.has(cacheKey)) return map.get(cacheKey)
        const answer = dfs(index + 1, remaining - nums[index]) || dfs(index + 1, remaining);
        map.set(cacheKey, answer);
        return answer;
    }
    return dfs(0, target)
};