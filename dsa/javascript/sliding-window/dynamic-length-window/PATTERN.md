# Dynamic-Length Window Pattern Notes

## When to use it

The window size is **what you're solving for**. `right` advances every
step; `left` only moves when the validity condition forces it. The
window's length at any moment is a candidate answer.

Recognition cues:

- "**longest** substring such that P", "**shortest** subarray such that
  P", "how many subarrays satisfy P".
- There is a **budget** — at most `k` replacements, at most `k`
  increments, sum at least `target`, no repeated characters.
- Crucially, P must be **monotone**: if a window is invalid, extending
  it right can't make it valid; shrinking from the left can. Without
  that, a window is the wrong tool.

If the size is handed to you, use
[`../fixed-length-window/PATTERN.md`](../fixed-length-window/PATTERN.md).

## Pick your variant first

These are three genuinely different loops. Choosing wrong is the usual
reason a dynamic-window solution is subtly off:

| Goal | Shrink while | Record the answer |
|---|---|---|
| **Longest** valid | window is **invalid** | after the shrink loop, every step |
| **Shortest** valid | window is **valid** | **inside** the shrink loop, before shrinking |
| **Count** valid | window is **invalid** | `+= right - left + 1` after the shrink loop |

The counting row is worth memorizing on its own: once the window
`[left..right]` is the largest valid one ending at `right`, then *every*
suffix of it is also valid, and there are `right - left + 1` of them.
That's how "count subarrays with at most K distinct" works — and
"exactly K" is then `atMost(K) - atMost(K - 1)`.

## Template (longest valid)

```js
let left = 0, best = 0;

for (let right = 0; right < s.length; right++) {
    add(s[right]);

    while (windowInvalid()) {          // shrink until valid again
        remove(s[left]);
        left++;
    }

    best = Math.max(best, right - left + 1);
}
return best;
```

`longestsubstringwithoutnonrepeatingcharacters.js` (LC 3) with a `Set`
as the state: invalid ⟺ the entering character is already in the set.

## Template (shortest valid)

Note what inverted: the `while` tests **valid**, and the answer is
recorded **before** each shrink, because a valid window may still have a
valid, shorter suffix.

```js
let left = 0, best = Infinity, total = 0;

for (let right = 0; right < nums.length; right++) {
    total += nums[right];

    while (total >= target) {                     // while VALID
        best = Math.min(best, right - left + 1);  // record BEFORE shrinking
        total -= nums[left];
        left++;
    }
}
return best === Infinity ? 0 : best;              // sentinel = "none found"
```

`minimumsubarraysum.js` (LC 209). The `Infinity` sentinel and the unwrap
are part of the pattern — never-assigned is a different answer from
zero-length.

> This only works because `nums[i] > 0`. With negative numbers, adding
> an element can *decrease* the sum, so validity isn't monotone in the
> window and the whole approach breaks — that's a prefix-sum problem.
> See [`../../prefix-sum/PATTERN.md`](../../prefix-sum/PATTERN.md).

## Writing the validity predicate

The loop is easy; the predicate is the problem. Two worth studying:

### "How much would it cost to fix this window?"

`longestrepeatingcharreplacement.js` (LC 424): a window is valid if you
can make it uniform with at most `k` replacements. The characters you'd
have to replace are everything that isn't the **most frequent** one:

```js
windowLength - maxFreqInWindow <= k
```

```js
let l = 0, r = 0, maxFreq = 0;
const freq = new Map();

while (r < s.length) {
    freq.set(s[r], (freq.get(s[r]) || 0) + 1);
    maxFreq = Math.max(maxFreq, freq.get(s[r]));

    if (r - l + 1 - maxFreq > k) {        // an `if`, not a `while`
        freq.set(s[l], freq.get(s[l]) - 1);
        l++;
    }
    r++;
}
return r - l;                             // the window never shrank
```

Two things about this implementation that look like bugs and aren't:

- **`maxFreq` is never decremented** when the window shrinks, so it can
  be stale (larger than the true max). That's fine: a stale `maxFreq`
  only makes the predicate *more* permissive, and the answer is
  monotone — you can never record a window longer than a genuinely valid
  one you already saw. Recomputing it correctly costs O(26) per step and
  changes nothing.
- **The shrink is an `if`, not a `while`**, so the window never
  shrinks — it slides at its high-water mark. That's why the return is
  `r - l` rather than a tracked maximum. Both formulations are correct;
  this one is shorter, the `while` + `Math.max` one is easier to
  explain out loud.

### "Sort first, then the cost is a formula"

`frequenceofmostfreq.js` (LC 1838): make `k` increments to maximize how
many elements share a value. **Sort first** — then the cheapest target
for any window is its largest (rightmost) element, and the cost to raise
everything in the window up to it is:

```js
nums[right] * windowLength - windowSum <= k
```

```js
nums.sort((a, b) => a - b);               // ← the step that makes it a window problem

let l = 0, total = 0, best = 0;
for (let r = 0; r < nums.length; r++) {
    total += nums[r];

    while (nums[r] * (r - l + 1) - total > k) {   // over budget → shrink
        total -= nums[l];
        l++;
    }

    best = Math.max(best, r - l + 1);
}
return best;
```

"Sort, then slide" is a real move and easy to miss, because sorting
destroys the original order — legal here only because the answer is a
*count*, not a position. Whenever a problem is about how many elements
can be made equal, or about grouping by closeness in value, check
whether sorting turns it into a contiguous-window question.

## Complexity

**O(n)** time. The nested `while` looks quadratic, but `left` only moves
forward and never resets, so it advances at most `n` times across the
entire run — **amortized O(1) per step**. Each element is added once and
removed at most once.

Space is **O(1)** for sum/counter state, **O(k)** or **O(alphabet)** for
frequency-map state.

Exception: `frequenceofmostfreq.js` is **O(n log n)** — the sort
dominates.

## Problems in this folder

- [`longestsubstringwithoutnonrepeatingcharacters.js`](longestsubstringwithoutnonrepeatingcharacters.js) (LC 3 Longest Substring Without Repeating Characters) — **longest**; `Set` state, invalid ⟺ duplicate entering.
- [`minimumsubarraysum.js`](minimumsubarraysum.js) (LC 209 Minimum Size Subarray Sum) — **shortest**; inverted shrink loop, `Infinity` sentinel.
- [`longestrepeatingcharreplacement.js`](longestrepeatingcharreplacement.js) (LC 424 Longest Repeating Character Replacement) — predicate `windowLength - maxFreq <= k`; non-shrinking `if` variant.
- [`frequenceofmostfreq.js`](frequenceofmostfreq.js) (LC 1838 Frequency of the Most Frequent Element) — **sort first**, then cost `nums[r] * len - sum <= k`.

Related variants at the parent level, each needing something this
template doesn't give you:
[`../minimumwindowsubstring.js`](../minimumwindowsubstring.js) (LC 76 —
shortest-valid plus a multiset-satisfied counter) and
[`../PATTERN.md`](../PATTERN.md) for the fixed-window special cases.
