# Arrays Pattern Notes

## When to use it

The catch-all for problems that don't need a specialized technique
(two pointers, sliding window, binary search, etc.) — just a direct scan
or in-place manipulation of the array. Common shapes: merging two sorted
arrays, shifting/rotating elements in place, or simple index bookkeeping
while iterating once or twice.

## Template (in-place overwrite with a write pointer)

```js
let write = 0;
for (let read = 0; read < nums.length; read++) {
    if (shouldKeep(nums[read])) {
        nums[write++] = nums[read];
    }
}
// nums[0..write-1] now holds the kept elements
```

## Complexity

Usually **O(n) time, O(1) space** for a single pass with in-place writes;
watch for hidden O(n log n) when a sort is involved (e.g. merging).

## Problems in this folder

- [`countnumberofteams.js`](countnumberofteams.js) (LC 1395)
- [`longestcommonprefix.js`](longestcommonprefix.js) (LC 14)
- [`longestconsecutiveseq.js`](longestconsecutiveseq.js) (LC 128) — hash-set streak counting, moved here from `sliding-window/` since it doesn't use a window at all.
- [`mergesortedarray.js`](mergesortedarray.js) (LC 88)
- [`movezeroes.js`](movezeroes.js) (LC 283)
- [`needlehaystack.js`](needlehaystack.js) (LC 28) — brute-force substring search, moved here from `two-pointers/` since it doesn't use two pointers.
- [`plusone.js`](plusone.js) (LC 66)
- [`removeduplicatessortedarray.js`](removeduplicatessortedarray.js) (LC 26)
- [`rotatearrayktimes.js`](rotatearrayktimes.js) (LC 189)
