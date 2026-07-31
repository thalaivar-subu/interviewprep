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

**Store indices, not values.** You can always recover the value with
`nums[i]`, but you can't recover the index from a value — and half these
problems want a distance (`i - prevIndex`) rather than a value.

## Template (circular array)

`nextgreater2.js` (LC 503). "Circular" means an element's next-greater
may wrap around to the front. Simulate two passes with `i % n`, and
**push only during the first pass**:

```js
const n = nums.length;
const result = new Array(n).fill(-1);
const stack = [];

for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;

    while (stack.length && nums[stack[stack.length - 1]] < nums[idx]) {
        result[stack.pop()] = nums[idx];
    }

    if (i < n) stack.push(idx);      // second pass only resolves, never enqueues
}
```

The `if (i < n)` guard is the whole trick: without it, every index gets
pushed twice and unresolved entries linger forever. With it, the second
pass exists purely to give the leftovers a chance to find a greater
element by wrapping. Still **O(n)** — `2n` iterations is a constant
factor.

## Template (boundary-marker stack)

`longestvalidparenthesis.js` (LC 32). Neither monotonic nor plain
bracket matching: the stack holds **indices as boundary markers**, and
the answer is a *distance* from the last unmatched position.

```js
const stack = [-1];              // sentinel: "the last invalid position"
let best = 0;

for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
        stack.push(i);
    } else {
        stack.pop();

        if (stack.length === 0) stack.push(i);            // this ')' is unmatched → new boundary
        else best = Math.max(best, i - stack[stack.length - 1]);
    }
}
return best;
```

Three things make it work:

- The **`-1` seed** so a valid run starting at index 0 measures as
  `i - (-1)` = the right length.
- **Pop first, ask questions after.** If the stack empties, the `)` you
  just read is unmatched, so it becomes the new boundary.
- The value at the top after popping is the **last index that can't be
  part of the current run**, so `i - top` is exactly the current valid
  length.

## Complexity

Each index is pushed once and popped at most once, so the whole pass is
**O(n) time** and **O(n) space** (worst case the stack holds every
element, e.g. a strictly increasing array).

## Problems in this folder

- [`nextGreater.js`](nextGreater.js) (LC 496 Next Greater Element I) —
  the template above, verbatim. (The file also contains a second copy of
  `dailyTemperatures`.)
- [`dailytemperatures.js`](dailytemperatures.js) (LC 739 Daily
  Temperatures) — decreasing stack; "next warmer day" is exactly "next
  greater element", tracked as a distance instead of a value.
- [`nextgreater2.js`](nextgreater2.js) (LC 503 Next Greater Element II) —
  **circular array**: iterate `[0, 2n)` with `idx = i % n`, push only
  while `i < n`.
- [`longestvalidparenthesis.js`](longestvalidparenthesis.js) (LC 32
  Longest Valid Parentheses) — **boundary-marker stack** seeded with
  `-1`; measure `i - stack.top`, re-push `i` when the stack empties.
- [`removekdigits.js`](removekdigits.js) (LC 402 Remove K Digits) —
  increasing stack: greedily pop larger digits from the top while we
  still have removals left, to leave the smallest possible number. Two
  cleanup steps are easy to forget: if `k > 0` after the scan the
  leftover is already increasing, so **pop the remaining `k` off the
  end**; and **strip leading zeros by slicing**, not via `Number()`,
  which overflows on the long test cases.
- [`validparenthesis.js`](validparenthesis.js) (LC 20 Valid
  Parentheses) — a plain stack (not monotonic), included here since it's
  the simplest "stack" warm-up.

Related: [`../monotonic-deque/PATTERN.md`](../monotonic-deque/PATTERN.md)
is the same idea with eviction from **both** ends, which is what a
sliding-window max needs; and
[`../linked-list/removeNodes.js`](../linked-list/removeNodes.js) (LC
2487) is a next-greater problem solved by reversing the list instead of
using a stack.
