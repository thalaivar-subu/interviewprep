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

> **`>>>` vs `>>`:** the template uses the **unsigned** right shift, and
> that is deliberate. `numof1s.js` in this folder uses `n = n >> 1` — the
> arithmetic shift, which preserves the sign bit, so a negative `n`
> fills with 1s and **the loop never terminates**. LC 191's inputs are
> non-negative so the file passes, but the template above is the version
> to copy.

## Template (clear the lowest set bit — `n & (n - 1)`)

The idiomatic one-liner for LC 191, and worth knowing on its own.
Subtracting 1 flips the lowest set bit to 0 and everything below it to
1; ANDing therefore **removes exactly one set bit**:

```js
function hammingWeight(n) {
    let count = 0;
    while (n) {
        n &= n - 1;        // clears the lowest set bit
        count++;
    }
    return count;
}
```

`n = 12` (`1100`) → `n - 1 = 1011` → `n & (n-1) = 1000`. One bit gone.

Faster than the shift loop: it runs **once per set bit** rather than 32
times. Two corollaries that come up as their own problems:

- `n & (n - 1) === 0` ⟺ `n` is a **power of two** (LC 231), since a
  power of two has exactly one set bit.
- `n & -n` isolates the lowest set bit (rather than clearing it) — the
  building block of a Fenwick tree.

## Template (XOR to find the unique element)

XOR's two defining properties — `x ^ x === 0` and `x ^ 0 === x` — mean
that XORing a whole array **cancels every value that appears twice**,
leaving the one that doesn't:

```js
function singleNumber(nums) {
    let result = 0;
    for (const num of nums) result ^= num;
    return result;
}
```

LC 136. O(n) time, **O(1) space**, no hashmap. Variants that fall out of
the same idea:

- **LC 268 Missing Number:** XOR all the indices *and* all the values;
  everything pairs off except the missing one.
- **LC 389 Find the Difference:** XOR both strings together.
- **LC 260 Single Number III** (two uniques): XOR everything to get
  `a ^ b`, isolate any set bit with `x & -x`, then partition the array on
  that bit and XOR each half separately.

The general move: **XOR is a self-cancelling accumulator**, so reach for
it whenever "everything appears an even number of times except one".

## Complexity

**O(1) time and space** — bounded by the fixed 32-bit width of a JS
integer, regardless of the numeric value.

More precisely: the shift loop is O(32) = O(1); `n & (n - 1)` is
O(popcount(n)), which is at most 32. XOR-scan problems are O(n) in the
array length but O(1) extra space.

> **JS caveat:** bitwise operators coerce to **signed 32-bit** integers,
> so they silently truncate anything above 2³¹−1. `1 << 31` is negative,
> and `2 ** 32 | 0` is `0`. Use `>>> 0` to read a result as unsigned, and
> `BigInt` if you genuinely need more than 32 bits.

## Problems in this folder

- [`numof1s.js`](numof1s.js) (LC 191 Number of 1 Bits) — shift-and-mask count; see the `n & (n - 1)` version above, and the `>>>` note.
- [`sumof2integers.js`](sumof2integers.js) (LC 371 Sum of Two Integers) — XOR is the sum without carry, `(a & b) << 1` is the carry; loop until the carry is 0.

Not yet here, though the notes above cover them: the XOR-unique family
(LC 136, 260, 268) and power-of-two checks (LC 231).
