# Functional / Memoized Recursion Pattern Notes

## When to use it

**"Functional" is a coding style, not an algorithm — every problem in
this folder is dynamic programming, written top-down.** Each call
returns a value, the parent combines those values, and nothing is
mutated or un-chosen. That is what makes them memoizable.

Read this folder when:

- The answer is a single number (a min, a max, a count) over an
  exponential space of choices.
- You can write the recurrence in one line — "the answer for `n` is
  `f(n-1)` combined with `f(n-2)`", or "the answer for `(i, j)` depends
  on whether `a[i] === b[j]`".
- Writing the loop bounds bottom-up feels harder than writing the
  recursion. Write the recursion, add a `Map`, ship it.

Where the neighbours differ: [`../backtracking/`](../backtracking/PATTERN.md)
enumerates configurations and undoes its choices;
[`../decision-tree/`](../decision-tree/PATTERN.md) is the take/skip
subset of this pattern; [`../../dp/`](../../dp/PATTERN.md) has the
bottom-up tabulations of these same recurrences.

## The four recurrence shapes in this folder

| Shape | State | Recognition cue |
|---|---|---|
| Optimization over an unbounded choice set | `remaining` | "fewest / most X to reach a total, unlimited supply" |
| Counting with a `start` index | `(start, remaining)` | "how many **combinations**" (order must not matter) |
| Two-string alignment | `(i, j)` | Two inputs consumed independently |
| Two-ended interval | `(left, right)` | Palindromes; you shrink from both sides |
| Fixed-position consumption | `(built, remaining)` | Each level consumes one *position*, options come from a lookup |

## Template (min-optimization with a `-1` sentinel)

`coinschange.js` (LC 322). Unbounded supply, so **every call may choose
every coin** — the loop starts at `0` each time.

```js
const coinChange = (coins, amount) => {
    const memo = new Map();

    const helper = (remaining) => {
        if (remaining === 0) return 0;
        if (remaining < 0) return -1;              // impossible branch
        if (memo.has(remaining)) return memo.get(remaining);

        let minCoins = amount + 1;                 // stand-in for Infinity
        for (const coin of coins) {
            const sub = helper(remaining - coin);
            if (sub !== -1) minCoins = Math.min(minCoins, sub + 1);
        }

        memo.set(remaining, minCoins);
        return minCoins;
    };

    const result = helper(amount);
    return result < amount + 1 ? result : -1;      // unreachable → -1
};
```

Two idioms worth stealing:

- **`amount + 1` as infinity.** Any real answer uses at most `amount`
  coins (all 1s), so `amount + 1` is unreachable and stays an `int`.
  `Infinity` also works but poisons arithmetic if you forget a guard.
- **The `-1` sentinel must be checked before adding.** `sub + 1` on
  `-1` gives `0`, which reads as "free" — the single most common bug in
  this problem. The guard exists *because* `-1` is not the identity of
  `min`; `Infinity`/`amount + 1` makes a dead branch vanish on its own
  and needs no guard.
  See [`../PATTERN.md`](../PATTERN.md) → *question 4* for why, and for
  the LC 322 (EDGE) vs LC 518 (LEAF) contrast the next template
  continues.

Note the state is **just `remaining`**, not `(index, remaining)`,
precisely because coins are reusable and order doesn't matter for a
*minimum*.

## Template (counting combinations — the `start` index)

`coinschange2.js` (LC 518). Same coins, same amount, but now you're
**counting** — and that changes everything.

```js
const change = (amount, coins) => {
    const memo = new Map();

    const backtrack = (start, remaining) => {
        if (remaining === 0) return 1;             // one complete combination
        if (remaining < 0) return 0;

        const key = `${start}-${remaining}`;
        if (memo.has(key)) return memo.get(key);

        let count = 0;
        for (let i = start; i < coins.length; i++) {
            count += backtrack(i, remaining - coins[i]);   // `i`, not `i + 1`
        }

        memo.set(key, count);
        return count;
    };

    return backtrack(0, amount);
};
```

`i` (not `i + 1`) keeps the coin reusable; **`start` (not `0`) is what
suppresses permutations.** Without it, `[1,2]` and `[2,1]` both count.

### The contrast that makes both problems click

| | LC 518 Coin Change II | LC 377 Combination Sum IV |
|---|---|---|
| Question | How many **combinations**? | How many **sequences**? |
| `1+2` vs `2+1` | Same, count once | Different, count twice |
| Loop starts at | `start` | `0` |
| State | `(start, remaining)` | `remaining` only |
| Bottom-up loop order | coins outer, target inner | target outer, nums inner |

Dropping `start` from the state is exactly what collapses LC 377 to a 1D
DP. See [`../../dp/PATTERN.md`](../../dp/PATTERN.md) → *Order-matters
counting*.

## Template (two-string alignment — `(i, j)`)

One cursor per string; on a match you consume both, on a mismatch you
branch. Three problems here are the same skeleton with different
combines.

**LC 1143 Longest Common Subsequence** (`longestcommonsubseq.js`) — the
canonical form:

```js
const dfs = (i, j, memo = new Map()) => {
    if (i === text1.length || j === text2.length) return 0;

    const key = `${i},${j}`;
    if (memo.has(key)) return memo.get(key);

    let ans;
    if (text1[i] === text2[j]) ans = 1 + dfs(i + 1, j + 1, memo);
    else ans = Math.max(dfs(i + 1, j, memo), dfs(i, j + 1, memo));

    memo.set(key, ans);
    return ans;
};
```

**LC 583 Delete Operation for Two Strings** (`deleteoperations.js`) —
same tree, minimize deletions. The base cases carry the answer: if one
string is exhausted, you must delete all of the other.

```js
if (i === word1.length) return word2.length - j;
if (j === word2.length) return word1.length - i;

if (word1[i] === word2[j]) return dfs(i + 1, j + 1);
return 1 + Math.min(dfs(i + 1, j), dfs(i, j + 1));
```

**LC 72 Edit Distance** (`minimumDistance.js`) — the same, plus a third
branch. Insert / delete / replace is a **3-way min**, and the diagonal
move is what "replace" means:

```js
const dfs = (i, j) => {
    if (i === 0) return j;                       // insert the rest
    if (j === 0) return i;                       // delete the rest

    if (word1[i - 1] === word2[j - 1]) return dfs(i - 1, j - 1);

    return 1 + Math.min(
        dfs(i, j - 1),        // insert
        dfs(i - 1, j),        // delete
        dfs(i - 1, j - 1)     // replace
    );
};

return dfs(word1.length, word2.length);
```

Note this one is **length-indexed** (counting down from the lengths,
indexing with `i - 1`) rather than 0-indexed counting up. Both work;
pick one and stay consistent, because mixing them off-by-ones every base
case.

## Template (two-ended interval — `(left, right)`)

`longestcommonpalindrome.js` (LC 516 Longest Palindromic Subsequence —
the file is misnamed). Palindromes are symmetric, so you shrink from
**both ends** instead of walking one cursor:

```js
const dfs = (left, right, memo = new Map()) => {
    if (left > right) return 0;                  // empty
    if (left === right) return 1;                // single char is a palindrome

    const key = `${left},${right}`;
    if (memo.has(key)) return memo.get(key);

    let ans;
    if (s[left] === s[right]) {
        ans = 2 + dfs(left + 1, right - 1, memo);   // both ends count
    } else {
        ans = Math.max(dfs(left, right - 1, memo),
                       dfs(left + 1, right, memo));
    }

    memo.set(key, ans);
    return ans;
};

return dfs(0, s.length - 1);
```

Two base cases, not one — `left > right` (even-length exhaustion) and
`left === right` (odd-length centre). The bottom-up version of this is
**interval DP**, which must be filled by increasing substring length;
see [`../../dp/PATTERN.md`](../../dp/PATTERN.md).

> Shortcut worth knowing: LPS(s) = LCS(s, reverse(s)). If you can write
> the two-string template you already have this one.

## Template (fixed-position consumption)

`numberpad.js` (LC 17 Letter Combinations of a Phone Number). Unlike
every template above, there is **no `start` index and no push/pop** —
each level consumes exactly one input position, and the options come
from a lookup table rather than from the input array.

```js
const map = new Map([
    ["2", "abc"], ["3", "def"], ["4", "ghi"], ["5", "jkl"],
    ["6", "mno"], ["7", "pqrs"], ["8", "tuv"], ["9", "wxyz"],
]);

const generate = (built, remaining) => {
    if (!remaining.length) {                     // consumed every digit
        result.push(built);
        return;
    }

    const letters = map.get(remaining.charAt(0));
    for (let i = 0; i < letters.length; i++) {
        generate(built + letters[i], remaining.substring(1));
    }
};

generate("", digits);
```

The tell: **the number of levels is fixed by the input length**, and
each level's branching factor comes from a per-position option set. Same
shape solves "generate all IP addresses from a template", "all readings
of an ambiguous encoding", etc. This one doesn't memoize — every path is
a distinct output, so there are no overlapping subproblems to cache.

## Converting memoization → tabulation

The four-step recipe, which works for essentially every recurrence in
this folder:

1. **Identify the state.** `dfs(i, j)` → `dp[i][j]`.
2. **Copy the base case into the table.** `if (i === m || j === n)
   return 0` means row `m` and column `n` are all zeros — that's why the
   table is `(m+1) × (n+1)`. The extra row and column *are* the base
   cases.
3. **Copy the recurrence verbatim.** `1 + dfs(i+1, j+1)` becomes
   `1 + dp[i+1][j+1]`. Same equation, different notation.
4. **Derive the fill order from the dependencies.**
   - Depends on `i + 1` → iterate `i` **backwards**.
   - Depends on `i - 1` → iterate `i` **forwards**.
   - Depends on both → pick an order where the dependency is already
     filled (for interval DP, that means iterating by **length**).

Worked on LC 1143 — the recursion reads `dp[i+1][j]`, `dp[i][j+1]`,
`dp[i+1][j+1]`, all larger indices, so both loops run backwards:

```js
const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
        if (text1[i] === text2[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
}

return dp[0][0];
```

(The long-form version of this recipe lives in the comment block at the
bottom of [`longestcommonsubseq.js`](longestcommonsubseq.js).)

## Complexity

**O(distinct states × work per state)**, plus O(depth) stack.

| Problem | States | Work/state | Time |
|---|---|---|---|
| LC 322 Coin Change | `amount` | `len(coins)` | **O(amount · C)** |
| LC 518 Coin Change II | `C × amount` | `C` | **O(C² · amount)** as written; O(C · amount) bottom-up |
| LC 1143 LCS | `m × n` | O(1) | **O(m · n)** |
| LC 583 Delete Operation | `m × n` | O(1) | **O(m · n)** |
| LC 72 Edit Distance | `m × n` | O(1) | **O(m · n)** |
| LC 516 Longest Palindromic Subseq | `n²` | O(1) | **O(n²)** |
| LC 1155 Dice Roll Sum | `n × target` | `k` | **O(n · target · k)** |
| LC 17 Letter Combinations | — | — | **O(4ⁿ · n)**, no memo possible |

Without the memo, every one of these is exponential — the `Map` is not
an optimization, it's the algorithm.

## Problems in this folder

- [`coinschange.js`](coinschange.js) (LC 322 Coin Change) — min-optimization, `-1` sentinel, `amount + 1` as infinity; state is `remaining` alone.
- [`coinschange2.js`](coinschange2.js) (LC 518 Coin Change II) — combination counting; `start` index suppresses permutations.
- [`longestcommonsubseq.js`](longestcommonsubseq.js) (LC 1143 Longest Common Subsequence) — two-string alignment; also contains the memo→tabulation recipe.
- [`deleteoperations.js`](deleteoperations.js) (LC 583 Delete Operation for Two Strings) — LCS-complement; base cases return the remaining length.
- [`minimumDistance.js`](minimumDistance.js) (LC 72 Edit Distance) — 3-way min over insert/delete/replace, length-indexed.
- [`longestcommonpalindrome.js`](longestcommonpalindrome.js) (LC 516 Longest Palindromic Subsequence — **file is misnamed**) — two-ended interval shrink.
- [`dicerolls.js`](dicerolls.js) (LC 1155 Number of Dice Rolls With Target Sum) — reduced state `(n, target)`, loop over the `k` faces, `MOD 1e9+7`.
- [`numberpad.js`](numberpad.js) (LC 17 Letter Combinations of a Phone Number) — fixed-position consumption from a lookup map; no memo.

`dicerolls.js` currently has its memo lines commented out — uncomment
them (the `${n}-${target}` key) to get O(n · target · k) instead of
O(kⁿ).
