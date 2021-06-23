const { Router } = require("express");
var router = Router();

router.use("/blog", require("./blog/new"));
router.use("/send", require("./support/send"));

module.exports = router;