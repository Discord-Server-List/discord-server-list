var {admin} = require("../admin.json");
var Guild = require("../models/Guild");

exports.checkAdmin = (req, res, next, owner) => {
    if (req.isAuthenticated()) {
        admin.push(owner);

        if(admin.includes(req.user.id)) {
            return next();
        } else {
            res.redirect("/")
        }
    } else {
        req.session.backURL = req.url;

        res.redirect("/login");
    }
}