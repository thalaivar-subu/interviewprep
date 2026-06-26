/**
40. Combination Sum II
Solved
Medium
Topics
premium lock icon
Companies
Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target.

Each number in candidates may only be used once in the combination.

Note: The solution set must not contain duplicate combinations.

 

Example 1:

Input: candidates = [10,1,2,7,6,1,5], target = 8
Output: 
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]
Example 2:

Input: candidates = [2,5,2,1,2], target = 5
Output: 
[
[1,2,2],
[5]
]
 

Constraints:

1 <= candidates.length <= 100
1 <= candidates[i] <= 50
1 <= target <= 30
 */
/**
 * https://leetcode.com/problems/combination-sum-ii/description/
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function (candidates, target) {
    const result = [];
    candidates.sort((a, b) => a - b);
    const used = new Array(candidates.length).fill(false);
    const helper = (start, currentCandidates, remaining) => {
        if (remaining < 0) return;
        if (remaining === 0) {
            result.push([...currentCandidates]);
            return;
        }
        for (let i = start; i < candidates.length; i++) {
            if (used[i]) continue;
            if (i > 0 && candidates[i] === candidates[i - 1] && !used[i - 1]) continue;
            currentCandidates.push(candidates[i]);
            used[i] = true;
            helper(i, currentCandidates, remaining - candidates[i]);
            currentCandidates.pop();
            used[i] = false;
        }
    }
    helper(0, [], target)
    return result;
};