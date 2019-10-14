const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/chat.html");
});

app.get("/client.js", function (req, res) {
    res.sendFile(__dirname + "/client.js");
});

app.get("/style.css", function (req, res) {
    res.sendFile(__dirname + "/style.css");
});

let users = [];
let connections = [];

io.sockets.on("connection", function (socket) {
    console.log("Connected");
    connections.push(socket);

    socket.on("disconnect", function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnected");
    });
});


server.listen(3001);