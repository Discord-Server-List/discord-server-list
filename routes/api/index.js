const { Router } = require("express");
var router = Router();

router.use("/blog", require("./blog/new"));
router.use("/send", require("./support/send"));
router.use("/guilds", require("@routes/api/guild/index"));
router.route("/").get((req, res) => {
    res.render("api/index", {
        icon: "/img/favicon.png" 
    })
})

module.exports = router;