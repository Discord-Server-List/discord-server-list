const { Router } = require("express");
var Guild = require("@models/Guild");
var router = Router();

router
.route("/")
.get(async(req, res) => {
    var d = await Guild.findOne({ownerID: req.params.ownerid});
    if(d) {
        res.redirect(`https://discord.com/users/${d.ownerID}`)
    } else {
        res.json({
            message: "User Not Found"
        })
    }
})

module.exports = router;