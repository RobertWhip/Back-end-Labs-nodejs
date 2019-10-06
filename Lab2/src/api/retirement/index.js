const express = require("express");
const controller = require("./controller.js");
const retirementApiRouter = new express.Router();

retirementApiRouter.get("/", controller.retirementController.get);
retirementApiRouter.get("/:id", controller.retirementController.getId);
retirementApiRouter.get("/bygender/:gender", controller.retirementController.getByGender);
retirementApiRouter.post("/", controller.retirementController.post);
retirementApiRouter.delete("/:id", controller.retirementController.deleteId);


module.exports = {
	apiRouter:retirementApiRouter
}
