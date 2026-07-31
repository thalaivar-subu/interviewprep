# Backtracking Pattern Notes

## When to use it

Backtracking is brute force with **undo**. Use it when the problem asks
for *all* valid configurations (or a count of them, or whether one
exists), and a partial configuration can be extended one decision at a
time.

Recognition cues:

- "Return **all** possible …" / "find **every** combination …"
- The output is a list of lists, or a count of arrangements.
- Constraints are small and exponential-looking (`n <= 8`, `n <= 16`,
  `nums.length <= 20`) — that's the setter telling you `2^n` or `n!` is
  fine.
- A greedy or DP formulation fails because you need the actual
  configurations, not just the optimum value.

The defining feature is the **un-choose** step. If you never undo
anything, you're doing memoized DP — see
[`../decision-tree/`](../decision-tree/PATTERN.md) and
[`../functional/`](../functional/PATTERN.md).

Read [`../PATTERN.md`](../PATTERN.md) first for the core template, the
`0` / `i` / `i + 1` loop-start table, and the duplicate-skipping rules.
This file covers the six shapes that the core template does **not**
produce.

## Template (constraint counters — no candidate array)

`generateparanthesis.js` (LC 22). There is no array to loop over; the
"candidates" are two fixed choices, each gated by a counter. Because the
string is rebuilt by concatenation, there is **nothing to pop** — the
undo is implicit in the immutability of strings.

```js
const result = [];

const backtrack = (current, open, close) => {
    if (current.length === 2 * n) {         // base: used all n pairs
        result.push(current);
        return;
    }

    if (open < n) {                          // can still open
        backtrack(current + "(", open + 1, close);
    }
    if (close < open) {                      // can only close what's open
        backtrack(current + ")", open, close + 1);
    }
};

backtrack("", 0, 0);
```

The generalizable idea: **when the validity rule is expressible as a
comparison between counters, branch on the counters instead of looping
over candidates.** `close < open` is the entire well-formedness proof.

## Template (2D board — one placement per row)

`nqueens.js` (LC 51). The outer recursion advances one **row** at a
time, so "no two queens share a row" is enforced for free by the
structure. The loop is over columns.

```js
const board = Array.from({ length: n }, () => Array(n).fill(false));

const backtrack = (board, row) => {
    if (row === board.length) {              // placed a queen in every row
        result.push(board.map(r => r.map(c => (c ? "Q" : ".")).join("")));
        return;
    }

    for (let col = 0; col < board.length; col++) {
        if (!isSafe(board, row, col)) continue;

        board[row][col] = true;              // choose
        backtrack(board, row + 1);           // explore the next row
        board[row][col] = false;             // un-choose
    }
};
```

Only three checks are needed, and each only looks **upward**, because
rows below the current one are still empty:

```js
const isSafe = (board, row, col) => {
    for (let i = 0; i < row; i++) {                  // column above
        if (board[i][col]) return false;
    }

    const maxLeft = Math.min(row, col);              // ↖ diagonal
    for (let i = 1; i <= maxLeft; i++) {
        if (board[row - i][col - i]) return false;
    }

    const maxRight = Math.min(row, board.length - col - 1);   // ↗ diagonal
    for (let i = 1; i <= maxRight; i++) {
        if (board[row - i][col + i]) return false;
    }

    return true;
};
```

`Math.min(row, col)` and `Math.min(row, n - col - 1)` are the diagonal
bounds — how far you can walk before falling off the top or the side.
Getting these right is most of the problem.

## Template (counting return instead of collecting)

`nqueens2.js` (LC 52) is the same search with a different payload.
Instead of pushing boards into a shared array, **each call returns a
number and the parent sums them**:

```js
const helper = (board, row) => {
    if (row === board.length) return 1;      // one complete solution

    let count = 0;
    for (let col = 0; col < board.length; col++) {
        if (!isSafe(board, row, col)) continue;

        board[row][col] = true;
        count += helper(board, row + 1);     // sum, don't push
        board[row][col] = false;
    }
    return count;
};
```

Prefer this form whenever the question asks "how many" — it avoids
building `n!` arrays you'd only count. It is also the form that
memoizes, if the state ever repeats (for N-Queens it doesn't, because
the board is part of the state).

## Template (string segmentation — choose a cut point)

`palindromepartitioning.js` (LC 131). Here the loop doesn't pick an
*element*, it picks **where to cut**. Grow the candidate substring one
character at a time inside the loop and `continue` when it fails the
predicate.

```js
const backtrack = (start, current) => {
    if (start === s.length) {                // consumed the whole string
        result.push([...current]);
        return;
    }

    let piece = "";
    for (let i = start; i < s.length; i++) {
        piece += s.charAt(i);                // extend the cut
        if (!isPalindrome(piece)) continue;  // prune

        current.push(piece);
        backtrack(i + 1, current);           // next cut starts after i
        current.pop();
    }
};
```

Any "split a string into pieces satisfying P" problem (word break
returning all sentences, IP address restoration, palindrome
partitioning) is this template with a different `P`.

## Template (k-bucket filling — `used[]` means something else)

`partitiontokequalsubsets.js` (LC 698). Read this one carefully,
because `used[]` here has the **opposite meaning** to the duplicate-skip
`used[]` in [`../PATTERN.md`](../PATTERN.md): there it marks "already
tried at this level", here it marks "already assigned to some bucket",
and it persists across bucket restarts.

```js
const total = nums.reduce((a, b) => a + b, 0);
if (total % k !== 0) return false;           // cheap impossibility check
const target = total / k;

const used = new Array(nums.length).fill(false);

const backtrack = (start, currentSum, bucketsLeft) => {
    if (bucketsLeft === 1) return true;      // last bucket must fit
    if (currentSum === target) {
        return backtrack(0, 0, bucketsLeft - 1);   // restart from 0
    }

    for (let i = start; i < nums.length; i++) {
        if (used[i]) continue;
        if (currentSum + nums[i] > target) continue;   // prune overshoot

        used[i] = true;
        if (backtrack(i + 1, currentSum + nums[i], bucketsLeft)) return true;
        used[i] = false;
    }
    return false;
};

return backtrack(0, 0, k);
```

Three things carry the weight: the `total % k` precheck, the
**`backtrack(0, 0, k - 1)` restart** (a new bucket may use any unused
element, so `start` resets while `used[]` does not), and returning
`true` as soon as one arrangement works instead of exploring the rest.

## Template (take/skip returning up the stack)

`subseq.js`. A backtracking-free way to enumerate: no shared array, no
push/pop — each call **returns** the list of results and the parent
concatenates. Two branches: consume the first character, or don't.

```js
const subseq = (processed, unProcessed) => {
    if (!unProcessed) return [processed];    // base: one complete result

    const withFirst    = subseq(processed + unProcessed.charAt(0),
                                unProcessed.substring(1));
    const withoutFirst = subseq(processed,
                                unProcessed.substring(1));

    return withFirst.concat(withoutFirst);
};
```

Cleaner to reason about (no mutation to get wrong) but allocates a lot
more. Use it when the input is a string and `n` is small; use the
push/pop template when you care about allocations.

## Complexity

Multiply the recursion-tree size by the per-node work:

| Shape | Nodes | Total |
|---|---|---|
| Subsets (LC 78, 90) | `2^n` | **O(n · 2^n)** — the `n` is the array copy |
| Permutations (LC 46, 47) | `n!` leaves | **O(n · n!)** |
| Combination sum (LC 39) | ≤ `n^(target/min)` | exponential in `target/min` |
| Generate parentheses (LC 22) | Catalan | **O(4ⁿ / √n)** |
| N-Queens (LC 51, 52) | ≤ `n!` | **O(n!)**, plus O(n) per `isSafe` |
| Palindrome partitioning (LC 131) | `2^(n-1)` cuts | **O(n · 2ⁿ)** |
| Partition to k subsets (LC 698) | — | **O(k · 2ⁿ)** |

Stack space is **O(depth)**, plus whatever the shared `current` array
holds. Pruning never improves the worst-case bound but is routinely the
difference between accepted and TLE — always `continue` on an
impossible candidate before recursing.

## Problems in this folder

Core template (see [`../PATTERN.md`](../PATTERN.md)):

- [`combinationsum.js`](combinationsum.js) (LC 39) — loop from `i`, element reusable.
- [`combinationsum2.js`](combinationsum2.js) (LC 40) — sort + `used[]` duplicate skip, loop from `i + 1`.
- [`combinationsum3.js`](combinationsum3.js) (LC 216) — loop from `i + 1`, compound base case (`remaining === 0 && length === k`).
- [`subsets.js`](subsets.js) (LC 78) — push a result at **every** node, not just leaves.
- [`subseqnum.js`](subseqnum.js) (LC 78, second take) — same algorithm as `subsets.js`.
- [`subsets2.js`](subsets2.js) (LC 90) — `i > start && nums[i] === nums[i-1]` skip (Form A).
- [`permutation.js`](permutation.js) (LC 46) — loop from `0` with a membership guard so every position may choose any unused element.
- [`permutation2.js`](permutation2.js) (LC 47) — loop from `0` with `used[]` (Form B).

Shapes covered above:

- [`generateparanthesis.js`](generateparanthesis.js) (LC 22) — constraint counters, no candidate array.
- [`nqueens.js`](nqueens.js) (LC 51) — 2D board, one placement per row, `isSafe` diagonal bounds.
- [`nqueens2.js`](nqueens2.js) (LC 52) — same search, counting return.
- [`palindromepartitioning.js`](palindromepartitioning.js) (LC 131) — string segmentation / choose-a-cut-point.
- [`partitiontokequalsubsets.js`](partitiontokequalsubsets.js) (LC 698) — k-bucket filling; `used[]` = assigned, restart at `0`.
- [`subseq.js`](subseq.js) — take/skip returning up the stack.
- [`array-partitions/`](array-partitions/PATTERN.md) — contiguous segment partitioning (2 problems).

Not actually backtracking:

- [`combinationsum4.js`](combinationsum4.js) (LC 377) — a byte-identical
  copy of [`../../dp/combinationsum4.js`](../../dp/combinationsum4.js)
  with no backtracking in it. Read
  [`../../dp/PATTERN.md`](../../dp/PATTERN.md) → *Order-matters counting*.
  Worth contrasting against `combinationsum.js`: same input, but
  sequences count as distinct, which is exactly why the loop starts at
  `0` and why it collapses to a 1D DP.

### Known rough edges in these files

- `subseq.js` also contains a `subseqIteration` helper that calls
  `subseq(i + 1, currentSubSeq)` — wrong function, swapped arguments.
  Ignore it; the template above is the working version.
- `permutation.js` contains a helper named `subseq` that actually
  generates permutations.
- `palindromepartitioning.js`'s `isPalindrome` loops while
  `l < s.length - 1` instead of `l < r`, so it compares every pair twice.
  Correct, just wasteful.
