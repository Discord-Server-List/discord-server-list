const { Router } = require("express");
var router = Router();

router
.route("/repo")
.get((req, res) => {
    res.redirect("https://github.com/Discord-Server-List")
})

module.exports = router;