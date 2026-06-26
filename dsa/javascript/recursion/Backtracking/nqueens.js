/**
51. N-Queens
Hard
Topics
premium lock icon
Companies
The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.

Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.

Each solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.

 

Example 1:


Input: n = 4
Output: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
Explanation: There exist two distinct solutions to the 4-queens puzzle as shown above
Example 2:

Input: n = 1
Output: [["Q"]]
 

Constraints:

1 <= n <= 9
 */
/**
 * https://leetcode.com/problems/n-queens/
 * @param {number} n
 * @return {string[][]}
 * N pow ! Time Complexity - Constant Decisions
 */
var solveNQueens = function (n) {
    let board = Array.from({ length: n }, () => Array(n).fill(false));
    let result = []
    const backtrack = (board, row) => {
        if (row === board.length) {
            result.push(board.map(x => x.map(y => y ? "Q" : ".").join("")))
            return;
        }
        for (let col = 0; col < board.length; col++) {
            if (isSafe(board, row, col)) {
                board[row][col] = true;
                backtrack(board, row + 1);
                board[row][col] = false;
            }
        }
    }
    backtrack(board, 0);
    return result;
};



const isSafe = (board, row, col) => {
    //check vertical row
    for (let i = 0; i < row; i++) {
        if (board[i][col]) return false;
    }

    // diagnol left
    let maxLeft = Math.min(row, col);
    for (i = 1; i <= maxLeft; i++) {
        if (board[row - i][col - i]) return false
    }

    // diagnol right
    let maxRight = Math.min(row, board.length - col - 1);
    for (i = 1; i <= maxRight; i++) {
        if (board[row - i][col + i]) return false
    }

    return true;
}