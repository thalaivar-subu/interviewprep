/**
212. Word Search II
Attempted
Hard
Topics
premium lock icon
Companies
Hint
Given an m x n board of characters and a list of strings words, return all words on the board.

Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

 

Example 1:


Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]
Output: ["eat","oath"]
Example 2:


Input: board = [["a","b"],["c","d"]], words = ["abcb"]
Output: []
 

Constraints:

m == board.length
n == board[i].length
1 <= m, n <= 12
board[i][j] is a lowercase English letter.
1 <= words.length <= 3 * 104
1 <= words[i].length <= 10
words[i] consists of lowercase English letters.
All the strings of words are unique.
 

 */
/**
 * https://leetcode.com/problems/word-search-ii/description/
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
var findWords = function (board, words) {
    const result = [];
    const wordSearchBoard = (word) => {
        const rows = board.length;
        const cols = board[0].length;
        const dfs = (r, c, index) => {
            // base  case 
            if (index === word.length) return true;

            if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[index]) return false;

            const temp = board[r][c];
            board[r][c] = "#";

            const found = dfs(r - 1, c, index + 1) || dfs(r + 1, c, index + 1) || dfs(r, c - 1, index + 1) || dfs(r, c + 1, index + 1)

            board[r][c] = temp;
            return found;
        }
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (dfs(r, c, 0)) {
                    result.push(word)
                    return;
                };
            }
        }
        return;
    }

    for (let i = 0; i < words.length; i++) {
        wordSearchBoard(words[i]);
    }
    return result;
};