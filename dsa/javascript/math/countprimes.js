/**
 * @param {number} n
 * @return {number}
 *  nlog(logn)
 */
var countPrimes = function (n) {
    if (n <= 1) return 0;
    let primes = [];
    for (let i = 2; i <= n; i++) primes[i] = true;

    for (let i = 2; i * i <= n; i++) {
        if (primes[i]) {
            for (let j = i * 2; j < n; j += i) primes[j] = false
        }
        else continue;
    }

    let countOfPrimes = 0;
    for (let i = 2; i < n; i++) {
        if (primes[i]) countOfPrimes++;
    }
    return countOfPrimes;
};