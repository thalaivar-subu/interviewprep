# Dynamic-Length Window Pattern Notes

Window size grows/shrinks based on a validity condition.

```js
let left = 0;

for (let right = 0; right < s.length; right++) {
    // Add s[right]

    while (windowInvalid()) {
        // Remove s[left]
        left++;
    }

    answer = Math.max(answer, right - left + 1);
}
```
