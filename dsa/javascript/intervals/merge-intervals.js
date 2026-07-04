/**
 * Medium
Topics
premium lock icon
Companies
Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

 

Example 1:

Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
Example 2:

Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.
Example 3:

Input: intervals = [[4,7],[1,4]]
Output: [[1,7]]
Explanation: Intervals [1,4] and [4,7] are considered overlapping.
 

Constraints:

1 <= intervals.length <= 104
intervals[i].length == 2
0 <= starti <= endi <= 104
 * @param {number[][]} intervals
 * @return {number[][]}
 o(NLogN)
 */
var merge = function (intervals) {
    if (intervals.length == 0) return [];

    // Sort the intervals by startTime, because [4,7] [1,4] should also get merged to [1,7]
    intervals = intervals.sort((a, b) => a[0] - b[0]);

    // keep First Interval in result;
    const result = [intervals[0]];


    // start from 1 and iterate
    for (let i = 1; i < intervals.length; i++) {
        let previousInterval = result[result.length - 1];
        let currentInterval = intervals[i];
        if (currentInterval[0] <= previousInterval[1]) {
            previousInterval[1] = Math.max(previousInterval[1], currentInterval[1]);
        } else result.push(currentInterval)
    }

    return result;
};