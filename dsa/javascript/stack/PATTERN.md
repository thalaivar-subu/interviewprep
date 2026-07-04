# Monotonic Stack Pattern Notes

Reference: https://leetcode.com/discuss/post/2347639/a-comprehensive-guide-and-template-for-m-irii/

## When to use it

Reach for a monotonic stack whenever a problem asks for, per element, the
**next/previous greater or smaller element** in an array — or anything
that reduces to that shape (spans, temperatures until it gets warmer,
largest rectangle in a histogram, removing digits to form the smallest
number, etc.). The key signal: you need to compare each element against
some "candidate" from earlier in the array, and once a better candidate
shows up, everything worse than it becomes irrelevant.

A **monotonically increasing stack** (bottom to top) is used to find the
**next smaller** element for each item as it gets pushed (pop everything
bigger than the current element first). A **monotonically decreasing
stack** is used to find the **next greater** element (pop everything
smaller than the current element first).

## Template

```js
function nextGreater(nums) {
    const stack = []; // stores indices, kept decreasing by value
    const result = new Array(nums.length).fill(-1);

    for (let i = 0; i < nums.length; i++) {
        while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
            const prevIndex = stack.pop();
            result[prevIndex] = nums[i]; // or i - prevIndex for "distance until"
        }
        stack.push(i);
    }

    return result;
}
```

To find the **next smaller** element instead, flip the comparison so the
stack stays increasing: pop while `nums[stack.top] > nums[i]`.

## Complexity

Each index is pushed once and popped at most once, so the whole pass is
**O(n) time** and **O(n) space** (worst case the stack holds every
element, e.g. a strictly increasing array).

## Examples in this folder

- [`dailytemperatures.js`](dailytemperatures.js) (LC 739) — decreasing
  stack, "next warmer day" is exactly "next greater element", tracked as
  a distance instead of a value.
- [`nextGreater.js`](nextGreater.js) — the template above, verbatim.
- [`removekdigits.js`](removekdigits.js) (LC 402) — increasing stack:
  greedily pop larger digits from the top while we still have removals
  left, to leave the smallest possible number.
- [`validparenthesis.js`](validparenthesis.js) (LC 20) — a plain stack
  (not monotonic), included here since it's the simplest "stack" warm-up.
