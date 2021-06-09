

module.exports.checkAuth = (req, res, next) => {
    if (!req.isAuthenticated()) { 
        return res.redirect("/login");
    } else {
        return next();
    }
}