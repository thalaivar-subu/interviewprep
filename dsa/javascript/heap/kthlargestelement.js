/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 * O(N∗Log(K))
 */
var findKthLargest = function(nums, k) {
    let minHeap = new MinPriorityQueue();
    for(num of nums){
        minHeap.enqueue(num);
        if(minHeap.size() > k) minHeap.dequeue();
    }
    return minHeap.front().element;
};