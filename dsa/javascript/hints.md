At Most K - Partition Sum
    for (
            let len = 1;
            len <= threshold && start + len <= arr.length;
            len++
        ) {
    max = Math.max(max, arr[start+len-1])
Exact K
        for (let i = start; i < start + threshold; i++) {
            maxInGroup = Math.max(maxInGroup, arr[i]);
        }

Should not contain duplicates
    If just duplicates
    candidates.sort((a, b) => a - b);
    if (i > start && candidates[i] === candidates[i - 1]) continue;


    candidates.sort((a, b) => a - b);
    const used = new Array(candidates.length).fill(false);
    if (i > 0 && candidates[i] === candidates[i - 1] && !used[i - 1]) continue;
    

all possible, possible valid combinations,  all distinct solutions,  possible to divide, all root-to-leaf paths, all possible subsets 
BACKTRACK


