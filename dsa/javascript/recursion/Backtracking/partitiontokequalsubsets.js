/** 
698. Partition to K Equal Sum Subsets
Medium
Topics
premium lock icon
Companies
Hint
Given an integer array nums and an integer k, return true if it is possible to divide this array into k non-empty subsets whose sums are all equal.

 

Example 1:

Input: nums = [4,3,2,3,5,2,1], k = 4
Output: true
Explanation: It is possible to divide it into 4 subsets (5), (1, 4), (2,3), (2,3) with equal sums.
Example 2:

Input: nums = [1,2,3,4], k = 3
Output: false
 

Constraints:

1 <= k <= nums.length <= 16
1 <= nums[i] <= 104
The frequency of each element is in the range [1, 4].
 */
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var canPartitionKSubsets = function (nums, k) {
    let total = nums.reduce((a, b) => a + b, 0);
    if (total % k !== 0) return false;

    const used = new Array(nums.length).fill(false);
    const target = total / k;
    const backTrack = (start, currentSum, K) => {
        if (K === 1) return true;
        if (currentSum === target) return backTrack(0, 0, K - 1);
        for (let i = start; i < nums.length; i++) {
            if (used[i]) continue;
            if (currentSum + nums[i] > target) continue
            used[i] = true;
            if (backTrack(i + 1, currentSum + nums[i], K)) return true;
            used[i] = false;
        }
        return false;
    }
    return backTrack(0, 0, k);
};