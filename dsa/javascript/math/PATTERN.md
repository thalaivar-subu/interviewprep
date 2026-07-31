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

Two details that carry the sieve's complexity: the inner loop starts at
**`i * i`** (anything smaller was already crossed off by a smaller
prime) and steps by `i`. Starting at `2 * i` still works but is slower.

## Template (integer → Roman)

`integertoroman.js` (LC 12). **The table is the algorithm.** Include the
six *subtractive compounds* (`CM`, `CD`, `XC`, `XL`, `IX`, `IV`)
interleaved in descending value order, and the greedy loop needs no
special cases at all:

```js
const map = {
    M: 1000, CM: 900, D: 500, CD: 400,      // ← CM and CD are the subtractive pairs
    C:  100, XC:  90, L:  50, XL:  40,
    X:   10, IX:   9, V:   5, IV:   4,
    I:    1,
};

let result = '';
for (const symbol in map) {
    const count = Math.floor(num / map[symbol]);   // how many of this symbol
    if (count !== 0) result += symbol.repeat(count);

    num %= map[symbol];                             // keep the remainder
    if (num === 0) return result;
}
return result;
```

Without the compounds you'd emit `IIII` instead of `IV`; with them, take
as many of the largest remaining value as fit, then move on — plain
greedy, and it is provably optimal because each entry is smaller than
the next one up.

> Note the file relies on **object key insertion order** for the
> descending iteration. Safe here (non-numeric string keys preserve
> insertion order in JS) but fragile as a habit — an array of
> `[value, symbol]` pairs makes the ordering explicit. The file's
> `for (key in map)` also leaks an implicit global, since `key` is
> undeclared.

## Template (Roman → integer)

`romantointeger.js` (LC 13). Reverse direction, and the subtractive
pairs become a **lookahead**: if the current symbol is worth less than
the next one, it's being subtracted — consume both.

```js
const value = new Map([["I",1],["V",5],["X",10],["L",50],["C",100],["D",500],["M",1000]]);

let result = 0;
for (let i = 0; i < s.length; i++) {
    const cur  = value.get(s[i]);
    const next = value.get(s[i + 1]);            // undefined past the end — fine

    if (next !== undefined && cur < next) {
        result += next - cur;
        i++;                                      // consumed two symbols
    } else {
        result += cur;
    }
}
```

Only seven symbols are needed here, not thirteen — the compounds fall
out of the `cur < next` test. Reading past the end gives `undefined`,
and `cur < undefined` is `false`, so the last character needs no special
case.

## Complexity

Sieve-based problems: **O(n log log n) time, O(n) space**.

Roman numeral problems: **O(1)** time and space in the strict sense —
LC 12 is capped at 3999, so the output is at most 15 characters, and LC
13's input is bounded the same way. If you prefer to state it in terms
of input size: O(len(s)) for parsing, O(number of symbols emitted) for
generating.

## Problems in this folder

- [`countprimes.js`](countprimes.js) (LC 204 Count Primes) — **Sieve of Eratosthenes**, inner loop from `i * i`.
- [`integertoroman.js`](integertoroman.js) (LC 12 Integer to Roman) — descending value table **including the six subtractive compounds**, greedy `repeat` + `%=`.
- [`romantointeger.js`](romantointeger.js) (LC 13 Roman to Integer) — **subtractive-pair lookahead**: `cur < next` ⇒ add the difference, skip two.
