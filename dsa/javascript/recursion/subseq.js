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
const subseqIteration = (currentSubSeq, start) => {
    if (currentSubSeq.length > 0) result.push([...currentSubSeq]);
    for (let i = start; i < v.length; i++) {
        currentSubSeq.push(v.charAt(i))
        subseq(i + 1, currentSubSeq)
        currentSubSeq.pop();
    }
}
subseqIteration([], 0)
console.log(result)