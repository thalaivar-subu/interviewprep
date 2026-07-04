# Binary Search Pattern Notes

## When to use it

Whenever the input is sorted (or has a "monotonic" property — a
condition that's false then true, or vice versa, across the range) and
you need better than O(n). Not limited to searching an array for a
value: also works on an answer range (e.g. "find the smallest x such
that condition(x) is true" — binary search over x itself, as in
`sqrt.js`).

## Template (classic search)

```js
let start = 0;
let end = nums.length - 1;

while (start <= end) {
    const mid = start + Math.floor((end - start) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) start = mid + 1;
    else end = mid - 1;
}
return -1;
```

## Template (search on answer / condition-based)

```js
let start = lo, end = hi;
while (start <= end) {
    const mid = start + Math.floor((end - start) / 2);
    if (isValid(mid)) end = mid - 1;   // try to find a smaller valid answer
    else start = mid + 1;
}
return start; // first value where isValid is true
```

## Complexity

**O(log n) time, O(1) space** in the classic case. Rotated-array
variants with duplicates can degrade to O(n) worst case since duplicates
force a linear skip to disambiguate which half is sorted.

## Problems in this folder

- [`binarysearch.js`](binarysearch.js) (LC 704) — the template itself.
- [`firstlastoccurence.js`](firstlastoccurence.js) (LC 34)
- [`peakindexmountainarray.js`](peakindexmountainarray.js) (LC 852)
- [`searchminrotatedsortedarray.js`](searchminrotatedsortedarray.js) (LC 33)
- [`searchminrotsortduplicate.js`](searchminrotsortduplicate.js) (LC 81)
- [`sqrt.js`](sqrt.js) (LC 69) — search on the answer.
- [`twosumsorted.js`](twosumsorted.js) (LC 167) — two-pointer, not binary
  search, but grouped here since it's the sorted-array Two Sum variant.
