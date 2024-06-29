/**
 * @param {number[]} nums
 * @return {number}
 * https://leetcode.com/problems/longest-increasing-subsequence/description/
 * O(N2), O(N)
Example 1:
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101], therefore the length is 4.
Example 2:
Input: nums = [0,1,0,3,2,3]
Output: 4
Example 3:
Input: nums = [7,7,7,7,7,7,7]
Output: 1
 
 */
var lengthOfLIS = function (nums) {
    if(!nums || !nums.length) return 0;
    let dp = Array(nums.length + 1).fill(1);
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    return Math.max(...dp);
};

/**
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function (nums) {
    if (!nums || !nums.length) return 0;

    let memo = Array(nums.length).fill(-1);

    const dfs = (currentIndex) => {
        if (memo[currentIndex] !== -1) return memo[currentIndex];

        let maxLength = 1;

        for (let i = 0; i < currentIndex; i++) {
            if (nums[currentIndex] > nums[i]) {
                maxLength = Math.max(maxLength, 1 + dfs(i));
            }
        }

        memo[currentIndex] = maxLength;
        return maxLength;
    };

    let maxLIS = 0;

    for (let i = 0; i < nums.length; i++) {
        maxLIS = Math.max(maxLIS, dfs(i));
    }

    return maxLIS;
};