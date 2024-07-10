/**
 * @param {number[][]} intervals
 * @return {number[][]}
 o(NLogN)
 */
 var merge = function (intervals) {
    if (intervals.length === 0) {
        return [];
    }
    // Step 1: Sort the intervals by their start time
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]]; // Step 2: Initialize merged list with the first interval
    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1]; // Get the last merged interval
        const current = intervals[i]; // Current interval being checked
        // Step 3: Check if the current interval overlaps with the last merged interval
        if (current[0] <= last[1]) {
            // If yes, merge them by updating the end time of the last merged interval
            last[1] = Math.max(last[1], current[1]);
        } else {
            // If not, add the current interval to the merged list
            merged.push(current);
        }
    }
    return merged;
};