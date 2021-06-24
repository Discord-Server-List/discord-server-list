var Category = require("@models/Category");
var { Router } = require("express");
var router = Router();

router
.route("/")
.get((req, res) => {
    res.render("admin/add_category", {
        icon: "/img/favicon.png",
        title: "Admin Add Category | Noisy Penguin Server List"
    });
})
.post((req, res) => {
    var c = new Category({
        categoryName: req.body.name
    });
    c.save((err) => {
        if(err) {
            return res.json({
                message: err
            })
        } else {
            return res.redirect("/admin/add/category")
        }
    })
})

module.exports = router;