# Linked List Pattern Notes

## When to use it

Any problem operating on a singly (or doubly) linked list. The
recurring tricks:

- **Fast/slow pointers** (Floyd's cycle detection) — cycle detection,
  finding the middle, checking a palindrome.
- **Dummy head node** — avoids special-casing "the head itself changes"
  when deleting/inserting near the front.
- **Reverse in place** with three pointers (`prev`, `current`, `next`) —
  the building block for reversing a whole list or a sublist.

## Template (fast/slow pointers)

```js
let slow = head;
let fast = head;
while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    // slow is now at the midpoint once fast hits the end
}
```

## Template (reverse in place)

```js
let prev = null;
let current = head;
while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
}
return prev; // new head
```

## Complexity

**O(n) time, O(1) space** for iterative traversal/reversal tricks.
Recursive merges (e.g. merging two sorted lists) are O(n) time but
**O(n) recursion space** instead of O(1).

## Problems in this folder

- [`LL.js`](LL.js) — the linked list class itself (insert/delete at any position).
- [`hascycle.js`](hascycle.js) (LC 141)
- [`mediumdeletenodell.js`](mediumdeletenodell.js) (LC 237)
- [`mergeksortedlist.js`](mergeksortedlist.js) (LC 23)
- [`mergesortedlist.js`](mergesortedlist.js) (LC 21)
- [`palindrome.js`](palindrome.js) (LC 234)
- [`removeNodes.js`](removeNodes.js) (LC 2487)
- [`removeNthFromLast.js`](removeNthFromLast.js) (LC 19)
- [`reversell.js`](reversell.js) (LC 206)
