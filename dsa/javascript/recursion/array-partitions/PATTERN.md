# Contiguous Segment Partition Pattern Notes

## When to use it

A distinct pattern that is neither plain backtracking nor subset DP:
split an array into **adjacent groups**, where each group has a size cap
and contributes a cost derived from its own elements, and you want the
best total.

Recognition cues:

- "Partition the array into **contiguous** subarrays of length **at
  most** `k`."
- Each group's contribution depends only on the group itself (its max,
  its sum, its length) — never on which groups came before.
- You're asked to maximize or minimize the **sum over groups**.

The key structural fact: because groups are contiguous and
non-overlapping, once you've decided where the first group ends, the
rest of the array is an **independent, identical subproblem**. So the
state is a single index — `where does the next group start` — no matter
how many groups you've already made.

Contrast with [`../PATTERN.md`](../PATTERN.md) (choose *which* elements
go together, state is a `used[]` set) and with
[`../../decision-tree/PATTERN.md`](../decision-tree/PATTERN.md)
(take/skip one element at a time).

## Template

The loop is over **group length**, not over elements. `maxInGroup` grows
monotonically as the group extends, so you compute it incrementally
rather than re-scanning:

```js
const helper = (start, memo = new Map()) => {
    if (start === arr.length) return 0;              // consumed everything
    if (memo.has(start)) return memo.get(start);

    let maxInGroup = 0;
    let best = -Infinity;                            // use +Infinity to minimize

    for (let len = 1; len <= k && start + len <= arr.length; len++) {
        maxInGroup = Math.max(maxInGroup, arr[start + len - 1]);  // extend
        const remaining = helper(start + len, memo);             // rest is independent

        best = Math.max(best, groupCost(maxInGroup, len) + remaining);
    }

    memo.set(start, best);
    return best;
};

return helper(0);
```

Only two things change between problems in this family:

| | `groupCost` | Combine |
|---|---|---|
| LC 1043 Partition Array for Max Sum | `maxInGroup * len` (every element becomes the max) | `Math.max` |
| Efficient Cost | `maxInGroup` (the group costs its max, once) | `Math.min` |

`start + len <= arr.length` is the bound that keeps the last group from
running off the end — get it wrong and you silently read `undefined`.

## Memoize on `start` alone

This is the part worth internalizing. It's tempting to think the state
needs "how many groups so far" or "what's in the current group", but
neither affects the future: the answer for the suffix starting at
`start` is the same regardless of how the prefix was cut. So the memo
key is one integer and there are only `n` distinct states.

`efficientcost-workday.js` currently has **no memo at all**, which makes
it O(k^n). Adding `memo` around it — exactly as above — takes it to
O(n · k) with no other change. That single-line difference between the
two files in this folder is the lesson.

## Complexity

- **Without memoization**: O(k^n) — every position branches `k` ways.
- **With memoization**: **O(n · k)** time (n states × k lengths each),
  **O(n)** space for the memo plus **O(n)** recursion depth.

Bottom-up, if you want to drop the stack: `dp[i]` = best for the suffix
at `i`, fill `i` from `n-1` down to `0` (each state depends on larger
indices), answer at `dp[0]`.

## Problems in this folder

- [`partition-sum.js`](partition-sum.js) (LC 1043 Partition Array for
  Maximum Sum) — `groupCost = maxInGroup * len`, maximize; memoized on
  `start`.
- [`efficientcost-workday.js`](efficientcost-workday.js) ("Efficient
  Cost", the min-variant of LC 1043) — `groupCost = maxInGroup`,
  minimize; **currently unmemoized**, add the memo above to make it
  O(n · k).
