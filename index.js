require("dotenv").config();
require('module-alias/register')
var express = require("express");
const { connectDB } = require("@utils/db");
var session = require("express-session");
var lingua = require("lingua");
var imageCache = require('image-cache');
const Guild  = require("@models/Guild");
var device = require('express-device');
const nodemailer = require('nodemailer');
const User = require("./models/User");
const Support = require("./models/Support");
const Chat_Support = require("./models/Chat_Support");
var Category = require("./models/Category");
var bot = require("@bot/index");
const { checkAuth } = require("@utils/auth");
const Post = require("@models/Post");
const {rateLimit} = require("./utils/rateLimit");
const { resolveImage, Canvas } = require("canvas-constructor");
const path = require("path");
const fetch = require('node-fetch');
const { check } = require("./utils/checkVersion");
var app = express();

//Trello Board(private)
//https://trello.com/b/sZf3SGWF/discord-server-list

//ROUTES
var login = require("@routes/api/login");
var logout = require("@routes/api/logout");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"))
app.use(device.capture());

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

check();

app.use(express.urlencoded({extended: true}))
app.use(express.json())
var sessionid = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "DiscordServerList",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sessionID: sessionid
    }
}));

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

//SOCIAL ROUTES
app.use(require("./routes/social/index"));

//SERVER ROUTES
app.use(require("./routes/guild/index"));

//SUPPORT BLOG ROUTES
app.use(require("./routes/blog/index"));

app.use("/login", login)

app.use("/me", require("./routes/me"));

app.use("/logout", logout)


app.get("/search", (req, res, next) => {
    try {
        Guild.find({$or: [{guildName: { '$regex':req.query.guildsearch }}]}, (err, data) => {
            if(err) {
                res.json({
                    message: err
                })
            } else {
                res.render("search", {
                    icon: "/img/favicon.png",
                    guild: data
                })
            }
        })
    } catch (error) {
        res.sendStatus(500).json({
            message: error,
            statusCode: 500
        })
    }
});


app.use("/api", require("./routes/api/index"));

app.post("/support/blog/search", (req, res, next) => {
    Post.findOne({title: req.body.blogquery}).exec(function(data) {
        res.redirect(`/support/blog/search/${req.body.blogquery}`)
    })
})

app.get("/admin/add/category", (req, res) => {
    res.render("admin/add_category.ejs", {
        icon: "/img/favicon.png",
        title: "Admin Add Category | Noisy Penguin Server List"
    });
})


//サーバーのカテゴリー追加するとPOSTリクエスト
app.post("/api/admin/add/category", (req, res) => {
    var c = new Category({
        categoryName: req.body.name
    });
    c.save((err) => {
        if(err) {
            return res.json({
                message: err
            })
        } else {
            return res.redirect("/")
        }
    })
    
})

app.get("/error", (req, res) => {
    res.render("error")
})

app.get("/server/add", checkAuth, async(req, res) => {

})

app.post("/api/server/add", async(req, res) => {
    
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
app.put("/server/:guild_id/desc/edit", (req, res, next) => {
    var Data = Guild.findById({guildID: req.params.guild_id});
    Data.description = req.body.desc;
    
    Data.save((err) => {
        if(err) {
            res.json({
                message: err
            })
        } else {
            res.redirect(`/server/${Data.guildID}`)
        }
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

app.use(require("./routes/index"));


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


app.get("/admin/message", async(req, res) => {
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

app.get("/admin/message/:message_id", async(req, res, next) => {
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

app.get("/api/guilds/:server_id", async(req, res) => {
    let d = await Guild.findOne({guildID: req.params.server_id});
    res.json(d);
})

bot.login(process.env.DISCORD_CLIENT_SECRET)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Listening to port ${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})