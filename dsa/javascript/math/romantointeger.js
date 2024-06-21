/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function(s) {
    let result = 0;
    const symbolMap = new Map([
        ["I", 1],
        ["V", 5],
        ["X", 10],
        ["L", 50],
        ["C", 100],
        ["D", 500],
        ["M", 1000]
    ])
    for(let i=0; i<s.length; i++){
        let fc = s.charAt(i);
        let nc = s.charAt(i+1);
        if(symbolMap.get(fc) < symbolMap.get(nc)){
            result += symbolMap.get(nc) - symbolMap.get(fc)
            i++;
        } else result+=symbolMap.get(fc)
    }
    return result;
};