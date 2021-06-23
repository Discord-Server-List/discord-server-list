const { Router } = require("express");
var router = Router();

router.use("/donate", require("@routes/donate"))
router.use("/user", require("@routes/user/index"))
router.use("/admin", require("@routes/admin/index"));
router.use("/about", require("@routes/about"));
router.use("/terms", require("@routes/terms"));
router.use("/invite", require("@routes/invite"));

module.exports = router;