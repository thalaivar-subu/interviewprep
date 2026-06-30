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