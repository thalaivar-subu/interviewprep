/**
 * @param {string} s
 * @return {string}
 * O(n2)
 * Example 1:
https://leetcode.com/problems/longest-palindromic-substring/description/
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
Example 2:

Input: s = "cbbd"
Output: "bb"
 
 */
var longestPalindrome = function (s) {
    let longest = "";
    for (let i = 0; i < s.length; i++) {
        let oddPalindrome = isPalindrome(s, i, i)
        let evenPalindrome = isPalindrome(s, i, i + 1)
        let longestPalindrome = evenPalindrome.length > oddPalindrome.length ? evenPalindrome : oddPalindrome;
        if (longestPalindrome.length > longest.length) longest = longestPalindrome;
    }
    return longest;
};

const isPalindrome = (s, left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]){
         left--; right++;
    }
    return s.slice(left + 1, right)
}