const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const users = [];
const connections = [];


app.use(express.static(__dirname + "/../../public"));

io.on("connection", function(socket){
    console.log("a user connected");
    connections.push(socket);

    socket.on("disconnect", function (data) {
        console.log("a user disconnected");
        connections.splice(connections.indexOf(socket), 1);
    })

    socket.on("send message", function (data) {
        io.sockets.emit("add message", {message: data});
    });
});

http.listen(3001, function(){
  console.log("listening on *:3001");
});