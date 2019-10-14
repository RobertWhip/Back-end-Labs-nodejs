const express = require("express");
const path = require("path");
const jwt = require('jsonwebtoken');
const api = require("./api");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(__dirname + "/../public"))

app.use("/api", api.router);

app.post("/chat.html", verifyToken, function (req, res) {
    jwt.verify(req.token, "mysecretkey", (err, authData) => {
        if (err) {
            res.sendFile(path.resolve("public/login.html"));
        } else {
            res.sendFile(path.resolve("auth/chat.html"));
        }
    });
});

function verifyToken (req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const token = bearerHeader.split(' ')[1];
        req.token = token;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.listen(process.env.PORT, () =>
     console.log(`Listening on ${process.env.HOST}:${process.env.PORT}`)
);