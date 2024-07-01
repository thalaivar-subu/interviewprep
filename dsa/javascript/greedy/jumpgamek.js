/**
 * @param {number[]} nums
 * @return {number}
 * https://leetcode.com/problems/jump-game-ii/description/
 * Example 1:
Input: nums = [2,3,1,1,4]
Output: 2
Explanation: The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index.
Example 2:
Input: nums = [2,3,0,1,4]
Output: 2
 */
var jump = function (nums) {
    let l = 0;
    let r = 0;
    let result = 0;
    while (r < nums.length - 1) {
        let farthest = 0;
        for (let i = l; i < r+1; i++) {
            farthest = Math.max(farthest, i + nums[i])
        }
        l = r + 1;
        r = farthest;
        result += 1;
    }
    return result;
};