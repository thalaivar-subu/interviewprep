/**
 * @param {number[]} nums
 * @return {number[][]}
 * https://leetcode.com/problems/subsets/
 */
var subsets = function(nums) {
    let result = [];
    let len = nums.length;
    const generateSubsets = (currentSubset, start) => {
        result.push([...currentSubset])
        for(let i = start; i<nums.length; i++){
            currentSubset.push(nums[i]);
            generateSubsets(currentSubset, i+1);
            currentSubset.pop();
        }
    }
    generateSubsets([], 0);
    return result;
};