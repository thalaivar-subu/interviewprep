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

## Complexity

**O(n) time, O(1) space** for a single pass with two pointers — this is
the whole appeal versus a nested-loop brute force. `3sum.js` adds an
O(n log n) sort on top, giving O(n^2) overall (one pointer pair scan
per fixed first element).

## Problems in this folder

- [`3sum.js`](3sum.js) (LC 15) — sort + converging pointers per fixed index.

Note: `buysellstocks.js` and `needlehaystack.js` used to live here but
were moved out — neither actually uses a converging/two-speed pointer
pair. `buysellstocks.js` is a single-pass running-minimum scan (now in
[`greedy/`](../greedy/buysellstocks.js)), and `needlehaystack.js` is a
brute-force substring search (now in
[`arrays/`](../arrays/needlehaystack.js)).
