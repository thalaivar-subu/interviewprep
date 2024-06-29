/* 
322. Coin Change
You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.
Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.
You may assume that you have an infinite number of each kind of coin.
Example 1:
Input: coins = [1,2,5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1
Example 2:
Input: coins = [2], amount = 3
Output: -1
Example 3:
Input: coins = [1], amount = 0
Output: 0
https://leetcode.com/problems/coin-change/description/
*/
// Top Down Approach
var coinChange = function (coins, amount) {
    const backTrack = (remaining) => {
        if (remaining === 0) return 0;
        if (remaining < 0) return -1;
        let minCoins = amount + 1;
        for (let coin of coins) {
            const coinsNeeded = backTrack(remaining - coin);
            if (coinsNeeded !== -1) minCoins = Math.min(minCoins, coinsNeeded + 1)
        }
        return minCoins;
    }
    let result = backTrack(amount);
    return result < amount + 1 ? result : -1;
};

// Top Down Approach With Memoization
var coinChange = function (coins, amount) {
    // Top Down Approach
    let map = new Map();
    const backTrack = (remaining) => {
        if (remaining === 0) return 0;
        if (remaining < 0) return -1;
        if(map.has(remaining)) return map.get(remaining);
        let minCoins = amount + 1;
        for (let coin of coins) {
            const coinsNeeded = backTrack(remaining - coin);
            if (coinsNeeded !== -1) minCoins = Math.min(minCoins, coinsNeeded + 1)
        }
        map.set(remaining, minCoins);
        return minCoins;
    }
    let result = backTrack(amount);
    return result < amount + 1 ? result : -1;
};

// Bottom Up Approach
var coinChange = function (coins, amount) {
    let dp = Array(amount + 1).fill(amount + 1);
    dp[0] = 0;
    for (let eachAmount = 1; eachAmount <= amount; eachAmount++) {
        for (let coin of coins) {
            if (eachAmount - coin >= 0) {
                let possibleSolution = 1 + dp[eachAmount - coin];
                dp[eachAmount] = Math.min(dp[eachAmount], possibleSolution);
            }
        }
    }
    return dp[amount] < amount + 1 ? dp[amount] : -1;
};