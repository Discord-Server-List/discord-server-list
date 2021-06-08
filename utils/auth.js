

module.exports.checkAuth = (req, res, next) => {
    if (!req.user) { 
        return res.redirect("/login");
    } else {
        return next();
    }
}