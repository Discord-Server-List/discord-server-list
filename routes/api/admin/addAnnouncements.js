var Announcements = require("@models/Announcements");
const {checkAdmin} = require("../../../utils/checkAdmin")
const { Router } = require("express");
var router = Router();

router
.route("/")
.post((req, res) => {
    let AnnouncementsData = new Announcements({
        title: req.body.announcementsTitle,
        body: req.body.announcementsBody
    })
    AnnouncementsData.save((err) => {
        if(err) {
            res.sendStatus(500).json({
                message: err
            })
        } else {
            res.redirect("/")
        }
    })
})
.get((req, res) => {
    res.render("admin/addAnnouncements", {
        icon: "/img/favicon.png"
    })
})

module.exports = router;