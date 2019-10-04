const simplifier = require("./function_simplifier")

const cnf = (func) => {
    
    func = doCnfModifications(func)
    console.log("done")
    return func;
}

const doCnfModifications = (func) => {
    let key = Object.keys(func)[0];

    if (key == "*") {
        for (let i = 0; i < func[key].length; i++) {
            doCnfModifications(func[key][i])
        }

    } else if (key == "||") {
        outer:
        for (let i = 0; i < func[key].length; i++) {
            if (typeof func[key][i] === "string" || typeof func[key][i]["!"] === "string") {
                console.log("STRING: " + JSON.stringify(func[key][i]))
                for (let j = 0; j < func[key].length; j++) {
                    if (i == j) continue;
                    let innerKey = Object.keys(func[key][j])[0]

                    if (innerKey == "*") {
                        let temp = {"*": []};
                        for (let k = 0; k < func[key][j][innerKey].length; k++) {
                            temp["*"].push({"||":[func[key][i], func[key][j][innerKey][k]]})
                        }

                        func[key] = func[key].filter(x => ![func[key][i],func[key][j]].includes(x));
                        func[key].push(temp)

                        func = simplifier.deleteUselessOperations(func);
                        func = simplifier.openParentheses(func);
                        func = doCnfModifications(func)
                        break outer;
                    }
                }
            } else if (typeof func[key][i] === "object"){
                let innerKey = Object.keys(func[key][i])[0];

                // first conjuction
                if (innerKey == "*") {
                    for (let j = 0; j < func[key].length; j++) {
                        if (i == j) continue;
                        
                        // second conjuction
                        if (typeof func[key][j] === "object") {
                            let secondInnerKey = Object.keys(func[key][j])[0];
                            if (secondInnerKey == "*") {
                                
                                let temp = {"*": []};
                                func[key][i][innerKey].forEach(element => {
                                    temp["*"].push({"||": [element, func[key][j]]});
                                });
                                temp = doCnfModifications(temp)
                                func[key] = func[key].filter(x => ![func[key][i],func[key][j]].includes(x));
                                func[key].push(temp)
                                
                                func = simplifier.deleteUselessOperations(func);
                                func = simplifier.openParentheses(func);
                                func = doCnfModifications(func)
                                break outer;
                            }
                        }
                    }
                }
            } 
        }
    }
    console.log("Func:: " + JSON.stringify(func));
    return func;
}

const isControversial = (func) => {
    let disjuncts = getDisjuncts(func);
    let newDisjuncts = JSON.parse(JSON.stringify(disjuncts));
    let emptyDisjunctFound = false;
    let resultDisjuncts = JSON.parse(JSON.stringify(newDisjuncts)).map(x => {
        return x.length == 0 ? ["∅", ""]: (x.length == 1 ? [x[0], ""] : [{"||": x}, ""]);
    });

    for (let i = 0; i < disjuncts.length; i++) {
        for (let j = 0; j < disjuncts.length; j++) {
            if (i == j) continue;
            let comp = compare(disjuncts[i], disjuncts[j]);
            if (comp) {
                let ok = 0;
                for (let c = 0; c < disjuncts.length; c++) {
                    // remove identicals
                    disjuncts[c] = disjuncts[c].filter(function(elem, index, self) {
                        return index === self.indexOf(elem);
                    });
                    comp.func = comp.func.filter(function(elem, index, self) {
                        return index === self.indexOf(elem);
                    });

                    //console.log(JSON.stringify(disjuncts[c]) + "   !=    " + JSON.stringify(comp.func))
                
                    let temp0 = JSON.parse(JSON.stringify(disjuncts[c])).map(x => JSON.stringify(x)); 
                    let temp1 = JSON.parse(JSON.stringify(comp.func)).map(x => JSON.stringify(x));

                    let paramsEqual = 0;
                    for (let o = 0; o < temp0.length; o++) {
                        if (temp1.includes(temp0[o]))
                            paramsEqual++;
                    }
                    if (paramsEqual != temp0.length) {
                        ok++;
                    }
                }
                //console.log("ok:"+ok + "   len:"+disjuncts.length)
                if (ok == disjuncts.length)
                    newDisjuncts.push(comp.func);
                

                let replaces = "  (" + (i+1) + ", " + (j+1) + comp.replaces+")";
                resultDisjuncts.push(comp.func.length == 0 ? ["∅", replaces]: 
                            (comp.func.length == 1 ? [comp.func[0], replaces]:
                            [{"||": comp.func}, replaces]));
                
                if (comp.func.length == 0) {
                    emptyDisjunctFound = true;
                    break;
                }
            }
        }
        if (emptyDisjunctFound) break;
        if (newDisjuncts.length > disjuncts.length) {
            disjuncts = JSON.parse(JSON.stringify(newDisjuncts));
            i = 0;
        }
    }
    return {emptyDisjunctFound, disjuncts: resultDisjuncts};
}

const compare = (func0, func1) => {
    for (let i = 0; i < func0.length; i++) {
        for (let j = 0; j < func1.length; j++) {
            if (typeof func0[i] === "object" && typeof func1[j] === "string") {
                if (func0[i]["!"].substring(0, func0[i]["!"].indexOf("(")) == func1[j].substring(0, (""+func1[j]).indexOf("("))) {
                    let params0 = func0[i]["!"].substring(func0[i]["!"].indexOf("(")+1, func0[i]["!"].length-1).split(",");
                    let params1 = func1[j].substring(func1[j].indexOf("(")+1, func1[j].length-1).split(",");
                    let constRegExp = new RegExp("a[0-9]+_");
                    let replaces = [];
                    let strReplaces = "";
                    let ok = 0;
                    if (params0.length - params1.length == 0) {
                        for (let c = 0; c < params0.length; c++) {
                            let isParam0Const = constRegExp.test(params0[c]);
                            let isParam1Const = constRegExp.test(params1[c]);

                            if (params0[c] == params1[c]) {
                                ok++;
                            } else if (isParam0Const && !isParam1Const) {
                                replaces.push([params1[c], params0[c]]);
                                ok++;
                            } else if (!isParam0Const && isParam1Const) {
                                replaces.push([params0[c], params1[c]]);
                                ok++;
                            }
                        }

                        
                        if (params0.length == ok) {
                            let newFunc0 = JSON.parse(JSON.stringify(func0));
                            let newFunc1 = JSON.parse(JSON.stringify(func1));
                            for (let k = 0; k < replaces.length; k++) {
                                newFunc0 = JSON.parse(JSON.stringify(newFunc0).replace(new RegExp(replaces[k][0], "g"), replaces[k][1]));
                                newFunc1 = JSON.parse(JSON.stringify(newFunc1).replace(new RegExp(replaces[k][0], "g"), replaces[k][1]));
                                strReplaces += ", " + replaces[k][0] + "->" + replaces[k][1];
                            }
                            
                            let newFunc = [];
                            for (let k = 0; k < func0.length; k++) {
                                if (k != i)
                                    newFunc.push(func0[k]);
                            }
                            for (let k = 0; k < func1.length; k++) {
                                if (k != j)
                                    newFunc.push(func1[k]);
                            }
                            return {func: newFunc, replaces:strReplaces};
                        }
                    }
                }
            } 
        }
    }
    return undefined;
}

const getDisjuncts = (func) => {
    if (func["*"])
        return func["*"].map(x => { return x["||"] ? x["||"] : [x]});
    console.error("The function is not CNF.");
    return undefined;
}

module.exports = {
    cnf,
    isControversial
}