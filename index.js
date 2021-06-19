require("dotenv").config();
require('module-alias/register')
var express = require("express");
const { connectDB } = require("@utils/db");
var session = require("express-session");
var lingua = require("lingua");
var fs = require("fs");
var {admin} = require("./admin.json");
var imageCache = require('image-cache');
const Guild  = require("@models/Guild");
var device = require('express-device');
const nodemailer = require('nodemailer');
const User = require("./models/User");
const Support = require("./models/Support");
const Chat_Support = require("./models/Chat_Support");
var bot = require("@bot/index");
const { Strategy } = require('passport-discord');
const passport = require('passport');
const { checkAuth } = require("@utils/auth");
const Post = require("@models/Post");
const {rateLimit} = require("./utils/rateLimit");
const { resolveImage, Canvas } = require("canvas-constructor");
const path = require("path");
const { errorHandler } = require("./utils/errorHandler");
const { connectMail } = require("./utils/connectMail");
const fetch = require('node-fetch');
var app = express();

//Trello Board(private)
//https://trello.com/b/sZf3SGWF/discord-server-list

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"))
app.use(device.capture());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, don) => done(null, obj));

connectDB(process.env.MONGODB_TEST);


let transport = (err) => {
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
           user: process.env.SMTP_USER,
           pass: process.env.SMTP_PASS
        }
    })
    if(err) {
        console.error(err)
    } else {
        console.log(`Connected to host ${process.env.SMTP_HOST}`)
    }
}

app.use(lingua(app, {
    defaultLocale: 'en',
    path: __dirname + '/locales',
    storageKey: 'locale',
    cookieOptions: {
        httpOnly: true
    }
}));

imageCache.setOptions({
    compressed: false,
    dir: path.join(__dirname + "/assets/img/"),
    extname: ".cacheimg"
})

var scopes = ['identify', 'email', 'guilds'];
var prompt = 'consent'

passport.use(new Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/login/callback',
    scope: scopes,
    prompt: prompt
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}))

var sessionid = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "DiscordServerList",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sessionID: sessionid
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: true}))
app.use(express.json())


let API_KEY = process.env.IPREGISTRY_API_KEY


app.get("/", async(req, res) => {
    fetch(`https://api.ipregistry.co?key=${API_KEY}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (json) {
        res.cookie('country', json['location']['country']['code']);
        res.cookie('theme', 'light')
        //res.cookie('locale', json['location']['country']['languages']['0']['code']);
        res.cookie('device', req.device.type)
        res.render("index", {
            title: "Noisy Penguin Server List",
            icon: "/img/favicon.png"
        })
    });
    
})

app.get("/github/repo", (req, res) => {
    res.redirect("https://github.com/Discord-Server-List")
})

app.get("/twitter", (req, res) => {
    res.redirect("https://twitter.com/penguin_noisy");
})


app.get('/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/login/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/me') } // auth success
);

app.get("/me", checkAuth, (req, res) => {
    console.log(req.user)
})

app.get("/logout", async(req, res) => {
    req.logout();
    res.redirect(`/`);
});

app.get("/search", (req, res) => {
    res.render("search.ejs", {
        icon: "/img/favicon.png"
    });
})

app.get("/search/?q=", (req, res) => {
    var search_key = req.query("q");
    Guild.find({guildName: search_key})
    .then(data => res.json(data))
    .catch(err => res.status(404).json({ success: false }));
});

app.get("/server", async(req, res) => {
    let filter = {};
    let d = await Guild.find(filter);
    res.send(d);
})

app.get("/blog/support", (req, res) => {
    Post.find().where('title').all(function (data) {
        res.send(data);
    })
})


app.get("/blog/support/new", (req, res) => {
    res.render("blog/new", {
        title: "New Post | Noisy Chicken Support",
        icon: "/img/favicon.png"
    })
})
//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
app.post("/api/blog/support/new", (req, res) => {
    var d = new Post();
    d.title = req.body.title;
    d.body = req.body.body;
    d.username = req.body.username;
    d.email = req.body.email;
    d.save((err) => {
        if(err) {
            res.send(err)
        } else {
            res.redirect("/blog/support")
        }
    })
})


app.get("/error", (req, res) => {
    res.render("error")
})

app.get("/server/add", checkAuth, async(req, res) => {

})

app.post("/api/server/add", async(req, res) => {
    var g = new Guild()
    g.guildID = req.body.guildid
})

app.get("/server/:id", async(req, res) => {
    var data = await Guild.findOne({guildID: req.params.id});
    var userD = await User.findOne({})
    if(data) {
        return res.render("guild/views", {
            title: data.guildName, 
            header: data.guildName,
            icon: "/img/favicon.png",
            add: data.ownerID,
            join: data.guildID,
            ownerTag: data.owner,
            ownerAvatar: data.ownerIcon,
            guildid: data.guildID,
            desc: data.description,
            userDesc: userD.description,
            verify: data.verified
        })
    } else {
        res.send("Server not found")
    }
})

/*
    encoded url
    https://www.url-encode-decode.com
*/
app.get("/server/:guild_id/share/twitter", async(req, res) => {
    let guildid = req.params.guild_id;
    let data = await Guild.findOne({guildID: guildid});
    let uri = `http://localhost:5000/server/${data.guildID}`
    res.redirect(`https://twitter.com/intent/tweet?text=Check+out+${data.guildName}+Page+on+Noisy+Penguin+Server+List+%23noisy_penguin+${uri}`)
})

app.get("/server/:guild_id/share/facebook", async(req, res) => {
    let guildid = req.params.guild_id;
    let data = await Guild.findOne({guildID: guildid});
    let uri = `http%3A%2F%2Flocalhost%3A5000%2Fserver%2F${data.guildID}`
    res.redirect(`https://www.facebook.com/dialog/share?app_id=${process.env.FB_APP_ID}&href=${uri}&display=popup`)
})

app.get("/server/:guild_id/share/whatsapp", async(req, res) => {
    let guildid = req.params.guild_id;
    let data = await Guild.findOne({guildID: guildid});
    let uri = `http%3A%2F%2Flocalhost%3A5000%2Fserver%2F${data.guildID}`
    let redirect = `https://api.whatsapp.com/send/?phone&text=Check+out+${data.guildName}+Page+on+Noisy+Penguin+Server+List+${uri}&app_absent=0`
    res.redirect(redirect);
})

app.get("/server/:guild_id/share/reddit", async(req, res) => {
    let guildid = req.params.guild_id;
    let data = await Guild.findOne({guildID: guildid});
    let uri = `http%3A%2F%2Flocalhost%3A5000%2Fserver%2F${data.guildID}`
    let redirect = `https://www.reddit.com/submit?url=${uri}&title=Check+out+${data.guildName}+Page+on+Noisy+Penguin+Server+List`
    res.redirect(redirect);
})

app.get("/server/:guild_id/edit", async(req, res) => {
    let guildid = req.params.guild_id;
    let data = await Guild.findOne({guildID: guildid});
    if(data)  return res.render("guild/edit", {
        icon: "/img/favicon.png",
        title:  "Edit " + data.guildName + " | Noisy Penguin Server List",
        name: data.guildName,
        servIcon: data.icon,
        servID: data.guildID,
        servDesc: data.description
    })
    else res.json({
        message: 'Server Not Found',
        statusCode: 404
    }).sendStatus(404)
})

/*
    JP:サーバーの概要を変更するのPOSTリクエスト
    EN: POST request for updating server description
    ID: Method POST untuk memperbarui deskripsi server
    zh_CN: 更新服务器描述的POST请求
    ko: 서버 설명 업데이트를위한 POST 요청
*/
app.post("/server/:guild_id/desc/edit", async(req, res, next) => {
    var desc = new Guild({
        guildID: req.params.guild_id,
        description: req.body.desc
    });
    desc.save().then(result => {
        console.log(result);
        return res.sendStatus(201).json({
            message: "Handling POST requests to /server/:guild_id/desc/edit",
            description: result
        })
    }).catch(err => {
        console.log(err);
        return res.sendStatus(500).json({
            error: err
        })
    })
})

app.get("/api", (req, res) => {
    res.render("api/index", {
        icon: "/img/favicon.png" 
    })
})


app.get("/api/stats/server/:id", rateLimit(15000, 4), async(req, res) => {
    let guildData = await Guild.findOne({guildID: req.params.id});
    if(!guildData) {
        res.sendStatus(404).json({
            error: true,
            code: 404,
            message: "Server not found"
        })
    } 
    try {
        res.send(guildData)
    } catch(e) {
        throw e;
    }
})

app.get("/api/embed/server/:id", rateLimit(15000, 4), async(req, res) => {
    let data = await Guild.findOne({guildID: req.params.id});

    if(!data){
        res.sendStatus(404).json({
            error: true,
            code: 404,
            message: "Server not found"
        })
    }
    try {
        let avatar = await resolveImage(data.icon);
        //let admin = await resolveImage(path.join(__dirname + "/assets/img/admin.png"));
        let verified = await resolveImage(path.join(__dirname + "/assets/img/Verified.png"));

        let img = new Canvas()
        .setColor("#404E5C")
        .printRectangle(0, 0, 500, 250)
        .setColor("#DCE2F9")
        .setTextFont("bold 35px sans")
        .printText(data.guildName, 120, 75)
        .printRoundedImage(avatar, 30, 30, 70, 70, 20)
        .setTextAlign("left")
        .setTextFont('bold 12px Verdana')
        if(data.verified == true)
            img.printImage(verified, 420, 55)
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
        throw error;
        res.sendStatus(500);
    }
})

app.get("/server/join/:guildid", async(req, res) => {
    var serv = await Guild.findOne({guildID: req.params.guildid});
    if(serv) {
        res.redirect(serv.guildInvite)
    } else {
        res.send("No Invite Link")
    }
})


app.get("/user/:userid", async(req, res) => {
    var userData = await User.findOne({userID: req.params.userid});
    if(userData) {
        res.render("user/views", {
            title: userData.username + " Profile",
            icon: userData.userIcon,
            id: userData.userID
        })
    } else {
        res.send("User Not Found")
    }
})

app.get("/user/add/:ownerid", async(req, res) => {
    var d = await Guild.findOne({ownerID: req.params.ownerid});
    if(d) {
        res.redirect(`https://discord.com/users/${d.ownerID}`)
    } else {
        res.send("User Not Found")
    }
})

app.get("/donate", (req, res) => {
    res.render("donate", {
        icon: "img/favicon.png"
    })
})


app.get("/support", async(req, res) => {
    let d = await User.findOne({});
    res.render("support", {
        icon: "/img/favicon.png"
    })
})

app.post("/add/support", async(req, res) => {
    let data = await User.findOne({userID: req.params.id});
    let s = new Support()
    s.title = req.body.title;
    s.body = req.body.body;
    //s.locale = req.body.locale;
    s.username = req.body.username;
    s.userID = data.userID;
    s.email = data.userEmail;
    s.file = req.body.attachments;

    const message = {
        from: data.userEmail, // Sender address
        to: process.env.EMAIL,         // List of recipients
        subject: s.title, // Subject line
        text: s.body // Plain text body
    };

    transport.sendMail(message, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log(info);
        }
    })

    s.save();
})

app.get("/support/:userid/:ticketid", async(req, res) => {
    let data = await Support.findOne({userID: req.params.userid, supportID: req.params.ticketid});
    if(!data) {
        res.sendStatus(404).json({
            error: true,
            code: 404,
            message: "Support Ticket Not Found"
        })
    } 
    res.json(data);
})

app.post("/api/send", async(req, res) => {
    let m = new Chat_Support()
    m.message = req.body.body;

    m.save((err) => {
        if(err) {
            console.error(err);
        } else {
            res.redirect("/");
        }
    })
})

app.get("/api/guilds/:server_id", async(req, res) => {
    let d = await Guild.findOne({guildID: req.params.server_id});
    res.json(d);
})


app.all("/js", (req, res, next) => {
    return res.sendStatus(403).send(
    {
            message: 'Access Forbidden'
    });
    next();
})

app.all("/css", (req, res, next) => {
    return res.sendStatus(403).send(
    {
            message: 'Access Forbidden'
    });
    next();
})

bot.login(process.env.DISCORD_CLIENT_SECRET)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Listening to port ${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})