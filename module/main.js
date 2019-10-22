const express = require('express');
const app = express();
const api = require('./api');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', api.router);

app.listen(3000);
