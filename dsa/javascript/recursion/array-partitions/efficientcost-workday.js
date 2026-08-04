/*
Efficient Cost

Given an array of positive integers arr and an integer threshold, partition the array into one or more contiguous groups such that:

Each group contains at most threshold elements.
The cost of a group is the maximum element in that group.

Return the minimum possible total cost obtained by partitioning the entire array.

Example 1
Input:
arr = [1,3,4,5,2,6]
threshold = 3
| Partition                 | Cost             |
| ------------------------- | ---------------- |
| `[1] [3] [4] [5] [2] [6]` | 1+3+4+5+2+6 = 21 |
| `[1,3] [4,5] [2,6]`       | 3+5+6 = 14       |
| `[1,3,4] [5] [2,6]`       | 4+5+6 = 15       |
| `[1,3] [4] [5,2,6]`       | 3+4+6 = 13       |
| `[1] [3,4,5] [2,6]`       | 1+5+6 = 12       |
| **`[1,3,4] [5,2,6]`**     | **4+6 = 10**     |

Output:
10
*/
// O(threshold^n) time worst case (no memoization), O(n) recursion space
// EDGE   - each group formed costs max*len, minimised
function efficientCost(arr, threshold) {
    const n = arr.length;

    const backTrack = (start) => {
        // Processed entire array
        if (start === n) return 0;

        let minCost = Infinity;
        let maxInGroup = 0;

        // arr = [1,3,4,5,2,6]
        // arr = [0,1,2,3,4,5]
        for (
            let len = 1;
            len <= threshold && start + len <= n;
            len++
        ) {
            maxInGroup = Math.max(maxInGroup, arr[start + len - 1]);

            const remainingCost = backTrack(start + len);

            minCost = Math.min(
                minCost,
                maxInGroup + remainingCost
            );
        }

        return minCost;
    };

    return backTrack(0);
}
/*
backTrack(0) -> [1,3,4,5,2,6]
├── take [1]       -> backTrack(1) -> [3,4,5,2,6]
│   ├── take [3]      -> backTrack(2) -> [4,5,2,6]
│   ├── take [3,4]    -> backTrack(3) -> [5,2,6]
│   └── take [3,4,5]  -> backTrack(4) -> [2,6]
│
├── take [1,3]    -> backTrack(2) -> [4,5,2,6]
│
└── take [1,3,4]  -> backTrack(3) -> [5,2,6]
*/

function printPartitions(arr, threshold) {

    const path = [];

    const backTrack = (start) => {

        if (start === arr.length) {
            console.log(JSON.stringify(path));
            return;
        }

        for (
            let len = 1;
            len <= threshold && start + len <= arr.length;
            len++
        ) {
            // Current partition
            const group = arr.slice(start, start + len);

            path.push(group);

            backTrack(start + len);

            // Backtrack
            path.pop();
        }
    };

    backTrack(0);
}

printPartitions([1,3,4,5,2,6], 3);