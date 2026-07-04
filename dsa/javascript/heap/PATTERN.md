# Heap Pattern Notes

## When to use it

Whenever you repeatedly need the current min or max out of a changing
collection — "kth largest element", "top k frequent", merging k sorted
lists, running median. A sorted array gives O(log n) lookup but O(n)
insert; a heap gives O(log n) for both insert and extract-min/max, which
is the trade-off that makes it the right structure here.

## Structure (min-heap, array-backed)

```js
// parent of i:      Math.floor((i - 1) / 2)
// left child of i:   2*i + 1
// right child of i:  2*i + 2

function heapifyUp(heap, index) {
    while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (heap[parent] <= heap[index]) break;
        [heap[parent], heap[index]] = [heap[index], heap[parent]];
        index = parent;
    }
}

function heapifyDown(heap, index) {
    const n = heap.length;
    while (2 * index + 1 < n) {
        let smallest = index;
        const left = 2 * index + 1, right = 2 * index + 2;
        if (left < n && heap[left] < heap[smallest]) smallest = left;
        if (right < n && heap[right] < heap[smallest]) smallest = right;
        if (smallest === index) break;
        [heap[smallest], heap[index]] = [heap[index], heap[smallest]];
        index = smallest;
    }
}
```

For a **max-heap** (needed for "kth largest"), either flip every
comparison above or push negated values into a min-heap.

## Complexity

**O(log n) time** per insert/extract, **O(n) space** for the heap.
Building a k-sized heap for "kth largest/smallest" style problems keeps
it to **O(n log k) time, O(k) space** instead of sorting the whole
input.

## Problems in this folder

- [`minHeap.js`](minHeap.js) — the min-heap data structure itself.
- [`kthlargestelement.js`](kthlargestelement.js) (LC 215)
