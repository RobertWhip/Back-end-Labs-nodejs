const function_ = require("./function");
const simplifier = require("./function_simplifier");
const normal_form = require("./normal_form")
const express = require("express");
const app = express();


app.use('/api/resolution_method/:f', function(req, res) {
    let inp = req.params.f;
    // res.send(req.query.f);
    let result = "Функція f -  "+ inp + "<br><br>";
    let strF = "!(" + inp+ ")".replace(/ /g, '');

    console.log("Entered function: "+ strF+"\n")

    let f = function_.parse(strF)
    console.log("Parsed function: " + JSON.stringify(f));
    console.log("Stringified: " + function_.stringify(JSON.parse(JSON.stringify(f))));

    //console.log();
    simplified = simplifier.simplify(f)
    f = simplified.func;
    //console.log("Simplified f: " + JSON.stringify(f));
    console.log("Simplified: " + function_.stringify(JSON.parse(JSON.stringify(f))));
    result += "!f =  " + function_.stringify(JSON.parse(JSON.stringify(f))) + " =";
    console.log();
    
    for (let i = 0; i < simplified.history.length; i++) {
        simplified.history[i] = function_.stringify(simplified.history[i]);
    }
    simplified.history = simplified.history.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
    });
    simplified.history.forEach(element => {
        result += "<br> = " + element +" = ";
    });

    f = normal_form.cnf(f);
    //console.log("CNF: " + JSON.stringify(f));
    console.log("CNF: " + function_.stringify(JSON.parse(JSON.stringify(f))));
    result += "<br><br>КНФ -  "+ function_.stringify(JSON.parse(JSON.stringify(f))) + "<br><br>";
    console.log();
    f = simplifier.deleteUselessOperations(f);
    console.log("after deletion: " + JSON.stringify(f))
    console.log("stringified fd: " + function_.stringify(JSON.parse(JSON.stringify(f))) + "\n");
    
    f = simplifier.openParentheses(f);
    mf = normal_form.isControversial(f)

    for (let i = 0; i < mf.disjuncts.length; i++) {
        console.log((i+1) + ") " + function_.stringify(mf.disjuncts[i][0]) +mf.disjuncts[i][1]);
        result += (i+1) + ") " + function_.stringify(mf.disjuncts[i][0]) +mf.disjuncts[i][1] + "<br>"
    }

    result += "<br>"

    if (mf.emptyDisjunctFound) {
        console.log("The function is generally significant");
        result += "В: Диз'юнкт ∅ побудовано. M!f - суперечлива, !f - суперечлива, а отже f - загальнозначима.";
    } else {
        console.log("The function is not generally significant");
        result += "В: Диз'юнкт ∅ побудувати не можна. M!f - не суперечлива, !f - не суперечлива, а отже f - не загальнозначима.";
    }
    res.send(result);
    /*
    //let test = "(P(a1_)*!Q(a1_))||(P(x)*!Q(a1_))"
    
    let test = {"||": [
        {"*": ["A(x)", "B(x)"]},
        {"*": ["C(x)", "D(x)"]},
        {"*": ["C(x)", "D(x)"]},
        "S(x)"
    ]};

    test = normal_form.cnf(test)
    console.log("CNF: " + JSON.stringify(test))
    console.log("stf: " + function_.stringify(JSON.parse(JSON.stringify(test))) + "\n");

    */    
});


app.listen(3000);
