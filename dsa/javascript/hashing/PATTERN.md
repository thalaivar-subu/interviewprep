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

## Complexity

**O(n) time, O(n) space** for both templates — one pass, plus the map.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Two Sum
LC 1, Valid Anagram LC 242).

Note: [`binary-search/twosumsorted.js`](../binary-search/twosumsorted.js)
solves the sorted-array variant with two pointers instead — a different
technique for a related problem, left where it is.
