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
    
