/*
Efficient Cost

Given an array of positive integers arr and an integer threshold, partition the array into one or more contiguous groups such that:

Each group contains at most threshold elements.
The cost of a group is the maximum element in that group.

Return the minimum possible total cost obtained by partitioning the entire array.

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
function efficientCost(arr, threshold) {
    const n = arr.length;

    const backTrack = (start) => {
        // Processed entire array
        if (start === n) return 0;

        let minCost = Infinity;
        let maxInGroup = 0;

        // Try taking 1,2,...,threshold elements
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