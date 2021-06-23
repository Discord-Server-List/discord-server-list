var Announcements = require("@models/Announcements");
const { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res) => {
    res.render("terms", {
        icon: "/img/favicon.png"
    })
})


module.exports = router;