///"The sum of any subarray can be obtained by subtracting two prefix sums."
/**
 * Now suppose I ask:
nums = [2, 3, 1, 4]
What is the sum of

[3,1]

Without prefix sums:

3 + 1 = 4

Using prefix sums:

P[2] = 6
P[0] = 2

6 - 2 = 4

Works.
 */

let prefixSum = 0;
const map = new Map();

// Base case
map.set(0, 1); // or 0, depending on the problem

for (const num of nums) {
    prefixSum += num;

    // Check if a previous prefix helps solve the problem
    if (map.has(prefixSum - target)) {
        // Do something
    }

    // Store current prefix
    map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
}