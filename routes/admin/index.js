var Announcements = require("@models/Announcements");
const { Router } = require("express");
var router = Router();

router.use("/addAnnouncements", require("@routes/api/admin/addAnnouncements"));

module.exports = router;