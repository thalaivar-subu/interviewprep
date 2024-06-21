/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
    if (x == 0 || x == 1) return x;
    let start = 0;
    let end = x;
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2);
        let square = mid * mid;
        if (square === x) return mid;
        else if (square > x) end = mid - 1;
        else start = mid + 1;
    }
    return Math.round(end);
};