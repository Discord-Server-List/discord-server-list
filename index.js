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
var Category = require("./models/Category");
var bot = require("@bot/index");
const { checkAuth } = require("@utils/auth");
const Post = require("@models/Post");
const path = require("path");
const fetch = require('node-fetch');
const { check } = require("./utils/checkVersion");
var app = express();

//Trello Board(private)
//https://trello.com/b/sZf3SGWF/discord-server-list




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

//ROUTES
var login = require("@routes/api/login");
var logout = require("@routes/api/logout");
app.use(require("./routes/index"));

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

app.get("/error", (req, res) => {
    res.render("error")
})

app.get("/server/add", checkAuth, async(req, res) => {

})

app.post("/api/server/add", async(req, res) => {
    
})


app.get("/support", async(req, res) => {
    let d = await User.findOne({});
    res.render("support", {
        icon: "/img/favicon.png"
    })
})

app.post("/add/support", async(req, res) => {
    let s = new Support()
    s.title = req.body.title;
    s.body = req.body.body;
    //s.locale = req.body.locale;
    s.username = req.body.username;
    s.userID = data.userID;
    s.email = data.userEmail;
    s.file = req.body.attachments;
    s.save((err) => {
        if(err) {
            res.json({
                message: err
            })
        } else {
            res.redirect("")
        }
    });
})

app.get("/support/:ticketid", async(req, res) => {
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



bot.login(process.env.DISCORD_CLIENT_SECRET)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Listening to port ${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})