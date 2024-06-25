/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
Example 1:
Input: nums = [1,1,1], k = 2
Output: 2
Example 2:
Input: nums = [1,2,3], k = 3
Output: 2
 */
function maximumSubarraySum(arr, k) {
    let maxSum = 0;
    for (let i = 0; i < k; i++) {
      maxSum += arr[i];
    }
  
    let currentSum = maxSum;
    for (let i = k; i < arr.length; i++) {
      currentSum = currentSum - arr[i - k] + arr[i];
      maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
  }