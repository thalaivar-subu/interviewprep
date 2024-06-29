/**
 * @param {string} s
 * @return {number}
 * Example 1:
Input: s = "abc"
Output: 3
Explanation: Three palindromic strings: "a", "b", "c".
Example 2:
Input: s = "aaa"
Output: 6
Explanation: Six palindromic strings: "a", "a", "a", "aa", "aa", "aaa".
 */
// Center Expansion
var countSubstrings = function (s) {
    let count = 0;
    const isPalindrome = (left, right) => {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            count++;
            left--; right++;
        }
    }
    for(let i=0;i<s.length;i++){
        isPalindrome(i, i);
        isPalindrome(i, i+1);
    }
    return count;
};

// DP Solution
var countSubstrings = function(s) {
    const n = s.length;
    let count = 0;

    // Create a DP table to store palindrome status
    const dp = Array.from({ length: n }, () => Array(n).fill(false));

    // All substrings of length 1 are palindromes
    for (let i = 0; i < n; i++) {
        dp[i][i] = true;
        count++;
    }

    // Check for substrings of length 2
    for (let i = 0; i < n - 1; i++) {
        if (s[i] === s[i + 1]) {
            dp[i][i + 1] = true;
            count++;
        }
    }

    // Check for substrings of length > 2
    for (let length = 3; length <= n; length++) {
        for (let i = 0; i < n - length + 1; i++) {
            const j = i + length - 1; // Ending index of the current substring

            // Check if the current substring is a palindrome
            if (s[i] === s[j] && dp[i + 1][j - 1]) {
                dp[i][j] = true;
                count++;
            }
        }
    }

    // Return the count of palindromic substrings
    return count;
};