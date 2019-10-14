const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("request");
require("dotenv").config();


const pool = mysql.createPool({
    connectionLimit: process.env.POOL_CONN_LIMIT || 5,
    host: process.env.HOST || "localhost",
    user: process.env.DB_USER || "root",
    database: process.env.DB_NAME || "usersdb",
    password: process.env.DB_PASS || "mydatabase"
});


const createTable = "CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255));";
const findUser = "SELECT * FROM users WHERE username = ?";
const addUser = "INSERT INTO users(username, password) VALUES(?, ?);";
const delUser = "DELETE FROM users WHERE id = ?;";

const userController = {
    register : function (req, res) {
        const username = req.body.username;
        const password = req.body.password0;
        if (password != req.body.password1) {
            res.json({status:401, message: "The passwords are not match."});
        } else {
            pool.query(findUser, username, function (err, rows) {
                if (err) {
                    console.log(err.message)
                    res.json({status:503, message: "The database is not available."});
                } 

                // username is not registered yet
                if (rows.length == 0) {
                    // hash the password
                    bcrypt.hash(password, 10, function (err, encrypted) {
                        if (err) res.sendStatus(500);
                        // register
                        pool.query(addUser, [username, encrypted], function (err, result) {
                            if (err) {
                                console.log(err.message)
                                res.json({status:503, message: "The database is not available"});
                            } else {
                                // then log in 
                                jwt.sign({id:result.insertId, username}, "mysecretkey", (err, token) => {
                                    request.post(
                                        `http://${process.env.HOST}:${process.env.PORT}/chat.html`,
                                        {headers: {"Authorization": "Bearer " + token}},
                                        function (error, response, body) {
                                        if (!error && response.statusCode == 200) {
                                            res.send(body);
                                        } else {
                                            res.json("Forbidden");
                                        }
                                    });
                                });
                            }
                        });
                    });

                // username is already registered
                } else {
                    res.json({status:401, message: "The given username is not available."});
               }
           });
        }
    },
    login : function (req, res) {
        const username = req.body.username;
        const password = req.body.password;

        pool.query(findUser, username, function (err, rows) {
            if (err) {
                console.error(err.message);
                res.json({status:503, message: "The database is not available."});
            } else if (rows.length == 1){
                // authorized
                bcrypt.compare(password, rows[0].password)
                    .then(isMatch => {
                        if (isMatch) {
                            // log in
                            jwt.sign({id:rows[0].id, username}, "mysecretkey", (err, token) => {
                                request.post(
                                    `http://${process.env.HOST}:${process.env.PORT}/chat.html`,
                                    { headers: {"Authorization": "Bearer " + token} },
                                     function (error, response, body) {
                                        if (!error && response.statusCode == 200) 
                                            res.send(body);
                                        else
                                            res.json("Forbidden");
                                    }
                                );
                            });
                        } else {
                            res.json({status:401, message:"The username or password is incorrect."});
                        }
                    });
            } else {
                res.json({status:401, message:"The username or password is incorrect."});   
            }
        });
             
    },
    eraseMe: function(req, res) {
        const username = req.body.username;
        const password = req.body.password;

        pool.query(findUser, username, function (err, rows) {
            if (err) {
                console.error(err.message);
                res.send(JSON.stringify({status:503, message: "The database is not available."}));
            } else if (rows.length == 1){
                const registeredPasswordHash = rows[0].password;
                const registeredPasswordSalt = rows[0].salt;
                const loginPasswordHash = bcrypt.hashSync(password, registeredPasswordSalt);

                if (registeredPasswordHash === loginPasswordHash) {
                    pool.query(delUser, rows[0].id, function (err, result) {
                        if (err) {
                            res.send(JSON.stringify({status: 503, message:"The database is not available."}));  
                        } else {
                            res.send(JSON.stringify({status: 200, message:"Successfully deleted."}));  
                        }
                    });

                } else {
                    res.send(JSON.stringify({status:401, message:"The username or password is incorrect."}));
                }
            } else {
                res.send(JSON.stringify({status: 503, message:"The database is not available."}));   
            }
        });
    }
}

module.exports = {
    userController
}