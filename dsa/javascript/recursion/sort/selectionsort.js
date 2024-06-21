const selectionSort = (arr, r, c, max) => {
    if (r === 0) return; // Base case: if only one element is left, the array is sorted

    if (c < r) {
        if (arr[c] > arr[max]) selectionSort(arr, r, c+1, c);
        else selectionSort(arr, r, c+1, max);
    } else {
        [arr[max], arr[r-1]] = [arr[r-1], arr[max]]
        selectionSort(arr, r - 1, 0, 0);
    }
}

let arr = [5,4,3,2,1]
selectionSort(arr, arr.length, 0, 0)
console.log(arr)