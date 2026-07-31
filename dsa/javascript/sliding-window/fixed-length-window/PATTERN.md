# Fixed-Length Window Pattern Notes

## When to use it

The window size `k` is **given by the problem**, not solved for. Every
window is a candidate; you evaluate all `n - k + 1` of them and keep the
best (or collect the ones that qualify).

Recognition cues: "…of length `k`", "…of size `k`", "every substring of
length 10", "all subarrays with exactly `k` elements". If the size is
what you're being asked to find, you want
[`../dynamic-length-window/PATTERN.md`](../dynamic-length-window/PATTERN.md)
instead.

Both pointers move together on every step, so there is no shrink loop
and no validity-driven `while` — just add one, remove one, evaluate.

## Template

```js
// build the first window
let state = init();
for (let i = 0; i < k; i++) add(state, arr[i]);
process(state, 0);                       // window starting at index 0

for (let r = k; r < n; r++) {
    add(state, arr[r]);                  // entering on the right
    remove(state, arr[r - k]);           // leaving on the left
    process(state, r - k + 1);           // window starting at r - k + 1
}
```

`arr[r - k]` is the element falling out — off-by-one here is the most
common bug. Sanity check with `k = 1`: `r - k` should equal `r - 1`, the
element you just replaced.

The `state` is whatever you can update in O(1):

| Problem asks for | `state` | `add` / `remove` |
|---|---|---|
| Max/min sum | a running `sum` | `sum += x` / `sum -= x` |
| Average | a running `sum` | same, divide at the end |
| Contains an anagram | a frequency map or 26-array | `freq[c]++` / `freq[c]--` |
| All-distinct check | a frequency map | see the `map.size === k` invariant below |
| Max/min **element** | not maintainable this way | use [`../../monotonic-deque/PATTERN.md`](../../monotonic-deque/PATTERN.md) |

That last row is the pattern's real boundary: sums and counts are
reversible, extremes are not — removing the current max tells you
nothing about the next one.

## Template (frequency match — is this window an anagram?)

`findallanagrams.js` (LC 438). Keep a count map for the pattern and one
for the window, and compare after each slide. **The delete-on-zero
housekeeping is mandatory** — without it, exhausted characters linger as
`0` entries and `map.size` never matches:

```js
const need = new Map(), have = new Map();
for (let i = 0; i < p.length; i++) {
    need.set(p[i], (need.get(p[i]) || 0) + 1);
    have.set(s[i], (have.get(s[i]) || 0) + 1);
}

let l = 0, r = p.length;
const result = sameCounts(have, need) ? [0] : [];

while (r < s.length) {
    have.set(s[r], (have.get(s[r]) || 0) + 1);       // entering
    have.set(s[l], (have.get(s[l]) || 0) - 1);       // leaving
    if (have.get(s[l]) <= 0) have.delete(s[l]);      // ← without this, size never matches

    l++; r++;
    if (sameCounts(have, need)) result.push(l);
}
```

`sameCounts` is O(26), so this is O(26·n). For the **O(1)-per-slide**
version — maintain a `matches` counter over two 26-length arrays and
repair it with two comparisons per add/remove — see
[`../PATTERN.md`](../PATTERN.md) → *O(1)-per-slide frequency match*.
That's the version to reach for if asked to optimize.

## Invariant (all-distinct window)

`maximumsubarraysumkdup.js` (LC 2461) needs "all `k` elements in the
window are distinct". The load-bearing fact:

> With delete-on-zero housekeeping, **`map.size === k` ⟺ all `k`
> elements in the window are distinct.**

`k` elements spread across `k` distinct keys means one each. Any repeat
collapses two elements into one key and drops the size below `k`. So the
"are they distinct" test is a single integer comparison:

```js
let sum = 0;
const map = new Map();

for (let i = 0; i < k; i++) {                        // first window
    sum += arr[i];
    map.set(arr[i], (map.get(arr[i]) || 0) + 1);
}
let best = map.size === k ? sum : 0;

for (let i = k; i < arr.length; i++) {
    map.set(arr[i], (map.get(arr[i]) || 0) + 1);           // entering
    map.set(arr[i - k], map.get(arr[i - k]) - 1);          // leaving
    if (map.get(arr[i - k]) === 0) map.delete(arr[i - k]); // ← the invariant depends on this

    sum = sum - arr[i - k] + arr[i];
    if (map.size === k) best = Math.max(best, sum);
}
return best;
```

Note `best` starts at `0`, not `-Infinity` — LC 2461 returns `0` when no
window qualifies.

## Complexity

**O(n)** time — each element is added once and removed once, and every
window is evaluated in O(1) (or O(alphabet) for the map-comparison
version, which is still O(n) with a constant factor of 26).

**O(1)** space for sum windows, **O(k)** or **O(alphabet)** for
frequency-map windows.

## Problems in this folder

- [`maximumsubarraysumk.js`](maximumsubarraysumk.js) — max **sum** of a
  subarray of size `k`; running-sum state, the template verbatim.
  (Heads-up: the file's header comment is pasted from LC 560 and
  labelled "kadane's Algorithm" — neither is right. It is also **not**
  LC 643, which returns the max *average*; same window, different
  return.)
- [`findallanagrams.js`](findallanagrams.js) (LC 438 Find All Anagrams
  in a String) — frequency-map window with delete-on-zero; see
  [`../PATTERN.md`](../PATTERN.md) for the O(1)-per-slide upgrade.
  (The file's leading block comment is never closed, so it swallows the
  JSDoc below it — cosmetic, but it hides the signature.)
- [`maximumsubarraysumkdup.js`](maximumsubarraysumkdup.js) (LC 2461
  Maximum Sum of Distinct Subarrays With Length K) — running sum plus
  the `map.size === k` all-distinct invariant.

Related: [`../../monotonic-deque/PATTERN.md`](../../monotonic-deque/PATTERN.md)
(LC 239) is the fixed window whose aggregate is a **max** — the one case
this template can't handle.
