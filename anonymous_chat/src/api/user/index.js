const express = require("express");
const controller = require("./controller.js");
const userApiRouter = new express.Router();

userApiRouter.post("/login", controller.userController.login);
userApiRouter.post("/register", controller.userController.register);

module.exports = {
    userApiRouter
}