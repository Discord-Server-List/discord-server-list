var Announcements = require("@models/Announcements");
const { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res) => {
    res.send("About")
})

module.exports = router;