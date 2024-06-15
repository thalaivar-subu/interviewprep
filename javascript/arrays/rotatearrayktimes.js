/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function (nums, k) {
    k = k % nums.length;
    reverse(nums, 0, nums.length - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, nums.length - 1);

};
const reverse = (nums, start, end) => {
    while (start < end) {
        // Swap the values at indices start and end
        [nums[start], nums[end]] = [nums[end], nums[start]];
        start++;
        end--;
    }
}