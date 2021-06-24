const { Router } = require("express");
var router = Router();

router.use("/download", require("./download"));
router.route("/").get((req, res) => {
    res.render("download")
})

module.exports = router