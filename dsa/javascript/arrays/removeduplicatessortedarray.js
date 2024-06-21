/**
 * @param {number[]} nums
 * @return {number}
 * https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/
 */
var removeDuplicates = function (nums) {
    let result = 0;
    let j = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i + 1] !== nums[i]) {
            nums[j++] = nums[i];
            result++;
        }
    }
    return result;
};