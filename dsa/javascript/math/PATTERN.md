# Math Pattern Notes

## When to use it

Problems that are really about number theory or numeric encoding rather
than a data-structure trick: prime sieves, base/radix conversions
(integer ↔ Roman numeral), digit manipulation. Usually the key insight
is a mathematical property (e.g. "a composite number always has a
factor ≤ its square root") rather than an algorithmic pattern.

## Template (Sieve of Eratosthenes — count primes below n)

```js
function countPrimes(n) {
    const isComposite = new Array(n).fill(false);
    let count = 0;
    for (let i = 2; i < n; i++) {
        if (isComposite[i]) continue;
        count++;
        for (let j = i * i; j < n; j += i) isComposite[j] = true;
    }
    return count;
}
```

## Complexity

Sieve-based problems: **O(n log log n) time, O(n) space**. Simple
greedy digit/symbol mapping problems (Roman numerals): **O(1) time**
since the symbol table is fixed-size, regardless of the input number.

## Problems in this folder

- [`countprimes.js`](countprimes.js) (LC 204)
- [`integertoroman.js`](integertoroman.js) (LC 12)
- [`romantointeger.js`](romantointeger.js) (LC 13)
