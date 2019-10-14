const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const url = "mongodb://127.0.0.1:27017";
const dbName = "retirement_db";
    
const retirementController = {
    // all
    get: (req, res) => {
        const mongoClient = new MongoClient(url);
        mongoClient.connect(function (err, result) {
            if (err) res.status(500).send(err);

            const people = result.db(dbName).collection("people");
            people.find().toArray(function (err, result) {
                if (err)
                    res.status(500).send(err);
                else
                    res.send(result);

                mongoClient.close();
            });
        });
    },
    // one
    getId: (req, res) => {
        let id = req.params.id;

        if (id) {
            const mongoClient = new MongoClient(url);
            mongoClient.connect(function (err, result) {
                if (err) res.status(500).send(err);

                const people = result.db(dbName).collection("people");
                people.findOne({_id: mongodb.ObjectID(id)}, function (err, result) {
                    if (err)
                        res.status(500).send(err);
                    else
                        res.send(result);

                    mongoClient.close();
                });
            });
        } else {
            res.sendStatus(500);
        }
    },
    // by gender
    getByGender: (req, res) => {
        let gender = req.params.gender;

        if (gender) {
            const mongoClient = new MongoClient(url);
            mongoClient.connect(function (err, result) {
                if (err) res.status(500).send(err);

                const people = result.db(dbName).collection("people");
                people.find().toArray(function (err, result) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        const maxBirthYear = new Date().getFullYear() - (gender == 'Man' ? 65 : 55);
                        res.send(result.filter(person => person.gender == gender && person.byear <= maxBirthYear));
                    }
                    mongoClient.close();
                });
            });
        } else {
            res.sendStatus(400);
        }
    },
    // add
    post: (req, res) => {
        let newPerson = JSON.parse(req.body.person);

        if (isValid(newPerson)) {
            const mongoClient = new MongoClient(url);
            mongoClient.connect(function (err, result) {
                if (err) res.status(500).send(err);

                const people = result.db(dbName).collection("people");
                people.insertOne(newPerson, function (err, result) {
                    if (err) 
                        res.status(500).send(err);
                    else
                        res.send(newPerson);

                    mongoClient.close();
                });
            });
        } else {
            res.sendStatus(400);
        }
    },
    deleteId: (req, res) => {
        let id = req.params.id;

        if (id) {
            const mongoClient = new MongoClient(url);
            mongoClient.connect(function (err, result) {
                if (err) res.status(500).send(err);

                const people = result.db(dbName).collection("people");
                people.findOneAndDelete({_id: mongodb.ObjectID(id)}, function (err, result) {
                    if (err) res.status(500).send(err);

                    if (result.value)
                        res.status(200).send(id + " has been deleted.");
                    else
                        res.status(418).send(id + " is not found.");

                    mongoClient.close();                        
                });
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