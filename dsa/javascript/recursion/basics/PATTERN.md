# Recursion Basics Pattern Notes

## When to use it

The recursion here has **one recursive call per branch** and no shared
mutable state — nothing is pushed, nothing is popped. You are using
recursion as a *substitute for a loop*, because the shrink rule is
easier to express as "solve the smaller version" than as an index
update.

Recognize it when:

- A number shrinks by a rule (`/2`, `-1`, digit-sum) until it hits a
  base value — the answer is the **number of steps** or the **final
  value**.
- You'd otherwise write nested loops with a counter you keep resetting.
- The problem says "repeat until a single digit / until zero / until it
  stops changing".

If you find yourself pushing to a list and popping it back, you're in
[`../backtracking/`](../backtracking/PATTERN.md), not here.

## Template (accumulator parameter)

The trick that keeps these one-liners: carry the running answer **down**
as a parameter instead of building it up on the way back. Every call is
then a tail call and the base case just returns the accumulator.

```js
const helper = (value, acc) => {
    if (isBase(value)) return acc;          // answer is already built

    if (rule1(value)) return helper(shrink1(value), acc + 1);
    return helper(shrink2(value), acc + 1);
};

return helper(input, 0);                    // seed the accumulator
```

`countsteps.js` (LC 1342) is exactly this: `num % 2 === 0` picks
`num / 2`, otherwise `num - 1`, and `steps` rides along.

The alternative — building up on the return — needs no seed but does the
arithmetic on the way out:

```js
const helper = (value) => {
    if (isBase(value)) return 0;
    return 1 + helper(shrink(value));
};
```

Both are O(log n) here. Use the accumulator form when the base case is
what you want to return verbatim.

## Template (recursion replacing nested loops)

Two counters, one recursive function. `c` walks the inner loop; when it
reaches the row width you **reset `c` to 0 and decrement `r`** — that
reset *is* the outer loop.

```js
const walk = (r, c, acc = "") => {
    if (r === 0) return acc;                // outer loop finished

    if (c < r) {                            // inner loop body
        return walk(r, c + 1, acc + "*");
    }
    return walk(r - 1, 0, acc + "\n");      // inner done → advance outer
};

walk(4, 0);
```

`trianglepattern.js` is this verbatim. The generalization: **any pair of
nested loops becomes `(outer, inner)` parameters plus a reset branch.**

## Template (digital root — reduce before you replicate)

`superdigit.js` (HackerRank Recursive Digit Sum) asks for the repeated
digit-sum of a string concatenated `k` times. The naive read builds the
`n × k`-length string first, which blows up.

The insight is that the **digital root is invariant under repeated
digit-summing**, so you may reduce `n` to a single digit *first* and
only then replicate:

```js
const getSuperDigit = (numString) => {
    if (numString.length === 1) return numString;

    let sum = 0;
    for (let i = 0; i < numString.length; i++) {
        sum += parseInt(numString.charAt(i));
    }
    return getSuperDigit(sum.toString());   // recurse on the sum
};

// reduce n first, THEN repeat k times, then reduce again
return getSuperDigit(getSuperDigit(n).repeat(k));
```

The two-level call is the whole trick. (The closed form —
`1 + (digitSum(n) * k - 1) % 9` — is worth knowing but the recursive
version is what an interviewer wants to see derived.)

## Complexity

- **Accumulator / shrink recursions**: O(depth) time, O(depth) stack.
  For a halving rule that's **O(log n)**; JS does not do tail-call
  elimination, so the stack really is O(log n) frames.
- **Nested-loop replacement**: same as the loops it replaces —
  `trianglepattern.js` is **O(r²)** time and O(r²) space for the output
  string (plus O(r²) frames, since each `*` is one call).
- **`superdigit`**: reducing an `m`-digit number costs O(m) and shrinks
  it to ~O(log m) digits, so the recursion depth is tiny. Reducing
  before replicating keeps the work at **O(len(n) + k)** instead of
  O(len(n) · k).

## Problems in this folder

- [`countsteps.js`](countsteps.js) (LC 1342 Number of Steps to Reduce a
  Number to Zero) — accumulator parameter, halve-or-decrement shrink rule.
- [`superdigit.js`](superdigit.js) (HackerRank Recursive Digit Sum) —
  digital-root reduction; reduce *before* replicating.
- [`trianglepattern.js`](trianglepattern.js) (pattern printing) —
  `(row, col)` counters with a reset branch, standing in for nested loops.
