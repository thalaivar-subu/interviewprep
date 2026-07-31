# Sort Pattern Notes

## When to use it

This folder is the sorting algorithms themselves (implementing a sort
from scratch), rather than problems that merely *call* `.sort()` as a
step. Good to revisit before interviews that ask you to implement a
specific algorithm or explain its trade-offs (stability, in-place vs
extra memory, average vs worst case).

## Quicksort template (in-place partitioning)

```js
function quickSort(nums, low, high) {
    if (low >= high) return;
    let start = low, end = high;
    const pivot = nums[Math.floor((start + end) / 2)];
    while (start <= end) {
        while (nums[start] < pivot) start++;
        while (nums[end] > pivot) end--;
        if (start <= end) {
            [nums[start], nums[end]] = [nums[end], nums[start]];
            start++; end--;
        }
    }
    quickSort(nums, low, end);
    quickSort(nums, start, high);
}
```

## Merge sort template (split, recurse, merge)

The other O(n log n) sort, and the one you're more likely to be asked to
write because the merge step generalizes (merge k lists, count
inversions, external sorting).

```js
const mergeSort = (nums) => {
    if (nums.length <= 1) return nums;                 // base case

    const mid = Math.floor(nums.length / 2);
    return merge(
        mergeSort(nums.slice(0, mid)),
        mergeSort(nums.slice(mid))
    );
};

const merge = (left, right) => {
    let l = 0, r = 0;
    const output = [];

    while (l < left.length && r < right.length) {
        if (left[l] < right[r]) output.push(left[l++]);
        else                    output.push(right[r++]);
    }

    return [...output, ...left.slice(l), ...right.slice(r)];   // one side has leftovers
};
```

The **leftover concatenation** is the step people forget: the `while`
stops as soon as *either* side is exhausted, so whatever remains on the
other side is already sorted and larger than everything emitted — append
it wholesale. Exactly one of the two `slice`s is non-empty.

Using `<` rather than `<=` in the comparison is what makes merge sort
**stable** (equal elements keep their original relative order) — worth
saying out loud, because it's the usual reason to pick it over
quicksort.

## Recursive quadratic sorts

`bubblesort.js` and `selectionsort.js` are written recursively, with two
counters standing in for nested loops — the same
"`(outer, inner)` parameters plus a reset branch" idea as
[`../recursion/basics/PATTERN.md`](../recursion/basics/PATTERN.md).

**Bubble sort** — `c` walks a pass swapping adjacent pairs; on reaching
`r`, restart with a shorter range:

```js
const bubbleSort = (arr, r, c) => {
    if (r === 0) return;                            // fully sorted

    if (c < r) {
        if (arr[c] > arr[c + 1]) [arr[c], arr[c + 1]] = [arr[c + 1], arr[c]];
        bubbleSort(arr, r, c + 1);                  // next pair in this pass
    } else {
        bubbleSort(arr, r - 1, 0);                  // pass done — shrink and restart
    }
};

bubbleSort(arr, arr.length - 1, 0);                 // r = LAST INDEX
```

**Selection sort** — carries a fourth parameter, the index of the
largest element seen this pass, and does one swap at the end of each
pass instead of many:

```js
const selectionSort = (arr, r, c, max) => {
    if (r === 0) return;

    if (c < r) {
        if (arr[c] > arr[max]) selectionSort(arr, r, c + 1, c);    // c is the new max
        else                   selectionSort(arr, r, c + 1, max);  // keep the old max
    } else {
        [arr[max], arr[r - 1]] = [arr[r - 1], arr[max]];           // place it at the end
        selectionSort(arr, r - 1, 0, 0);
    }
};

selectionSort(arr, arr.length, 0, 0);               // r = LENGTH
```

> **The call conventions differ and it matters.** Bubble sort is seeded
> with `arr.length - 1`, selection sort with `arr.length`. The reason:
> bubble's inner test reads `arr[c + 1]`, so `r` must stop one short of
> the end; selection's writes to `arr[r - 1]`, so `r` is a length. Copy
> the wrong seed and you either skip the last element or read past the
> end.

Both files also declare a top-level `let arr = [5,4,3,2,1]` and
`console.log` it — driver scaffolding that would collide if the two
files were ever loaded into one scope.

## Choosing one

| Need | Use |
|---|---|
| Guaranteed O(n log n), stability | **Merge sort** |
| In-place, best average constant factor | **Quicksort** |
| Nearly-sorted input, tiny n | Insertion sort (not in this folder) |
| O(1) space and you must not recurse | Heapsort — see [`../heap/PATTERN.md`](../heap/PATTERN.md) |

JS's built-in `Array.prototype.sort` is required to be stable (ES2019)
and is typically Timsort — merge sort with runs. And remember:
**`.sort()` compares as strings by default**, so numeric sorting always
needs `(a, b) => a - b`.

## Complexity

| Algorithm | Time (avg) | Time (worst) | Space | Stable |
|---|---|---|---|---|
| Bubble sort | O(n^2) | O(n^2) | O(1) iterative / O(n) if recursive | Yes |
| Selection sort | O(n^2) | O(n^2) | O(1) iterative / O(n) if recursive | No |
| Quicksort | O(n log n) | O(n^2) | O(log n) recursion (avg) | No |
| Merge sort | O(n log n) | O(n log n) | O(n) | Yes |

Quicksort's O(n²) worst case needs an adversarial pivot sequence
(already-sorted input with a first/last pivot); the mid-element pivot
used in the template above avoids the common cases.

## Problems in this folder

- [`quicksort.js`](quicksort.js) — in-place Hoare-style partition with a mid pivot, recursing on `(low, end)` and `(start, high)`.
- [`mergesort.js`](mergesort.js) — split at mid, recurse, two-pointer merge with leftover concatenation. Stable.
- [`bubblesort.js`](bubblesort.js) — **recursive** `(arr, r, c)`; seeded with `arr.length - 1`.
- [`selectionsort.js`](selectionsort.js) — **recursive** `(arr, r, c, max)`; seeded with `arr.length`, one swap per pass.

Related: [`../arrays/mergesortedarray.js`](../arrays/mergesortedarray.js)
(LC 88) is the merge step alone, done in place from the back, and
[`../linked-list/mergeksortedlist.js`](../linked-list/mergeksortedlist.js)
(LC 23) is merge sort's divide-and-conquer applied to k lists.
