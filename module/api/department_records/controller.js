const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const url = 'mongodb://127.0.0.1:27017';
const dbName = "department_records";
const workerScheme = new Schema({
    name: String,
    department: String,
    position: String,
    gender: String,
    experience: String,
    salary: Number
});

mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const Worker = mongoose.model("workers", workerScheme);

const departmentRecordController = {
    get: function (req, res) {
        const page = Number.parseInt(req.query.page);
        const recordCount = Number.parseInt(req.query.records) || 5;
        Worker.find({}, function (err, docs) {
            if (err)
                res.sendStatus(500);
            else {
                if (page) {
                    const begin = (page-1) * recordCount;
                    const end = begin + recordCount;
                    res.send(docs.slice(begin, end));
                } else {
                    res.send(docs);
                }
            }
        });
    },
    getAverageFemaleSalary: function (req, res) {
        const department = req.query.department;
        Worker.find({}, function (err, docs) {
            if (err)
                res.sendStatus(500);
            else {
                const female = docs.filter(elem => elem.gender === 'Female' && elem.department === department);
                let sum = 0;
                female.map(elem => {sum+= elem.salary});
                res.json((sum/female.length).toFixed(2));
            }
        });
    },
    post: function (req, res) {
        let newWorker = req.body;

        if (isValidData(newWorker)) {
            const worker = new Worker(newWorker);
            worker.save(function (err) {
                if (err) {
                    console.log(err);
                    res.send(err.message);
                } else {
                    console.log('saved', worker);
                    res.send(newWorker);
                }
            });
        } else {
            res.sendStatus(400);
        }
    }
};

isValidData = (worker) => {
    return worker && worker.name && worker.department && worker.position &&
        worker.gender && worker.experience && worker.salary;
}

module.exports = {
    departmentRecordController
};