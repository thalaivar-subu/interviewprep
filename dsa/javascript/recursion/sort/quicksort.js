/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArray = function (nums) {
    quickSort(nums, 0, nums.length - 1)
    return nums;
};

const quickSort = (nums, low, high) => {
    if (low >= high) {
        return;
    }
    let start = low;
    let end = high;
    let pivot = nums[Math.floor(start + (end - start) / 2)];
    while (start <= end) {
        while (nums[start] < pivot) start++
        while (nums[end] > pivot) end--;
        if (start <= end) {
            [nums[start], nums[end]] = [nums[end], nums[start]]
            start++;
            end--;
        }
    }
    quickSort(nums, low, end);
    quickSort(nums, start, high);
};