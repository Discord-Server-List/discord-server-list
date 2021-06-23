const { Router } = require("express");
var router = Router();
var serverRoutes = require("./server");

router.use("/server", serverRoutes)

module.exports = router;