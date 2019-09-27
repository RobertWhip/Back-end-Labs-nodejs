const express = require("express");
const app = express();

app.use("/api/about", function(request, response){
    response.send("<h1>Шимон Роберт Тамашович</h1><h2>СА2</h2><h2>Варінт 9</h2><h3>27.09.2019</h3>");
});

app.use("/api/task1", function(req, res){
    res.send(`${req.query.n ? req.query.n.length : "<b>enter:</b>  localhost:3000/api/task1?n=[number]"}`);
});

app.use('/api/task2', function(req, res){
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

    let currentYear = new Date().getFullYear();
    let retirementAge = gender == 'Man' ? 65 : 55;
    res.send(people.filter(x => x.gender == gender &&
            currentYear - x.bdate.getFullYear() >= retirementAge));
});

app.listen(3000);
