/**
https://leetcode.com/problems/minimum-number-of-taps-to-open-to-water-a-garden/description/
 * @param {number} n
 * @param {number[]} ranges
 * @return {number}
Input: n = 5, ranges = [3,4,1,1,0,0]
Output: 1
Explanation: The tap at point 0 can cover the interval [-3,3]
The tap at point 1 can cover the interval [-3,5]
The tap at point 2 can cover the interval [1,3]
The tap at point 3 can cover the interval [2,4]
The tap at point 4 can cover the interval [4,4]
The tap at point 5 can cover the interval [5,5]
Opening Only the second tap will water the whole garden [0,5]
Example 2:

Input: n = 3, ranges = [0,0,0,0]
Output: -1
Explanation: Even if you activate all the four taps you cannot water the whole garden.
 */
var minTaps = function(n, ranges) {
    let dp = Array(n+1).fill(Infinity)
    dp[0] = 0;
    for(let i=0; i< ranges.length; i++){
        let start = Math.max(0, i - ranges[i]);
        let end = Math.min(n, i + ranges[i]);
        for(let j=1;j<end+1; j++){
            dp[j] = Math.min(dp[j], dp[start] + 1)
        }
    }
    return dp[n] < Infinity ? dp[n] : -1;
};
