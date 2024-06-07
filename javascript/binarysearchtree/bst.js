// https://gist.github.com/Prottoy2938/c61a4fa5614c0086952e2464b80136be

module.exports = class BinarySearchTree {
    constructor() {
        this.root = null;
    }
    insertMany(values) {
        values.map(x => this.insert(x));
    }
    insert(value) {
        this.root = this._insert(this.root, value)
    }
    _insert(node, value) {
        if (node == null) {
            return new Node(value);
        }
        if (value == node.value) return node;
        if (value < node.value) {
            node.left = this._insert(node.left, value);
        } else {
            node.right = this._insert(node.right, value);
        }
        return node;
    }
    displayTree(){
        this.inOrderTraversal();
    }
    inOrderTraversal(node = this.root){
        if(node){
            this.inOrderTraversal(node.left);
            console.log(node.value);
            this.inOrderTraversal(node.right);
        }
    }
}
class Node {
    constructor(value) {
        this.value = value;
        this.right = null;
        this.left = null;
    }
}