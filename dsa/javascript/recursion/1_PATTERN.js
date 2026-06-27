https://leetcode.com/discuss/post/1405817/backtracking-algorithm-problems-to-pract-lujf/
/** Normal Backtracking Pattern` */

backtrack = () => {
    // base condition if any. no condition for subsets
    if(target  === 0) return;
    // loop
    // Push into current subset
    // Recursion - i=0 or i=start, backtrack(i) 
    //  The list must not contain the same combination twice => i+1
    // if different sequence considered as different combination => i=0
    // Pop from current subset
    for (let i = 0; i < n; i++) {
           currentCandidates.push(candidates[i]);
            helper(currentCandidates, i, target - candidates[i]);
            currentCandidates.pop();
    }
}
backtrack(0, [], target)

/** Without DUplicates Backtracking Pattern` */
    nums.sort((a, b) => a - b);
    let used = new Array(nums.length).fill(false);

    // On Push used true
    // On Pop used false

    // inside loop to skip
    if(used[i]) continue;
    if(i>0 && nums[i] === nums[i-1] && !used[i-1]) continue;

    // if pass index - i>start && nums[i] === nums[i-1] continue;
    

/* Decision Tree Backtracking Pattern */
var rob = function (nums) {
    const map = new Map();
    const helper = (i) => {
        if (i >= nums.length) return 0;
        if (map.has(i)) return map.get(i)
        const rob = nums[i] + helper(i + 2)
        const skip = helper(i + 1)
        const output = Math.max(rob, skip);
        map.set(i, output)
        return output;
    }
    return helper(0);
};

/* Reduced State Backtracking Pattern */
var numRollsToTarget = function (n, k, target) {
    const MOD = Math.pow(10, 9) + 7;
    const map = new Map();
    const helper = (n, target) => {
        if (n <= 0) {
            if (target === 0) return 1
            else return 0;
        }
        // let cacheKey = `${n}-${target}`;
        // if (map.has(cacheKey)) return map.get(cacheKey);
        let count = 0;
        for (let i = 1; i <= k; i++) {
            count = (count + helper(n - 1, target - i)) % MOD;
        }
        // map.set(cacheKey, count)
        return count;
    }
    return helper(n, target);
};