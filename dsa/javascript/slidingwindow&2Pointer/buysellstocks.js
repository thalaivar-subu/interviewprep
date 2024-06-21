/**
 * @param {number[]} prices
 * @return {number}
Example 1:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.
Example 2:
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.
o(N)
 */
var maxProfit = function(prices) {
    let l = 0;
    let r = 1;
    let max = 0;
    while(l<prices.length){
        const left = prices[l];
        const right = prices[r];
        if(left<right) {
            let profit = right - left;
            max = Math.max(max, profit);
        } else l=r;
        r++;
    }
    return max;
};