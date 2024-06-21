/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
Example 1:
Input: nums = [1,5,4,2,9,9,9], k = 3
Output: 15
Explanation: The subarrays of nums with length 3 are:
- [1,5,4] which meets the requirements and has a sum of 10.
- [5,4,2] which meets the requirements and has a sum of 11.
- [4,2,9] which meets the requirements and has a sum of 15.
- [2,9,9] which does not meet the requirements because the element 9 is repeated.
- [9,9,9] which does not meet the requirements because the element 9 is repeated.
We return 15 because it is the maximum subarray sum of all the subarrays that meet the conditions
Example 2:
Input: nums = [4,4,4], k = 3
Output: 0
Explanation: The subarrays of nums with length 3 are:
- [4,4,4] which does not meet the requirements because the element 4 is repeated.
We return 0 because no subarrays meet the conditions.
 */
function maximumSubarraySum(arr, k) {
    let maxSum = 0;
    let sumOfFirstK = 0;
    let map = new Map();
    for (let i = 0; i < k; i++) {
        sumOfFirstK += arr[i];
        map.set(arr[i], (map.get(arr[i]) || 0) + 1);
    }
    if (map.size === k) maxSum = sumOfFirstK;

    let currentSum = sumOfFirstK;
    for (let i = k; i < arr.length; i++) {
        map.set(arr[i], (map.get(arr[i]) || 0) + 1);
        map.set(arr[i - k], (map.get(arr[i - k]) || 0) - 1);
        if (map.get(arr[i - k]) === 0) map.delete(arr[i - k])
        currentSum = currentSum - arr[i - k] + arr[i];
        if(map.size === k) maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}