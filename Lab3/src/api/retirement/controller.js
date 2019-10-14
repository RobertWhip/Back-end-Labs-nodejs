const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const url = "mongodb://127.0.0.1:27017";
const dbName = "retirement_db";

const personScheme = new Schema({
    name: String,
    gender: String,
    byear: Number,
    education: String,
    spec: String,
    accountingYear: Number
});


mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true});
const Person = mongoose.model("people", personScheme);
    
const retirementController = {
    // all
    get: (req, res) => {
        console.log("return all objects");
        Person.find({}, function (err, docs) {
            if (err)
                res.status(500).send(err);
            else
                res.send(docs);
        });
    },
    // one
    getId: (req, res) => {
        let id = req.params.id;

        if (id) {
           Person.findById(id, function (err, docs) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    res.send(docs);
                }
           });
        } else {
            res.sendStatus(400);
        }
    },
    // by gender
    getByGender: (req, res) => {
        let gender = req.params.gender;

        if (gender) {
            Person.find({}, function (err, docs) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    const maxBirthYear = new Date().getFullYear() - (gender == 'Man' ? 65 : 55);
                    res.send(docs.filter(person => person.gender == gender && person.byear <= maxBirthYear));
                }
            })
        } else {
            res.sendStatus(400);
        }
    },
    // add
    post: (req, res) => {
        console.log(req.body);
        let newPerson = req.body;

        if (isValid(newPerson)) {
            const person = new Person(newPerson);
            person.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send(err.message);
                } else {
                    console.log("saved", person);
                    res.send(newPerson);
                }
                
            });
        } else {
            res.sendStatus(400);
        }
    },
    deleteId: (req, res) => {
        let id = req.params.id;

        if (id) {
            Person.findByIdAndDelete(id, function (err, doc) {
                if (err) {
                    console.log(err);
                    res.send(err.message);
                } else {
                    res.send(doc);
                }
            });
        } else {
            res.sendStatus(400);
        }
    }
}

//{name:'', gender:'', byear:2019, education:'', spec:'', accounting:2019}
const isValid = (person) => {
    return person && person.name && person.gender && person.byear && person.education && person.spec && person.accountingYear;
}

module.exports = {
    retirementController
};