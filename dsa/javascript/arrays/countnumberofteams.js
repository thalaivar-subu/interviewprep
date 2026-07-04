/*
1395. Count Number of Teams
Medium
Topics
premium lock icon
Companies
Hint
There are n soldiers standing in a line. Each soldier is assigned a unique rating value.

You have to form a team of 3 soldiers amongst them under the following rules:

Choose 3 soldiers with index (i, j, k) with rating (rating[i], rating[j], rating[k]).
A team is valid if: (rating[i] < rating[j] < rating[k]) or (rating[i] > rating[j] > rating[k]) where (0 <= i < j < k < n).
Return the number of teams you can form given the conditions. (soldiers can be part of multiple teams).

 

Example 1:

Input: rating = [2,5,3,4,1]
Output: 3
Explanation: We can form three teams given the conditions. (2,3,4), (5,4,1), (5,3,1). 
Example 2:

Input: rating = [2,1,3]
Output: 0
Explanation: We can't form any team given the conditions.
Example 3:

Input: rating = [1,2,3,4]
Output: 4
 

Constraints:

n == rating.length
3 <= n <= 1000
1 <= rating[i] <= 105
All the integers in rating are unique.
*/

/**
 * @param {number[]} rating
 * @return {number}
 * O(n^2) time, O(1) space
 */
var numTeams = function (rating) {
    let numOfTeams = 0;
    for (let i = 0; i < rating.length; i++) {
        let leftSmaller = 0, rightSmaller = 0, leftGreater = 0, rightGreater = 0;
        // upto Mid Element
        for (let j = 0; j < i; j++) {
            if (rating[j] < rating[i]) leftSmaller++;
            else leftGreater++;
        }
        // after Mid Element
        for (let k = i + 1; k < rating.length; k++) {
            if (rating[k] > rating[i]) rightGreater++;
            else rightSmaller++
        }

        numOfTeams += leftSmaller * rightGreater + leftGreater * rightSmaller;
    }
    return numOfTeams;
};

/*
Another example
rating = [1, 2, 3, 4, 5]

Choose j = 2 (value = 3)

Left side : [1, 2]
Smaller than 3 → 2 elements

Right side : [4, 5]
Greater than 3 → 2 elements

Therefore

leftSmaller = 2
rightGreater = 2

Teams = 2 × 2 = 4

Those four teams are:

(1,3,4)
(1,3,5)
(2,3,4)
(2,3,5)
 */