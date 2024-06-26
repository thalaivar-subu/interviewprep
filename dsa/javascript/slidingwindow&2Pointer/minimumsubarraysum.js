/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
Example 1:
Input: target = 7, nums = [2,3,1,2,4,3]
Output: 2
Explanation: The subarray [4,3] has the minimal length under the problem constraint.
Example 2:
Input: target = 4, nums = [1,4,4]
Output: 1
Example 3:
Input: target = 11, nums = [1,1,1,1,1,1,1,1]
Output: 0
 */
var minSubArrayLen = function (target, nums) {
    let l = 0; r = 0;
    let result = Infinity;
    let total = 0;
    while (r < nums.length) {
        total += nums[r];
        while (total >= target) {
            result = Math.min(result, r - l + 1);
            total -= nums[l];
            l++
        }
        r++;
    }
    return result === Infinity ? 0 : result;
};