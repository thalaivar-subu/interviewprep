// https://www.hackerrank.com/challenges/greedy-florist
function getMinimumCost(k, c) {
    let total = 0;
    c.sort((a, b) => b - a);
    for(let i = 0; i<c.length; i++){
        let prevPrice = Math.floor(i/k);
        let currentPrice = c[i];
        total += (prevPrice + 1) * currentPrice 
    }
    return total;
}
