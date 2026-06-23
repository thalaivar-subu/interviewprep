/**
 * @param {number} n
 * @param {number} k
 * @param {number} target
 * @return {number}
 * https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/description/
 * Example 1:

Input: n = 1, k = 6, target = 3
Output: 1
Explanation: You throw one die with 6 faces.
There is only one way to get a sum of 3.
Example 2:

Input: n = 2, k = 6, target = 7
Output: 6
Explanation: You throw two dice, each with 6 faces.
There are 6 ways to get a sum of 7: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1.
Example 3:

Input: n = 30, k = 30, target = 500
Output: 222616187
Explanation: The answer must be returned modulo 109 + 7.
* O(2 pow N)
 */
var numRollsToTarget = function (n, k, target) {
    const MOD = Math.pow(10, 9) + 7;
    const map = new Map();
    const helper = (n, target) => {
        if (n <= 0) {
            if (target === 0) return 1
            else return 0;
        }
        let cacheKey = `${n}-${target}`;
        if (map.has(cacheKey)) return map.get(cacheKey);
        let count = 0;
        for (let i = 1; i <= k; i++) {
            count = (count + helper(n - 1, target - i)) % MOD;
        }
        map.set(cacheKey, count)
        return count;
    }
    return helper(n, target, k);
};
