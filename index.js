require("dotenv").config();
require('module-alias/register')
var express = require("express");
const { connectDB } = require("@utils/db");
var session = require("express-session");
var lingua = require("lingua");
var device = require('express-device');
var Announcements = require("./models/Announcements");
var bot = require("@bot/index");
const { checkAuth } = require("@utils/auth");
const fetch = require('node-fetch');
const { check } = require("./utils/checkVersion");
var app = express();

//Trello Board(private)
//https://trello.com/b/sZf3SGWF/discord-server-list




app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"))
app.use(device.capture());

connectDB(process.env.MONGODB_TEST);


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

check();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
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

const { detect } = require('detect-browser');
const browser = detect();

app.get("/", async(req, res) => {
    let AnnouncementsData = await  Announcements.find({}).lean();
    fetch(`https://api.ipregistry.co?key=${API_KEY}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (json) {
        res.cookie('country', json['location']['country']['code']);
        res.cookie('theme', 'light')
        res.cookie('client', browser.name)
        //res.cookie('locale', json['location']['country']['languages']['0']['code']);
        res.cookie('device', req.device.type)
        res.render("index", {
            title: "Noisy Penguin Server List",
            icon: "/img/favicon.png",
            Announcementsdata: AnnouncementsData
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
app.use("/support", require("./routes/support/index"))

app.use("/api", require("./routes/api/index"));

app.get("/server/add", checkAuth, async(req, res) => {

})

app.post("/api/server/add", async(req, res) => {
    
})



bot.login(process.env.DISCORD_CLIENT_SECRET)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Listening to port ${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})