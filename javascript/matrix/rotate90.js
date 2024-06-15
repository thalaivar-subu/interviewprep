/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var rotate = function(matrix) {
    for(let i=0;i<matrix.length;i++){
        for(let j=i; j<matrix[i].length;j++){
            let temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp
        }
    }
    for(let i=0;i<matrix.length;i++){
        matrix[i] = matrix[i].reverse();
    }
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
            // Reverse each row
            for (let i = 0; i < N; i++) {
                matrix[i] = matrix[i].reverse();
            }
            // Reverse each column
            for (let j = 0; j < M; j++) {
                for (let i = 0; i < N; i++) {
                    [matrix[i][j], matrix[N - 1 - i][j]] = [matrix[N - 1 - i][j], matrix[i][j]];
                }
            } */