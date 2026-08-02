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

## The four questions that decide your recursion

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

### 4. How do I combine the returned values?

Once you're returning a value, three things follow *mechanically* from
one fact: **what kind of quantity you return.** Read the first word of
the problem statement and everything else is decided.

```
"list / print all"   -> COLLECT   push([...cur]) at leaf, return void, pop after call
"how many"           -> COUNT     combine +      leaf 1     dead 0         no +1 on edges
"fewest / min cost"  -> MIN       combine min    leaf 0     dead Infinity  +1 on the edge
"longest / max"      -> MAX       combine max    leaf 0     dead 0/-Inf    +k on the edge
"can you / possible" -> BOOLEAN   combine ||     leaf true  dead false     short-circuits
```

#### Why counting adds but optimizing takes an extremum

Solutions reachable through choice A and through choice B are **disjoint
sets**, so counting must **aggregate every branch**: `|A| + |B|`.
Optimizing gets to **pick** one branch and discard the rest. Same tree,
different combine — that is the entire difference.

#### Where `+1` goes: leaves vs edges

Every root→leaf path is one solution. Take `amount = 3, coins = [1,2]`:

```
  3 --1--> 2 --1--> 1 --1--> 0      path A: coins {1,1,1}
  3 --1--> 2 --2----------> 0       path B: coins {1,2}
  3 --2--> 1 --1----------> 0       path C: coins {2,1}
```

- **COUNT** asks *"how many paths?"* → mark each **leaf** `1` and add.
  Traversing an edge doesn't create a new way, so edges are worth
  nothing → **no `+1` at the call site.**
- **MIN/MAX** asks *"cheapest path?"* → mark each **edge** `+1` and
  minimize. Reaching a leaf costs nothing more → **leaf is `0`.**

Exactly inverted, which is why the base cases differ:

| | leaf value | edge value | answer is |
|---|---|---|---|
| LC 518 Coin Change II (count) | `1` | — | number of leaves |
| LC 322 Coin Change (min) | `0` | `+1` | edges on the cheapest path |

**The tell:** a `+` on the recursive call means edge-focused
(MIN/MAX); no `+` means leaf-focused (COLLECT/COUNT/BOOLEAN). That holds
for every file in this folder.

#### You don't have to memorize the base case

It is just **the honest answer to the empty problem**:

- *"How many ways to make amount 0?"* → one (take nothing) → `return 1`
- *"How many coins to make amount 0?"* → zero → `return 0`
- *"LIS of an empty suffix?"* → `0`
- *"Ways to match an empty remaining `t`?"* → one (match nothing) → `1`

The **failure** base is the **identity of the combine operator** — the
value that vanishes under it:

| Returns | Combine | Success base | Failure base |
|---|---|---|---|
| a count | `+` | `1` | `0` |
| a min | `Math.min` | `0` | `Infinity` |
| a max | `Math.max` | `0` | `0` / `-Infinity` |
| a boolean | `\|\|` | `true` | `false` |

This is why `coinschange.js`'s `-1` sentinel needs the
`if (sub !== -1)` guard while `amount + 1` doesn't: `-1` is not the
identity of `min`, so a dead branch fails to vanish — and `-1 + 1 = 0`
reads as "free", the classic bug. Both conventions work; only one needs
the guard.

#### `+=` is not a counting construct

It is one accumulator skeleton with a swappable operator:

```js
let acc = IDENTITY;
for (const choice of choices) acc = COMBINE(acc, recurse(choice));
return acc;
```

`count += x` is that skeleton when `COMBINE` is `+`;
`minCoins = Math.min(minCoins, x + 1)` is the same skeleton with `min`.
The two-branch forms (`ans = a + b`, `Math.max(take, skip)`) are the same
skeleton with the loop unrolled to two iterations. Don't file them as
different patterns.

#### Every problem in this folder, classified

| Bucket | Combine | Leaf | Dead | Files |
|---|---|---|---|---|
| COLLECT | `result.push([...cur])` | push + `return` | — | `subsets`, `subsets2`, `subseq`, `subseqnum`, `permutation`, `permutation2`, `combinationsum`, `combinationsum2`, `combinationsum3`, `generateparanthesis`, `palindromepartitioning`, `nqueens`, `numberpad` |
| COUNT | `+` | `1` | `0` | `coinschange2`, `combinationsum4`, `nqueens2`, `distinctsequence`, `targetsum`, `dicerolls` |
| MIN | `Math.min` | `0` | `Infinity` / `-1` | `coinschange`, `deleteoperations`, `minimumDistance`, `efficientcost-workday` |
| MAX | `Math.max` | `0` | — | `houserobber`, `houserobber2`, `lengthoflongestincreasingsubseq`, `longestcommonsubseq`, `longestcommonpalindrome`, `partition-sum` |
| BOOLEAN | `\|\|` | `true` | `false` | `paritition-equal-sum`, `partitiontokequalsubsets` |

Every `.js` file carries this as a one-line `// LEAF` / `// EDGE` /
`// LINEAR` tag above its declaration. `basics/` is linear recursion with
no combine step at all.

#### Two pairs that isolate the variable

- **`coinschange.js` vs `coinschange2.js`** — identical tree, identical
  loop. Only the *question* differs, and that flips `+`→`min` and
  `return 1`→`return 0`. EDGE vs LEAF.
- **`nqueens.js` vs `nqueens2.js`** — identical tree, identical pruning.
  One pushes boards, the other does `count += helper(...)`. COLLECT vs
  COUNT, both LEAF.

#### Three cases that look like exceptions but confirm the rule

- `longestcommonpalindrome.js` — a MAX problem whose base is
  `left === right → 1`, because a single char genuinely *is* a
  palindrome of length 1. And it uses `2 + dfs(...)`, not `1 +`, because
  matching both ends consumes **two** characters. Edge value = items
  consumed.
- `deleteoperations.js` — bases return `word2.length - j`, not `0`:
  "one string exhausted" honestly costs *delete all the rest*.
- `targetsum.js` — the leaf itself decides,
  `total === target ? 1 : 0`. Still a leaf value, just computed.

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
