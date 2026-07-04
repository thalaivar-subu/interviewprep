# Sliding Window Pattern Notes

## Dynamic-length window template

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
