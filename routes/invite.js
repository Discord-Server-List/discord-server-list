const { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res) => {
    res.redirect(process.env.DISCORD_CLIENT_INVITE)
})

module.exports = router;