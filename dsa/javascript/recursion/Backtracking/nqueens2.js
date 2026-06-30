/*
52. N-Queens II
Solved
Hard
Topics
premium lock icon
Companies
The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.

Given an integer n, return the number of distinct solutions to the n-queens puzzle.

 

Example 1:


Input: n = 4
Output: 2
Explanation: There are two distinct solutions to the 4-queens puzzle as shown.
Example 2:

Input: n = 1
Output: 1
 

Constraints:

1 <= n <= 9
*/
/**
 * https://leetcode.com/problems/n-queens-ii/description/
 * @param {number} n
 * @return {number}
 */
var totalNQueens = function (n) {
    let board = Array.from({ length: n }, () => Array(n).fill(false));
    let result = [];
    const helper = (board, row) => {
        if (row === board.length) {
            return board.every(y => y.some(x => x === true)) ? 1 : 0;
        };
        let count = 0;
        for (let col = 0; col < board.length; col++) {
            if (isSafe(board, row, col)) {
                board[row][col] = true;
                count += helper(board, row + 1);
                board[row][col] = false;
            }
        }
        return count;

    }
    return helper(board, 0);
};

const isSafe = (board, row, col) => {
    // Vertical
    for (let i = 0; i < row; i++) {
        if (board[i][col]) return false;
    }

    // Left Diagnol
    const maxLeft = Math.min(row, col)
    for (let i = 1; i <= maxLeft; i++) {
        if (board[row - i][col - i]) return false
    }

    // Right Diagnol
    const maxRight = Math.min(row, board.length - col - 1);
    for (let i = 1; i <= maxRight; i++) {
        if (board[row - i][col + i]) return false;
    }
    return true


}