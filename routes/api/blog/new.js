const { Router } = require("express");
var Post = require("@models/Post");
var router = Router();

router
.route("/support/new")
.post((req, res) => {
        let p = new Post({
            username: req.body.username,
            email: req.body.email,
            title: req.body.title,
            body: req.body.body
        })
        p.save((err) => {
            if(err) {
                res.json({
                    message: err
                })
            } else {
                return res.redirect("/blog/support")
            }
        })
})

module.exports = router;