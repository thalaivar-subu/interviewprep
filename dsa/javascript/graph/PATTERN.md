# Graph Pattern Notes

## Flood Fill / Connected Components

```js
dfs(r, c) {
    if (invalid || visited) return;

    visited.add(...)
    dfs(up)
    dfs(down)
    dfs(left)
    dfs(right)
}
```

## BFS Grid

```js
queue = [[start, 0]]

while (queue.length) {
    [node, dist] = queue.shift()

    for (nei of graph[node]) {
        queue.push([nei, dist + 1])
    }
}
```
