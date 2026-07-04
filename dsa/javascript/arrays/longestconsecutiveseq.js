/**
128. Longest Consecutive Sequence
Solved
Medium
Topics
premium lock icon
Companies
Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in O(n) time.

 

Example 1:

Input: nums = [100,4,200,1,3,2]
Output: 4
Explanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.
Example 2:

Input: nums = [0,3,7,2,5,8,4,6,0,1]
Output: 9
Example 3:

Input: nums = [1,0,1,2]
Output: 3
 

Constraints:

0 <= nums.length <= 105
-109 <= nums[i] <= 109


 */
/**
 * https://leetcode.com/problems/longest-consecutive-sequence/
 * @param {number[]} nums
 * @return {number}
 * O(n) time, O(n) space
 */
var longestConsecutive = function (nums) {
    // sort or add in set
    let numSet = new Set(nums);
    let longest = 0;
    for (let num of numSet) {
        // count from begining of a sequence
        if (!(numSet.has(num - 1))) {
            let currentStreak = 1; // once loop enter itself streak starts
            let currentNum = num;
            while (numSet.has(currentNum + 1)) {
                currentNum++;
                currentStreak++;
            }
            longest = Math.max(longest, currentStreak);
        }
    }
    return longest;
};