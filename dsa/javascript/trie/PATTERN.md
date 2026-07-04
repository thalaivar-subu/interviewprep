# Trie (Prefix Tree) Pattern Notes

## When to use it

Reach for a trie whenever a problem is about **prefixes** over a set of
strings: autocomplete/search-suggestions, spell-checking, longest common
prefix among many words, or word-search over a dictionary rather than a
single word. A hashmap of strings works for exact lookups, but a trie
lets you answer "does any word start with this prefix?" in O(prefix
length) instead of scanning every word.

## Structure

Each node holds a map (or fixed-size array for lowercase-only alphabets)
from character to child node, plus a flag marking "a word ends here."

```js
class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const ch of word) {
            if (!node.children[ch]) node.children[ch] = new TrieNode();
            node = node.children[ch];
        }
        node.isEnd = true;
    }

    search(word) {
        const node = this._traverse(word);
        return node !== null && node.isEnd;
    }

    startsWith(prefix) {
        return this._traverse(prefix) !== null;
    }

    _traverse(str) {
        let node = this.root;
        for (const ch of str) {
            if (!node.children[ch]) return null;
            node = node.children[ch];
        }
        return node;
    }
}
```

## Complexity

Insert/search/startsWith are all **O(L)** where `L` is the length of the
word/prefix, independent of how many words are stored. Space is
**O(total characters across all inserted words)** in the worst case (no
shared prefixes).

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Implement
Trie LC 208, Search Suggestions System LC 1268).
