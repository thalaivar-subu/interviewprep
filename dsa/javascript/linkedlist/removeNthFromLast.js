/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/
Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]
Example 2:
Input: head = [1], n = 1
Output: []
Example 3:
Input: head = [1,2], n = 1
Output: [1]
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function(head, n) {
    let slow = head;
    let fast = head;
    while(n--) fast = fast.next;
    let prev = null
    while(fast){
        prev = slow;
        slow = slow.next;
        fast = fast.next;
    }
    if(prev == null) return head.next;
    prev.next = slow.next;
    slow.next = null;
    return head;
};