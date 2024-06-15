const subseq = (processed, unProcessed, result = []) =>{
    if(!unProcessed) {
        return [processed]
    }
    let withFirstChar = subseq(processed + unProcessed.charAt(0), unProcessed.substring(1))
    let withoutFirstChar = subseq(processed, unProcessed.substring(1))
    return withFirstChar.concat(withoutFirstChar);
}

console.log(subseq("", "abc"));

const v = "abc"
const result = [];
const subseqIteration = (index, arr) => {
    if (arr.length > 0) result.push([...arr]);
    for (let i = index; i < v.length; i++) {
        arr.push(v.charAt(i))
        subseq(i + 1, arr)
        arr.pop();
    }
}
subseqIteration(0, [])
console.log(result)