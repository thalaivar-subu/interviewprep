/*
Example 1:

Input: digits = [1,2,3]
Output: [1,2,4]
Explanation: The array represents the integer 123.
Incrementing by one gives 123 + 1 = 124.
Thus, the result should be [1,2,4].
Example 2:

Input: digits = [4,3,2,1]
Output: [4,3,2,2]
Explanation: The array represents the integer 4321.
Incrementing by one gives 4321 + 1 = 4322.
Thus, the result should be [4,3,2,2].
Example 3:

Input: digits = [9]
Output: [1,0]
Explanation: The array represents the integer 9.
Incrementing by one gives 9 + 1 = 10.
Thus, the result should be [1,0].
 
*/

/**
 * @param {number[]} digits
 * @return {number[]}
 */

/*
Iterate from last - mod/10 if 0 add 1 to previous again mod same till all elements changed
*/
var plusOne = function(digits) {
    let n = digits.length - 1
    let prevMod;
    while(prevMod !== -1 && n>=0){
        let sum = digits[n] + 1
        if(sum % 10 === 0){
            prevMod = sum % 10
            digits[n] = prevMod
        } else {
            digits[n] = sum
            prevMod = -1
        }
        n--;
    }
    if(prevMod === 0){
        digits.unshift(1)
    }
    return digits
};