'use strict';

const Hapi = require('hapi');

const routes = require('./routes');
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const app = new Hapi.Server({
    host,
    port
});

app.route(routes);

module.exports = app;