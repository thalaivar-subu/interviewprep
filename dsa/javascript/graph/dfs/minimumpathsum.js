/*
64. Minimum Path Sum
Solved
Medium
Topics
premium lock icon
Companies
Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.

Note: You can only move either down or right at any point in time.

 

Example 1:


Input: grid = [[1,3,1],[1,5,1],[4,2,1]]
Output: 7
Explanation: Because the path 1 → 3 → 1 → 1 → 1 minimizes the sum.
Example 2:

Input: grid = [[1,2,3],[4,5,6]]
Output: 12
 

Constraints:

m == grid.length
n == grid[i].length
1 <= m, n <= 200
0 <= grid[i][j] <= 200
*/
/**
 * https://leetcode.com/problems/minimum-path-sum/description/
 * @param {number[][]} grid
 * @return {number}
 */
var minPathSum = function (grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    let minimumSum = Infinity;
    const map = new Map();
    const dfs = (r, c, sum) => {
        const cacheKey = `${r}-${c}-${sum}`;
        if (map.has(cacheKey)) return map.get(cacheKey);
        if (r >= rows || c >= cols) return;
        if (r === rows - 1 && c === cols - 1) {
            minimumSum = Math.min(minimumSum, sum + grid[r][c])
            return
        }
        const result = dfs(r + 1, c, grid[r][c] + sum) + dfs(r, c + 1, grid[r][c] + sum);
        map.set(cacheKey, result);
        return result;

    }
    dfs(0, 0, 0);
    return minimumSum;
};

// If time out approach diff
var minPathSum = function (grid) {
    const rows = grid.length;
    const cols = grid[0].length;

    const map = new Map();

    const dfs = (r, c) => {
        if (r >= rows || c >= cols) return Infinity;

        if (r === rows - 1 && c === cols - 1) {
            return grid[r][c];
        }

        const cacheKey = `${r}-${c}`;
        if (map.has(cacheKey)) return map.get(cacheKey);

        const down = dfs(r + 1, c);
        const right = dfs(r, c + 1);

        const result = grid[r][c] + Math.min(down, right);

        map.set(cacheKey, result);

        return result;
    };

    return dfs(0, 0);
};