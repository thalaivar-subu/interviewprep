# Fixed-Length Window Pattern Notes

Window size is fixed at `k`; slide it one element at a time.

```js
// Build first window

for (...) {
    // add first k elements
}

processWindow();

while (right < n) {
    // Add new element
    add(s[right]);

    // Remove old element
    remove(s[left]);

    left++;
    right++;

    processWindow();
}
```

## Problems in this folder

- [`findallanagrams.js`](findallanagrams.js) (LC 438)
- [`maximumsubarraysumk.js`](maximumsubarraysumk.js) (LC 643)
- [`maximumsubarraysumkdup.js`](maximumsubarraysumkdup.js) — same pattern
  with a distinct-elements constraint (tracked via a frequency map),
  moved here from a loose top-level file to sit with its sibling.
