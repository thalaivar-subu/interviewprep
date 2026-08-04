// https://leetcode.com/problems/lru-cache/

import java.util.HashMap;
import java.util.Map;

class LRUCache {

    private static class Node {
        int key;
        int val;
        Node prev;
        Node next;

        Node(int key, int val) {
            this.key = key;
            this.val = val;
        }
    }

    private final int capacity;
    private final Map<Integer, Node> cache;

    // Dummy head and tail
    private final Node head;
    private final Node tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new HashMap<>();

        this.head = new Node(0, 0);
        this.tail = new Node(0, 0);

        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        // Key not found
        if (!cache.containsKey(key)) return -1;

        // Move accessed node to the front (Most Recently Used)
        Node node = cache.get(key);
        remove(node);
        add(node);

        return node.val;
    }

    public void put(int key, int value) {

        // If key already exists, remove old node
        if (cache.containsKey(key)) {
            Node existing = cache.get(key);
            remove(existing);
            cache.remove(key);
        }

        // Insert new node at the front
        Node newNode = new Node(key, value);
        add(newNode);

        // Remove Least Recently Used node if capacity exceeded
        if (cache.size() > capacity) {
            Node lru = tail.prev;
            remove(lru);
            cache.remove(lru.key);
        }
    }

    // Add node right after head (Most Recently Used position)
    private void add(Node node) {
        Node next = head.next;

        head.next = node;
        node.prev = head;

        node.next = next;
        next.prev = node;

        cache.put(node.key, node);
    }

    // Remove node from the doubly linked list
    private void remove(Node node) {
        Node prev = node.prev;
        Node next = node.next;

        prev.next = next;
        next.prev = prev;
    }
}

/*
 * Your LRUCache object will be instantiated and called as such:
 * LRUCache obj = new LRUCache(capacity);
 * int value = obj.get(key);
 * obj.put(key, value);
 */
