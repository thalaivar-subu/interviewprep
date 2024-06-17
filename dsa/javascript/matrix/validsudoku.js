//https://leetcode.com/explore/interview/card/top-interview-questions-easy/92/array/769/
/**
 * @param {character[][]} board
 * @return {boolean}
 */
var isValidSudoku = function (board) {

    for (let row of board) {
        if (!validate(row)) return false
    }

    for (let col = 0; col < 9; col++) {
        let tempArr = []
        for (let row = 0; row < 9; row++) {
            tempArr.push(board[row][col])
        }
        if (!validate(tempArr)) return false;
    }

    for (let blockRow = 0; blockRow < 3; blockRow++) {
        for (let blockCol = 0; blockCol < 3; blockCol++) {
            let tempArr = [];
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    tempArr.push(board[blockRow * 3 + row][blockCol * 3 + col]);
                }
            }
            if (!validate(tempArr)) return false;
        }
    }
    return true

};

const validate = (arr) => {
    const map = new Map();
    for (let num of arr) {
        if (num !== ".") {
            if (!map.has(num)) {
                map.set(num)
            } else {
                return false
            }
        }
    }
    return true;
}

