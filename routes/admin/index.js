var Announcements = require("@models/Announcements");
const { Router } = require("express");
var router = Router();

router.use("/addAnnouncements", require("@routes/api/admin/addAnnouncements"));
router.use("/message", require("@routes/admin/message"));

module.exports = router;