/*
https://leetcode.com/problems/remove-nodes-from-linked-list/description/

You are given the head of a linked list.

Remove every node which has a node with a greater value anywhere to the right side of it.

Return the head of the modified linked list.

 

Example 1:


Input: head = [5,2,13,3,8]
Output: [13,8]
Explanation: The nodes that should be removed are 5, 2 and 3.
- Node 13 is to the right of node 5.
- Node 13 is to the right of node 2.
- Node 8 is to the right of node 3.
Example 2:

Input: head = [1,1,1,1]
Output: [1,1,1,1]
Explanation: Every node has value 1, so no nodes are removed.
 

Constraints:

The number of the nodes in the given list is in the range [1, 105].
1 <= Node.val <= 105

*/

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 * O(n) time, O(1) space
 */

var removeNodes = function(head) {
   const reverse = (ll) => {
    let prev = null;
    let next = null;
    while(ll){
        next = ll.next;
        ll.next = prev;
        prev = ll;
        ll = next;
    }
    return prev;
   }
   head = reverse(head);
   /*
   Input: head = [5,2,13,3,8]
   Output: [13,8]
   */
   let max = head.val;
   let current = head;
   while(current && current.next) {
    if(current.next.val < max) {
        current.next = current.next.next;
    } else {
        current = current.next;
        max = current.val;
    }
   }
   return reverse(head);
};
