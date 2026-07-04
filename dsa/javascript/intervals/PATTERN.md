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

## Complexity

Dominated by the sort: **O(n log n) time**, **O(n) space** for the result
array (or O(1) extra if merging in place).

## Problems in this folder

- [`merge-intervals.js`](merge-intervals.js) (LC 56) — moved here from `greedy/`.
- [`insert-intervals.js`](insert-intervals.js) (LC 57) — moved here from `greedy/`.
- [`non-overlapping-intervals.js`](non-overlapping-intervals.js) (LC 435) — moved here from `greedy/`.
