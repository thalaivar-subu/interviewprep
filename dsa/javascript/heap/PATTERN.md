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

## Template (bounded size-k heap — "kth largest")

The pattern behind every "top k" question. Counter-intuitively, **you
use a MIN-heap to find the kth LARGEST**: keep exactly `k` elements, and
evict the smallest whenever the heap grows past `k`. What survives is
the top `k`, and its minimum — sitting at the root — is the kth largest.

```js
const heap = new MinHeap();

for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop();      // evict the smallest; it can't be top-k
}

return heap.peek();                        // smallest of the k largest = kth largest
```

`kthlargestelement.js` (LC 215). This is **O(n log k)**, not O(n log n) —
the heap never exceeds `k` elements, which matters when `k ≪ n` and is
the reason to prefer it over sorting.

The eviction argument: once `k` elements larger than `x` exist, `x` can
never be the kth largest, so discarding it immediately is safe.

> **Running this file locally:** it uses `MinPriorityQueue` with
> `.enqueue()` / `.dequeue()` / `.front().element`, a global that exists
> only in LeetCode's judge — it is not in Node, and `minHeap.js` in this
> folder exports nothing, so the two can't be wired together as-is.
> Treat the file as pseudocode or paste it into LeetCode.

### The other standard answer: quickselect

Interviewers often push for better than O(n log k). **Quickselect** —
quicksort's partition step, recursing into only the side containing the
target index — is **O(n) average**, O(n²) worst:

```js
// partition around a pivot, then:
//   if pivotIndex === target        → done
//   if pivotIndex  <  target        → recurse right
//   else                            → recurse left
```

Trade-offs worth stating: quickselect is O(n) average but destroys the
input order and degrades on adversarial pivots; the heap is a
predictable O(n log k) and, unlike quickselect, works on a **stream**
where you never see all of `n` at once. That last point is usually the
deciding one.

## Complexity

**O(log n) time** per insert/extract, **O(n) space** for the heap.
Building a k-sized heap for "kth largest/smallest" style problems keeps
it to **O(n log k) time, O(k) space** instead of sorting the whole
input.

| Operation | Time |
|---|---|
| `push` / `pop` | O(log n) |
| `peek` | O(1) |
| Build from an array (`heapify`) | **O(n)**, not O(n log n) |
| Top-k over a stream of n | **O(n log k)**, O(k) space |
| Heapsort | O(n log n), O(1) extra |

## Problems in this folder

- [`minHeap.js`](minHeap.js) — the min-heap data structure itself (array-backed, `heapifyUp`/`heapifyDown`). A data-structure implementation, not a problem; it self-invokes demo code and exports nothing.
- [`kthlargestelement.js`](kthlargestelement.js) (LC 215 Kth Largest Element in an Array) — **bounded size-k min-heap**; evict when `size > k`. Quickselect is the O(n)-average alternative.

Related: [`../linked-list/mergeksortedlist.js`](../linked-list/mergeksortedlist.js)
(LC 23) is the canonical heap application — a min-heap of the `k` current
heads — though that file solves it by pairwise merging instead. And
Dijkstra needs a real priority queue too, though there is no shortest-path
folder in this repo yet.
