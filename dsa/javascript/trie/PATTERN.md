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

## Template (collect words below a prefix node)

`_traverse(prefix)` gets you to the node; from there, a DFS gathers
every word in that subtree. Because children are visited in sorted key
order, the results come out **lexicographically** — which is exactly
what autocomplete wants:

```js
collect(prefix, limit = 3) {
    const node = this._traverse(prefix);
    if (!node) return [];

    const out = [];

    const dfs = (n, path) => {
        if (out.length === limit) return;         // prune once we have enough
        if (n.isEnd) out.push(path);

        for (const ch of Object.keys(n.children).sort()) {
            dfs(n.children[ch], path + ch);
        }
    };

    dfs(node, prefix);
    return out;
}
```

LC 1268 Search Suggestions System is this, called once per prefix of the
search word. The `limit` early-return is what keeps it fast — you stop
descending as soon as you have three.

> If your nodes use a fixed 26-slot array instead of an object,
> iterating `0..25` is already sorted and the `.sort()` disappears.

## Template (wildcard matching — branch on `.`)

LC 211 Design Add and Search Words. A `.` matches any character, so at
that position you must **try every child**:

```js
search(word) {
    const dfs = (node, i) => {
        if (i === word.length) return node.isEnd;

        const ch = word[i];

        if (ch === '.') {
            for (const child of Object.values(node.children)) {
                if (dfs(child, i + 1)) return true;    // any child may work
            }
            return false;
        }

        return node.children[ch] ? dfs(node.children[ch], i + 1) : false;
    };

    return dfs(this.root, 0);
}
```

The exact-character branch stays O(1); only the wildcards fan out. Worst
case (all dots) is O(26^L), but real inputs have few.

## Technique (trie + board DFS — the LC 212 pattern)

The reason tries show up in graph problems. Searching a board for `k`
words one at a time is O(k × board × 4^L); carrying a **trie node
alongside the position** matches all `k` words in a single traversal,
and dead prefixes prune instantly:

```js
const dfs = (r, c, node) => {
    const ch = board[r][c];
    const next = node.children[ch];
    if (!next) return;                        // ← no word has this prefix; stop now

    if (next.word) { result.push(next.word); next.word = null; }   // dedupe by clearing

    board[r][c] = '#';
    for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc] !== '#') dfs(nr, nc, next);
    }
    board[r][c] = ch;                          // backtrack
};
```

Two idioms worth keeping: **store the whole word at the terminal node**
(`next.word = word` at insert time) so you never rebuild the string from
the path, and **null it after a hit** so duplicates are impossible
without a `Set`.

`word-search-2.js` currently lives in
[`../graph/`](../graph/PATTERN.md) and does *not* use a trie — it runs a
full board search per word and will TLE on LC 212. It's the natural
first resident for this folder.

## Complexity

Insert/search/startsWith are all **O(L)** where `L` is the length of the
word/prefix, independent of how many words are stored. Space is
**O(total characters across all inserted words)** in the worst case (no
shared prefixes).

| Operation | Time |
|---|---|
| insert / search / startsWith | **O(L)** |
| Collect `k` words under a prefix | O(L + k·L) |
| Wildcard search | O(L) typical, O(26^L) all-dots worst |
| Board DFS with trie | O(m·n·4^L) worst, far less in practice |

The selling point over a hash set: a set answers *exact* membership in
O(L) too, but **"does any word start with this prefix?" needs a full
scan** with a set and O(L) with a trie. If a problem never asks about
prefixes, use a `Set`.

## Problems in this folder

None yet — add solutions here as you work through them (e.g. Implement
Trie LC 208, Search Suggestions System LC 1268).

The structure above covers LC 208 as-is; `collect` covers LC 1268; the
wildcard `search` covers LC 211; and the board DFS covers LC 212, whose
current (brute-force) implementation sits at
[`../graph/word-search-2.js`](../graph/word-search-2.js).
