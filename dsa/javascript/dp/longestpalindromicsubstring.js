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
// Center expansion
var longestPalindrome = function (s) {
    
const isPalindrome = (left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]){
         left--; right++;
    }
    return s.slice(left + 1, right)
}
    let longest = "";
    for (let i = 0; i < s.length; i++) {
        let oddPalindrome = isPalindrome(s, i, i)
        let evenPalindrome = isPalindrome(s, i, i + 1)
        let longestPalindrome = evenPalindrome.length > oddPalindrome.length ? evenPalindrome : oddPalindrome;
        if (longestPalindrome.length > longest.length) longest = longestPalindrome;
    }
    return longest;
};

// DP Solution
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function(s) {
    const n = s.length;
    if (n === 0) return "";

    let start = 0; // Starting index of the longest palindromic substring
    let maxLength = 1; // Length of the longest palindromic substring

    // Create a 2D DP table to store whether substrings are palindromes
    const dp = Array.from({ length: n }, () => Array(n).fill(false));

    // All substrings of length 1 are palindromes
    for (let i = 0; i < n; i++) {
        dp[i][i] = true;
    }

    // Check for substrings of length 2
    for (let i = 0; i < n - 1; i++) {
        if (s[i] === s[i + 1]) {
            dp[i][i + 1] = true;
            start = i;
            maxLength = 2;
        }
    }

    // Check for substrings of length > 2
    for (let length = 3; length <= n; length++) {
        for (let i = 0; i < n - length + 1; i++) {
            const j = i + length - 1; // Ending index of the current substring

            // Check if the current substring is a palindrome
            if (s[i] === s[j] && dp[i + 1][j - 1]) {
                dp[i][j] = true;

                // Update the longest palindromic substring found so far
                if (length > maxLength) {
                    start = i;
                    maxLength = length;
                }
            }
        }
    }

    // Return the longest palindromic substring
    return s.substring(start, start + maxLength);
};
