/**
48. Rotate Image
Medium
Topics
premium lock icon
Companies
You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).

You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.

 

Example 1:


Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [[7,4,1],[8,5,2],[9,6,3]]
Example 2:


Input: matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
Output: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]
 

Constraints:

n == matrix.length == matrix[i].length
1 <= n <= 20
-1000 <= matrix[i][j] <= 1000
 */
/**
 * https://leetcode.com/problems/rotate-image/description/
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 * O(n^2) time, O(1) space
 */

/*
90°   : Transpose + Reverse rows        ✅

180°  : Reverse rows + Reverse columns ✅
        (No transpose needed)

270°  : Transpose + Reverse columns    ✅
*/
var rotate = function (matrix) {
    // Transpose
    for (let i = 0; i < matrix.length; i++) {
        for (let j = i; j < matrix[i].length; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]]
        }
    }

    // Reverse Each Rows for 90 Degree
    for (let i = 0; i < matrix.length; i++) matrix[i] = matrix[i].reverse();

    return matrix;
};
/*  case 180:
            // Reverse each row
            for (let i = 0; i < N; i++) {
                matrix[i] = matrix[i].reverse();
            }
            // Reverse each column
            for (let j = 0; j < M; j++) {
                for (let i = 0; i < N; i++) {
                    [matrix[i][j], matrix[N - 1 - i][j]] = [matrix[N - 1 - i][j], matrix[i][j]];
                }
            }
            break;
        case 270:
            // Transpose the matrix
            for (let i = 0; i < N; i++) {
                for (let j = i; j < M; j++) {
                    [matrix[j][i], matrix[i][j]] = [matrix[i][j], matrix[j][i]];
                }
            }
            // Reverse each column
            for (let j = 0; j < M; j++) {
                for (let i = 0; i < N; i++) {
                    [matrix[i][j], matrix[N - 1 - i][j]] = [matrix[N - 1 - i][j], matrix[i][j]];
                }
            } */