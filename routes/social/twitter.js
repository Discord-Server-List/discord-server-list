const { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res) => {
    res.redirect("https://twitter.com/penguin_noisy");
})

module.exports = router;