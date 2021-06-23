const { Router } = require("express");
var Post = require("@models/Post");
var router = Router();

router
.route("/support") 
.get(async(req, res) => {
    try {
        let data = await Post.find({}).lean();
        return res.render("blog/index", {
            icon: "/img/favicon.png",
            supportData: data
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

router
.route("/support/new")
.get((req, res) => {
    res.render("blog/new", {
        title: "New Post | Noisy Chicken Support",
        icon: "/img/favicon.png"
    })
})

router
.route("/support/articles/:support_id")
.get(async(req, res) => {
    let supportParam = req.params.support_id;
    let data = await Post.findOne({_id: supportParam});
    if(data) {
        res.render("blog/views", {
            icon: "/img/favicon.png",
            supportData: data
        })
    } else {
        next();
    }
})

module.exports = router;