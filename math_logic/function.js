const parse = (strF, swaps) => {
    let swapped = parentheseSwap(strF, swaps);
    return operationSeq(swapped);
}

/*
    {"!":{"=>":[{"Ax":{"=>":["P(x)","Q(x)"]}},{"=>":[{"Ax":"P(x)"},{"Ax":"Q(x)"}]}]}}
    !( Ax(P(x)=>Q(x)) => (AxP(x) => AxQ(x)) )                                       */
const stringify = (func) => {
    let key = Object.keys(func)[0];
    let strFunc = ""; 

    if (key == "!" || key[0] == "A" || key[0] == "E"){
        if (typeof func[key] === "object")
            strFunc = key + "(" + stringify(func[key]) + ")";
        else 
            strFunc = key + func[key];
    } else if (key == "*" || key == "||" || key == "=>" || key == "<=>") {
        for (let i = 0; i < func[key].length; i++)
            func[key][i] = stringify(func[key][i]);
        strFunc = "(" + func[key].join(key) + ")";
    } else if (typeof func === "string"){
        return func;
    }

    return strFunc;
}

findSwap = (pid, pswaps) => {
    for (let i = 0; i < pswaps.length; i++) {
        if (pswaps[i][pid]) {
            return pswaps[i][pid];
        }
    }
}

parseSequence = (seq, swaps) => {
    for (let i = 0; i < seq.length; i++) {
        if (seq[i][0] == 's') {
            seq[i] = parse(findSwap(seq[i], swaps), swaps);
        } else {
            seq[i] = parse(seq[i], swaps);
        }
    }
    return seq;
}

operationSeq = (swappedF) => {
    let f = swappedF[0];
    let swaps = swappedF[1];
    let treeF = {};
    

    if (f.includes("<=>")) {
        let eqSeq = f.split("<=>");
        eqSeq = parseSequence(eqSeq, swaps);
        treeF["<=>"] = eqSeq;

    } else if (f.includes("=>")) {
        let impSeq = f.split("=>");
        impSeq = parseSequence(impSeq, swaps);
        treeF["=>"] = impSeq;

    } else if (f.includes("||")) {
        let orSeq = f.split("||");
        orSeq = parseSequence(orSeq, swaps);
        treeF["||"] = orSeq;

    } else if (f.includes("*")){
        let andSeq = f.split("\*");
        andSeq = parseSequence(andSeq, swaps);
        treeF["*"] = andSeq;

    } else { 
        let hasQuanters = new RegExp("^[AE][a-z]");
        if (f[0] == '!') {
            if(f[1] == 's')
                treeF = {'!': parse(findSwap(f.substring(1, f.length),swaps),swaps)}//parse(swaps[0][f.substring(1, f.length)], swaps)};
            else
                treeF = {'!': parse(f.substring(1, f.length))};
        } else if(hasQuanters.test(f)) { // Ax12P(x12)
            let isCapital = new RegExp("[A-Z]|s");
            let end = 0;
            
            for (let i = f.length-1; i >= 0; i--)
                if (isCapital.test(f[i])) {
                    end = i;
                    break;
                }

            treeF = {[f.substring(0, end)]: parse(f.substring(end, f.length), swaps)};

        } else {
            if(f[0] == 's')
                treeF = parse(findSwap(f, swaps),swaps)//parse(swaps[0][f.substring(0, f.length)],swaps);
            else
                treeF = f; 
        }
    }

    return treeF;
}

parentheseSwap = (f, swaps=[]) => {
    let swapCount = swaps.length;
    let newStr = '';
    let parentheseStart = false;
    let innerParentheses = 0;
    let startIndex = -1;
    let isCapitalLetter = new RegExp("[A-Z]")

    for (let q = 0; q < f.length; q++) {
        if (f[q] == '(') {
            if (!parentheseStart) {
                if (!isCapitalLetter.test(f[q - 1])) {
                    parentheseStart = true;
                    startIndex = q;
                    continue;
                }
            } else {
                innerParentheses++;
                continue;
            }
        } else if (f[q] == ')') {
            if (innerParentheses > 0) {
                innerParentheses--;
                continue
            } else if (parentheseStart) {
                parentheseStart = false;
                newStr += 's' + swapCount;

                swaps.push({ ['s' + swapCount]: f.substring(startIndex + 1, q) })
                swapCount++;
                continue;
            }
        }
        if (!parentheseStart) {
            newStr += f[q];
        }
    }

    
    let res = [newStr, swaps];
    return res;
}


module.exports = {
    parse,
    stringify
} 
