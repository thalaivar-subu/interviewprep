/*
* https://leetcode.com/problems/search-in-rotated-sorted-array/description/
*
*
Example 1:
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
Example 2:
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1
Example 3:
Input: nums = [1], target = 0
Output: -1
*/
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let pivot = findPivotIndex(nums, target);
    if(pivot===-1) return binarySearch(nums, 0, nums.length -1, target);
    if(nums[pivot] === target) return pivot;
    if(target>=nums[0]) return binarySearch(nums, 0, pivot - 1, target);
    else return binarySearch(nums, pivot+1, nums.length -1, target);
};

const findPivotIndex = (nums, target) =>{
    let start = 0;
    let end = nums.length - 1;
    while(start<=end){
        let mid = Math.floor(start + (end-start)/2);
        if(mid<end && nums[mid] > nums[mid+1]) return mid;
        else if(mid>start && nums[mid]<nums[mid -1]) return mid-1;
        else if(nums[mid] <= nums[start]) end = mid - 1;
        else start = mid + 1;
    }
    return -1;
}

const binarySearch = (nums, start, end, target) => {
    while(start<=end){
        let mid = Math.floor(start + (end-start)/2);
        if(nums[mid] < target) start = mid + 1;
        else if(nums[mid] > target) end = mid - 1;
        else return mid;
    }
    return -1;
}
