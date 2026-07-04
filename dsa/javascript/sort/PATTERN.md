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

## Complexity

| Algorithm | Time (avg) | Time (worst) | Space |
|---|---|---|---|
| Bubble sort | O(n^2) | O(n^2) | O(1) iterative / O(n) if recursive |
| Selection sort | O(n^2) | O(n^2) | O(1) iterative / O(n) if recursive |
| Quicksort | O(n log n) | O(n^2) | O(log n) recursion (avg) |
| Merge sort | O(n log n) | O(n log n) | O(n) |

## Problems in this folder

- [`bubblesort.js`](bubblesort.js)
- [`mergesort.js`](mergesort.js)
- [`quicksort.js`](quicksort.js)
- [`selectionsort.js`](selectionsort.js)
