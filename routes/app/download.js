const { Router } = require("express");
var router = Router();

router.route("/").get(async(req, res) => {
    res.redirect("/file/noisy-penguin.zip")
})

module.exports = router