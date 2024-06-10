/*
Recursive Digit Sum - Hackerrank
Example - n 9875, k = 4
The number  is created by concatenating the string   times so the initial .
    superDigit(p) = superDigit(9875987598759875)
                  9+8+7+5+9+8+7+5+9+8+7+5+9+8+7+5 = 116
    superDigit(p) = superDigit(116)
                  1+1+6 = 8
    superDigit(p) = superDigit(8)
*/
// digital root remains same how much time you multiply
function superDigit(n, k) {        
        const getSuperDigit = (numString) => {
                if(numString.length === 1) return numString;
                let sum = 0;
                for(let i = 0;i<numString.length; i++) sum+=parseInt(numString.charAt(i));
                return getSuperDigit(sum.toString());
        }
        return getSuperDigit(getSuperDigit(n).repeat(k))
}
