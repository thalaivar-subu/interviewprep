
// https://leetcode.com/problems/lru-cache/

function ListNode(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
}

/**
 * @param {number} capacity
 */
var LRUCache = function (capacity) {
    this.capacity = capacity;
    this.cache = new Map();

    // Dummy head and tail
    this.head = new ListNode(0, 0);
    this.tail = new ListNode(0, 0);

    this.head.next = this.tail;
    this.tail.prev = this.head;
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
    // Key not found
    if (!this.cache.has(key)) return -1;

    // Move accessed node to the front (Most Recently Used)
    const node = this.cache.get(key);
    this._remove(node);
    this._add(node);

    return node.val;
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {

    // If key already exists, remove old node
    if (this.cache.has(key)) {
        const node = this.cache.get(key);
        this._remove(node);
        this.cache.delete(key);
    }

    // Insert new node at the front
    const newNode = new ListNode(key, value);
    this._add(newNode);

    // Remove Least Recently Used node if capacity exceeded
    if (this.cache.size > this.capacity) {
        const lru = this.tail.prev;
        this._remove(lru);
        this.cache.delete(lru.key);
    }
};

/**
 * Add node right after head (Most Recently Used position)
 */
LRUCache.prototype._add = function (node) {
    const next = this.head.next;

    this.head.next = node;
    node.prev = this.head;

    node.next = next;
    next.prev = node;

    this.cache.set(node.key, node);
};

/**
 * Remove node from the doubly linked list
 */
LRUCache.prototype._remove = function (node) {
    const prev = node.prev;
    const next = node.next;

    prev.next = next;
    next.prev = prev;
};

/**
 * Your LRUCache object will be instantiated and called as such:
 *
 * const obj = new LRUCache(capacity);
 * const value = obj.get(key);
 * obj.put(key, value);
 */