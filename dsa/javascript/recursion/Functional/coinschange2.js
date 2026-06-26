https://www.hackerrank.com/challenges/coin-change/problem

/**
 * 518. Coin Change II
Attempted
Medium
Topics
premium lock icon
Companies
You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0.

You may assume that you have an infinite number of each kind of coin.

The final answer is guaranteed to fit into a signed 32-bit integer.

 

Example 1:

Input: amount = 5, coins = [1,2,5]
Output: 4
Explanation: there are four ways to make up the amount:
5=5
5=2+2+1
5=2+1+1+1
5=1+1+1+1+1
Example 2:

Input: amount = 3, coins = [2]
Output: 0
Explanation: the amount of 3 cannot be made up just with coins of 2.
Example 3:

Input: amount = 10, coins = [10]
Output: 1
 * @param {number} amount
 * @param {number[]} coins
 * @return {number}
 */
var change = function (amount, coins) {
    const map = new Map();
    const backTrack = (start, remaining) => {
        if (remaining === 0) return 1;
        if (remaining < 0) return 0;
        const cacheKey = `${start}-${remaining}`
        if (map.has(cacheKey)) return map.get(cacheKey);
        let count = 0;
        for (let i = start; i < coins.length; i++) {
            const coin = coins[i]
            count += backTrack(i, remaining - coin);
        }
        map.set(cacheKey, count)
        return count;
    }
    return backTrack(0, amount);
};