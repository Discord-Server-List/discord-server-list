const { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect(`/`);
})

module.exports = router;