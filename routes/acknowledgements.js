let {Router} = require("express");
let router = Router();

router.route("/").get(async(req, res, next) => {
    res.render("acknowledgements", {
        icon: "/img/favicon.png"
    })
})

module.exports = router;