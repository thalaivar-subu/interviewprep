# Monotonic Deque Pattern Notes

## When to use it

This is the sliding-window sibling of the [monotonic stack](../stack/PATTERN.md).
Use a **deque of indices** (not values) whenever you need the
max/min inside every window of a sliding window, and the window slides
one step at a time. A monotonic stack alone can't do this because old
elements need to be evicted once they fall outside the window on the
left — a deque lets you pop from both ends.

Keep the deque monotonically **decreasing** (front to back) to track the
window **maximum**: before pushing an index, pop all indices from the
back whose values are smaller than the incoming value — they can never
be the max again while the current element is still in the window.

## Template (sliding window maximum)

```js
function maxSlidingWindow(nums, k) {
    const deque = []; // stores indices, values decreasing front-to-back
    const result = [];

    for (let i = 0; i < nums.length; i++) {
        // evict indices that fell out of the window on the left
        if (deque.length && deque[0] <= i - k) deque.shift();

        // maintain decreasing order: drop anything smaller than nums[i]
        while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
            deque.pop();
        }

        deque.push(i);

        if (i >= k - 1) result.push(nums[deque[0]]);
    }

    return result;
}
```

For the window **minimum**, flip the comparison so the deque stays
increasing instead.

## Complexity

Each index is pushed once and popped at most once: **O(n) time**,
**O(k) space** for the deque.

## Problems in this folder

- [`sliding-window-maximum.js`](sliding-window-maximum.js) (LC 239) —
  relocated here from `sliding-window/` since it's the canonical example
  of this pattern rather than a general sliding-window problem.
