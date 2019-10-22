const express = require('express');
const departmentRecords = require('./department_records');
const router = new express.Router();

router.use('/department', departmentRecords.apiRouter);

module.exports = {
    router
};