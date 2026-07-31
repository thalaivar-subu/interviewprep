# Decision Tree Pattern Notes

## When to use it

Every element gets an independent **yes/no** decision — take it or skip
it — and you want a single aggregate answer (a max, a min, a count, a
boolean) rather than the list of configurations.

Recognition cues:

- "Choose a subset such that …", "can you reach …", "how many ways …"
- Rephrasing the problem as *"for each element: include or exclude"*
  produces a correct brute force.
- The brute force is `2^n` but the number of **distinct
  `(index, remaining)` pairs** is small.

This is memoized DP, not backtracking — nothing is un-chosen, and the
answer flows back up as a return value. If you need the actual subsets,
go to [`../backtracking/`](../backtracking/PATTERN.md); if you want the
same recurrences tabulated, go to [`../../dp/`](../../dp/PATTERN.md).

## Template (take / skip)

```js
const helper = (i, memo = new Map()) => {
    if (i >= nums.length) return baseValue;
    if (memo.has(i)) return memo.get(i);

    const take = value(nums[i]) + helper(i + skipAhead, memo);
    const skip = helper(i + 1, memo);

    const answer = Math.max(take, skip);     // or min, or take + skip
    memo.set(i, answer);
    return answer;
};

return helper(0);
```

`houserobber.js` (LC 198) is this verbatim with `skipAhead = 2` — taking
house `i` forbids house `i + 1`, which is the *only* thing that makes
this problem more than a sum.

## The real skill: picking the state

The template above has a one-integer state. Most problems in this folder
need more, and choosing correctly is the whole difficulty. The rule:

> The state must contain **everything about the past that changes the
> future** — and nothing else.

Anything you add beyond that multiplies your memo size for no reason;
anything you leave out makes the cache return wrong answers. Four
worked examples, in increasing order of subtlety:

### 1. Two independent cursors — `(i, j)`

`distinctsequence.js` (LC 115 Distinct Subsequences): count how many
subsequences of `s` equal `t`. One cursor per string.

```js
const helper = (i, j, memo = new Map()) => {
    if (j === t.length) return 1;            // matched all of t → one way
    if (i === s.length) return 0;            // ran out of s → no way

    const key = `${i},${j}`;
    if (memo.has(key)) return memo.get(key);

    let ans;
    if (s[i] === t[j]) {
        ans = helper(i + 1, j + 1, memo)     // use this char to match
            + helper(i + 1, j, memo);        // or save it for later
    } else {
        ans = helper(i + 1, j, memo);        // no choice, skip in s
    }

    memo.set(key, ans);
    return ans;
};
```

Two things that are easy to get wrong and both matter:

- The branches are **summed**, not maxed. Counting problems add;
  optimization problems take an extremum. Same tree, different combine.
- The base cases are **asymmetric**. `j === t.length` returns `1` and
  must be checked **first** — if both strings are exhausted at once,
  that's still a successful match. Swap the order and you return 0.

### 2. Carrying the previous choice — `(prevIdx, currIdx)`

`lengthoflongestincreasingsubseq.js` (LC 300): whether you may take
`nums[j]` depends on what you took *last*, so the last-taken index has
to be in the state.

```js
const dfs = (i, j, memo = new Map()) => {   // i = last taken, j = considering
    if (j === nums.length) return 0;

    const key = `${i},${j}`;
    if (memo.has(key)) return memo.get(key);

    let take = 0;
    if (nums[i] < nums[j]) take = 1 + dfs(j, j + 1, memo);   // j becomes the new prev
    const skip = dfs(i, j + 1, memo);

    const ans = Math.max(take, skip);
    memo.set(key, ans);
    return ans;
};
```

The tell for this shape: **the validity of a choice depends on an
earlier choice, not just on the index.** Whenever you catch yourself
wanting to write "the previous element I picked", that goes in the
state. (Note this makes the state 2D and thus O(n²); the classic
`dp[i] = 1 + max(dp[j] for j < i)` formulation is 1D — see
[`../../dp/PATTERN.md`](../../dp/PATTERN.md).)

### 3. A remaining budget — `(index, remaining)`

`paritition-equal-sum.js` (LC 416): 0/1 knapsack. The state is where you
are plus how much of the target is left.

```js
const total = nums.reduce((a, b) => a + b, 0);
if (total % 2 !== 0) return false;           // odd total can never split
const target = total / 2;

const dfs = (index, remaining, memo = new Map()) => {
    if (remaining === 0) return true;        // check success BEFORE bounds
    if (index >= nums.length || remaining < 0) return false;

    const key = `${index}-${remaining}`;
    if (memo.has(key)) return memo.get(key);

    const answer = dfs(index + 1, remaining - nums[index], memo)   // take
                || dfs(index + 1, remaining, memo);                // skip

    memo.set(key, answer);
    return answer;
};

return dfs(0, target);
```

Two habits worth keeping: the **parity precheck** (`total % 2`) kills
half the inputs in O(n) before any recursion, and `||` short-circuits so
a successful "take" branch never explores "skip".

### 4. A running total — `(index, total)`

`targetsum.js` (LC 494): assign `+` or `-` to every element. There is no
"skip" — both branches always fire — and the state carries a **running
sum** rather than a decrementing budget.

```js
const backtrack = (index, total, memo = new Map()) => {
    if (index === nums.length) return total === target ? 1 : 0;

    const key = `${index}-${total}`;
    if (memo.has(key)) return memo.get(key);

    const ways = backtrack(index + 1, total + nums[index], memo)
               + backtrack(index + 1, total - nums[index], memo);

    memo.set(key, ways);
    return ways;
};

return backtrack(0, 0);
```

Running total vs. decrementing budget is a genuine choice: the budget
form lets you prune early (`remaining < 0` ⇒ dead), the running-total
form can't (later elements might bring you back). Prefer the budget form
when all values are positive.

## Composite memo keys

Once the state has two parts you need a composite key. `Map` compares
object keys by identity, so build a string:

```js
const key = `${i},${j}`;        // or `${index}-${remaining}`
```

Keep the separator — `${1}${23}` and `${12}${3}` collide without one.
For dense integer states, nested arrays
(`Array.from({length: n}, () => new Array(m).fill(-1))`) are faster than
string keys, at the cost of readability.

## Complexity

**O(distinct states × work per state)** time, and space proportional to
the memo plus O(depth) stack.

| Problem | States | Time |
|---|---|---|
| LC 198 House Robber | `n` | **O(n)** |
| LC 115 Distinct Subsequences | `n × m` | **O(n · m)** |
| LC 300 LIS (this formulation) | `n × n` | **O(n²)** |
| LC 416 Partition Equal Subset | `n × target` | **O(n · sum)** — pseudo-polynomial |
| LC 494 Target Sum | `n × (2·sum + 1)` | **O(n · sum)** |

"Pseudo-polynomial" matters: LC 416 and LC 494 are only fast because the
sums are bounded (`nums[i] <= 100`, `n <= 200`). Double the value range
and the table doubles.

## Problems in this folder

- [`houserobber.js`](houserobber.js) (LC 198 House Robber) — take/skip with `skipAhead = 2`, 1D state.
- [`distinctsequence.js`](distinctsequence.js) (LC 115 Distinct Subsequences) — two cursors `(i, j)`, branches **summed**, asymmetric base cases.
- [`lengthoflongestincreasingsubseq.js`](lengthoflongestincreasingsubseq.js) (LC 300 Longest Increasing Subsequence) — state carries the **previously taken index**.
- [`paritition-equal-sum.js`](paritition-equal-sum.js) (LC 416 Partition Equal Subset Sum) — 0/1 knapsack, `(index, remaining)` budget, parity precheck.
- [`targetsum.js`](targetsum.js) (LC 494 Target Sum) — ± assignment, `(index, runningTotal)`, both branches always taken.

Note: `distinctsequence.js` currently has **no memoization**, so it is
O(2ⁿ) and will TLE on LC 115's `length <= 1000` constraint. Adding the
`${i},${j}` memo shown above is the only change it needs.
