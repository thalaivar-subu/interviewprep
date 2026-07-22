/**
560. Subarray Sum Equals K
Solved
Medium
Topics
premium lock icon
Companies
Hint
Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.

A subarray is a contiguous non-empty sequence of elements within an array.

 

Example 1:

Input: nums = [1,1,1], k = 2
Output: 2
Example 2:

Input: nums = [1,2,3], k = 3
Output: 2
 

Constraints:

1 <= nums.length <= 2 * 104
-1000 <= nums[i] <= 1000
-107 <= k <= 107
 */
/**
 * https://leetcode.com/problems/subarray-sum-equals-k/submissions/2050775701/
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */

//If Negative Numbers: O(n) time, O(n) space
// currentPrefix - oldPrefix = k
// oldPrefix = currentPrefix - k
/*
prefix=1

Need

1-3=-2

Not found

Store 1
*/
var subarraySum = function(nums, k) {
    let count = 0;
    let prefixSum = 0;
    const map = new Map();

    // prefix sum 0 has occurred once
    map.set(0, 1);

    for (const num of nums) {
        prefixSum += num;

        if (map.has(prefixSum - k)) {
            count += map.get(prefixSum - k);
        }

        map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
    }

    return count;
};

//If only positive numbers are present: O(n) time (sliding window), O(1) space
var subarraySum = function (nums, k) {
    let l = 0;
    let r = 0;
    let output = 0;

    let sum = 0;
    while (r < nums.length) {
        sum += nums[r];
        while (sum > k) {
            sum -= nums[r];
            l++;
        }
        if (sum === k) output++;
        r++;
    }
    return output;
};