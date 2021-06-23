const { Router } = require("express");
var Chat_Support = require("@models/Chat_Support");
var router = Router();

router
.route("/")
.post((req, res) => {
    let m = new Chat_Support({
        message: req.body.message,
        userEmail: req.body.email_input
    }) 
    m.save((err) => {
        if(err) {
            res.json({
                message: err
            })
        } else {
            res.redirect("/");
        }
    })
})

module.exports = router;