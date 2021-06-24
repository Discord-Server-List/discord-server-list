const { Router } = require("express");
var router = Router();
var serverRoutes = require("@routes/api/guild/server");

router.use("/server", serverRoutes)
router.use("/search", require("./search"));

module.exports = router;