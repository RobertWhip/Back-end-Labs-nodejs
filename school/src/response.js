'use strict'

const knex = require('./knex');
const boom = require('@hapi/boom');

const functions = {
    insert: async (error, tableName, payload) => {
        let res;
        if (!error) {
            await knex(tableName).insert(payload)
                .then(function (id) {
                    console.log('Inserted: ' + JSON.stringify(payload));
                    res = {status: 'OK', code:200};
                }).catch(function (err) {
                    console.log('Error while trying to insert: ' + err);
                    res = boom.internal('Database is unavailable.');
                });
        } else {
            res = boom.badRequest('Invalid query.');
        }
        return res;
    },
    deleteRow: async (error, tableName, id) => {
        let result;
        if (!error) {
            await knex(tableName).delete().where({'id': id})
                .then(function (res) {
                    console.log(`Deleted a record from ${tableName} with id ${id}`);
                    result = {status:'OK', code:200};
                }).catch(function (err) {
                    result = boom.internal('Database is unavailable.');
                });
        } else {
            result = boom.badRequest('Invalid query.');
        }

        return result;
    }
}

module.exports = {
    functions
}