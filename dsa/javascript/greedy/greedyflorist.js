// https://www.hackerrank.com/challenges/greedy-florist
// Complete the getMinimumCost function below.
function getMinimumCost(k, c) {
    let minimumCost = 0;
    // We need to sort in descending order so maximum will be fetched first
    c.sort((a, b) => b - a);
    for(let i=0; i<c.length; i++){
        // 0 till each buys once. k =2, c = 3, [0/2, 1/2, 2/2 = 1]
        let previousPrice = Math.floor(i/k);
        let currentPrice = c[i];
        minimumCost += (previousPrice + 1) * currentPrice;
    }
    return minimumCost;
}