const { Router } = require("express");
var Guild = require("@models/Guild");
var User = require("@models/User");
var Category = require("../../models/Category");
var router = Router();

router
.route("/")
.get(async(req, res, next) => {
    try {
        let d = await Guild.find({}).lean();
        var category = await Category.find({}).lean();
        res.render("server", {
            guild: d,
            icon: "/img/favicon.png",
            serverCategory: category
        })
    } catch (error) {
        //if there is error forward the error
        next(error);
    }
})

router
.route("/:id")
.get(async(req, res, next) => {
    try {
        var data = await Guild.findOne({guildID: req.params.id});
        var userD = await User.findOne({});
        var category = Category.find({}).lean();
        res.render("guild/views", {
            title: data.guildName, 
            header: data.guildName,
            guildicon: data.icon,
            add: data.ownerID,
            join: data.guildID,
            ownerTag: data.owner,
            ownerAvatar: data.ownerIcon,
            guildid: data.guildID,
            desc: data.description,
            userDesc: userD.description,
            verify: data.verified,
            userid: userD.userID,
            icon: "/img/favicon.png",
            serverCategory: category
        })
    } catch (error) {
        next(error)
    }
})

//SHARE ROUTES
router
.route("/:guild_id/share/twitter")
.get(async(req, res, next) => {
   try {
    let data = await Guild.findOne({guildID: req.params.guild_id});
    let uri = `http://localhost:5000/server/${data.guildID}`;
    return res.redirect(`https://twitter.com/intent/tweet?text=Check+out+${data.guildName}+Page+on+Noisy+Penguin+Server+List+%23noisy_penguin+${uri}`)
   } catch (error) {
       next(error)
   }
})

router
.route("/:guild_id/share/facebook")
.get(async(req, res, next) => {
    try {
        let data = await Guild.findOne({guildID: req.params.guild_id});
        let uri = `http://localhost:5000/server/${data.guildID}`
        return res.redirect(`https://www.facebook.com/dialog/share?app_id=${process.env.FB_APP_ID}&href=${uri}&display=popup`)
    } catch (error) {
        next(error);
    }
})

router
.route("/:guild_id/share/whatsapp")
.get(async(req, res, next) => {
    try {
        let data = await Guild.findOne({guildID: req.params.guild_id});
        let uri = `http%3A%2F%2Flocalhost%3A5000%2Fserver%2F${data.guildID}`
        let redirect = `https://api.whatsapp.com/send/?phone&text=Check+out+${data.guildName}+Page+on+Noisy+Penguin+Server+List+${uri}&app_absent=0`
        return res.redirect(redirect);
    } catch (error) {
        next(error);
    }
})

router
.route("/:guild_id/share/reddit")
.get(async(req, res, next) => {
    try {
        let data = await Guild.findOne({guildID: req.params.guild_id});
        let uri = `http%3A%2F%2Flocalhost%3A5000%2Fserver%2F${data.guildID}`
        let redirect = `https://www.reddit.com/submit?url=${uri}&title=Check+out+${data.guildName}+Page+on+Noisy+Penguin+Server+List`
        return res.redirect(redirect);
    } catch (error) {
        next(error);
    }
})

router
.route("/join/:guild_id")
.get(async(req, res) => {
    var serv = await Guild.findOne({guildID: req.params.guild_id});
    if(serv) {
        return res.redirect(serv.guildInvite)
    } else {
        return res.sendStatus(404).json({
            message: "No Invite Link Was Found",
            errorCode: 404
        })
    }
})

router.route("/:guild_id/edit")
.get(async(req, res, next) => {
    try {
        let guildData = await Guild.findOne({guildID: req.params.guild_id});
        return res.render("guild/edit", {
            icon: "/img/favicon.png",
            title:  "Edit " + guildData.guildName + " | Noisy Penguin Server List",
            name: guildData.guildName,
            servIcon: guildData.icon,
            servID: guildData.guildID,
            servDesc: guildData.description
        })
    } catch(err) {
        next(err)
    }
})
router.route("/:guild_id/desc/edit")
.put((req, res, next) => {
    try {
        var Data = Guild.findById({guildID: req.params.guild_id, description: req.body.desc});
    
        Data.save((err) => {
            if(err) {
                res.json({
                    message: err
                })
            } else {
                res.redirect(`/server/${Data.guildID}`)
        }
    })
    } catch(e) {
        next(e)
    }
})

module.exports = router;