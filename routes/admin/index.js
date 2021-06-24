var Announcements = require("@models/Announcements");
const { Router } = require("express");
var router = Router();

router.use("/addAnnouncements", require("@routes/api/admin/addAnnouncements"));
router.use("/add/category", require("@routes/api/admin/addCategory"));
router.use("/message", require("@routes/admin/message"));

module.exports = router;