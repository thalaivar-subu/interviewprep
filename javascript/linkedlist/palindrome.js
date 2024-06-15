/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var isPalindrome = function(head) {
    let slow = head;
    let fast = head;
    while(fast && fast.next){
        slow = slow.next
        fast = fast.next.next
    }
    let current = slow
    let prev = null;
    while(current){
        let next = current.next
        current.next = prev
        prev = current
        current = next
    }
    let p1 = head
    let p2 = prev
    while(p1 && p2){
        if(p1.val !== p2.val) return false
        p1 = p1.next
        p2 = p2.next
    }
    return true
};