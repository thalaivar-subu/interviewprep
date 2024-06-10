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
// DP Solution
var coinChange = function(coins, amount) {
    let dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0; // 0 coins required for 0
    for(let amt = 1; amt<=amount; amt++){
        // for each amt we are getting minimum value so 1 more loop
        for(let coin of coins){
            if(amt - coin >= 0){
                // valid case
                dp[amt] = Math.min(dp[amt], 1 + dp[amt-coin]);
            }
        }
    }
    return dp[amount] < amount + 1 ? dp[amount] : -1;
};

// DFS Solution With Memoization
var coinChange = function(coins, amount) {
    const map = new Map();
    coins.sort((a,b) => b - a)
    const dfs = (remaining) => {
        if(remaining === 0) return 0; // no amt left
        if(remaining <0) return -1; // can't achieve amt
        if(map.has(remaining)) return map.get(remaining) // from cache
        let minCoins = amount + 1;
        for(let coin of coins){
            const coinsNeeded = dfs(remaining - coin);
            if(coinsNeeded !== -1) minCoins = Math.min(minCoins, coinsNeeded + 1);
        }
        map.set(remaining, minCoins); // store even if minCoins is amount + 1
        return minCoins;
    }
    let result = dfs(amount)
    return result < amount + 1 ? result : -1;
};
