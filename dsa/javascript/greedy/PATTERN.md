# Greedy Pattern Notes

## When to use it

When making the locally-best choice at every step provably leads to a
globally optimal answer — no need to explore alternatives or backtrack.
Common tells: "minimum number of X to cover/achieve Y", or a problem
that can be reduced to sorting by one key and then scanning once. The
tricky part of greedy problems is proving the greedy choice is safe;
once that's established, the code itself is usually short.

The reliable proof technique is the **exchange argument**: assume an
optimal solution that *disagrees* with your greedy choice, then show you
can swap in the greedy choice without making the solution worse.
Therefore some optimal solution agrees with greedy, and by induction
greedy is optimal. Every template below carries its exchange argument —
they're one sentence each, and stating one out loud is usually what an
interviewer is actually listening for.

If you can't construct the exchange argument, that's evidence the
problem isn't greedy. Reach for [`../dp/PATTERN.md`](../dp/PATTERN.md)
instead — LC 1326 in this folder is solvable both ways, which makes it a
good calibration exercise.

## Template (running best-so-far, single pass)

The simplest greedy: no sort, one scan, keep the best thing seen so far
and compare the current element against it.

```js
let best = 0, bestSoFar = arr[0];

for (let i = 1; i < arr.length; i++) {
    best = Math.max(best, arr[i] - bestSoFar);   // use the best seen so far
    bestSoFar = Math.min(bestSoFar, arr[i]);     // then update it
}
return best;
```

`buysellstocks.js` (LC 121): `bestSoFar` is the cheapest price seen, and
selling today at that buy price is the best you can do *today*. The file
writes it as an `l`/`r` pair that resets `l = r` on a new low, which is
the same algorithm.

> **Exchange argument:** for a fixed sell day, no buy day cheaper than
> the running minimum exists — so pairing each sell day with the running
> minimum can only improve any solution.

Compare with [`../dp/buysellstockktimes.js`](../dp/buysellstockktimes.js)
(LC 188): once transactions are limited to `k`, greedy stops working and
you need the state machine.

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

The sort key **is** the algorithm. Sorting by the wrong key gives a
plausible-looking program that is silently wrong on some inputs, so
justify the key before writing the loop.

## Template (position-derived multiplier — sort descending)

`greedyflorist.js` (HackerRank Greedy Florist). `k` people buy `n`
flowers; each flower costs `(previously bought by that person + 1) ×
price`. Sort **descending** and hand out flowers in order — then the
i-th most expensive flower is bought at multiplier `floor(i / k) + 1`:

```js
c.sort((a, b) => b - a);                    // DESCENDING

let total = 0;
for (let i = 0; i < c.length; i++) {
    total += (Math.floor(i / k) + 1) * c[i];
}
return total;
```

Because purchases round-robin across `k` people, positions `0..k-1` all
get multiplier 1, `k..2k-1` get 2, and so on — no need to track who buys
what.

> **Exchange argument (rearrangement inequality):** if a cheaper flower
> ever carried a *smaller* multiplier than a more expensive one,
> swapping the two strictly lowers the total. So in any optimum the
> costs are paired with multipliers in opposite order — expensive with
> cheap.

This "pair the largest with the smallest" shape recurs; recognize it
whenever the cost is a **product** of a value you choose and a weight
determined by position.

## Template (sort + converging two pointers)

`minimizemaxpairsum.js` (LC 1877). Pair up `n` elements to minimize the
largest pair sum. Sort, then pair the **two ends** inward:

```js
nums.sort((a, b) => a - b);

let l = 0, r = nums.length - 1, best = 0;
while (l < r) {
    best = Math.max(best, nums[l] + nums[r]);
    l++; r--;
}
return best;
```

> **Exchange argument:** suppose the largest element `M` is paired with
> anything other than the smallest element `m`. Then `m` is paired with
> some `x`, and the two pairs are `(M, y)` and `(m, x)`. Swapping to
> `(M, m)` and `(x, y)` leaves both new sums ≤ `max(M + y, m + x)` —
> never worse. Repeat inward.

Note the pointers converge **after** a sort — that's the tell separating
this from the [`../two-pointers/`](../two-pointers/PATTERN.md) family,
where the input arrives sorted.

## Template (counting-map greedy — anchor at the smallest)

`handofstraights.js` (LC 846 / LC 1296). Group all cards into runs of
`groupSize` consecutive values. The greedy: **the smallest remaining
card must start a group**, because nothing smaller exists to precede it.

```js
if (hand.length % groupSize !== 0) return false;   // cheap impossibility check

hand.sort((a, b) => a - b);
const count = new Map();
for (const card of hand) count.set(card, (count.get(card) || 0) + 1);

for (const card of hand) {                    // ascending, so this is the smallest left
    if (!count.has(card)) continue;           // already consumed

    for (let j = card; j < card + groupSize; j++) {
        if (!count.has(j)) return false;      // run is broken → impossible
        count.set(j, count.get(j) - 1);
        if (count.get(j) === 0) count.delete(j);   // delete-on-zero, so `has` means "available"
    }
}
return true;
```

> **Exchange argument:** the smallest remaining card `c` must be in
> *some* group, and every group containing `c` has it as the minimum
> (nothing smaller is left). So the group `c..c+size-1` is forced —
> there is no alternative to exchange against.

Two mechanics that carry the weight: the **`n % groupSize` precheck**,
and **delete-on-zero** so `map.has(j)` is a valid availability test. The
file also has a simpler no-duplicates version that just walks the sorted
array in strides of `groupSize`.

## Template (index-based farthest reach)

```js
let currentEnd = 0;
let farthest = 0;
let count = 0;

for (let i = 0; i < n; i++) {
    farthest = Math.max(farthest, reach(i));

    if (i === farthest) return -1;      // stalled — unreachable (omit if guaranteed reachable)
    if (i === currentEnd) {             // must commit to a jump here
        count++;
        currentEnd = farthest;
    }
}
return count;
```

`jumpgamek.js` (LC 45, minimum jumps) and `jumpgame.js` (LC 55, the
boolean variant — `if (i > reachable) return false`).

> **Exchange argument:** among all positions reachable in `j` jumps, the
> one reaching farthest dominates every other — anything a shorter reach
> can get to, the farthest reach can also get to. So taking it never
> costs an extra jump.

The `i === currentEnd` test is "I've exhausted everything the previous
jump bought me; I must spend another jump now."

## Template (interval covering)

The explicit-interval sibling of farthest-reach: cover `[0, time]` with
the fewest intervals. Sort by **start** (tie-break by longer end), then
repeatedly take the interval reaching farthest among those that start
within your current coverage:

```js
clips.sort((a, b) => a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]);

let count = 0, currentEnd = 0, farthest = 0, i = 0;

while (currentEnd < time) {
    while (i < clips.length && clips[i][0] <= currentEnd) {   // all reachable clips
        farthest = Math.max(farthest, clips[i][1]);
        i++;
    }

    if (farthest === currentEnd) return -1;   // couldn't extend → impossible
    count++;
    currentEnd = farthest;
}
return count;
```

`videostitching.js` (LC 1024). `i` never resets, so despite the nested
loops this is a single O(n) pass after the sort.

> **Exchange argument:** among intervals that start within the covered
> region, the one ending farthest covers a superset of what any other
> covers going forward. Swapping any optimal solution's choice for it
> can't increase the count.

**Sort by start** here, not by end — a common mix-up. Sort-by-end is for
*selecting non-overlapping* intervals (LC 435), a different problem; see
[`../intervals/PATTERN.md`](../intervals/PATTERN.md).

### The reduction: intervals → a per-index max-reach array

`minimumnumberoftaps.js` (LC 1326) looks like interval covering, and
this is the whole insight: **compress the intervals into a max-reach
array indexed by start position, and Jump Game II applies verbatim** —
no sort needed at all.

```js
const maxReach = new Array(n + 1).fill(0);

for (let i = 0; i <= n; i++) {
    const left  = Math.max(0, i - ranges[i]);      // clamp to the garden
    const right = Math.min(n, i + ranges[i]);
    maxReach[left] = Math.max(maxReach[left], right);   // best reach FROM this position
}

// ...now run the farthest-reach template over maxReach
```

O(n), because bucketing by start replaces the sort. Whenever intervals
have small integer coordinates, check whether this reduction applies
before reaching for a sort.

Compare [`../dp/minimumtaps.js`](../dp/minimumtaps.js), which solves the
same problem as range-relaxation DP — slower, but it needs no proof.

## Complexity

Usually **O(n log n) time** (dominated by the sort), **O(1) extra
space** beyond the sort itself.

| Template | Time | Space |
|---|---|---|
| Running best-so-far | **O(n)** | O(1) |
| Sort + single pass | O(n log n) | O(1) |
| Position multiplier | O(n log n) | O(1) |
| Sort + converging pointers | O(n log n) | O(1) |
| Counting-map | O(n log n) | O(n) |
| Farthest reach | **O(n)** | O(1) |
| Interval covering | O(n log n) | O(1) |
| Interval covering via max-reach bucketing | **O(n)** | O(n) |

## Problems in this folder

- [`buysellstocks.js`](buysellstocks.js) (LC 121 Best Time to Buy and Sell Stock) — **running minimum**, single pass. Moved here from `two-pointers/` since it isn't a converging-pointer technique.
- [`greedyflorist.js`](greedyflorist.js) (HackerRank Greedy Florist) — sort **descending**, multiplier `floor(i / k) + 1`; rearrangement inequality.
- [`handofstraights.js`](handofstraights.js) (LC 846 Hand of Straights) — **counting-map greedy** anchored at the smallest remaining card.
- [`minimizemaxpairsum.js`](minimizemaxpairsum.js) (LC 1877 Minimize Maximum Pair Sum in Array) — sort, then pair the two ends inward.
- [`jumpgame.js`](jumpgame.js) (LC 55 Jump Game) — farthest reach, boolean variant.
- [`jumpgamek.js`](jumpgamek.js) (LC 45 Jump Game II) — farthest reach, minimum-count variant.
- [`videostitching.js`](videostitching.js) (LC 1024 Video Stitching) — **interval covering**; sort by start, take the farthest end, stall ⇒ `-1`.
- [`minimumnumberoftaps.js`](minimumnumberoftaps.js) (LC 1326 Minimum Number of Taps to Open to Water a Garden) — **compress intervals into a max-reach array**, then Jump Game II. Compare the DP version at [`../dp/minimumtaps.js`](../dp/minimumtaps.js).

Note: the interval-merging problems (`mergeintervals.js`, `insertintervals.js`,
`nonoverlappingintervals.js`) used to live here but moved out to their
own dedicated [`intervals/`](../intervals/PATTERN.md) folder, since
"intervals" is a distinct enough pattern to warrant its own home rather
than being folded into greedy.
