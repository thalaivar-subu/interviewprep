/**
90. Subsets II
Solved
Medium
Topics
premium lock icon
Companies
Given an integer array nums that may contain duplicates, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.

 

Example 1:

Input: nums = [1,2,2]
Output: [[],[1],[1,2],[1,2,2],[2],[2,2]]
Example 2:

Input: nums = [0]
Output: [[],[0]]
 

Constraints:

1 <= nums.length <= 10
-10 <= nums[i] <= 10
 */
/**
 * https://leetcode.com/problems/subsets-ii/description/
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function(nums) {
    const result = [];
    // No Duplicates, so sort
    nums.sort((a,b) => a- b);
    const helper = (start, currentSubset) => {
        result.push([...currentSubset]);
        for(let i=start;i<nums.length;i++){
            if(i>start && nums[i] === nums[i-1]) continue;
            currentSubset.push(nums[i]);
            helper(i+1, currentSubset);
            currentSubset.pop();
        }
    }
    helper(0, [])
    return result;
};