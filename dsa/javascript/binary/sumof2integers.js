/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 * O(1) time (bounded by 32 bits), O(1) space
 */
var getSum = function(a, b) {
    while(b){
        let c = a & b;
        a = a ^ b;
        b = (c)<<1;
    }
    return a;
};