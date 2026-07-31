/**
79. Word Search
Medium
Topics
premium lock icon
Companies
Given an m x n grid of characters board and a string word, return true if word exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

 

Example 1:


Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
Output: true
Example 2:


Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"
Output: true
Example 3:


Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"
Output: false
 

Constraints:

m == board.length
n = board[i].length
1 <= m, n <= 6
1 <= word.length <= 15
board and word consists of only lowercase and uppercase English letters.
 

Follow up: Could you use search pruning to make your solution faster with a larger board?
 */
/**
 * https://leetcode.com/problems/word-search/description/
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
function exist(board, word) {
    const rows = board.length;
    const cols = board[0].length;

    function dfs(r, c, index) {

        // Entire word matched
        if (index === word.length)
            return true;

        // Invalid position / wrong character
        if (
            r < 0 ||
            r >= rows ||
            c < 0 ||
            c >= cols ||
            board[r][c] !== word[index]
        )
            return false;

        // Mark visited
        const temp = board[r][c];
        board[r][c] = '#';

        // Explore 4 directions
        const found =
            dfs(r + 1, c, index + 1) ||
            dfs(r - 1, c, index + 1) ||
            dfs(r, c + 1, index + 1) ||
            dfs(r, c - 1, index + 1);

        // Backtrack
        board[r][c] = temp;

        return found;
    }

    // Try every cell as starting point
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (dfs(r, c, 0))
                return true;
        }
    }

    return false;
}