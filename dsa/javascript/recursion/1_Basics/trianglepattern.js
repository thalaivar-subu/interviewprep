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