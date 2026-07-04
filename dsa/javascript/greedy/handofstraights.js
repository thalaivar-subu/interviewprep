/**
 * https://leetcode.com/problems/hand-of-straights/
 * Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards.

Given an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return true if she can rearrange the cards, or false otherwise.

 * https://leetcode.com/problems/divide-array-in-sets-of-k-consecutive-numbers/description/
Given an array of integers nums and a positive integer k, check whether it is possible to divide this array into sets of k consecutive numbers.

Return true if it is possible. Otherwise, return false.
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
 * O(n log n) time (sort + map ops), O(n) space
 */
var isNStraightHand = function (hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;

    // Sort hand for consecutive
    hand.sort((a, b) => a - b);

    // Since duplicates - create map
    const map = new Map();
    hand.forEach(card => map.set(card, (map.get(card) || 0) + 1));

    // We check value not index so loop with values
    for (let card of hand) {
        // If card completely used skip it
        if (!map.has(card)) continue;
        for (let j = card; j < card + groupSize; j++) {
            if (map.has(j)) {
                map.set(j, map.get(j) - 1);
                if (map.get(j) == 0) map.delete(j);
            } else return false;
        }
    }
    return true;
};

// iF NO duplicate: O(n log n) time (sort), O(1) extra space
function isNStraightHand(hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;

    hand.sort((a, b) => a - b);

    for (let i = 0; i < hand.length; i += groupSize) {
        for (let j = i + 1; j < i + groupSize; j++) {
            if (hand[j] !== hand[j - 1] + 1) {
                return false;
            }
        }
    }

    return true;
}