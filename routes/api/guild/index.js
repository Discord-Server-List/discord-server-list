const { Router } = require("express");
var router = Router();

router.use("/embed", require("./embed"));


module.exports = router;