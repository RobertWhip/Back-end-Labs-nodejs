const express = require('express');
const controller = require('./controller');
const apiRouter = new express.Router();

apiRouter.get('/average_female_salary', controller.departmentRecordController.getAverageFemaleSalary);
apiRouter.get('/', controller.departmentRecordController.get);
apiRouter.post('/', controller.departmentRecordController.post);

module.exports = {
    apiRouter
}