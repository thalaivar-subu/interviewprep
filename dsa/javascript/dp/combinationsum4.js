/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * Example 1:
https://leetcode.com/problems/combination-sum-iv/description/
Input: nums = [1,2,3], target = 4
Output: 7
Explanation:
The possible combination ways are:
(1, 1, 1, 1)
(1, 1, 2)
(1, 2, 1)
(1, 3)
(2, 1, 1)
(2, 2)
(3, 1)
Note that different sequences are counted as different combinations.
Example 2:

Input: nums = [9], target = 3
Output: 0
 */
var combinationSum4 = function (nums, target) {
    // first we define our cache memory to store every number of combination
    let dp = {0: 1};

    // Iterate 1 to target
    for(let i=1; i<target+1; i++){
        // first initialise the dp[total] = 0
        dp[i] = 0;
        for(let num of nums){
            //  Now getting the all combination and if combination in negative the assign 0
            dp[i] += dp[i-num] || 0;
        }
    }
    // Now our work is complte so just return dp[target]
    return dp[target]
};