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

The recursive framings of most of these live in
[`../recursion/functional/`](../recursion/functional/PATTERN.md) and
[`../recursion/decision-tree/`](../recursion/decision-tree/PATTERN.md).
Write the recursion first if the loop bounds aren't obvious — then use
the conversion recipe below.

## Which family is this?

The single most useful thing to know about a DP problem is **which of
the seven shapes it is**. The templates differ far more than the "use a
table" advice suggests. Match the cue, jump to the template:

| Cue in the problem | Family | State |
|---|---|---|
| One sequence, answer at position `i` depends on `i-1`/`i-2` | [1D linear](#template-1d-linear-bottom-up) | `i` |
| **Two** strings/arrays consumed independently | [2D two-sequence](#template-2d-two-sequence) | `(i, j)` |
| Palindromes; substring `[i..j]` built from `[i+1..j-1]` | [Interval DP](#template-interval-dp-fill-by-length) | `(i, j)` |
| Palindromic **substrings**, and you want O(1) space | [Center expansion](#template-center-expansion) | — |
| Unlimited supply of items, hit a target, minimize count | [Unbounded knapsack](#template-unbounded-knapsack) | `amount` |
| Count ways to hit a target, **order matters** | [Order-matters counting](#template-order-matters-counting) | `target` |
| Each item covers a **range** of positions | [Range relaxation](#template-range-relaxation) | position |
| "Best ending **at** `i`, scanning all earlier `j`" | [Max over all j < i](#template-max-over-all-j--i) | `i` |
| A limited number of state-changing actions (buy/sell, k uses) | [State machine](#template-state-machine) | `(i, k, mode)` |

## How to pick the state

Everything above turns on this, so it's worth stating as a rule:

> The state is **exactly** what about the past changes the future — no
> more, no less.

- **Too little** and the cache returns wrong answers (two genuinely
  different situations collide on one key).
- **Too much** and the table explodes for nothing.

Three diagnostic questions:

1. **What varies between recursive calls?** Those parameters are your
   state. Anything you pass but never change (the input array, the
   dictionary) stays out.
2. **Given only the state, can I finish the problem?** If you need to
   ask "but what did I pick earlier?", that earlier pick belongs in the
   state — this is why LC 300's recursive form carries `prevIdx`, and
   why LC 518 carries `start` but LC 377 doesn't.
3. **Is the state bounded?** `remaining` bounded by `amount`, indices
   bounded by `n`. If a parameter can take unboundedly many values, you
   don't have a DP yet.

Notice `wordbreak.js` memoizes on **the suffix string itself**
(`memo[s]`), not on an index. That's legal — it's still a bounded state
(`n` distinct suffixes) — but the index form `dp[i]` is cheaper because
it avoids hashing strings.

## Converting memoization → tabulation

Four steps that work for essentially every recurrence here:

1. **Identify the state.** `dfs(i, j)` → `dp[i][j]`.
2. **Copy the base case into the table.** `if (i === m || j === n)
   return 0` means row `m` and column `n` are zeros — that's exactly why
   the table is `(m+1) × (n+1)`. The padding row and column **are** the
   base cases.
3. **Copy the recurrence verbatim.** `1 + dfs(i+1, j+1)` becomes
   `1 + dp[i+1][j+1]`. Same equation.
4. **Derive the fill order from the dependencies.**
   - Depends on `i + 1` → iterate `i` **backwards**.
   - Depends on `i - 1` → iterate `i` **forwards**.
   - Depends on both ends (`i+1` and `j-1`) → neither direction works;
     iterate by **interval length** instead. That's why interval DP
     looks different.

(The long-form walkthrough lives in the comment block at the bottom of
[`../recursion/functional/longestcommonsubseq.js`](../recursion/functional/longestcommonsubseq.js).)

---

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

## Template (1D linear, bottom-up)

```js
const dp = new Array(n + 1).fill(0);
dp[0] = base0;
dp[1] = base1;
for (let i = 2; i <= n; i++) {
    dp[i] = combine(dp[i - 1], dp[i - 2]);
}
return dp[n];
```

Only the last two entries are ever read, so this reduces to two
variables and O(1) space. `climbstairs.js` (LC 70).

## Template (2D two-sequence)

Two inputs consumed independently. **Pad by one row and one column** so
the base case needs no special-casing, then index the strings with
`i - 1` / `j - 1`.

```js
const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;          // diagonal: consume both
        } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);   // drop one side
        }
    }
}
return dp[m][n];
```

`longestcommonsubseq.js` (LC 1143). The three-cell dependency —
**diagonal on a match, up/left on a mismatch** — is the shape; only the
combine changes for edit distance (3-way min including the diagonal) and
delete-distance. Row `i` only reads row `i-1`, so this is reducible to
two rows, O(n) space.

## Template (interval DP — fill by length)

`dp[i][j]` describes the substring `s[i..j]`, and it depends on
`dp[i+1][j-1]` — a *shorter* interval. Neither loop direction gets that
for free, so the outer loop is over **length**:

```js
const dp = Array.from({ length: n }, () => Array(n).fill(0));

for (let i = 0; i < n; i++) dp[i][i] = 1;            // length-1 base

for (let length = 2; length <= n; length++) {
    for (let i = 0; i <= n - length; i++) {
        const j = i + length - 1;                     // derive j from i and length

        if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
}
return dp[0][n - 1];                                  // whole string
```

`longestpalindromicsubseq.js` (LC 516). Note the answer is at
`dp[0][n-1]`, not `dp[n][n]` — you're asking about the full interval.
`i <= n - length` is the bound that keeps `j` in range.

> Shortcut: LPS(s) = LCS(s, reverse(s)), so the 2D template solves this
> too if you'd rather not remember the length loop.

## Template (center expansion)

For palindromic **substrings** (contiguous), expanding around centers
beats the table: same O(n²) time, but **O(1) space** and much less code.
There are `2n - 1` centers — `n` single characters and `n - 1` gaps:

```js
const expand = (left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
        // count++            ← for LC 647 (counting)
        left--; right++;
    }
    return s.slice(left + 1, right);   // ← for LC 5 (longest); loop overshot by one
};

for (let i = 0; i < s.length; i++) {
    expand(i, i);        // odd length,  centre = s[i]
    expand(i, i + 1);    // even length, centre = the gap after s[i]
}
```

**You must run both.** Only doing `expand(i, i)` silently misses every
even-length palindrome ("bb"). `longestpalindromicsubstring.js` (LC 5)
and `palindromicsubstring.js` (LC 647) each contain this *and* the
boolean-table version — the table seeds length-1 and length-2 diagonals
explicitly, then runs the interval loop from length 3.

## Template (unbounded knapsack)

Unlimited supply, so the inner loop is over the **item set**, not over a
fixed `i - 1` / `i - 2` offset:

```js
const dp = Array(amount + 1).fill(amount + 1);   // amount + 1 = "infinity"
dp[0] = 0;

for (let sub = 1; sub <= amount; sub++) {
    for (const coin of coins) {
        if (sub - coin >= 0) {
            dp[sub] = Math.min(dp[sub], 1 + dp[sub - coin]);
        }
    }
}
return dp[amount] < amount + 1 ? dp[amount] : -1;   // unreachable → -1
```

`coinschange.js` (LC 322). Two idioms: **`amount + 1` as infinity** (no
real answer can exceed `amount` coins, and it stays an integer), and the
final **unreachability check** — an untouched cell still holds the
sentinel, which means "impossible", not "expensive".

## Template (order-matters counting)

```js
const dp = new Array(target + 1).fill(0);
dp[0] = 1;                                    // one way to make nothing

for (let t = 1; t <= target; t++) {           // target OUTER
    for (const num of nums) {                 // nums INNER
        if (t - num >= 0) dp[t] += dp[t - num];
    }
}
return dp[target];
```

`combinationsum4.js` (LC 377). **The loop order is the whole lesson:**

| Loop order | Counts | Problem |
|---|---|---|
| target outer, nums inner | **Sequences** — `1+2` ≠ `2+1` | LC 377 Combination Sum IV |
| nums outer, target inner | **Combinations** — `1+2` = `2+1` | LC 518 Coin Change II |

With nums on the outside, each number is fully absorbed before the next
is considered, so no arrangement can interleave them. Swapping two
`for` lines changes the answer — this is worth verifying by hand once on
`nums = [1,2], target = 3`.

## Template (range relaxation)

Each item doesn't advance you one step; it covers a whole **interval**.
So relax every position the item reaches from the item's start:

```js
const dp = Array(n + 1).fill(Infinity);
dp[0] = 0;

for (let i = 0; i < ranges.length; i++) {
    const start = Math.max(0, i - ranges[i]);      // clamp to the garden
    const end   = Math.min(n, i + ranges[i]);

    for (let j = start + 1; j <= end; j++) {
        dp[j] = Math.min(dp[j], dp[start] + 1);    // reach j by opening this tap
    }
}
return dp[n] < Infinity ? dp[n] : -1;
```

`minimumtaps.js` (LC 1326). `dp[start] + 1` — not `dp[j-1] + 1` —
because opening one tap gets you from its left edge all the way to `j`
in a single move. The clamping matters: taps at the ends reach outside
`[0, n]`. This same problem also has a greedy solution; see
[`../greedy/PATTERN.md`](../greedy/PATTERN.md) for the interval-covering
version and why both are correct.

## Template (max over all j < i)

`dp[i]` = the best answer **ending exactly at** `i`, found by scanning
every earlier position:

```js
const dp = new Array(n).fill(1);      // every element alone is a valid answer

for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
            dp[i] = Math.max(dp[i], dp[j] + 1);
        }
    }
}
return Math.max(...dp);               // NOT dp[n - 1]
```

`longestincreasingsubseq.js` (LC 300). The trap is the return: because
`dp[i]` means "ending at `i`", the best subsequence may end anywhere, so
you take the max over the whole array. `dp[n-1]` is a different (wrong)
question.

> **O(n log n) variant, worth knowing:** keep a `tails` array where
> `tails[k]` is the smallest possible tail of an increasing subsequence
> of length `k+1`. For each `num`, binary-search for the first tail
> `>= num` and overwrite it (or append if none). The answer is
> `tails.length`. `tails` is **not** an actual subsequence — only its
> length is meaningful.

## Template (state machine)

When the answer depends not just on *where* you are but on *what mode
you're in* and *how many actions you have left*, add a dimension per
axis. Buy/sell with at most `k` transactions is 3D:

```js
// f[day][transactionsUsed][holding]   holding: 0 = in cash, 1 = holding stock
const f = Array.from({ length: n }, () =>
    Array.from({ length: k + 1 }, () => [0, 0]));

for (let j = 1; j <= k; j++) f[0][j][1] = -prices[0];   // buying on day 0

for (let i = 1; i < n; i++) {
    for (let j = 1; j <= k; j++) {
        f[i][j][0] = Math.max(f[i - 1][j][0], f[i - 1][j][1] + prices[i]);  // sell or idle
        f[i][j][1] = Math.max(f[i - 1][j][1], f[i - 1][j - 1][0] - prices[i]); // buy or idle
    }
}
return f[n - 1][k][0];                                  // must end in cash
```

`buysellstockktimes.js` (LC 188). Three things to get right:

- **Initialization.** `f[0][j][1] = -prices[0]` — holding on day 0 means
  you spent `prices[0]`. Leaving it at `0` claims a free share.
- **Where `k` decrements.** Here `j - 1` appears on the **buy** line, so
  a transaction is "consumed" when opened. Decrementing on sell is
  equally valid — just be consistent, or you'll be off by one.
- **Which plane holds the answer.** `[0]` — ending while still holding
  stock is never better than having sold it.

The whole family (LC 121 / 122 / 123 / 188 / 309 / 714) is this table
with dimensions added or removed.

## Complexity

**O(number of distinct subproblems × work per subproblem)** time, and
space proportional to the memo/table size — often reducible to O(1) or
O(n) if only the last couple of states are ever needed (rolling array).

| Family | Time | Space | Reducible to |
|---|---|---|---|
| 1D linear | O(n) | O(n) | **O(1)** (two vars) |
| 2D two-sequence | O(m·n) | O(m·n) | **O(n)** (two rows) |
| Interval DP | O(n²) | O(n²) | — (needs the full table) |
| Center expansion | O(n²) | **O(1)** | — |
| Unbounded knapsack | O(amount·C) | O(amount) | — |
| Order-matters counting | O(target·C) | O(target) | — |
| Range relaxation | O(n²) worst | O(n) | — |
| Max over all j < i | O(n²) | O(n) | O(n log n) time via tails |
| State machine | O(n·k) | O(n·k) | **O(k)** (two days) |

## Problems in this folder

- [`climbstairs.js`](climbstairs.js) (LC 70) — 1D linear; the Fibonacci recurrence.
- [`longestcommonsubseq.js`](longestcommonsubseq.js) (LC 1143) — 2D two-sequence, padded table.
- [`longestpalindromicsubseq.js`](longestpalindromicsubseq.js) (LC 516) — interval DP, filled by length.
- [`longestpalindromicsubstring.js`](longestpalindromicsubstring.js) (LC 5) — center expansion **and** boolean interval table.
- [`palindromicsubstring.js`](palindromicsubstring.js) (LC 647) — the same two techniques, in counting form.
- [`coinschange.js`](coinschange.js) (LC 322) — unbounded knapsack; `amount+1` sentinel, `-1` on unreachable.
- [`combinationsum4.js`](combinationsum4.js) (LC 377) — order-matters counting; target-outer loop order.
- [`minimumtaps.js`](minimumtaps.js) (LC 1326) — range relaxation. Compare the greedy solution at [`../greedy/minimumnumberoftaps.js`](../greedy/minimumnumberoftaps.js).
- [`longestincreasingsubseq.js`](longestincreasingsubseq.js) (LC 300) — max over all `j < i`; answer is `Math.max(...dp)`.
- [`buysellstockktimes.js`](buysellstockktimes.js) (LC 188) — 3D state machine over `(day, transactions, holding)`.
- [`wordbreak.js`](wordbreak.js) (LC 139) — memoized on the **suffix string**; scan prefixes against a `Set`. The index form is `dp[i] = any(dp[j] && s.slice(j, i) in dict)`.

### Overlap with `recursion/`

Four of these are also solved recursively, deliberately — read them as
before/after pairs and practice the conversion recipe on them:

| Problem | Recursive | Tabulated |
|---|---|---|
| LC 322 Coin Change | [`../recursion/functional/coinschange.js`](../recursion/functional/coinschange.js) | `coinschange.js` |
| LC 1143 LCS | [`../recursion/functional/longestcommonsubseq.js`](../recursion/functional/longestcommonsubseq.js) | `longestcommonsubseq.js` |
| LC 516 LPS | [`../recursion/functional/longestcommonpalindrome.js`](../recursion/functional/longestcommonpalindrome.js) | `longestpalindromicsubseq.js` |
| LC 300 LIS | [`../recursion/decision-tree/lengthoflongestincreasingsubseq.js`](../recursion/decision-tree/lengthoflongestincreasingsubseq.js) | `longestincreasingsubseq.js` |

`combinationsum4.js` also has a byte-identical copy at
[`../recursion/backtracking/combinationsum4.js`](../recursion/backtracking/combinationsum4.js),
which contains no backtracking — this file is the one to read.

`buysellstockktimes.js`'s top-down version has its memo lines commented
out, so as written it is O(2ⁿ); the tabulated version below it is the
working one.
