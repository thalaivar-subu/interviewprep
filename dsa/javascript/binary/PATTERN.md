# Bit Manipulation Pattern Notes

## When to use it

Reach for bitwise operators when a problem talks about binary
representations directly (counting set bits, adding without `+`,
XOR tricks for finding a unique element) or when you need O(1)
space/time tricks that would otherwise need extra memory.

Key operators: `&` (AND, test/clear a bit), `|` (OR, set a bit),
`^` (XOR, toggle a bit / find differences), `<<` `>>` (shift),
`n & (n-1)` (clear the lowest set bit).

## Template (count set bits)

```js
function hammingWeight(n) {
    let count = 0;
    while (n) {
        count += n & 1;
        n >>>= 1;
    }
    return count;
}
```

## Template (add two integers without `+`)

```js
function getSum(a, b) {
    while (b) {
        const carry = a & b;
        a = a ^ b;
        b = carry << 1;
    }
    return a;
}
```

## Complexity

**O(1) time and space** — bounded by the fixed 32-bit width of a JS
integer, regardless of the numeric value.

## Problems in this folder

- [`numof1s.js`](numof1s.js) (LC 191, Number of 1 Bits)
- [`sumof2integers.js`](sumof2integers.js) (LC 371, Sum of Two Integers)
