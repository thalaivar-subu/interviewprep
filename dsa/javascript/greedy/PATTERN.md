# Greedy Pattern Notes

## When to use it

When making the locally-best choice at every step provably leads to a
globally optimal answer — no need to explore alternatives or backtrack.
Common tells: "minimum number of X to cover/achieve Y", or a problem
that can be reduced to sorting by one key and then scanning once. The
tricky part of greedy problems is proving the greedy choice is safe;
once that's established, the code itself is usually short.

## Template (sort + single pass)

```js
items.sort((a, b) => a.key - b.key);

let result = 0;
for (const item of items) {
    if (shouldTake(item)) {
        result += apply(item);
    }
}
return result;
```

## Template (interval-style "farthest reach")

```js
let currentEnd = 0;
let farthest = 0;
let count = 0;

for (let i = 0; i < n; i++) {
    farthest = Math.max(farthest, reach(i));
    if (i === currentEnd) {
        count++;
        currentEnd = farthest;
    }
}
```

## Complexity

Usually **O(n log n) time** (dominated by the sort), **O(1) extra
space** beyond the sort itself.

## Problems in this folder

- [`buysellstocks.js`](buysellstocks.js) (LC 121) — single-pass running-minimum scan, moved here from `two-pointers/` since it isn't a converging-pointer technique.
- [`greedyflorist.js`](greedyflorist.js) (HackerRank)
- [`handofstraights.js`](handofstraights.js) (LC 846)
- [`jumpgame.js`](jumpgame.js) (LC 55)
- [`jumpgamek.js`](jumpgamek.js) (LC 45)
- [`minimizemaxpairsum.js`](minimizemaxpairsum.js) (LC 1877)
- [`minimumnumberoftaps.js`](minimumnumberoftaps.js) (LC 1326, greedy variant — compare with the DP version in [`dp/minimumtaps.js`](../dp/minimumtaps.js))
- [`videostitching.js`](videostitching.js) (LC 1024)

Note: the interval-merging problems (`mergeintervals.js`, `insertintervals.js`,
`nonoverlappingintervals.js`) used to live here but moved out to their
own dedicated [`intervals/`](../intervals/PATTERN.md) folder, since
"intervals" is a distinct enough pattern to warrant its own home rather
than being folded into greedy.
