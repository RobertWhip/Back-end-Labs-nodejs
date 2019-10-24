'use strict'

const Joi = require('@hapi/joi');

const schemas = {
    pupil: Joi.object({
        name: Joi.string().required(),
        class_id: Joi.number().required(),
        birthdate: Joi.date().required()
    }),
    teacher: Joi.object({
        name: Joi.string().required(),
        subject_id: Joi.number().required(),
        birthdate: Joi.date().required()
    }),
    grade: Joi.object({
        grade: Joi.number().min(1).max(5).required(),
        teacher_id: Joi.number().required(),
        pupil_id: Joi.number().required(),
        date: Joi.date()
    })
};

module.exports = {
    schemas
};