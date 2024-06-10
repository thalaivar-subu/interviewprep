/**
https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/
 * @param {number[]} prices
 * @return {number}
 */
/*
- Concept is buy at low price. How we know low is next day should be high
- If next day is high, check for next next day, if that is not high buy next day
- else buy the highest next of next days.
- Once done, do the same logic for remaining elements
*/
var maxProfit = function(prices) {
    let profit = 0;
    for(let i=0; i<prices.length+1; i++){
        if(prices[i+1] > prices[i]){
            let j=i+1
            while(prices[j+1] > prices[j]) j++;
            profit += prices[j] - prices[i]
            i = j
        }
    }
    return profit;
};
