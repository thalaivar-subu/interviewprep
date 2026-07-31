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

The transpose loop starts at **`j = i`**, not `j = 0`. Starting at 0
swaps every pair twice and leaves the matrix unchanged — the single
most common bug in LC 48. The other rotations follow from the same two
primitives:

| Rotation | Recipe |
|---|---|
| 90° clockwise | transpose, then reverse each **row** |
| 90° counter-clockwise | transpose, then reverse each **column** |
| 180° | reverse each row, then reverse the row order |

## Template (3×3 block indexing)

`validsudoku.js` (LC 36). The rows and columns are easy; the sub-blocks
need index arithmetic, and there are two standard ways to write it.

**Nested block walk** (what the file does) — iterate over block
coordinates, then over offsets inside the block:

```js
for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
        const cells = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                cells.push(board[blockRow * 3 + r][blockCol * 3 + c]);
            }
        }
        if (!allDistinct(cells)) return false;
    }
}
```

**Single-pass with a derived block index** — the version worth knowing,
because it validates all three constraint types in one sweep:

```js
const rows  = Array.from({ length: 9 }, () => new Set());
const cols  = Array.from({ length: 9 }, () => new Set());
const boxes = Array.from({ length: 9 }, () => new Set());

for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val === '.') continue;

        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);   // ← 0..8 block id

        if (rows[r].has(val) || cols[c].has(val) || boxes[b].has(val)) return false;

        rows[r].add(val); cols[c].add(val); boxes[b].add(val);
    }
}
return true;
```

**`Math.floor(r / 3) * 3 + Math.floor(c / 3)`** maps a cell to its
0-through-8 block id — the row-band times 3 plus the column-band. It's
the same flattening as `r * cols + c`, applied to block coordinates
instead of cell coordinates, and it shows up again in grid
[`../union-find/PATTERN.md`](../union-find/PATTERN.md).

## Complexity

**O(n^2) time** (must touch every cell), **O(1) extra space** when done
in place (as opposed to allocating a new matrix).

For LC 36 specifically both are **O(1)** — the board is fixed at 9×9, so
the 81 cells and 27 sets are constants. On a general n×n board with
√n×√n blocks it would be O(n²) time and space.

## Problems in this folder

- [`rotate90.js`](rotate90.js) (LC 48 Rotate Image) — **transpose then reverse rows**; `j` starts at `i`. The file also documents the 180°/270° variants.
- [`validsudoku.js`](validsudoku.js) (LC 36 Valid Sudoku) — **3×3 block index arithmetic**; O(1) time/space since the board is fixed at 9×9.

Note these are two unrelated sub-patterns sharing a folder: a geometric
transform and a grid group-validation. For grid **traversal** (islands,
BFS on a grid) see [`../graph/PATTERN.md`](../graph/PATTERN.md); the
set-based duplicate detection in LC 36 is really
[`../hashing/PATTERN.md`](../hashing/PATTERN.md).
