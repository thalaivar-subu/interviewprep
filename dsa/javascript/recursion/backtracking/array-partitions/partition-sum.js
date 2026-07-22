/**
 1043. Partition Array for Maximum Sum
Medium
Topics
premium lock icon
Companies
Hint
Given an integer array arr, partition the array into (contiguous) subarrays of length at most k. After partitioning, each subarray has their values changed to become the maximum value of that subarray.

Return the largest sum of the given array after partitioning. Test cases are generated so that the answer fits in a 32-bit integer.

 

Example 1:

Input: arr = [1,15,7,9,2,5,10], k = 3
Output: 84
Explanation: arr becomes [15,15,15,9,10,10,10]
Example 2:

Input: arr = [1,4,1,5,7,3,6,1,9,9,3], k = 4
Output: 83
Example 3:

Input: arr = [1], k = 1
Output: 1
 

Constraints:

1 <= arr.length <= 500
0 <= arr[i] <= 109
1 <= k <= arr.length
 */
/**
 * https://leetcode.com/problems/partition-array-for-maximum-sum/
 * @param {number[]} arr
 * @param {number} k
 * @return {number}
 * O(n * k) time, O(n) space (memoized by index)
 */
var maxSumAfterPartitioning = function (arr, k) {
    let map = new Map();
    const helper = (i) => {
        if (i === arr.length) return 0;
        if (map.has(i)) return map.get(i);
        let maxInGroup = 0;
        let maxCost = 0;
        for (let len = 1; len <= k && i + len <= arr.length; len++) {
            maxInGroup = Math.max(maxInGroup, arr[i + len - 1]);
            const remaining = helper(i + len);
            maxCost = Math.max(maxCost, maxInGroup * len + remaining);
        }
        map.set(i, maxCost);
        return maxCost;
    }
    return helper(0)
};