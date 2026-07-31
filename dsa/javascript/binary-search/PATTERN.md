# Binary Search Pattern Notes

## When to use it

Whenever the input is sorted (or has a "monotonic" property — a
condition that's false then true, or vice versa, across the range) and
you need better than O(n). Not limited to searching an array for a
value: also works on an answer range (e.g. "find the smallest x such
that condition(x) is true" — binary search over x itself, as in
`sqrt.js`).

Recognition cues beyond "the array is sorted":

- `O(log n)` appears in the problem statement. That's a direct
  instruction.
- The answer space is a **range of integers** and `isValid(x)` is
  monotone — once true it stays true. Binary search the answer.
- The array is **rotated**, **bitonic** (up then down), or otherwise
  piecewise-monotone. You can still halve, you just need a different
  test for which half to keep.

## The invariants — know which loop you're writing

Three loop shapes appear below, and mixing them up is the usual source
of infinite loops and off-by-ones:

| Loop | Ends when | Answer | Use for |
|---|---|---|---|
| `while (start <= end)` | `start > end` (crossed) | returned inside, or `start` / `end` after | exact match, lower bound |
| `while (start < end)` | `start === end` (converged) | `start` | "find the one position where P flips" |

For `while (start <= end)`, the post-loop state is worth memorizing:

> When the loop exits, **`end` is the last index that failed the test
> and `start` is the first that passed** (they've crossed, `start === end + 1`).

That's what `sqrt.js` (LC 69) relies on — the loop never finds an exact
square, exits with `end` holding the largest value whose square is `< x`,
and returns it. It's also why the search-on-answer template returns
`start`. If you can't state which of `start`/`end` you want, you don't
yet know if your loop is right.

`mid = start + Math.floor((end - start) / 2)` rather than
`(start + end) / 2` — overflow-safe by habit, though JS numbers make it
moot here.

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

The array may not exist at all — you're searching the **answer range**.
`sqrt.js` searches `[0, x]` for the largest `mid` with `mid * mid <= x`;
"minimum capacity to ship in D days" and "minimum eating speed" are the
same shape with a heavier `isValid`.

## Template (record and keep going — duplicate boundaries)

`firstlastoccurence.js` (LC 34). With duplicates, finding *an*
occurrence isn't enough. **Don't return on equality** — record the index
and keep shrinking toward the side you want:

```js
const findBoundary = (nums, target, wantFirst) => {
    let start = 0, end = nums.length - 1, found = -1;

    while (start <= end) {
        const mid = start + Math.floor((end - start) / 2);

        if (nums[mid] < target) start = mid + 1;
        else if (nums[mid] > target) end = mid - 1;
        else {
            found = mid;                          // remember it...
            if (wantFirst) end = mid - 1;         // ...but keep looking left
            else start = mid + 1;                 // ...or right
        }
    }
    return found;
};

// LC 34: run it twice
const first = findBoundary(nums, target, true);
const last  = first === -1 ? -1 : findBoundary(nums, target, false);
```

The `found = mid` line is the entire difference from the classic
template. Same trick for "first element ≥ target", "last element ≤
target", "insertion position".

## Template (neighbour comparison — converge, no equality branch)

`peakindexmountainarray.js` (LC 852). There is no target to compare
against; the decision comes from comparing `mid` to its **neighbour**.
Use `while (start < end)` and answer with `start`:

```js
let start = 0, end = arr.length - 1;

while (start < end) {
    const mid = start + Math.floor((end - start) / 2);

    if (arr[mid] > arr[mid + 1]) end = mid;       // descending → peak is at or left of mid
    else start = mid + 1;                          // ascending → peak is right of mid
}
return start;                                      // start === end === the peak
```

Note `end = mid`, **not** `mid - 1` — `mid` might *be* the peak, so it
must stay in the range. That's exactly why the loop is `<` and not
`<=`: with `end = mid` and `start <= end`, a two-element range would
never shrink and the loop would spin forever. Also, `mid + 1` is always
in bounds here because `start < end` implies `mid < end`.

Same shape solves LC 162 (find any peak) and LC 153 (minimum of a
rotated array, comparing `nums[mid]` to `nums[end]`).

## Template (rotated array — find the pivot, then search)

`searchminrotatedsortedarray.js` (LC 33). A rotated sorted array is two
sorted runs. Find where they join, then run an ordinary binary search on
the correct one.

**Finding the pivot** (the index of the last element before the drop):

```js
const findPivotIndex = (nums) => {
    let start = 0, end = nums.length - 1;

    while (start <= end) {
        const mid = start + Math.floor((end - start) / 2);

        if (mid < end   && nums[mid] > nums[mid + 1]) return mid;       // drop on the right
        if (mid > start && nums[mid] < nums[mid - 1]) return mid - 1;   // drop on the left

        if (nums[mid] >= nums[start]) start = mid + 1;   // left half sorted → pivot is right
        else end = mid - 1;                              // right half sorted → pivot is left
    }
    return -1;                                            // not rotated at all
};
```

`nums[mid] >= nums[start]` is the load-bearing test: **in a rotated
array, at least one half is always properly sorted**, and comparing
`mid` to an endpoint tells you which. If the left half is sorted, the
discontinuity must be on the right.

Then dispatch on which run the target lives in:

```js
const pivot = findPivotIndex(nums);
if (pivot === -1) return binarySearch(nums, 0, nums.length - 1, target);
if (nums[pivot] === target) return pivot;

return target >= nums[0]
    ? binarySearch(nums, 0, pivot - 1, target)                // first (larger) run
    : binarySearch(nums, pivot + 1, nums.length - 1, target); // second (smaller) run
```

> The one-pass alternative (no separate pivot hunt) is also standard:
> each iteration, decide which half is sorted, then check whether the
> target falls inside that half's range — if yes go there, else go the
> other way. Same O(log n), fewer moving parts, harder to derive under
> pressure.

## Template (rotated array with duplicates)

`searchminrotsortduplicate.js` (LC 81). Duplicates break the "which half
is sorted" test: when `nums[start] === nums[mid] === nums[end]`, both
halves look equally plausible and there is **no way to decide** — so
shrink both ends by one and try again.

```js
if (nums[start] === nums[mid] && nums[mid] === nums[end]) {
    if (start < end && nums[start] > nums[start + 1]) return start;  // check before discarding
    start++;
    if (end > start && nums[end - 1] > nums[end]) return end - 1;
    end--;
}
else if (nums[start] < nums[mid] || (nums[start] === nums[mid] && nums[mid] > nums[end])) {
    start = mid + 1;                     // left half genuinely sorted
}
else end = mid - 1;
```

**Check whether the element you're about to discard is itself the pivot
before discarding it** — that's what the two guarded returns are for.
This is the step that makes it **O(n) worst case** (`[2,2,2,2,2,1,2]`
degrades to a linear scan), and saying so is part of the answer.

## Complexity

**O(log n) time, O(1) space** in the classic case — each iteration
halves the range.

| Variant | Time |
|---|---|
| Classic / boundary / peak / search-on-answer | **O(log n)** |
| Rotated, no duplicates | **O(log n)** (two passes) |
| Rotated **with duplicates** | O(log n) average, **O(n) worst** |
| Search on answer with a heavy `isValid` | O(log(range) × cost of `isValid`) |

Duplicates force the linear skip above because they destroy the
which-half-is-sorted test.

## Problems in this folder

- [`binarysearch.js`](binarysearch.js) (LC 704 Binary Search) — the classic template itself.
- [`sqrt.js`](sqrt.js) (LC 69 Sqrt(x)) — **search on the answer**; relies on the post-loop invariant that `end` holds the largest failing value.
- [`firstlastoccurence.js`](firstlastoccurence.js) (LC 34 Find First and Last Position) — **record-and-continue**; run twice with a direction flag.
- [`peakindexmountainarray.js`](peakindexmountainarray.js) (LC 852 Peak Index in a Mountain Array) — **neighbour comparison**, `while (start < end)`, `end = mid`, answer is `start`.
- [`searchminrotatedsortedarray.js`](searchminrotatedsortedarray.js) (LC 33 Search in Rotated Sorted Array) — **pivot finding** via `nums[mid] >= nums[start]`, then search the right run.
- [`searchminrotsortduplicate.js`](searchminrotsortduplicate.js) (LC 81 Search in Rotated Sorted Array II) — the above plus **duplicate disambiguation**; O(n) worst case.
- [`twosumsorted.js`](twosumsorted.js) (LC 167 Two Sum II) — converging two pointers, **not binary search**; grouped here as the sorted-array Two Sum variant. The technique is in [`../two-pointers/PATTERN.md`](../two-pointers/PATTERN.md).

Minor note: `validatebst.js` in [`../binary-search-tree/`](../binary-search-tree/PATTERN.md)
is the tree analogue of the same halving idea — every comparison
discards one subtree.
