const express = require("express");
const api = require("./api");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/api", api.router);

app.listen(3000);
//mongoose