const { Router } = require("express");
var router = Router();

router.use("/embed", require("./embed"));
router.use("/widget", require("@routes/api/guild/widget"));

module.exports = router;