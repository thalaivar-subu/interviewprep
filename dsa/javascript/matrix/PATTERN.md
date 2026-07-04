# Matrix Pattern Notes

## When to use it

Problems operating on a 2D grid where the trick is about **in-place
geometric transformation** (rotate, transpose, reflect) or validating
rows/columns/sub-blocks without extra storage. The general recipe for
rotating a square matrix: transpose (swap `matrix[i][j]` with
`matrix[j][i]`), then reverse each row (for 90° clockwise) or each
column (for 90° counter-clockwise).

## Template (rotate 90° clockwise, in place)

```js
function rotate(matrix) {
    const n = matrix.length;

    // Transpose
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }

    // Reverse each row
    for (let i = 0; i < n; i++) matrix[i].reverse();
}
```

## Complexity

**O(n^2) time** (must touch every cell), **O(1) extra space** when done
in place (as opposed to allocating a new matrix).

## Problems in this folder

- [`rotate90.js`](rotate90.js) (LC 48)
- [`validsudoku.js`](validsudoku.js) (LC 36) — O(1) time/space since the
  board is fixed at 9x9.
