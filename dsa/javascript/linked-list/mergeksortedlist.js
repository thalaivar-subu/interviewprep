/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 * https://leetcode.com/problems/merge-k-sorted-lists/description/
 * O(N∗Log(K))
 */
var mergeKLists = function (lists) {
    if (!lists || !lists.length) return null;
    const merge2SortedLists = (l1, l2) => {
        if (!l1) return l2;
        if (!l2) return l1;
        if (l1.val < l2.val) {
            l1.next = merge2SortedLists(l1.next, l2);
            return l1;
        } else {
            l2.next = merge2SortedLists(l1, l2.next);
            return l2;
        }
    }
    // This O(N*K)
    for (let i = 1; i < lists.length; i++) {
        lists[0] = merge2SortedLists(lists[0], lists[i]);
    }

    // Try this Divide & Conquery - Merge Sort
    //Time:  O(N log k)
    // Space: O(log k)   (rounds) + recursion stack from mergeTwoLists
    while (lists.length > 1) {
        const merged = [];

        for (let i = 0; i < lists.length; i += 2) {
            const l1 = lists[i];
            const l2 = i + 1 < lists.length
                ? lists[i + 1]
                : null;

            merged.push(mergeSortedLists(l1, l2));
        }

        lists = merged;
    }
    return lists[0];
};
