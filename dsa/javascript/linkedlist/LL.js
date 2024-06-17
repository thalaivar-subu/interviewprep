class LinkedList {
    constructor(){
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    display(){
        let temp = this.head;
        let displayString = "";
        while(temp){
            displayString += temp.value + " -> "
            temp = temp.next;
        }
        console.log(displayString);
    }
    insertFirst(v){
        let node = new Node(v, null);
        node.next = this.head;
        this.head = node;
        if(this.tail == null) this.tail = this.head;
        this.size++;
    }
    insertLast(v){
        if(this.head == null) this.head = new Node(v, null);
        else {
            let node = new Node(v, null);
            this.tail.next = node;
            this.tail = node;
        }
        this.size++;
    }
    insert(v, index){
        if(!index || index > this.size) return
        if(index === 0) {
            this.insertFirst(v);
            return;
        }
        if(index == this.size){
            this.insertLast(v);
            return;
        } 
        let temp = this.head;
        for(let i=1;i<index;i++) temp = temp.next;
        let node = new Node(v, temp.next);
        temp.next = node;
        this.size++;
    }
    deleteFirst(){
        if(this.head == null) return
        this.head = this.head.next;
        if(this.head == null) this.tail = null;
        this.size--;
    }
    deleteLast(){
        if(this.size<=1) {
            this.deleteFirst();
            return;
        }
        let temp = this.head;
        for(let i=0;i<this.size-2;i++){
            temp = temp.next;
        }
        temp.next = null;
        this.tail = temp;
        this.tail.next = null;
        this.size--;
    }
}

class Node {
    constructor(value, next = null) {
        this.value = value;
        this.next = next;
    }
}

let ll = new LinkedList();
ll.insertFirst(1);
ll.insertFirst(2);
ll.insertLast(3);
ll.insert(0, 3)
ll.deleteFirst()
ll.deleteLast();ll.deleteLast();ll.deleteLast();
ll.display();
