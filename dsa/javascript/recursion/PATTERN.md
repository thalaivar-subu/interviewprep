# Recursion Pattern Notes

Source: https://leetcode.com/discuss/post/1405817/backtracking-algorithm-problems-to-pract-lujf/

This folder is a **router**. The four subfolders are genuinely different
patterns that happen to share a recursive shape — read the one that
matches your problem:

| Subfolder | Pattern | Read when |
|---|---|---|
| [`basics/`](basics/PATTERN.md) | Linear recursion, accumulators, loop replacement | The recursion has **one branch**; you're using it instead of a loop |
| [`backtracking/`](backtracking/PATTERN.md) | Choose → explore → un-choose | You must **enumerate every valid configuration** |
| [`backtracking/array-partitions/`](backtracking/array-partitions/PATTERN.md) | Contiguous segment partition | Split an array into **adjacent groups**, cost per group |
| [`decision-tree/`](decision-tree/PATTERN.md) | Take/skip, memoized | Each element gets a **yes/no** decision, you want one optimum |
| [`functional/`](functional/PATTERN.md) | Memoized DP written recursively | Recursion **returns a value** that you cache |

## When to use it

Reach for recursion when the problem is naturally self-similar: "solve
this for `n`" reduces to "solve this for `n-1`" (or for a suffix, or for
a subtree). Three signals, in increasing order of complexity:

- **One recursive call, result flows straight back** → plain recursion
  (`basics/`). You're really writing a loop.
- **A loop of recursive calls, and you mutate shared state before/after
  each** → backtracking (`backtracking/`). The un-choose step is what
  makes it backtracking.
- **A loop of recursive calls whose *return values* you combine, and the
  same arguments recur** → memoized DP (`decision-tree/`,
  `functional/`). Nothing is undone; you cache instead.

**Naming warning:** `decision-tree/` and `functional/` are *not*
backtracking despite living under `recursion/`. Nothing is un-chosen in
either — they build an answer from return values. `functional/` is a
coding style, not an algorithm; every file in it is memoized DP. If you
want the tabulated versions of the same recurrences, see
[`../dp/PATTERN.md`](../dp/PATTERN.md).

## The three questions that decide your recursion

### 1. What is the state?

The state is exactly the set of parameters that change between calls.
If two different call paths reach the same state, they must produce the
same answer — that is what makes memoization legal. Adding a parameter
that doesn't affect the answer (like a `result` array you push into)
would break the cache, so those stay outside the memo key.

### 2. Where does the loop start — `0`, `i`, or `i + 1`?

This single choice determines what you enumerate. Memorize the table:

| Loop start | Meaning | Produces | Example |
|---|---|---|---|
| `helper(0)` | Every call may choose **any** candidate | Permutations / order matters | LC 46, LC 377 |
| `helper(i)` | May **reuse** the current element | Combinations with repetition | LC 39, LC 518 |
| `helper(i + 1)` | May **not** reuse the current element | Combinations without repetition | LC 40, LC 78 |

Read the problem statement for the tell: *"the list must not contain the
same combination twice"* ⇒ `i + 1`. *"different sequences count as
different combinations"* ⇒ `0`.

### 3. Do I collect results or return a value?

- **Collect**: push into a shared `result` array at the base case, and
  push a **copy** (`[...current]`) — the live array is about to be
  mutated by the pop.
- **Return**: each call returns a number/boolean that the parent
  combines. This is the shape that memoizes.

Same problem, both shapes: `nqueens.js` collects boards, `nqueens2.js`
returns a count.

## Template (core backtracking)

```js
const result = [];

const backtrack = (start, current) => {
    if (isComplete(start, current)) {
        result.push([...current]);   // copy — `current` gets mutated
        return;
    }

    for (let i = start; i < candidates.length; i++) {
        if (!isValid(candidates[i])) continue;   // prune early

        current.push(candidates[i]);             // choose
        backtrack(i + 1, current);               // explore (0 / i / i+1)
        current.pop();                           // un-choose
    }
};

backtrack(0, []);
return result;
```

## Template (skipping duplicates)

Needed whenever the input may contain repeated values and the output
must not contain repeated results. **Sort first** — the rule only works
on adjacent equals.

```js
nums.sort((a, b) => a - b);

// Form A — you pass a `start` index (subsets, combinations):
//   skip a duplicate that is not the first pick at this level
for (let i = start; i < nums.length; i++) {
    if (i > start && nums[i] === nums[i - 1]) continue;
    ...
}

// Form B — you loop from 0 with a used[] array (permutations):
//   skip a duplicate whose identical predecessor is not currently in use
const used = new Array(nums.length).fill(false);
for (let i = 0; i < nums.length; i++) {
    if (used[i]) continue;
    if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;

    used[i] = true;
    backtrack(...);
    used[i] = false;
}
```

`!used[i - 1]` means the earlier twin was already un-chosen on this
path, so picking this twin now would rebuild a branch we just finished.

## Complexity

Recursion cost is **(number of nodes in the recursion tree) × (work per
node)**, plus **O(depth)** call-stack space.

- Subsets: `2^n` nodes → **O(n · 2^n)** (the `n` is the array copy).
- Permutations: `n!` leaves → **O(n · n!)**.
- Combination-sum style: bounded by `O(n^(target/min))`.
- Once memoized, it collapses to **O(distinct states × work per state)**
  — that's the whole point of `decision-tree/` and `functional/`.

Pruning (`continue` on an invalid candidate) doesn't change the bound
but is usually the difference between passing and TLE.

## Problems in this folder

All problems live in subfolders; each subfolder's `PATTERN.md` has its
own index.

- [`basics/`](basics/PATTERN.md) — 3 problems (LC 1342, HackerRank Recursive Digit Sum, pattern printing)
- [`backtracking/`](backtracking/PATTERN.md) — 14 problems (LC 22, 39, 40, 46, 47, 51, 52, 78, 90, 131, 216, 377, 698)
- [`backtracking/array-partitions/`](backtracking/array-partitions/PATTERN.md) — 2 problems (LC 1043 and its min-variant)
- [`decision-tree/`](decision-tree/PATTERN.md) — 5 problems (LC 115, 198, 300, 416, 494)
- [`functional/`](functional/PATTERN.md) — 8 problems (LC 17, 72, 322, 516, 518, 583, 1143, 1155)

### Overlap with `dp/`

Several problems are solved twice, deliberately — recursively here and
tabulated in [`../dp/`](../dp/PATTERN.md). Read them as before/after
pairs:

| Problem | Recursive | Tabulated |
|---|---|---|
| LC 322 Coin Change | [`functional/coinschange.js`](functional/coinschange.js) | [`../dp/coinschange.js`](../dp/coinschange.js) |
| LC 1143 LCS | [`functional/longestcommonsubseq.js`](functional/longestcommonsubseq.js) | [`../dp/longestcommonsubseq.js`](../dp/longestcommonsubseq.js) |
| LC 516 Longest Palindromic Subseq | [`functional/longestcommonpalindrome.js`](functional/longestcommonpalindrome.js) | [`../dp/longestpalindromicsubseq.js`](../dp/longestpalindromicsubseq.js) |

Two notes on the current files: `functional/longestcommonpalindrome.js`
is misnamed (it solves LC 516 Longest Palindromic *Subsequence*, not a
"longest common palindrome"), and
`backtracking/combinationsum4.js` is a byte-identical copy of
[`../dp/combinationsum4.js`](../dp/combinationsum4.js) containing no
backtracking at all — read the DP notes for it, not these.
