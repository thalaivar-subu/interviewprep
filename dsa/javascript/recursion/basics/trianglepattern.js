// O(r^2) time, O(r^2) space (output string)
// LINEAR - recursion used as a loop, prints only
const triangle = (r, c, result = "") => {
    if(r===0) return result;
    if(c<r) {
        result+='*';
        return triangle(r, c+1, result);
    }
    else{
        result+='\n'
        return triangle(r - 1, 0, result);
    }
}

console.log(triangle(4, 0))