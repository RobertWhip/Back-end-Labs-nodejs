const hasQuantizers = new RegExp("^[AE][a-z]");

const simplify = (func) => {
    let history = [];
    globalIndex = 0;
    func = doImpsAndEqs(func);
    history.push(JSON.parse(JSON.stringify(func)));
    //console.log("imps and eqs: " + JSON.stringify(func) + "\n");
    func = doNegatives(func);
    history.push(JSON.parse(JSON.stringify(func)));
    //console.log("negatives: " + JSON.stringify(func) + "\n");
    func = removeAllQuantizers(func, "A");
    history.push(JSON.parse(JSON.stringify(func)));
    console.log("remove quantsA: " + JSON.stringify(func) + "\n");
    func = replaceExistQuantizers(func);
    history.push(JSON.parse(JSON.stringify(func)));
    console.log("replace exists: " + JSON.stringify(func) + "\n");
    func = removeAllQuantizers(func, "E");
    history.push(JSON.parse(JSON.stringify(func)));
    //console.log("remove quentsE: " + JSON.stringify(func) + "\n");
    func = removeIdenticals(func);
    history.push(JSON.parse(JSON.stringify(func)));
    //console.log("remove ident: " + JSON.stringify(func) + "\n");
    func = openParentheses(func);
    history.push(JSON.parse(JSON.stringify(func)));
    //console.log("parentheeses: " + JSON.stringify(func) + "\n");


   /*
    let test = {"||": 
                    [
                        {"Ex":"P(x)"},
                        {"Ex":
                            {"||":
                                [
                                    "Q(x)", "R(y)", {"Ey": "T(y)"}
                                ]
                            }
                        },
                        {"Ey":"F(y)"}
                    ]
                };
    test = replaceExistQuantizers(test);

    console.log("TESTED:::" + JSON.stringify(test));
    test = removeAllQuantizers(test, "E");
    console.log("TESTED:::" + JSON.stringify(test));
    */
    return {func, history};
};

const deleteUselessOperations = (func) => {
    let key = Object.keys(func)[0];
    
    if (Array.isArray(func[key])) {
        if (func[key].length == 1) {
            func = deleteUselessOperations(func[key][0]);
        } else {
            for (let i = 0; i < func[key].length; i++) {
                func[key][i] = deleteUselessOperations(func[key][i]);
            }
        }
    }

    return func
}

const removeIdenticals = (func) => {
    let key = Object.keys(func)[0];
    if (key == "*" || key == "||"){
        func[key] = func[key].filter(function(elem, index, self) {
            return index === self.indexOf(elem);
        });

        for (let i = 0; i < func[key].length; i++) {
            if (typeof func[key][i] === "object") {
                func[key][i] = removeIdenticals(func[key][i]);
            }
        }
    }

    return func;
}

const removeAllQuantizers = (func, quantizer) => {
    let key = Object.keys(func)[0];

    if (key[0] == quantizer) {
        func = func[key];
    } else if (Array.isArray(func[key])) {
        for (let i = 0; i < func[key].length; i++) {
            if (typeof func[key][i] === "object")
                func[key][i] = removeAllQuantizers(func[key][i], quantizer);
        }
    }

    return func;
};


const findConstByVar = (variable) => {
    for (let i = 0; i < vars.length; i++) {
        if (vars[i][variable]) {
            return vars[i][variable];
        }
    }

    return undefined;
}

let globalIndex = 0;
let vars = [];
const replaceExistQuantizers = (func) => {
    let key = Object.keys(func)[0];
    let innerKey = Object.keys(func[key])[0]
    if (Array.isArray(func[key][innerKey]))
        func[key] = replaceExistQuantizers(func[key])
    if (key[0] == "E") {
        let variable = key.substring(1, key.length)
        let const_ = undefined;
        
        let savedConst = findConstByVar(variable);
        if (savedConst) {
            const_ = savedConst;
        } else {
            const_ = "a"+globalIndex +"_";
            vars.push({[variable]: const_});
            globalIndex++;
        }

        func = JSON.parse(JSON.stringify(func[key]).replace(new RegExp(variable,"g"), const_));
        
    } else if (Array.isArray(func[key])) {
        for (let i = 0; i < func[key].length; i++) {
            if (typeof func[key][i] === "object") {
                func[key][i] = replaceExistQuantizers(func[key][i]);
                
            }
        }
    }

    return func;
};

const openAllQuantizers = (func) => {
    let key = Object.keys(func)[0];

    if (hasQuantizers.test(key)) {
        func = openQuantizer(func);
    } else if (Array.isArray(func[key])) {
        for (let i = 0; i < func[key].length; i++) {
            if (typeof func[key][i] === "object")
                func[key][i] = openAllQuantizers(func[key][i]);
        }
    }

    return func;
};

const openParentheses = (func) => {
    let key = Object.keys(func)[0];
    if (key == "*" || key == "||") {
        for (let i = 0; i < func[key].length; i++) {
            let innerKey = Object.keys(func[key][i])[0];
            
            if (innerKey == key) {
                func[key][i][innerKey].forEach(element => {
                    func[key].push(openParentheses(element));
                });
                func[key].splice(i, 1);
                func = openParentheses(func)
            } else if (typeof func[key][i] === "object") {
                func[key][i] = openParentheses(func[key][i]);
            }
        }
    }
    return func;
};

const doNegatives = (func) => {
    if (func instanceof String) return func;
    let key = Object.keys(func)[0];

    if (Array.isArray(func[key])) {
        for (let i = 0; i < func[key].length; i++) {
            func[key][i] = doNegatives(func[key][i]);
        }
    } else if (func[key] instanceof Object){
        func[key] = doNegatives(func[key]);
    }

    if (key == "!") {
        func = negative(func);
    }

    return func;
};

const doImpsAndEqs = (func) => {
    if (func instanceof String) return func;
    let key = Object.keys(func)[0];

    if (Array.isArray(func[key]))
        for (let i = 0; i < func[key].length; i++)
            func[key][i] = doImpsAndEqs(func[key][i]);
    else if (func[key] instanceof Object)
        func[key] = doImpsAndEqs(func[key])
    
    if (key == "=>")
        func = implication(func);
    else if (key == "<=>")
        func = equivalence(func);
    
    return func;
}

const implication = (impl) => { // {=>: [P, Q]} -> {||: [{!: P}, Q]}
    return {"||":[
                {"!": impl["=>"][0]},
                impl["=>"][1]
            ]};
};

const equivalence = (eq) => { // {<=>: [P, Q]} -> {||: [{"*":[P,Q]}, {"*", [{!:P},{!:Q}]}] }
    return {"||":[
                {"*":[
                    eq["<=>"][0],
                    eq["<=>"][1]
                ]},
                {"*":[
                    {"!": eq["<=>"][0]},
                    {"!": eq["<=>"][1]}
                ]}
            ]};
};


const negative = (func) => {
    if (!func["!"]) {
        return func
    }

    if (func["!"]["!"]) {
        return negative(func["!"]["!"]);
    
    } else if (func["!"]["*"]) {
        return {"||": func["!"]["*"].map(elem => {return negative({"!": elem})})};
    
    } else if (func["!"]["||"]){
        return {"*": func["!"]["||"].map(elem => {return negative({"!": elem})})};
    
    } else {
        let temp = func["!"];
        let key = Object.keys(temp)[0];

        if (hasQuantizers.test(key)) {
            if (key[0] == "A")
                return {["E"+key.substring(1,key.length)]: negative({"!": func["!"][key]})};
            else
                return {["A"+key.substring(1,key.length)]: negative({"!": func["!"][key]})};
        }
        return func;
    }
};

const openQuantizer = (func) => {
    let quantizer = Object.keys(func)[0];
    let quantizerValue = Object.keys(func[quantizer])[0];
    if (typeof func[quantizer][quantizerValue] === "string")
        return func;
    return {[quantizerValue]: func[quantizer][quantizerValue].map(elem => { return {[quantizer]: elem}})};
};

module.exports = {
    simplify,
    openParentheses,
    deleteUselessOperations,
    removeIdenticals
};