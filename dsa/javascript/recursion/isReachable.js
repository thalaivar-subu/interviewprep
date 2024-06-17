// FW Staff Eng - Systems Question

const isReachable = (arr) => {
    const helper = (arr, index) => {
        if (index >= arr.length - 1) return true;
        if (arr[index] === 0) return false;
        
        for (let i = 1; i <= arr[index]; i++) {
            if (helper(arr, index + i)) {
                return true;
            }
        }
        
        return false;
    }
    
    return helper(arr, 0);
}

console.log(isReachable([2, 2, 0, 1, 1, 4])); // true
console.log(isReachable([2, 1, 0, 1, 1, 4])); // false
console.log(isReachable([2, 3, 0, 1, 0, 4])); // true
console.log(isReachable([3, 4, 0, 0, 1, 2, 0, 3, 0, 0, 4])); // true
