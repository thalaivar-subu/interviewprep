const nextGreater = (nums) => {
    const stack = [];
    const result = new Array(nums.length).fill(-1);

    for(let i = 0;i<nums.length;i++){
        while(stack.length > 0 && nums[stack[stack.length -1]] < nums[i]){
            const prevIndex = stack.pop();
            result[prevIndex] = nums[i]
        }
        stack.push(i);
    }
    return result;
};


/**
 * Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]
https://leetcode.com/problems/daily-temperatures/description/
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
    const stack = [];
    const result = new Array(temperatures.length).fill(0);

    for (let i = 0; i < temperatures.length; i++) {
        while (stack.length > 0 && temperatures[stack[stack.length - 1]] < temperatures[i]) {
            const prevIndex = stack.pop();
            result[prevIndex] = i - prevIndex;
        }
        stack.push(i);
    }
    return result;
}

console.log(nextGreater([4, 5, 2, 25])); // [5, 25, 25, -1]
console.log(nextGreater([5, 7, 1, 2, 6, 0])); // [7, -1, 2, 6, -1, -1]
console.log(nextGreater([5, 2, 1, 3, 7])); // [7, 3, 3, 7, -1]