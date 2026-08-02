/**
994. Rotting Oranges
Medium
Topics
premium lock icon
Companies
You are given an m x n grid where each cell can have one of three values:

0 representing an empty cell,
1 representing a fresh orange, or
2 representing a rotten orange.
Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.

 

Example 1:


Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4
Example 2:

Input: grid = [[2,1,1],[0,1,1],[1,0,1]]
Output: -1
Explanation: The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.
Example 3:

Input: grid = [[0,2]]
Output: 0
Explanation: Since there are already no fresh oranges at minute 0, the answer is just 0.
 

Constraints:

m == grid.length
n == grid[i].length
1 <= m, n <= 10
grid[i][j] is 0, 1, or 2.
 */
/**
 * https://leetcode.com/problems/rotting-oranges/description/
 * @param {number[][]} grid
 * @return {number}
 * O(m*n) time, O(m*n) space (queue)
 */
var orangesRotting = function(grid) {
    const queue = [];
    let fresh = 0;
    let minutes = 0;

    // Find all rotten oranges and count fresh oranges
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 2) {
                queue.push([i, j]);
            } else if (grid[i][j] === 1) {
                fresh++;
            }
        }
    }

    // No fresh oranges
    if (fresh === 0) return 0;

    const directions = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1]   // right
    ];

    while (queue.length && fresh > 0) {
        const size = queue.length;

        // Process one minute
        for (let i = 0; i < size; i++) {
            const [row, col] = queue.shift();

            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;

                if (
                    newRow < 0 ||
                    newRow >= grid.length ||
                    newCol < 0 ||
                    newCol >= grid[0].length ||
                    grid[newRow][newCol] !== 1
                ) {
                    continue;
                }

                grid[newRow][newCol] = 2;
                fresh--;
                queue.push([newRow, newCol]);
            }
        }

        minutes++;
    }

    return fresh === 0 ? minutes : -1;
};