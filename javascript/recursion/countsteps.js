/**
https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/description/
Example 1:
Input: num = 14
Output: 6
Explanation: 
Step 1) 14 is even; divide by 2 and obtain 7. 
Step 2) 7 is odd; subtract 1 and obtain 6.
Step 3) 6 is even; divide by 2 and obtain 3. 
Step 4) 3 is odd; subtract 1 and obtain 2. 
Step 5) 2 is even; divide by 2 and obtain 1. 
Step 6) 1 is odd; subtract 1 and obtain 0.
Example 2:

Input: num = 8
Output: 4
Explanation: 
Step 1) 8 is even; divide by 2 and obtain 4. 
Step 2) 4 is even; divide by 2 and obtain 2. 
Step 3) 2 is even; divide by 2 and obtain 1. 
Step 4) 1 is odd; subtract 1 and obtain 0.
Example 3:

Input: num = 123
Output: 12
 * @param {number} num
 * @return {number}
 */
var numberOfSteps = function(num) {
    return helper(num, 0);
};

const helper = (num, steps) => {
    if(num === 0) return steps;
    if(num%2===0) return helper(num/2, steps + 1)
    return helper(num-1, steps+1)
}
