/*
* https://leetcode.com/problems/search-in-rotated-sorted-array-ii/
*
*
Example 1:

Input: arr = [1,1,2,2,0,0]
target = 0
Output: true

*/

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let pivot = findPivotIndex(nums, target);
    if(pivot===-1) return binarySearch(nums, 0, nums.length -1, target) !==-1;
    if(nums[pivot] === target) return true;
    if(target>=nums[0]) return binarySearch(nums, 0, pivot - 1, target) !==-1;
    else return binarySearch(nums, pivot+1, nums.length -1, target) !==-1;
};

const findPivotIndex = (nums, target) =>{
    let start = 0;
    let end = nums.length - 1;
    while(start<=end){
        let mid = Math.floor(start + (end-start)/2);
        if(mid < end && nums[mid] > nums[mid+1]) return mid;
        else if(start < mid && nums[mid-1] > nums[mid]) return mid - 1;
        //have duplicates so
        else if(nums[start] === nums[mid] && nums[mid] === nums[end]){
            if(start < end && nums[start] > nums[start+1]) return start;
            start++;
            if(end > start && nums[end-1] > nums[end]) return end - 1;
            end--;
        } else if(nums[start] < nums[mid]  ||(nums[start] === nums[mid] && nums[mid] > nums[end])){
            start = mid + 1;
        } else end = mid - 1;
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
