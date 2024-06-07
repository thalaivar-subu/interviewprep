/**
 * https://leetcode.com/problems/hand-of-straights/
 * https://leetcode.com/problems/divide-array-in-sets-of-k-consecutive-numbers/description/
Input: nums = [1,2,3,3,4,4,5,6], k = 4
Output: true
Explanation: Array can be divided into [1,2,3,4] and [3,4,5,6].
Example 2:
Input: nums = [3,2,1,2,3,4,3,4,5,9,10,11], k = 3
Output: true
Explanation: Array can be divided into [1,2,3] , [2,3,4] , [3,4,5] and [9,10,11].
Example 3:
Input: nums = [1,2,3,4], k = 3
Output: false
Explanation: Each array should be divided in subarrays of size 3.
 * @param {number[]} hand
 * @param {number} groupSize
 * @return {boolean}
 */
var isNStraightHand = function (hand, groupSize) {
    // base check
    if (hand.length % groupSize !== 0) return false;

    //consecutive - So sort
    hand.sort((a, b) => a - b);

    //duplicates are there so create hashMap
    let map = new Map();
    hand.forEach(card => map.set(card, (map.get(card) || 0) + 1));

    // After sorting, the array becomes [1, 2, 2, 3, 3, 4, 6, 7, 8].
    for (let card of hand) {
        if (!map.has(card)) continue;
        for (let j = card; j < card + groupSize; j++) { // handles +1 check
            if (map.has(j)) {
                map.set(j, (map.get(j) || 0) - 1)
                if (map.get(j) === 0) map.delete(j); // mandatory to delete
            } else return false

        }
    }
    return true;
};