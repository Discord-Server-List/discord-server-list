const { resolveImage, Canvas }  = require("canvas-constructor");
var Guild = require("@models/Guild");
var path = require("path");
const { Router } = require("express");
const rateLimit = require("express-rate-limit");
var router = Router();

router
.route("/:server_id")
.get(rateLimit, async(req, res, next) => {
    try {
        let data = await Guild.findOne({guildID: req.params.server_id});
        
        let avatar = await resolveImage(data.icon);
        //let verified = await resolveImage(path.join(__dirname + "/assets/img/Verified.png"));
        let img = new Canvas()
        .setColor("#c8833c")
        .printRectangle(0, 0, 500, 250)
        .setColor("#DCE2F9")
        .setTextFont("bold 35px sans")
        .printText(data.guildName, 120, 75)
        .printRoundedImage(avatar, 30, 30, 70, 70, 20)
        .setTextAlign("left")
        .setTextFont('bold 12px Verdana')
        /*if(data.verified == true)
        img.printImage(verified, 420, 55)*/
    img
        .printText(`Server Region: ${data.guildRegion}`, 30, 145)
        .setTextFont('normal 15px Verdana')
        .printWrappedText(data.description,  30, 175, 440, 15)
        .setTextFont('bold 12px sans-serif')
        .printText(data.owner, 10, 245)
        .setTextAlign("right")
        .printText(process.env.DOMAIN, 490, 245);
    res.writeHead(200, {
        "Content-Type": "image/png"
    })
    res.end(await img.toBuffer(), "binary")
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = router;