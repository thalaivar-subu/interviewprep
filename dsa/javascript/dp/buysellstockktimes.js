/**
https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/description/
Example 1:
Input: k = 2, prices = [2,4,1]
Output: 2
Explanation: Buy on day 1 (price = 2) and sell on day 2 (price = 4), profit = 4-2 = 2.
Example 2:
Input: k = 2, prices = [3,2,6,5,0,3]
Output: 7
Explanation: Buy on day 2 (price = 2) and sell on day 3 (price = 6), profit = 6-2 = 4. Then buy on day 5 (price = 0) and sell on day 6 (price = 3), profit = 3-0 = 3.
 * @param {number} k
 * @param {number[]} prices
 * @return {number}
 */

/**
 * @param {number} k
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (k, prices) {
    let cache = {};
    const helper = (i, transactions, flag) => {
        if (transactions === 0 || i === prices.length) return 0;

        // if(cache[`${i}-${transactions}-${flag}`] !== undefined) return cache[`${i}-${transactions}-${flag}`];

        // skip current day
        let result = helper(i + 1, transactions, flag);

        // buy
        if (flag) {
            let profit = -prices[i];
            result = Math.max(result, profit + helper(i + 1, transactions, false))
        } else {
            let profit = prices[i];
            result = Math.max(result, profit + helper(i + 1, transactions - 1, true))
        }
        // cache[`${i}-${transactions}-${flag}`] = result;
        return result;
    }
    return helper(0, k, true)
};


var maxProfit = function (k, prices) {
    const n = prices.length;
    // 3d array - day times, k times, sell,buy
    const f = Array.from({ length: n }, () =>
        Array.from({ length: k + 1 }, () => Array.from({ length: 2 }, () => 0)),
    );
    // buying on 1st day - coz buy/sell profit zero
    for (let j = 1; j <= k; ++j) {
        f[0][j][1] = -prices[0];
    }
    for (let i = 1; i < n; ++i) {
        for (let j = 1; j <= k; ++j) {
            f[i][j][0] = Math.max(f[i - 1][j][1] + prices[i], f[i - 1][j][0]);
            f[i][j][1] = Math.max(f[i - 1][j - 1][0] - prices[i], f[i - 1][j][1]);
        }
    }
    // 0 gives answer
    return f[n - 1][k][0];
};