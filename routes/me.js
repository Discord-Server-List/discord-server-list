const { Router } = require("express");
var User = require("@models/User");
var { checkAuth } = require("../utils/auth");
var router = Router();

router
.route("/")
.get(async(req, res, next) => {
    if (req.session.user) { 
        return next();
    } else {
        return res.redirect("/login");
    }
})


module.exports =  router;