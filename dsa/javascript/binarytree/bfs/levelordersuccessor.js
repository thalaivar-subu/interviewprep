var levelOrderSuccessor = function(root, key) {
    if(!root) return [];
    // let result = [];
    let queue = [root];
    while(queue.length > 0){
        let currentLevel = []
        let len = queue.length
        // for(let i=0;i<len;i++){
            let currentNode = queue.shift();
            if(currentNode.left) queue.push(currentNode.left);
            if(currentNode.right) queue.push(currentNode.right);
            if(currentNode === key) break;
        // }
        // result.push(currentLevel)
    }
    return queue[0];
};