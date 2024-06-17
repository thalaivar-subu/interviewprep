// https://leetcode.com/problems/roman-to-integer/
/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function(s) {
    let number = 0;
    const sym = { 
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    }
    for(let i=0;i<s.length;i++){
        if(sym[s[i]] < sym[s[i+1]]){
            number+=  sym[s[i+1]] - sym[s[i]] 
            i++
        } else number+=sym[s[i]]
    }
    return number
};