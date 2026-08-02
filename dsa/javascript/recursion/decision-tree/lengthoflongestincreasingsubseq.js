/**
300. Longest Increasing Subsequence
Solved
Medium
Topics
premium lock icon
Companies
Given an integer array nums, return the length of the longest strictly increasing subsequence.

 

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
 

Constraints:

1 <= nums.length <= 2500
-104 <= nums[i] <= 104
 

Follow up: Can you come up with an algorithm that runs in O(n log(n)) time complexity?
 */
/**
 * https://leetcode.com/problems/longest-increasing-subsequence/description/
 * @param {number[]} nums
 * @return {number}
 */
// EDGE   - taking nums[j] adds +1 to the length
var lengthOfLIS = function (nums) {
    if (nums.length === 0) return 0;

    const memo = new Map();

    const dfs = (i, j) => {
        if (j === nums.length) return 0;

        const key = `${i},${j}`;
        if (memo.has(key)) return memo.get(key);

        let take = 0;
        if (nums[i] < nums[j]) {
            take = 1 + dfs(j, j + 1);
        }

        let skip = dfs(i, j + 1);

        const ans = Math.max(take, skip);
        memo.set(key, ans);

        return ans;
    };

    let max = 1;
    for (let i = 0; i < nums.length; i++) {
        max = Math.max(max, 1 + dfs(i, i + 1));
    }

    return max;
};