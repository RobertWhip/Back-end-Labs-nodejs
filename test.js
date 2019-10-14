const express = require("express");
const app = express()

app.use("/:id", function (req, res) {
	const param = req.params["id"];
	console.log(param);
	console.log("Safe");
});

app.listen(3004);
