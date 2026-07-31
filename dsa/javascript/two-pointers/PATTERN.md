# Two Pointers Pattern Notes

## When to use it

Whenever two indices move through the array/string — either **converging**
from both ends toward the middle (sorted-array pair-sum problems, 3Sum,
palindrome checks), or **both moving forward** at different speeds
(remove-duplicates-style in-place compaction, tracking a running
min/max as you scan once).

## Template (converging pointers on a sorted array)

```js
let left = 0;
let right = nums.length - 1;

while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
}
```

## Template (same-direction pointers, in-place compaction)

```js
let write = 0;
for (let read = 0; read < nums.length; read++) {
    if (shouldKeep(nums[read])) {
        nums[write++] = nums[read];
    }
}
```

`twosumsorted.js` (LC 167) in
[`../binary-search/`](../binary-search/PATTERN.md) is this template
verbatim. Why moving the *smaller* side is safe: if `sum < target`, then
`nums[left]` paired with anything at or below `right` is also too small,
so `left` can never be part of a solution with any remaining partner —
discarding it loses nothing. Symmetric argument for `right`.

## Template (fix one index, converge on the rest)

`3sum.js` (LC 15). Sort, fix the first element, then two-pointer the
remaining subarray for the complement. Turns O(n³) into O(n²).

```js
nums.sort((a, b) => a - b);
const result = [];

for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;     // (a) skip duplicate anchors

    let j = i + 1, k = nums.length - 1;

    while (j < k) {
        const sum = nums[i] + nums[j] + nums[k];

        if (sum === 0) {
            result.push([nums[i], nums[j], nums[k]]);

            while (j < k && nums[j] === nums[j + 1]) j++;   // (b) skip duplicate partners
            while (j < k && nums[k] === nums[k - 1]) k--;
            j++; k--;                                       // (c) then advance past the pair
        }
        else if (sum < 0) j++;
        else k--;
    }
}
```

**The three duplicate rules are the actual difficulty of this problem**
— the converging scan is the easy part, and omitting any of them
produces repeated triplets:

- **(a)** If `nums[i]` equals its predecessor, every triplet anchored
  here was already produced. `i > 0 &&` matters — without it you skip
  nothing but crash on `nums[-1]`... or rather, silently do the wrong
  thing.
- **(b)** After recording a hit, advance `j` past all copies of
  `nums[j]` and retreat `k` past all copies of `nums[k]`. Both `while`s
  need the `j < k` guard so they can't cross.
- **(c)** Then still do `j++; k--`. The `while` loops stop *on* the last
  duplicate, not past it — dropping this line makes the same triplet
  match forever.

Because the array is sorted, all duplicates are adjacent, which is what
makes these checks O(1). Sorting first isn't just for the two-pointer
scan; it's also what makes deduplication cheap. Same structure extends
to 4Sum (two fixed indices, one converging scan) and to
`kSum` in general.

## Complexity

**O(n) time, O(1) space** for a single pass with two pointers — this is
the whole appeal versus a nested-loop brute force. `3sum.js` adds an
O(n log n) sort on top, giving O(n^2) overall (one pointer pair scan
per fixed first element).

## Problems in this folder

- [`3sum.js`](3sum.js) (LC 15 3Sum) — sort + converging pointers per fixed index; three duplicate-skipping rules.

### This folder is thin

Two pointers is a top-5 interview pattern and there is one problem here.
The **same-direction compaction** template above has *no example in this
folder at all* — its natural ones live next door as
[`../arrays/movezeroes.js`](../arrays/movezeroes.js) (LC 283) and
[`../arrays/removeduplicatessortedarray.js`](../arrays/removeduplicatessortedarray.js)
(LC 26); read those. The converging template's worked example is
[`../binary-search/twosumsorted.js`](../binary-search/twosumsorted.js)
(LC 167).

Worth adding when you get to them: LC 11 Container With Most Water (the
"always move the shorter wall" exchange argument), LC 75 Sort Colors
(Dutch national flag — three pointers, one pass), LC 125 Valid
Palindrome, LC 42 Trapping Rain Water.

Note: `buysellstocks.js` and `needlehaystack.js` used to live here but
were moved out — neither actually uses a converging/two-speed pointer
pair. `buysellstocks.js` is a single-pass running-minimum scan (now in
[`greedy/`](../greedy/buysellstocks.js)), and `needlehaystack.js` is a
brute-force substring search (now in
[`arrays/`](../arrays/needlehaystack.js)).
