/** https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/
Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.
If target is not found in the array, return [-1, -1].
You must write an algorithm with O(log n) runtime complexity.
Example 1:
Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]
Example 2:
Input: nums = [5,7,7,8,8,10], target = 6
Output: [-1,-1]
Example 3:
Input: nums = [], target = 0
Output: [-1,-1]

 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function(nums, target) {
    let result = [-1, -1];
    result[0] = binarySearch(nums, target, true);
    if(result[0]!==-1) result[1] = binarySearch(nums, target, false);
    return result;
};

const binarySearch = (nums, target, firstOccurence) => {
    let start = 0;
    let end = nums.length - 1;
    let occurence = -1;
    while(start<=end){
        let mid = Math.floor(start + (end-start)/2);
        if(nums[mid] < target) start = mid + 1;
        else if(nums[mid] > target) end = mid - 1;
        else {
            occurence = mid;
            if(firstOccurence) end = mid - 1;
            else start = mid + 1;
        }
    }
    return occurence;
}