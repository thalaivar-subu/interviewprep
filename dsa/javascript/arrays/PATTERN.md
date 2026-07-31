# Arrays Pattern Notes

## When to use it

The catch-all for problems that don't need a specialized technique
(two pointers, sliding window, binary search, etc.) — just a direct scan
or in-place manipulation of the array. Common shapes: merging two sorted
arrays, shifting/rotating elements in place, or simple index bookkeeping
while iterating once or twice.

The techniques below are individually small, but each one is the *whole*
answer to its problem. Skim the headings; they're the recognition cues.

## Template (in-place overwrite with a write pointer)

The default. One read pointer scans, one write pointer trails behind
holding the compacted result.

```js
let write = 0;
for (let read = 0; read < nums.length; read++) {
    if (shouldKeep(nums[read])) {
        nums[write++] = nums[read];
    }
}
// nums[0..write-1] now holds the kept elements
```

`movezeroes.js` (LC 283, then zero-fill the tail) and
`removeduplicatessortedarray.js` (LC 26, keep when
`nums[read] !== nums[read - 1]`).

**This works only when writing forward can't clobber something you still
need to read** — i.e. `write <= read` always. The next template is what
you do when that fails.

## Template (merge from the back)

`mergesortedarray.js` (LC 88). `nums1` has the merged result written
*into it*, so a forward merge would overwrite `nums1`'s own unread
elements. Fill **from the largest end backwards** instead — the tail is
free space, so nothing you overwrite has been read yet.

```js
let i = m - 1;              // last real element of nums1
let j = n - 1;              // last element of nums2
let k = m + n - 1;          // last slot overall

while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k] = nums1[i--];
    else                               nums1[k] = nums2[j--];
    k--;
}
```

Two details:

- The loop condition is **`j >= 0`**, not `i >= 0 && j >= 0`. Once
  `nums2` is exhausted, whatever remains in `nums1` is already in place —
  there is nothing left to do. The reverse is not true, which is why
  `i >= 0` appears only in the comparison.
- `i >= 0 &&` guards against reading `nums1[-1]` (which is `undefined`,
  and `undefined > x` is `false`, so it would *accidentally* work — but
  don't rely on that).

Generalizes: **when an in-place write would clobber unread input, look
for an end where the output is guaranteed to be free space.**

## Template (rotation by triple reversal)

`rotatearrayktimes.js` (LC 189). Rotating right by `k` in O(1) space:
reverse everything, then reverse each of the two pieces back.

```js
k = k % nums.length;                      // k can exceed n
reverse(nums, 0, nums.length - 1);        // whole array
reverse(nums, 0, k - 1);                  // first k
reverse(nums, k, nums.length - 1);        // the rest
```

`[1,2,3,4,5,6,7], k=3` → reverse all `[7,6,5,4,3,2,1]` → reverse first 3
`[5,6,7,4,3,2,1]` → reverse rest `[5,6,7,1,2,3,4]`. ✓

**Left** rotation by `d` uses the same three reversals with a different
split point — reverse all, then `[0, n-d-1]`, then `[n-d, n-1]`. (Or
just note that rotating left by `d` is rotating right by `n - d`.)

`k %= n` first, always — `k` may be larger than the array.

## Template (fix the middle, multiply the counts)

`countnumberofteams.js` (LC 1395). Counting triples `(i, j, k)` with
`i < j < k` and a monotone rating. Enumerating all triples is O(n³);
instead **fix the middle element** and count how many valid partners lie
on each side:

```js
let total = 0;

for (let j = 0; j < rating.length; j++) {
    let leftSmaller = 0, leftGreater = 0, rightSmaller = 0, rightGreater = 0;

    for (let i = 0; i < j; i++)
        rating[i] < rating[j] ? leftSmaller++ : leftGreater++;

    for (let k = j + 1; k < rating.length; k++)
        rating[k] > rating[j] ? rightGreater++ : rightSmaller++;

    total += leftSmaller * rightGreater      // increasing triple
           + leftGreater * rightSmaller;     // decreasing triple
}
```

The multiplication is the idea: any of the `leftSmaller` choices pairs
with any of the `rightGreater` choices independently, so the count is
the product, not a nested loop. **Whenever you're counting k-tuples with
an ordering constraint, try fixing the middle element** — it usually
drops one factor of `n`.

## Template (vertical scanning for a common prefix)

`longestcommonprefix.js` (LC 14). Walk **column by column** rather than
string by string, and bail at the first mismatch:

```js
let result = "";
for (let i = 0; i < strs[0].length; i++) {
    for (let j = 1; j < strs.length; j++) {
        if (strs[0][i] !== strs[j][i]) return result;   // also covers j being shorter
    }
    result += strs[0][i];
}
return result;
```

Indexing past the end of a shorter string yields `undefined`, which
never equals a character — so the short-string case needs no special
handling.

The same file has a second solution worth knowing:

> **Sort lexicographically, then compare only the first and last
> strings.** After sorting, the extremes are the two most dissimilar
> strings, so their common prefix *is* the common prefix of the whole
> set.

O(m·n log n) instead of O(m·n), but two lines and a nice thing to say
out loud.

## Template (hash-set streak, start-of-run gate)

`longestconsecutiveseq.js` (LC 128). Sorting would be O(n log n) and the
problem demands O(n).

```js
const set = new Set(nums);
let longest = 0;

for (const num of set) {
    if (set.has(num - 1)) continue;      // ← the gate: only start at a run's head

    let current = num, streak = 1;
    while (set.has(current + 1)) { current++; streak++; }

    longest = Math.max(longest, streak);
}
```

**The `!set.has(num - 1)` gate is what makes this O(n)**, and it's the
only interesting line. Without it, the run `[1..k]` gets walked from
every one of its members — O(n²). With it, each run is walked exactly
once from its smallest element, so the total inner-loop work across the
whole outer loop is bounded by `n`. Iterating over the **set**, not the
array, also dedupes for free.

This is a hashing problem more than an array problem; see
[`../hashing/PATTERN.md`](../hashing/PATTERN.md).

## Template (digit carry propagation)

`plusone.js` (LC 66). Walk from the least significant digit; stop as
soon as a digit doesn't carry.

```js
for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
        digits[i]++;
        return digits;              // no carry — done
    }
    digits[i] = 0;                  // carry into the next position
}

digits.unshift(1);                  // fell off the front: all nines
return digits;
```

The all-nines case (`[9,9,9]` → `[1,0,0,0]`) is the only edge case, and
it's the one that gets skipped in interviews. The array grows by exactly
one digit, never more.

## Complexity

Most problems here are **O(n) time, O(1) space** — a single pass with
in-place writes. But "arrays" is a catch-all, and three of these aren't:

| Problem | Time | Note |
|---|---|---|
| Write pointer, merge-back, rotate, plus-one | **O(n)** | O(1) space |
| `longestconsecutiveseq.js` | **O(n)** | O(n) space for the set |
| `longestcommonprefix.js` | O(m·n) / O(m·n log n) | the sort variant trades time for brevity |
| `needlehaystack.js` | O(m·n) | brute force; KMP would be O(m + n) |
| `countnumberofteams.js` | **O(n²)** | by design — beats the O(n³) brute force |

Watch for hidden O(n log n) whenever a sort sneaks in.

## Problems in this folder

- [`movezeroes.js`](movezeroes.js) (LC 283 Move Zeroes) — write pointer, then zero-fill the tail.
- [`removeduplicatessortedarray.js`](removeduplicatessortedarray.js) (LC 26 Remove Duplicates from Sorted Array) — write pointer with a `!==` previous test.
- [`mergesortedarray.js`](mergesortedarray.js) (LC 88 Merge Sorted Array) — **merge from the back**, three pointers.
- [`rotatearrayktimes.js`](rotatearrayktimes.js) (LC 189 Rotate Array) — **triple reversal**, `k %= n` first; also has the left-rotation variant.
- [`countnumberofteams.js`](countnumberofteams.js) (LC 1395 Count Number of Teams) — **fix the middle**, multiply left/right counts. O(n²).
- [`longestcommonprefix.js`](longestcommonprefix.js) (LC 14 Longest Common Prefix) — vertical scanning; plus the sort-and-compare-extremes trick.
- [`longestconsecutiveseq.js`](longestconsecutiveseq.js) (LC 128 Longest Consecutive Sequence) — hash-set streak with the `!set.has(num - 1)` start-of-run gate. Moved here from `sliding-window/` since it doesn't use a window at all; it's really a [`../hashing/`](../hashing/PATTERN.md) problem.
- [`plusone.js`](plusone.js) (LC 66 Plus One) — carry propagation from the last digit, `unshift(1)` on all nines.
- [`needlehaystack.js`](needlehaystack.js) (LC 28 Find the Index of the First Occurrence) — brute-force substring search, moved here from `two-pointers/` since it doesn't use two pointers.

Note: the write-pointer template is duplicated in
[`../two-pointers/PATTERN.md`](../two-pointers/PATTERN.md) as its
"same-direction pointers" template — that folder has no local example,
so `movezeroes.js` and `removeduplicatessortedarray.js` double as its
worked examples.
