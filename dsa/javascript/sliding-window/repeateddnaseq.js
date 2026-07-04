/**
187. Repeated DNA Sequences
Solved
Medium
Topics
premium lock icon
Companies
The DNA sequence is composed of a series of nucleotides abbreviated as 'A', 'C', 'G', and 'T'.

For example, "ACGAATTCCG" is a DNA sequence.
When studying DNA, it is useful to identify repeated sequences within the DNA.

Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule. You may return the answer in any order.

 

Example 1:

Input: s = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"
Output: ["AAAAACCCCC","CCCCCAAAAA"]
Example 2:

Input: s = "AAAAAAAAAAAAA"
Output: ["AAAAAAAAAA"]
 

Constraints:

1 <= s.length <= 105
s[i] is either 'A', 'C', 'G', or 'T'.
 */
/**
 * https://leetcode.com/problems/repeated-dna-sequences/
 * @param {string} s
 * @return {string[]}
 * O(n) time, O(n) space
 */
var findRepeatedDnaSequences = function (s) {
    let seen = new Set(); let result = new Set();
    let l = 0;
    while (l < s.length - 9) {
        let current = s.slice(l, l + 10);
        if (seen.has(current)) result.add(current)
        else seen.add(current)
        l++;
    }
    return Array.from(result);
};