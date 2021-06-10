const planController = require("./Plan.controller");
const express = require("express");
const router = express.Router();

router.post("/plan/create", planController.createPlan);
router.get("/plan/list", planController.listPlan);


module.exports = router;