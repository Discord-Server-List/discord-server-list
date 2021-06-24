var Guild = require("../../../models/Guild");
var { Router } = require("express");
var router = Router();


router
.route("/:server_id")
.get(async(req, res, next) => {
    try {
        let guildData = await Guild.findOne({guildID: req.params.server_id});
        res.json(guildData)
    } catch(e) {
        res.json({
            message: e
        })
    }
})

module.exports = router;