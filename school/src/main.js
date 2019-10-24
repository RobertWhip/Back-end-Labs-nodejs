'use strict'

const config = require('./config');
const Hapi = require('@hapi/hapi');
const boom = require('@hapi/boom');
const knex = require('./knex');

const validation = require('./validation');
const reponseFunctions = require('./response').functions;

const host = config.get('server.ip');
const port = config.get('server.port');

const init = async () => {
    const server = Hapi.server({
        port,
        host
    });

    server.route({
        method: 'GET',
        path: '/{table}',
        handler: (request, h) => {
            const id = request.query.id;
            const {table} = request.params;
            let result = boom.internal('Database is unavailable.');
            
            if (['teacher', 'pupil', 'grade'].includes(table)) {
                result = id ? knex.select('*').from(table).where({'id': id}) : knex.select('*').from(table);
            } else {
                result = boom.badRequest('Invalid query.');
            }
            return result;
        }
    });

    server.route({
        method: 'GET',
        path: '/grade/{pupil_id}/{teacher_id}',
        handler: function(request, h) {
            console.log(request.query);
            let pupilId = parseInt(request.params.pupil_id);
            const teacherId = parseInt(request.params.teacher_id);
            let result = boom.internal('Database is unavailable.');

            if (pupilId && !teacherId) {
                result = knex.select('*').from('grade').where({'pupil_id': pupilId});
            } else if (!pupilId && teacherId) {
                result = knex.select('*').from('grade').where({'teacher_id': teacherId});
            } else if (pupilId && teacherId) {
                result = knex.select('*').from('grade').where({'pupil_id': pupilId, 'teacher_id': teacherId});
            } else {
                result = boom.badRequest('Invalid query.');
            }

            return result;
        }
    });

   server.route({
        method: 'POST',
        path: '/{tableName}',
        handler: async function(request, h) {
            const {tableName} = request.params;
            const payload = request.payload;
            let error = {};
            
            if (['teacher', 'pupil', 'grade'].includes(tableName))
                error = validation.schemas[tableName].validate(payload).error;

            return h.response(await reponseFunctions.insert(error, tableName, payload));
        }
    });

    server.route({
        method: 'DELETE',
        path: '/delete/{tableName}/{id}',
        handler: async function (request, h) {
            const {tableName, id} = request.params;
            let error = 1;

            if (id && ['teacher', 'pupil', 'grade'].includes(tableName))
                error = undefined;

            return h.response(await reponseFunctions.deleteRow(error, tableName, id));
        }
    });

    await server.start();
    console.log(`Listening on ${host}:${port}`);
}

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

init();