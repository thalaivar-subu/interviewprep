/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
Example 1:
Input: nums = [1,2,4], k = 5
Output: 3
Explanation: Increment the first element three times and the second element two times to make nums = [4,4,4].
4 has a frequency of 3.
Example 2:
Input: nums = [1,4,8,13], k = 5
Output: 2
Explanation: There are multiple optimal solutions:
- Increment the first element three times to make nums = [4,4,8,13]. 4 has a frequency of 2.
- Increment the second element four times to make nums = [1,8,8,13]. 8 has a frequency of 2.
- Increment the third element five times to make nums = [1,4,13,13]. 13 has a frequency of 2.
Example 3:
Input: nums = [3,9,6], k = 2
Output: 1
 */
var maxFrequency = function (nums, k) {
    nums.sort((a, b) => a - b);
    let l = 0; let r = 0;
    let total = 0; let result = 0;
    while (r < nums.length) {
        total += nums[r];
        while (nums[r] * (r - l + 1) > total + k) {
            total -= nums[l];
            l++;
        }
        result = Math.max(result, r - l + 1);
        r++;
    }
    return result;
};