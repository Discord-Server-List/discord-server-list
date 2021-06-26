const { Router } = require("express");
var router = Router();

router.use("/donate", require("@routes/donate"))
router.use("/user", require("@routes/user/index"))
router.use("/admin", require("@routes/admin/index"));
router.use("/about", require("@routes/about"));
router.use("/terms", require("@routes/terms"));
router.use("/support", require("@routes/support/index"));
router.use("/invite", require("@routes/invite"));
router.use("/app", require("@routes/app/index"));
router.use("/acknowledgements", require("@routes/acknowledgements"));

module.exports = router;