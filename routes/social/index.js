const { Router } = require("express");
var router = Router();

var twitter = require("./twitter");
var github = require("./github");

router.use("/twitter", twitter);
router.use("/github", github)

module.exports = router;