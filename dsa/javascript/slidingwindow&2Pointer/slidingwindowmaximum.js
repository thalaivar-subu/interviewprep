/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 * o(nk)
 */
var maxSlidingWindow = function (nums, k) {
    let result = [];
    for (let i = k - 1; i < nums.length; i++) {
        let max = nums[i];
        for (let j = i - 1; j >= i - (k - 1); j--) max = Math.max(max, nums[j])
        result.push(max)
    }
    return result;
};

var maxSlidingWindow = function (nums, k) {
    let dequeue = []; // decreasing order
    let result = [];
    for (let i = 0; i < nums.length; i++) {
        // If the left boundary of the window has exceeded the left-most index in the deque,
        // remove the left-most index as it's no longer in the window.
        if (dequeue.length && i - k + 1 > dequeue[0]) dequeue.shift();
        // While the deque is not empty and the current element is greater than the
        // last element indexed in deque, remove the last element from the deque.
        // This ensures elements in the deque are always in decreasing order.
        while (dequeue.length && nums[dequeue[dequeue.length - 1]] <= nums[i]) dequeue.pop();
        dequeue.push(i);
        // If we have hit the size of the window, append the maximum value (front of the deque)
        // to the maxValues array.
        if (i >= k - 1) result.push(nums[dequeue[0]])
    }
    return result;
}
