# Dynamic Programming Pattern Notes

## When to use it

When a brute-force recursive solution re-solves the same subproblem
many times (overlapping subproblems) and an optimal solution is built
from optimal solutions to smaller subproblems (optimal substructure).
Recognize it from phrasing like "minimum/maximum number of ways to...",
"can you reach...", or when a recursive brute force is exponential but
the number of *distinct* subproblems is actually small (bounded by one
or two indices).

Two ways to implement the same recurrence:
- **Top-down (memoization)**: write the natural recursion, cache results
  keyed by the changing parameters.
- **Bottom-up (tabulation)**: fill a table iteratively from the base
  case upward, no recursion/call-stack overhead.

## Template (top-down memoization)

```js
function solve(i, memo = new Map()) {
    if (baseCase(i)) return baseValue;
    if (memo.has(i)) return memo.get(i);

    const result = combine(solve(i - 1, memo), solve(i - 2, memo));
    memo.set(i, result);
    return result;
}
```

## Template (bottom-up tabulation)

```js
const dp = new Array(n + 1).fill(0);
dp[0] = base0;
dp[1] = base1;
for (let i = 2; i <= n; i++) {
    dp[i] = combine(dp[i - 1], dp[i - 2]);
}
return dp[n];
```

## Complexity

**O(number of distinct subproblems × work per subproblem)** time, and
space proportional to the memo/table size — often reducible to O(1) or
O(n) if only the last couple of states are ever needed (rolling array).

## Problems in this folder

- [`buysellstockktimes.js`](buysellstockktimes.js) (LC 188)
- [`climbstairs.js`](climbstairs.js) (LC 70)
- [`coinschange.js`](coinschange.js) (LC 322)
- [`combinationsum4.js`](combinationsum4.js) (LC 377)
- [`longestcommonsubseq.js`](longestcommonsubseq.js) (LC 1143)
- [`longestincreasingsubseq.js`](longestincreasingsubseq.js) (LC 300)
- [`longestpalindromicsubseq.js`](longestpalindromicsubseq.js) (LC 516)
- [`longestpalindromicsubstring.js`](longestpalindromicsubstring.js) (LC 5)
- [`minimumtaps.js`](minimumtaps.js) (LC 1326)
- [`palindromicsubstring.js`](palindromicsubstring.js) (LC 647)
- [`wordbreak.js`](wordbreak.js) (LC 139)
