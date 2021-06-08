module.exports.checkPost = (req, res, next) => {
    if(!req.body) {
        res.redirect("/error")
    } else {
        return next();
    }
}