const { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res) => {
    res.render("donate", {
        icon: "img/favicon.png"
    })
})

module.exports = router;