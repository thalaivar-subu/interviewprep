# Intervals Pattern Notes

## When to use it

Any problem that hands you a list of `[start, end]` pairs and asks you to
merge, insert, count overlaps, or remove the minimum number to make them
non-overlapping. Almost always the first move is to **sort** — by start
time for merging/inserting, by end time for the "minimum removals"
greedy variant.

## Merge / Insert template (sort by start)

```js
intervals.sort((a, b) => a[0] - b[0]);
const result = [intervals[0]];

for (let i = 1; i < intervals.length; i++) {
    const prev = result[result.length - 1];
    const cur = intervals[i];
    if (cur[0] <= prev[1]) {
        prev[1] = Math.max(prev[1], cur[1]); // overlap: extend
    } else {
        result.push(cur); // no overlap: new interval
    }
}
```

## Minimum removals template (sort by end, greedy)

```js
intervals.sort((a, b) => a[1] - b[1]);
let prevEnd = intervals[0][1];
let removals = 0;

for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    if (start < prevEnd) removals++;      // overlaps prev kept interval
    else prevEnd = end;                    // keep this one instead
}
```

### Why sort by *end* for the greedy?

Worth being able to say in one sentence, because it's the only part of
LC 435 that isn't mechanical:

> **Exchange argument:** among a set of mutually conflicting intervals,
> keeping the one that **finishes earliest** leaves the most room for
> everything after it. So any optimal solution can be rewritten to
> include the earliest-finishing interval without getting worse.

Sorting by start instead gives a plausible-looking program that fails on
`[[1,100],[2,3],[4,5]]` — it keeps the long interval and drops two.

Note this is the opposite of the interval-**covering** greedy (LC 1024,
LC 1326), which sorts by *start* and takes the farthest end. Different
question: covering wants to reach as far as possible, selection wants to
conflict as little as possible. See
[`../greedy/PATTERN.md`](../greedy/PATTERN.md).

## Watch the endpoints: `<` vs `<=`

**The two templates above deliberately disagree**, and reading them cold
you'd copy the wrong one half the time:

| Template | Test | Treats `[1,2]` and `[2,3]` as |
|---|---|---|
| Merge (LC 56) | `cur[0] <= prev[1]` | **overlapping** — merges into `[1,3]` |
| Greedy removals (LC 435) | `start < prevEnd` | **non-overlapping** — keeps both |

Neither is "right" — LC 56 says touching intervals merge, LC 435 says
`[1,2]` and `[2,3]` don't conflict. **Read the problem statement for
whether endpoints are inclusive**, then pick the comparator. Getting
this wrong produces an answer off by exactly the number of touching
pairs, which is the kind of bug that passes the sample cases.

## Insert template (three-phase sweep, input already sorted)

`insert-intervals.js` (LC 57) hands you an already-sorted list, so the
O(n log n) sort isn't needed at all. The canonical O(n) form is three
sequential phases:

```js
const result = [];
let i = 0;
const n = intervals.length;

// 1. everything that ends before the new interval starts — copy as-is
while (i < n && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);

// 2. everything that overlaps — absorb into newInterval
while (i < n && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
}
result.push(newInterval);

// 3. everything that starts after — copy as-is
while (i < n) result.push(intervals[i++]);

return result;
```

Each phase's `while` starts where the last left off, so it's a single
pass. The file in this folder instead inserts the new interval at the
right position and re-runs the whole merge — also O(n) here, but it
throws away the sortedness guarantee and doesn't generalize.

## Complexity

Dominated by the sort: **O(n log n) time**, **O(n) space** for the result
array (or O(1) extra if merging in place).

Exception: LC 57 receives sorted input, so the three-phase sweep is
**O(n)**.

## Problems in this folder

- [`merge-intervals.js`](merge-intervals.js) (LC 56 Merge Intervals) — sort by **start**, extend-or-push; `cur[0] <= prev[1]` (touching counts as overlapping). Moved here from `greedy/`.
- [`insert-intervals.js`](insert-intervals.js) (LC 57 Insert Interval) — input is pre-sorted; the three-phase sweep above is the O(n) form. Moved here from `greedy/`.
- [`non-overlapping-intervals.js`](non-overlapping-intervals.js) (LC 435 Non-overlapping Intervals) — sort by **end**, greedy `prevEnd`; `start < prevEnd` (touching does **not** count). Moved here from `greedy/`.

Related: interval **covering** (fewest intervals to span a range) is a
different greedy and lives in [`../greedy/PATTERN.md`](../greedy/PATTERN.md)
— LC 1024 and LC 1326.
