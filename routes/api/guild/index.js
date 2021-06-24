const { Router } = require("express");
var router = Router();

router.use("/embed", require("./embed"));
router.use("/widget", require("@routes/api/guild/widget"));
router.use("/search", require("@routes/api/guild/search"));

module.exports = router;