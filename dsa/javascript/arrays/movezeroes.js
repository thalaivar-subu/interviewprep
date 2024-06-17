/*
Example 1:

Input: nums = [0,1,0,3,12]
Output: [1,3,12,0,0]
Example 2:

Input: nums = [0]
Output: [0]
*/
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
/*
Two Pointer Approach
i, j 
Move non zero to 1st and append zero in another loop
*/
var moveZeroes = function(nums) {
    let j =0;
    for(let i=0;i<nums.length;i++){
        if(nums[i]!==0){
            nums[j++] =nums[i]
        }
    }
    for(let i=j;i<nums.length;i++){
        nums[i]=0
    }
    return nums
};