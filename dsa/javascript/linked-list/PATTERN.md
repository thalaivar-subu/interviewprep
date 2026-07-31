# Linked List Pattern Notes

## When to use it

Any problem operating on a singly (or doubly) linked list. You can't
index, you can't go backwards, and you usually can't afford O(n) extra
space — so the whole game is **what can two or three pointers do in one
pass**. The recurring tricks:

- **Fast/slow pointers** — cycle detection, finding the middle,
  finding the k-th from the end.
- **Dummy head node** — avoids special-casing "the head itself changes".
- **Reverse in place** with three pointers (`prev`, `current`, `next`) —
  the building block for reversing a whole list or a sublist, *and* a
  way to convert "look right" into "look left".

Recognition cue for the fast/slow family: any question phrased in terms
of a **position relative to the end** ("the middle", "the n-th from
last", "does it loop") — you can't know where the end is, so you use a
second pointer to encode the offset.

## Template (fast/slow — 2× speed)

For "the middle" and "is there a cycle". `fast` moves twice per step, so
when it hits the end, `slow` is halfway.

```js
let slow = head, fast = head;
while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) return true;   // cycle: fast lapped slow
}
// no cycle; slow is at the midpoint
```

Both conditions matter: `fast` guards the odd-length end, `fast.next`
guards the even-length one. `hascycle.js` (LC 141) uses the equality
check; `palindrome.js` (LC 234) uses the midpoint.

## Template (fast/slow — fixed gap)

**A different variant that the 2× template does not give you.** Advance
`fast` by exactly `n` first, *then* move both in lockstep. When `fast`
falls off the end, `slow` is exactly `n` from it.

```js
let slow = head, fast = head;
while (n--) fast = fast.next;         // open a gap of exactly n

let prev = null;
while (fast) {
    prev = slow;
    slow = slow.next;
    fast = fast.next;
}
// slow is the n-th node from the end; prev is the node before it
```

`removeNthFromLast.js` (LC 19). The gap is the whole idea: the distance
between the pointers never changes, so it survives to the end of the
list. Use **fixed gap** when you need a specific offset; use **2× speed**
when you need a *fraction* of the length.

## Template (dummy head)

Named in the list above but worth showing, because it removes the
`prev == null` special case in the previous template. Allocate a fake
node in front of the real head and return `dummy.next`:

```js
const dummy = new ListNode(0, head);
let prev = dummy;

while (prev.next) {
    if (shouldDelete(prev.next)) prev.next = prev.next.next;   // splice out
    else prev = prev.next;
}

return dummy.next;      // correct even if the original head was removed
```

Reach for this **any time the head might change** — deletion near the
front, insertion at the front, or building a new list. It converts "two
cases" into one.

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

`reversell.js` (LC 206). Save `next` **before** you overwrite
`current.next` — that's the only line people get wrong.

## Technique (reverse to flip the direction of a comparison)

`removeNodes.js` (LC 2487): remove every node that has a greater value
*somewhere to its right*. Looking right is exactly what a singly linked
list can't do — so **reverse the list, and "greater to the right"
becomes "greater already seen"**, which is a running max:

```js
head = reverse(head);          // now we scan right-to-left

let max = head.val;
let current = head;
while (current && current.next) {
    if (current.next.val < max) current.next = current.next.next;  // drop it
    else { current = current.next; max = current.val; }
}

return reverse(head);          // restore the original direction
```

Three passes, still O(n), still O(1) space.

**The general move — "I need to know something about what's ahead, so
reverse and make it something about what's behind"** — is worth keeping.
The alternative is a monotonic stack (push values, pop everything
smaller), which is the same insight spent as O(n) space instead of two
reversals; see [`../stack/PATTERN.md`](../stack/PATTERN.md).

## Technique (delete a node without access to its head)

`mediumdeletenodell.js` (LC 237). You're handed only the node to delete,
so you can't reach its predecessor. **Impersonate the successor
instead**: copy its value in, then splice *it* out.

```js
node.val  = node.next.val;
node.next = node.next.next;
```

You aren't deleting the given node — you're deleting the one after it,
having first stolen its value. This only works for a non-tail node,
which the problem guarantees.

## Template (merge two sorted lists, recursively)

`mergesortedlist.js` (LC 21). Pick the smaller head, then let the
recursion produce the rest and hang it off `next`:

```js
var mergeTwoLists = function (l1, l2) {
    if (!l1) return l2;
    if (!l2) return l1;

    if (l1.val < l2.val) {
        l1.next = mergeTwoLists(l1.next, l2);
        return l1;
    }
    l2.next = mergeTwoLists(l1, l2.next);
    return l2;
};
```

Elegant, but **O(n) stack** — mention the iterative dummy-head version
if the interviewer cares about space:

```js
const dummy = new ListNode(0);
let tail = dummy;

while (l1 && l2) {
    if (l1.val < l2.val) { tail.next = l1; l1 = l1.next; }
    else                 { tail.next = l2; l2 = l2.next; }
    tail = tail.next;
}
tail.next = l1 || l2;          // attach whatever's left
return dummy.next;
```

## Template (merge k lists by pairwise halving)

`mergeksortedlist.js` (LC 23). Folding every list into the first is
O(N·k). Instead **merge lists in pairs, halving the count each round**:

```js
while (lists.length > 1) {
    const merged = [];
    for (let i = 0; i < lists.length; i += 2) {
        merged.push(merge2(lists[i], i + 1 < lists.length ? lists[i + 1] : null));
    }
    lists = merged;
}
return lists[0];
```

`log k` rounds, each touching all `N` nodes ⇒ **O(N log k)**. Same
divide-and-conquer accounting as merge sort. The other standard answer
is a min-heap of the `k` current heads, also O(N log k) — see
[`../heap/PATTERN.md`](../heap/PATTERN.md).

## Composing the templates

`palindrome.js` (LC 234) is worth reading as a worked example of using
three templates at once, which is what most "hard" linked-list problems
actually are:

1. Fast/slow → find the middle.
2. Reverse in place → reverse the second half.
3. Two pointers → walk both halves comparing values.

O(n) time, O(1) space. The tidy version restores the list afterwards by
reversing the second half back.

## Complexity

**O(n) time, O(1) space** for every iterative template here — the whole
point of the pointer tricks is avoiding an array copy.

Two exceptions:

- **Recursive** merges (LC 21, and the `merge2` inside LC 23) are O(n)
  time but **O(n) recursion space**. The iterative dummy-head version is
  O(1).
- **Merging k lists** is **O(N log k)** time (N = total nodes) with
  O(log k) recursion rounds — versus O(N·k) for the naive fold.

## Problems in this folder

- [`reversell.js`](reversell.js) (LC 206 Reverse Linked List) — the three-pointer reversal template.
- [`hascycle.js`](hascycle.js) (LC 141 Linked List Cycle) — fast/slow 2×, `slow === fast`.
- [`palindrome.js`](palindrome.js) (LC 234 Palindrome Linked List) — composes fast/slow + reverse + compare.
- [`removeNthFromLast.js`](removeNthFromLast.js) (LC 19 Remove Nth Node From End of List) — **fixed-gap** two pointers (not the 2× variant). Would be shorter with a dummy head.
- [`mergesortedlist.js`](mergesortedlist.js) (LC 21 Merge Two Sorted Lists) — recursive merge idiom; iterative dummy-head version above.
- [`mergeksortedlist.js`](mergeksortedlist.js) (LC 23 Merge k Sorted Lists) — **pairwise halving**, O(N log k).
- [`removeNodes.js`](removeNodes.js) (LC 2487 Remove Nodes From Linked List) — **reverse to flip the comparison direction**, then a running max.
- [`mediumdeletenodell.js`](mediumdeletenodell.js) (LC 237 Delete Node in a Linked List) — copy the successor's value, splice the successor.
- [`LL.js`](LL.js) — the linked list class itself (insert/delete at any position). A data-structure implementation, not a problem.
