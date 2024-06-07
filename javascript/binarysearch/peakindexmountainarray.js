/*
* https://leetcode.com/problems/peak-index-in-a-mountain-array/description/
*
*
Example 1:
Input: arr = [0,1,0]
Output: 1
Example 2:
Input: arr = [0,2,1,0]
Output: 1
Example 3:
Input: arr = [0,10,5,2]
Output: 1
*/

/**
 * @param {number[]} arr
 * @return {number}
 */
var peakIndexInMountainArray = function(arr) {
    let start = 0;
    let end = arr.length - 1;
    while(start<end){
        let mid = Math.floor(start +(end-start)/2);
        if(arr[mid] > arr[mid+1]) end = mid;
        else start = mid + 1;
    }
    return start;
};
