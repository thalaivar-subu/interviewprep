/**
 * @param {number} n
 * @return {number}
 * O(1) time (bounded by 32 bits), O(1) space
 */
var hammingWeight = function(n) {
    let count = 0;
    while(n) {
        if(n&1) count++
        n = n >> 1;
    }
    return count;
};