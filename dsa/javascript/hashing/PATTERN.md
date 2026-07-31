# Hashing Pattern Notes

## When to use it

The single most common interview shortcut: whenever you find yourself
needing to answer "have I seen this before?" or "what's the count/index
of this value?" in less than O(n) per lookup, reach for a `Map` or
`Set`. It trades O(n) extra space for turning an O(n) or O(n^2) nested
scan into a single O(n) pass.

Recognize it when a brute-force solution looks like a nested loop
checking pairs (`for i, for j`), or repeatedly calls `.includes()` /
`.indexOf()` inside a loop — a hashmap almost always collapses that to
one pass.

## Template (complement lookup, e.g. two-sum style)

```js
const seen = new Map(); // value -> index (or count, etc.)

for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
        return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
}
```

## Template (frequency / anagram comparison)

```js
const freq = new Map();
for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1);
for (const ch of t) {
    if (!freq.has(ch)) return false;
    freq.set(ch, freq.get(ch) - 1);
    if (freq.get(ch) === 0) freq.delete(ch);
}
return freq.size === 0;
```

## Template (grouping by a canonical key)

The third shape, and the one people miss: when you need to group items
that are "the same" under some transformation, **compute a canonical key
and bucket by it**.

```js
const groups = new Map();

for (const word of strs) {
    const key = word.split('').sort().join('');    // anagrams share a sorted key
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
}

return Array.from(groups.values());
```

LC 49 Group Anagrams. The art is picking a key that is **equal exactly
when the items should group**: sorted characters for anagrams, a
26-length count string for the same in O(L), `Math.floor(r/3)*3 +
Math.floor(c/3)` for Sudoku blocks, a normalized shape for isomorphic
strings.

## Habits that prevent the usual bugs

- **Look up before you insert.** In the complement template, inserting
  first lets an element match itself (`nums[i] + nums[i] === target`).
- **Delete on zero.** When a frequency map is used as a *set of live
  keys*, a lingering `0` entry breaks `map.size` comparisons. Both
  templates above do this; so does
  [`../sliding-window/fixed-length-window/PATTERN.md`](../sliding-window/fixed-length-window/PATTERN.md).
- **`Map` vs plain object.** `Map` preserves insertion order, allows any
  key type, has `.size`, and has no prototype keys to collide with
  (`{}["constructor"]` is not `undefined`). Prefer `Map` unless the keys
  are known-safe strings.
- **`Set` for membership, `Map` for association.** If you're setting
  values you never read, you wanted a `Set`.
- **Objects and arrays as keys compare by identity**, not contents —
  `map.set([1,2], x)` can never be looked up. Serialize to a string
  (`` `${r},${c}` ``) or encode to an integer (`r * cols + c`).

## Complexity

**O(n) time, O(n) space** for both templates — one pass, plus the map.

Grouping by a sorted key is O(n · L log L); the count-string variant is
O(n · L). All are *average*-case bounds — hashing is O(1) amortized, not
guaranteed, though that distinction only surfaces in adversarial
settings.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Two Sum
LC 1, Valid Anagram LC 242, Group Anagrams LC 49).

### Hashing problems already solved elsewhere

Three problems in other folders are pure instances of the templates
above — read them as this folder's worked examples:

- [`../arrays/longestconsecutiveseq.js`](../arrays/longestconsecutiveseq.js)
  (LC 128) — `Set` membership plus the `!set.has(num - 1)` start-of-run
  gate, which is what makes it O(n).
- [`../sliding-window/fixed-length-window/findallanagrams.js`](../sliding-window/fixed-length-window/findallanagrams.js)
  (LC 438) — the frequency/anagram template above, maintained
  incrementally across a window.
- [`../matrix/validsudoku.js`](../matrix/validsudoku.js) (LC 36) —
  `Set`-based duplicate detection, one set per row/column/block.

Also: [`../prefix-sum/PATTERN.md`](../prefix-sum/PATTERN.md) is the
complement-lookup template specialized to running sums — four variants
of "which earlier prefix pairs with this one".

Note: [`../binary-search/twosumsorted.js`](../binary-search/twosumsorted.js)
solves the sorted-array variant with two pointers instead — a different
technique for a related problem, left where it is. The trade: two
pointers is O(1) space but needs sorted input; hashing is O(n) space and
doesn't care about order.
