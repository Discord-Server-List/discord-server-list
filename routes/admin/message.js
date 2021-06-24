var Chat_Support = require("@models/Chat_Support");
var { Router } = require("express");
var router = Router();

router
.route("/")
.get(async(req, res) => {
    try {
        let m = await Chat_Support.find({}).lean();
        res.render("admin/message", {
            data: m
        })
    } catch (error) {
        res.sendStatus(500).json({
            message: error
        })
    }
})

router
.route("/:message_id")
.get(async(req, res, next) => {
    let data = await Chat_Support.findOne({messageID: req.params.message_id});
    if(data) {
        res.render("admin/chat_support.ejs", {
            page_title: data.userEmail + " | Noisy Penguin Server List Support",
            msg: data.message,
            id: data._id,
            email: data.userEmail
        })
    } else {
        next()
    }
})

module.exports = router;
