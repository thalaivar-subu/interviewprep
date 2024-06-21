/**
 * @param {number[]} nums
 * @return {number[]}
 *  space and time - nlogn
 */
var sortArray = function (nums) {
    return mergeSort(nums)
};

const mergeSort = (nums) => {
    if (nums.length <= 1) return nums;
    let n = nums.length;
    let mid = Math.floor(n / 2);
    const left = nums.slice(0, mid);
    const right = nums.slice(mid, nums.length);
    return merge(
        mergeSort(left),
        mergeSort(right)
    )
}
const merge = (left, right) => {
    let l = 0;
    let r = 0;
    let output = []
    while (l < left.length && r < right.length) {
        if (left[l] < right[r]) output.push(left[l++])
        else output.push(right[r++])
    }
    return [...output, ...left.slice(l), ...right.slice(r)]
}