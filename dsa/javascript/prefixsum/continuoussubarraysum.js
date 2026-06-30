/**
523. Continuous Subarray Sum
Solved
Medium
Topics
premium lock icon
Companies
Given an integer array nums and an integer k, return true if nums has a good subarray or false otherwise.

A good subarray is a subarray where:

its length is at least two, and
the sum of the elements of the subarray is a multiple of k.
Note that:

A subarray is a contiguous part of the array.
An integer x is a multiple of k if there exists an integer n such that x = n * k. 0 is always a multiple of k.
 

Example 1:

Input: nums = [23,2,4,6,7], k = 6
Output: true
Explanation: [2, 4] is a continuous subarray of size 2 whose elements sum up to 6.
Example 2:

Input: nums = [23,2,6,4,7], k = 6
Output: true
Explanation: [23, 2, 6, 4, 7] is an continuous subarray of size 5 whose elements sum up to 42.
42 is a multiple of 6 because 42 = 7 * 6 and 7 is an integer.
Example 3:

Input: nums = [23,2,6,4,7], k = 13
Output: false
 

Constraints:

1 <= nums.length <= 105
0 <= nums[i] <= 109
0 <= sum(nums[i]) <= 231 - 1
1 <= k <= 231 - 1
 */
/**
 * https://leetcode.com/problems/continuous-subarray-sum/description/
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var checkSubarraySum = function(nums, k) {
    if (k === 0) {
        for (let i = 1; i < nums.length; i++) {
            if (nums[i] === 0 && nums[i - 1] === 0) {
                return true;
            }
        }
        return false;
    }

    const map = new Map();
    map.set(0, -1);

    let prefixSum = 0;

    for (let i = 0; i < nums.length; i++) {
        prefixSum += nums[i];

        let rem = ((prefixSum % k) + k) % k;

        if (map.has(rem)) {
            if (i - map.get(rem) >= 2) {
                return true;
            }
        } else {
            // Store only the first occurrence
            map.set(rem, i);
        }
    }

    return false;
};