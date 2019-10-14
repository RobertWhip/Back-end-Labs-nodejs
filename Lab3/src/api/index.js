const express = require("express");
const retirement = require("./retirement");
const router = new express.Router();


router.use("/retirement", retirement.apiRouter);

module.exports = {
	router
}
