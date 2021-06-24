var {Router} = require("express")
const Support = require("@models/Support")
var router = Router();

router
.route("/")
.get(async(req, res) => {
    res.render("support", {
        icon: "/img/favicon.png"
    })
})

router.use("/add", require("./add"));

module.exports = router