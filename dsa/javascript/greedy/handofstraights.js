/**
846. Hand of Straights
Solved
Medium
Topics
premium lock icon
Companies
Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards.

Given an integer array hand where hand[i] is the value written on the ith card and an integer groupSize, return true if she can rearrange the cards, or false otherwise.

 

Example 1:

Input: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3
Output: true
Explanation: Alice's hand can be rearranged as [1,2,3],[2,3,4],[6,7,8]
Example 2:

Input: hand = [1,2,3,4,5], groupSize = 4
Output: false
Explanation: Alice's hand can not be rearranged into groups of 4.

 

Constraints:

1 <= hand.length <= 104
0 <= hand[i] <= 109
1 <= groupSize <= hand.length
 

Note: This question is the same as 1296: https://leetcod
*/
/**
 * https://leetcode.com/problems/hand-of-straights/description/
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