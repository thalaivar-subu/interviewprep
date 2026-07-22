/**
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function (nums) {
    if (nums.length === 0) return 0;

    const memo = new Map();

    const dfs = (i, j) => {
        if (j === nums.length) return 0;

        const key = `${i},${j}`;
        if (memo.has(key)) return memo.get(key);

        let take = 0;
        if (nums[i] < nums[j]) {
            take = 1 + dfs(j, j + 1);
        }

        let skip = dfs(i, j + 1);

        const ans = Math.max(take, skip);
        memo.set(key, ans);

        return ans;
    };

    let max = 1;
    for (let i = 0; i < nums.length; i++) {
        max = Math.max(max, 1 + dfs(i, i + 1));
    }

    return max;
};