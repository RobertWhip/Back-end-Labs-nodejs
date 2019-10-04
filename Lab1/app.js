const function_ = require("./function");
const simplifier = require("./function_simplifier");
const normal_form = require("./normal_form")
const express = require("express");
const app = express();

// localhost:3000/api/about
app.use("/api/about", function(request, response){
    response.send("<h1>Шимон Роберт Тамашович</h1><h2>СА2</h2><h2>Варінт 9</h2><h3>27.09.2019</h3>");
});

// localhost:3000/api/task1?n=123
app.use("/api/task1", function(req, res){
    res.send(`${req.query.n ? req.query.n.length : "<b>Error.</b> Enter: localhost:3000/api/task1?n=[number]"}`);
});

// localhost:3000/api/task2?gender=Man
app.use('/api/task2', function(req, res){
    if (!req.query.gender)
        res.send("<b>Error.</b> Enter: localhost:3000/api/task2?gender=[Man|Woman]");
        
    let gender = req.query.gender.toString();
    let people = [
        {name:'John S.', gender:'Man', bdate:new Date(1952,1,0,0,0,0,0), education:'Average', spec:'Technician', accounting:new Date(2002)},
        {name:'Abby S.', gender:'Woman', bdate:new Date(2000,1,0,0,0,0,0), education:'High', spec:'Statistics', accounting:undefined},
        {name:'Jacob S.', gender:'Man', bdate:new Date(1990,1,0,0,0,0,0), education:'High', spec:'Statistics', accounting:undefined},
        {name:'Mary J.', gender:'Woman', bdate:new Date(1963,1,0,0,0,0,0), education:'Average', spec:'Cooker', accounting:new Date(2009)},
        {name:'Peter P.', gender:'Man', bdate:new Date(1945,1,0,0,0,0,0), education:'High', spec:'System analysis', accounting:new Date(2004)},
        {name:'Elizabeth K.',gender:'Woman', bdate:new Date(1957,1,0,0,0,0,0), education:'High', spec:'Mathematician', accounting:new Date(1999)},
        {name:'Abbey S.', gender:'Woman', bdate:new Date(1995,1,0,0,0,0,0), education:'High', spec:'Statistics', accounting:undefined}
    ];

    // retirement
    let maxBirthYear = new Date().getFullYear() - (gender == 'Man' ? 65 : 55);
    res.send(people.filter(x => x.gender == gender && x.bdate.getFullYear() <= maxBirthYear));
});

app.listen(3000);
