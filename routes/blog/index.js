const { Router } = require("express");
var router = Router();

router.use("/blog", require("./blog"));

module.exports = router;