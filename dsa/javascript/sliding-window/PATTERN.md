# Sliding Window Pattern Notes

## When to use it

Whenever the answer is about a **contiguous** run of an array or string
— a subarray or substring, never a subsequence — and a brute force would
re-scan overlapping ranges. The window turns O(n·k) or O(n²) into O(n)
by *updating* the window state on each slide instead of recomputing it.

Recognition cues:

- The words **subarray**, **substring**, **consecutive**, **window**, or
  a fixed **"of length k"**.
- The brute force is "for every start, for every end, evaluate".
- The evaluation is **incrementally updatable**: adding one element on
  the right and removing one on the left is cheap (a sum, a counter, a
  frequency map).

If the quantity can't be updated incrementally — you'd have to re-scan
the window each slide — a window won't help; look at
[`../prefix-sum/PATTERN.md`](../prefix-sum/PATTERN.md) or
[`../monotonic-deque/PATTERN.md`](../monotonic-deque/PATTERN.md) (which
maintains a window *max* in O(1) amortized).

## Fixed or dynamic? Read the question

This is the fork that decides everything else:

| The problem says | Shape | Read |
|---|---|---|
| "…of length `k`", "…of size `k`", a fixed window given up front | **Fixed** | [`fixed-length-window/PATTERN.md`](fixed-length-window/PATTERN.md) |
| "longest / shortest … such that P", the size is what you're solving for | **Dynamic** | [`dynamic-length-window/PATTERN.md`](dynamic-length-window/PATTERN.md) |

Fixed windows move both pointers together every step; dynamic windows
move `right` every step and let `left` catch up only when the validity
condition demands it.

## Template (fixed)

```js
// build the first window
for (let i = 0; i < k; i++) add(arr[i]);
process();

for (let r = k; r < n; r++) {
    add(arr[r]);            // element entering on the right
    remove(arr[r - k]);     // element leaving on the left
    process();
}
```

## Template (dynamic — longest valid)

```js
let left = 0, best = 0;

for (let right = 0; right < s.length; right++) {
    add(s[right]);

    while (windowInvalid()) {
        remove(s[left]);
        left++;
    }

    best = Math.max(best, right - left + 1);
}
```

## Template (dynamic — shortest valid)

**Not** the same loop with `Math.min` swapped in. The shrink condition
inverts: you shrink *while the window is valid*, recording the answer
before each shrink, because a valid window may still be shrinkable.

```js
let left = 0, best = Infinity, total = 0;

for (let right = 0; right < nums.length; right++) {
    total += nums[right];

    while (total >= target) {                    // while VALID, not while invalid
        best = Math.min(best, right - left + 1); // record BEFORE shrinking
        total -= nums[left];
        left++;
    }
}

return best === Infinity ? 0 : best;             // sentinel → "no such window"
```

`minimumsubarraysum.js` (LC 209). The `Infinity` sentinel and the
`=== Infinity ? 0` unwrap are part of the pattern — an untouched `best`
means no valid window existed, which is a different answer from `0`.

## Template (minimum window with a required multiset)

`minimumwindowsubstring.js` (LC 76) is the shortest-valid shape plus a
non-trivial validity test: the window must contain **every character of
`t`, with multiplicity**. Re-comparing two maps each slide would be
O(26) per step; instead track a single counter.

```js
const need = new Map();
for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);

let count = need.size;          // how many DISTINCT chars are still unsatisfied
let l = 0, r = 0, length = Infinity, best = "";

while (r < s.length) {
    const ch = s[r];
    if (need.has(ch)) {
        need.set(ch, need.get(ch) - 1);
        if (need.get(ch) === 0) count--;        // this char is now fully satisfied
    }
    r++;

    while (count === 0) {                        // window is valid → try to shrink
        if (r - l < length) { length = r - l; best = s.slice(l, r); }

        const left = s[l];
        if (need.has(left)) {
            need.set(left, need.get(left) + 1);
            if (need.get(left) > 0) count++;     // broke it — back to unsatisfied
        }
        l++;
    }
}
return best;
```

The two asymmetric tests are the whole trick:

- Decrement `count` only when a need hits **exactly 0**. Going negative
  means surplus copies, which don't make the window "more valid".
- Increment `count` only when a need goes back **above 0**. Removing a
  surplus copy doesn't invalidate anything.

Get either wrong and `count` drifts. This "number of distinct
requirements satisfied" counter generalizes to any multiset-containment
window.

## Template (O(1)-per-slide frequency match)

`permutationinstring.js` (LC 567). When you need "is this window an
anagram of `p`?" on every slide, comparing two 26-length arrays is O(26)
per step. Instead maintain a **`matches` counter** — how many of the 26
letters currently have equal counts — and repair it locally on each
add/remove:

```js
const need = Array(26).fill(0), have = Array(26).fill(0);
const idx = (c) => c.charCodeAt(0) - 97;

for (let i = 0; i < s1.length; i++) {   // seed the first window
    need[idx(s1[i])]++;
    have[idx(s2[i])]++;
}

let matches = 0;
for (let i = 0; i < 26; i++) if (need[i] === have[i]) matches++;

let l = 0;
for (let r = s1.length; r < s2.length; r++) {
    if (matches === 26) return true;

    let i = idx(s2[r]);                              // entering
    have[i]++;
    if (need[i] === have[i]) matches++;              // just became equal
    else if (need[i] + 1 === have[i]) matches--;     // just left equality

    i = idx(s2[l]);                                  // leaving
    have[i]--;
    if (need[i] === have[i]) matches++;
    else if (need[i] - 1 === have[i]) matches--;
    l++;
}
return matches === 26;
```

The pattern to internalize: **when a per-slide check is O(alphabet),
convert it to a counter and repair the counter with the two comparisons
"did this bucket just become equal / just stop being equal".** Note the
answer must be checked once more after the loop, for the final window.

The same trick applies to
[`fixed-length-window/findallanagrams.js`](fixed-length-window/findallanagrams.js)
(LC 438), which currently uses the O(26) full-map comparison.

## Template (small constant k — just hash the substring)

`repeateddnaseq.js` (LC 187). When `k` is a **small fixed constant**
(here 10), there's no need for an incremental window at all — slice each
`k`-substring and hash it. Two sets: one for "seen once", one for the
answer (which also dedupes triples).

```js
const seen = new Set(), result = new Set();

for (let l = 0; l + 10 <= s.length; l++) {
    const current = s.slice(l, l + 10);
    if (seen.has(current)) result.add(current);
    else seen.add(current);
}
return Array.from(result);
```

O(n·k) time and space, which is O(n) for constant `k`. The classic
follow-up is a **rolling hash** — or, since the alphabet here is 4
letters, encode each character in 2 bits and keep a 20-bit integer,
updating with `hash = ((hash << 2) | code) & 0xFFFFF` for O(1) per slide
and O(n) space.

## Template (rotations → windows by doubling the string)

`minflipsbinarystring.js` (LC 1888). The problem allows rotating the
string, which sounds like a different axis entirely. The trick:
**`s + s` contains every rotation of `s` as a length-`n` substring**, so
"try all rotations" becomes "slide a fixed-`n` window over the doubled
string".

```js
const n = s.length;
s = s + s;                                    // every rotation is now a window

let alt1 = "", alt2 = "";                     // the two ideal alternating targets
for (let i = 0; i < s.length; i++) {
    alt1 += i % 2 === 0 ? "0" : "1";
    alt2 += i % 2 === 0 ? "1" : "0";
}

let diff1 = 0, diff2 = 0, result = s.length, l = 0;

for (let r = 0; r < s.length; r++) {
    if (s[r] !== alt1[r]) diff1++;            // entering: two mismatch counters
    if (s[r] !== alt2[r]) diff2++;

    if (r - l + 1 > n) {                      // leaving: evict once oversized
        if (s[l] !== alt1[l]) diff1--;
        if (s[l] !== alt2[l]) diff2--;
        l++;
    }

    if (r - l + 1 === n) result = Math.min(result, diff1, diff2);
}
return result;
```

Three ideas stacked: **string doubling** for rotations, **precomputed
ideal targets** so "cost" is just a mismatch count, and **two counters
in one window** because the target alternation could start with either
character. Note `alt1`/`alt2` are indexed by the absolute position `r`,
not by the window offset — that's what keeps them consistent as the
window moves.

## Complexity

**O(n) time** for both shapes. The dynamic version looks quadratic
because of the inner `while`, but `left` only ever moves forward, so
across the whole run it advances at most `n` times — **amortized O(1)
per step**.

Space is **O(1)** for sum/counter windows, **O(k)** or **O(alphabet)**
for frequency-map windows, and O(n) for the hashing variants above.

Two exceptions in this folder: `repeateddnaseq.js` is O(n·k) time and
space (fine for constant `k`), and `minflipsbinarystring.js` builds two
`2n`-length strings, so O(n) space.

## Problems in this folder

Sub-patterns:

- [`fixed-length-window/PATTERN.md`](fixed-length-window/PATTERN.md) — 3 problems (LC 438, 2461, max-sum-of-size-k).
- [`dynamic-length-window/PATTERN.md`](dynamic-length-window/PATTERN.md) — 4 problems (LC 3, 209, 424, 1838).

At this level (each is a variant the two sub-templates don't cover
directly):

- [`minimumwindowsubstring.js`](minimumwindowsubstring.js) (LC 76 Minimum Window Substring) — **dynamic, shortest-valid** + the `count = need.size` satisfied-requirements counter.
- [`permutationinstring.js`](permutationinstring.js) (LC 567 Permutation in String) — **fixed** window + O(1)-per-slide `matches` counter over two 26-arrays.
- [`repeateddnaseq.js`](repeateddnaseq.js) (LC 187 Repeated DNA Sequences) — **fixed** k=10; slice-and-hash with two sets, no incremental update.
- [`minflipsbinarystring.js`](minflipsbinarystring.js) (LC 1888 Minimum Number of Flips to Make the Binary String Alternating) — **fixed** window of size `n` over `s + s`, two mismatch counters.

Related patterns worth knowing about:

- [`../monotonic-deque/PATTERN.md`](../monotonic-deque/PATTERN.md) — window **max/min**, the one aggregate a plain counter can't maintain.
- [`../prefix-sum/PATTERN.md`](../prefix-sum/PATTERN.md) — subarray sums when values can be negative, which breaks the window's monotonicity assumption.
- [`../arrays/longestconsecutiveseq.js`](../arrays/longestconsecutiveseq.js) (LC 128) — looks like a window problem, isn't; it's a hash-set streak scan.
