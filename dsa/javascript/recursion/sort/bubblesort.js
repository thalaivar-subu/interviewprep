const bubbleSort = (arr, r, c) => {
    if (r === 0) return; // Base case: if only one element is left, the array is sorted

    if (c < r) {
        if (arr[c] > arr[c + 1]) {
            // Swap elements if they are in the wrong order
            [arr[c], arr[c + 1]] = [arr[c + 1], arr[c]];
        }
        // Move to the next pair
        bubbleSort(arr, r, c + 1);
    } else {
        // Restart from the first pair, reduce the effective array size by 1
        bubbleSort(arr, r - 1, 0);
    }
}

let arr = [5,4,3,2,1]
bubbleSort(arr, arr.length - 1, 0)
console.log(arr)