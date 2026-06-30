/* Flood Fill / Connected Components */
dfs(r, c) {
    if (invalid || visited) return;

    visited.add(...)
    dfs(up)
    dfs(down)
    dfs(left)
    dfs(right)
}

/*BFS Grid*/
queue = [[start,0]]

while(queue.length){
    [node,dist] = queue.shift()

    for(nei of graph[node]){
        queue.push([nei, dist+1])
    }
}