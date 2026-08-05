/* 
Minimum Inconvenience
Problem
Amazon has multiple delivery centers all over
the world. A city is given in the form of a grid
where the delivery centers are marked as 1
and all other places are marked as 0 .
Distance between two cells is defined as the
maximum absolute distance between xcoordinates and y-coordinates. For example,
distance between (1,2) and (0,4) is
max(|1-0|, |2-4|) = 2 .
The inconvenience of the grid is defined as the
maximum distance of any place marked 0
from its nearest delivery center.
Amazon is planning to open a new delivery
center to reduce the inconvenience of the grid.
Minimize the inconvenience of the grid by
converting at most one 0 (any place) to 1 (a
delivery center) and report this minimum value.
Example
Given n = 2 (rows), m = 4 (columns):
grid = [[0, 0, 0, 1],
[0, 0, 0, 1]]
Distances to nearest delivery centers:
3 2 1 0
3 2 1 0
Initial inconvenience is 3 .
It is optimal to convert (0,0) to a delivery
center, resulting in:
1 0 0 1
0 0 0 1
Now the inconvenience is 1 , with distances:
0 1 1 0
1 1 1 0
Function Description
Complete the function getMinInconvenience
in the editor below.
getMinInconvenience has the following
parameter:
int grid[n][m] : 2D binary matrix
Returns
int : the minimum inconvenience possible
Constraints
1 <= n, m <= 500
0 <= grid[i][j] <= 1
Sample Case 0
Input
n = 3
m = 4
grid = [[0, 0, 0, 0],
[0, 0, 0, 0],
[0, 0, 0, 0]]
Output
2
Explanation
It is optimal to convert (1,1) to 1 , resulting
in:
0 0 0 0
0 1 0 0
0 0 0 0
where the distance of each cell from its
nearest 1 is:
1 1 1 2
1 0 1 2
1 1 1 2
Max distance is 2 .

Solution
Approach: Binary search on the answer D . For
a candidate D , check whether every 0 -cell
can be covered — either by an existing 1
within Chebyshev distance D , or by a single
new point we're free to place.
Compute coverage using two prefix-sum
passes (row window, then column window),
since a Chebyshev ball of radius D is a
(2D+1) x (2D+1) square.
Collect the bounding box of cells still
uncovered by existing 1 s.
If no cells are uncovered, D is feasible even
without a new point.
Otherwise, one new point can fix everything
iff that bounding box fits inside a (2D+1) x
(2D+1) square: maxRow - minRow <= 2D
and maxCol - minCol <= 2D .
The smallest feasible D found by binary
search is the answer.
function getMinInconvenience(grid) {
const n = grid.length, m =
grid[0].length;
function isFeasible(D) {
// rowCover[i][j]: is there a 1
in row i within columns [j-D, j+D]?
const rowCover = Array.from({
length: n }, () => new
Array(m).fill(0));
for (let i = 0; i < n; i++) {
const prefix = new Array(m +
1).fill(0);
for (let j = 0; j < m; j++)
prefix[j + 1] = prefix[j] + grid[i]
[j];
for (let j = 0; j < m; j++) {
const lo = Math.max(0, j -
D);
const hi = Math.min(m - 1, j
+ D);
rowCover[i][j] = (prefix[hi +
1] - prefix[lo]) > 0 ? 1 : 0;
}
}
// fresh every call — must not
leak across binary search iterations
let minRow = Infinity, maxRow = -
Infinity, minCol = Infinity, maxCol =
-Infinity;
let anyUncovered = false;
for (let j = 0; j < m; j++) {
const prefix = new Array(n +
1).fill(0);
for (let i = 0; i < n; i++)
prefix[i + 1] = prefix[i] +
rowCover[i][j];
for (let i = 0; i < n; i++) {
const lo = Math.max(0, i -
D);
const hi = Math.min(n - 1, i
+ D);
const covered = (prefix[hi +
1] - prefix[lo]) > 0;
if (!covered) {
anyUncovered = true;
if (i < minRow) minRow = i;
if (i > maxRow) maxRow = i;
if (j < minCol) minCol = j;
if (j > maxCol) maxCol = j;
}
}
}
if (!anyUncovered) return true;
return (maxRow - minRow) <= 2 * D
&& (maxCol - minCol) <= 2 * D;
}
let start = 0, end = Math.max(n -
1, m - 1);
while (start < end) {
const mid = (start + end) >> 1;
if (isFeasible(mid)) end = mid;
else start = mid + 1;
}
return start;
}
Trace — Sample Case 0 (n=3, m=4, all
zeros)
No existing 1 s, so coverage never depends on
D — the whole grid is the "uncovered"
bounding box every time: rows 0..2 (span 2 ),
cols 0..3 (span 3 ).
D=1 : check 2 <= 2 ✓, 3 <= 2 ✗ →
infeasible
D=2 : check 2 <= 4 ✓, 3 <= 4 ✓ →
feasible
Binary search converges to D = 2 , matching
the expected output.
Complexity: O(n * m * log(max(n, m)))
time, O(n * m) space — fine for n, m <=
500 
*/
function getMinInconvenience(grid) {
  const n = grid.length, m = grid[0].length;

  function isFeasible(D) {
    // rowCover[i][j]: is there a 1 in row i within columns [j-D, j+D]?
    const rowCover = Array.from({ length: n }, () => new Array(m).fill(0));
    for (let i = 0; i < n; i++) {
      const prefix = new Array(m + 1).fill(0);
      for (let j = 0; j < m; j++) prefix[j + 1] = prefix[j] + grid[i][j];
      for (let j = 0; j < m; j++) {
        const lo = Math.max(0, j - D);
        const hi = Math.min(m - 1, j + D);
        rowCover[i][j] = prefix[hi + 1] - prefix[lo] > 0 ? 1 : 0;
      }
    }

    // colCover[i][j]: is there rowCover=1 within rows [i-D, i+D]?
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    let anyUncovered = false;

    for (let j = 0; j < m; j++) {
      const prefix = new Array(n + 1).fill(0);
      for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + rowCover[i][j];
      for (let i = 0; i < n; i++) {
        const lo = Math.max(0, i - D);
        const hi = Math.min(n - 1, i + D);
        const covered = prefix[hi + 1] - prefix[lo] > 0;
        if (!covered) {
          anyUncovered = true;
          if (i < minRow) minRow = i;
          if (i > maxRow) maxRow = i;
          if (j < minCol) minCol = j;
          if (j > maxCol) maxCol = j;
        }
      }
    }

    if (!anyUncovered) return true; // no new point even needed
    return maxRow - minRow <= 2 * D && maxCol - minCol <= 2 * D;
  }

  let lo = 0, hi = Math.max(n - 1, m - 1);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (isFeasible(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}