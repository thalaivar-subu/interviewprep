/* https://yomguithereal.github.io/posts/lru-cache 
https://leetcode.com/problems/lru-cache/
*/
class ListNode {
    constructor(key, val){
        this.key = key;
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    constructor(capacity){
        this.capacity = capacity;
        this.head = new ListNode(null, null);
        this.tail = new ListNode(null, null);
        this.cache = new Map();
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    _add(node) {
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }
    _remove(node) {
        const next = node.next;
        const prev = node.prev;
        prev.next = next;
        next.prev = prev;
    }
    get(key){
        if(!this.cache.has(key)) return -1;
        
        const node = this.cache.get(key);
        this._remove(node);
        this._add(node);
        return node.val;
        
    }
    put(key, val){
        if(this.cache.has(key)) this._remove(this.cache.get(key));
        
        const node = new ListNode(key, val);
        this._add(node);
        this.cache.set(key, node);
        if(this.cache.size > this.capacity) {
            const leastRecentlyUsed = this.tail.prev;
            this._remove(leastRecentlyUsed);
            this.cache.delete(leastRecentlyUsed.key);
        }
        
    }
    
}

// Example usage
let lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1)); 
lru.put(3, 3); 
console.log(lru.get(2)); 
lru.put(4, 4); 
console.log(lru.get(1)); 
console.log(lru.get(3)); 
console.log(lru.get(4));