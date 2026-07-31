# Prefix Sum Pattern Notes

## When to use it

The founding identity:

> **The sum of any subarray is the difference of two prefix sums.**
> `sum(i..j) = P[j] - P[i-1]`

Which means: **any question about a subarray property becomes a question
about a *pair* of prefixes** — and pairs are what a hashmap finds in O(1).
That converts the O(n²) "for every start, for every end" scan into a
single pass.

Concretely, with `nums = [2, 3, 1, 4]`, the sum of `[3, 1]` is
`P[2] - P[0]` = `6 - 2` = `4`. ✓

Recognition cues:

- "How many **subarrays** …", "does there exist a subarray …", "the
  longest subarray with sum equal to …"
- The property is expressible as a **difference or a relation between
  two prefixes**: equal to `k`, divisible by `k`, same remainder.
- The array contains **negative numbers**, which rules out a sliding
  window (adding an element can decrease the sum, so validity isn't
  monotone in the window). If everything is positive, check
  [`../sliding-window/PATTERN.md`](../sliding-window/PATTERN.md) first —
  a window is O(1) space.

## Pick your map variant

All four templates are one pass with one map. What changes is **what you
key on** and **what you store** — get those two wrong and the code looks
right but answers a different question.

| Question | Key | Value | Seed |
|---|---|---|---|
| Count subarrays with sum `= k` | prefix sum | **count** of that prefix | `map.set(0, 1)` |
| Count subarrays with sum **divisible by** `k` | `((sum % k) + k) % k` | **count** | `map.set(0, 1)` |
| Does a subarray of length ≥ 2 exist with sum divisible by `k` | remainder | **first index** | `map.set(0, -1)` |
| Same, but on a tree path | prefix sum | count, **decremented on the way out** | `map.set(0, 1)` |

The **count vs. index** split is the one to internalize: counting
questions store counts, existence-and-length questions store the
**earliest** index (and must never overwrite it).

## Template (count — sum equals k)

```js
const map = new Map();
map.set(0, 1);                      // one empty prefix, so subarrays starting at 0 count

let prefixSum = 0, count = 0;

for (const num of nums) {
    prefixSum += num;

    if (map.has(prefixSum - k)) count += map.get(prefixSum - k);   // every earlier match

    map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
}
return count;
```

`countsubarraysumequalsk.js` (LC 560). Two things:

- **`map.set(0, 1)` is not decoration.** Without it, a subarray that
  starts at index 0 has no earlier prefix to subtract and is never
  counted.
- **Look up *before* you insert.** Otherwise a zero-valued element
  matches itself.

## Template (remainder map — divisible by k)

`countsubarraysumdivbyk.js` (LC 974). Key insight: if two prefixes leave
the **same remainder mod k**, the subarray between them is divisible by
`k` — because their difference is a multiple of `k`. So key the map on
the remainder instead of the raw sum, and count pairs:

```js
const map = new Map();
map.set(0, 1);

let prefixSum = 0, count = 0;

for (const num of nums) {
    prefixSum += num;

    const rem = ((prefixSum % k) + k) % k;      // ← normalize; see below

    if (map.has(rem)) count += map.get(rem);
    map.set(rem, (map.get(rem) || 0) + 1);
}
return count;
```

**`((x % k) + k) % k` is mandatory**, and it's the whole bug surface of
this problem. JS `%` is a *remainder*, not a modulus: `-3 % 5` is `-2`,
not `2`. So `-3` and `2` are congruent mod 5 but would land in different
buckets and never pair up. LC 974's input explicitly includes negatives.

## Template (remainder → first index — length constraints)

`continuoussubarraysum.js` (LC 523). Now the question is *existence with
a minimum length*, so you need positions, not counts:

```js
const map = new Map();
map.set(0, -1);                     // an empty prefix "ends" just before index 0

let prefixSum = 0;

for (let i = 0; i < nums.length; i++) {
    prefixSum += nums[i];
    const rem = ((prefixSum % k) + k) % k;

    if (map.has(rem)) {
        if (i - map.get(rem) >= 2) return true;     // length ≥ 2
    } else {
        map.set(rem, i);            // ← store ONLY the first occurrence
    }
}
return false;
```

Three deliberate differences from the counting template:

- **Seed is `map.set(0, -1)`**, not `(0, 1)` — you're storing an index,
  and the empty prefix sits at position `-1` so a subarray starting at 0
  has length `i - (-1)` = `i + 1`.
- **Never overwrite an existing key.** Keeping the earliest index
  maximizes `i - map.get(rem)`, which is what gives the length
  constraint its best shot. Overwriting silently breaks the problem.
- The `else` matters: insert only when absent.

## Template (prefix sum on a tree path — with backtracking)

`pathsum3.js` (LC 437). The same complement lookup, except the "array"
is the **root-to-node path**, so the map must be unwound when you leave
a node — otherwise one branch sees the other branch's prefixes:

```js
const map = new Map();
map.set(0, 1);
let count = 0;

const dfs = (node, prefixSum) => {
    if (!node) return;

    prefixSum += node.val;
    count += map.get(prefixSum - targetSum) || 0;          // same lookup as LC 560

    map.set(prefixSum, (map.get(prefixSum) || 0) + 1);     // enter: record

    dfs(node.left,  prefixSum);
    dfs(node.right, prefixSum);

    map.set(prefixSum, map.get(prefixSum) - 1);            // leave: UNDO
};

dfs(root, 0);
```

**The decrement on the way out is the whole adaptation.** Without it,
this counts paths that jump between sibling subtrees, which aren't
downward paths at all. The pattern generalizes: any array technique
becomes a tree technique by adding the undo step — the path is the
array, and DFS is the scan.

## Template (prefix/suffix products — no map at all)

`productarrayexceptself.js` (LC 238). Same *decomposition* idea (split
the answer at index `i` into "everything before" and "everything
after"), but multiplicative and with no hashmap — you can't subtract
your way out of a product when zeros are involved, and division is
banned.

Two passes into the **output array**, so no extra space:

```js
const result = new Array(nums.length).fill(1);

let prefix = 1;
for (let i = 0; i < nums.length; i++) {
    result[i] = prefix;             // product of everything strictly before i
    prefix *= nums[i];
}

let suffix = 1;
for (let i = nums.length - 1; i >= 0; i--) {
    result[i] *= suffix;            // times everything strictly after i
    suffix *= nums[i];
}
return result;
```

Assign-then-update in the forward pass, multiply-then-update in the
backward pass — in both cases the running variable must *exclude*
`nums[i]` at the moment it's used. Zeros need no special handling: the
prefix/suffix decomposition never divides.

The same forward-and-backward shape solves LC 42 (trapping rain water,
with max instead of product) and LC 135 (candy).

## Complexity

**O(n) time, O(n) space** for every hashmap variant — one pass, and the
map can hold up to `n` distinct prefixes (or up to `k` distinct
remainders, so O(min(n, k))).

`productarrayexceptself.js` is **O(n) time, O(1) extra space** (the
output array doesn't count), and `pathsum3.js` is **O(n) time, O(h)
space** for the map plus recursion.

The naive alternative is O(n²) — this whole pattern exists to remove
that inner loop.

## Problems in this folder

- [`countsubarraysumequalsk.js`](countsubarraysumequalsk.js) (LC 560 Subarray Sum Equals K) — the count template; `map.set(0, 1)` seed.
- [`countsubarraysumdivbyk.js`](countsubarraysumdivbyk.js) (LC 974 Subarray Sums Divisible by K) — **remainder map**; `((sum % k) + k) % k` normalization.
- [`continuoussubarraysum.js`](continuoussubarraysum.js) (LC 523 Continuous Subarray Sum) — remainder → **first index**, seeded `(0, -1)`, never overwritten; enforces length ≥ 2.
- [`pathsum3.js`](pathsum3.js) (LC 437 Path Sum III) — prefix sum along a **tree path**, map decremented on the way out. See also [`../binary-tree/PATTERN.md`](../binary-tree/PATTERN.md).
- [`productarrayexceptself.js`](productarrayexceptself.js) (LC 238 Product of Array Except Self) — **prefix/suffix products**, no map; O(1) extra space. (The file allocates an unused `map`.)

> **Known bug:** `countsubarraysumequalsk.js` contains a second,
> positive-numbers-only sliding-window implementation that re-declares
> `var subarraySum`, so it **shadows and replaces** the correct
> prefix-sum solution above it — and it shrinks with `sum -= nums[r]`
> where it must be `nums[l]`. `nums = [1,4,2,1], k = 3` returns `2`; the
> correct answer is `1` (only `[2,1]`). Read the first implementation.

Related: [`../sliding-window/PATTERN.md`](../sliding-window/PATTERN.md)
for the all-positive case (O(1) space), and
[`../hashing/PATTERN.md`](../hashing/PATTERN.md) for the general
complement-lookup idea these templates specialize.
