require("dotenv").config();
require('module-alias/register')
var express = require("express");
const { connectDB } = require("@utils/db");
var session = require("express-session");
var lingua = require("lingua");
var {admin} = require("./admin.json");
const Guild  = require("@models/Guild");
const nodemailer = require('nodemailer');
const User = require("./models/User");
const Support = require("./models/Support");
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
const request = require("request");
var app = express();

//Trello Board(private)
//https://trello.com/b/sZf3SGWF/discord-server-list

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"))
app.use(session({
    secret: "DiscordServerList",
    resave: false,
    saveUninitialized: false
}));


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

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    if (user) done(null, user);
});

/*
    https://www.npmjs.com/package/passport-oauth2-refresh
    https://stackoverflow.com/questions/62878689/discord-js-oauth2-with-passport-js
*/
const strategy = new Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.REDIRECT,
    scope: ["identify", "email", "guilds"]
}, async(accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({userID: profile.id});
        if(user) {
            User.findOrCreate({
                userID: profile.id,
                guilds: profile.guilds,
                rtoken: refreshToken,
                atoken: accessToken
            })
            async(err) => {
                if(err) throw err;
                let newUser = await User.findOne({userID: profile.id})
                done(null, newUser)
            }
        } else {
            let newUser = User.create({
                userID: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                rtoken: refreshToken,
                atoken: accessToken,
                userIcon: profile.avatar,
                userEmail: profile.email,
                staff: false,
                guilds: profile.guilds,
                is_premium: false
            })
            const savedUser = await newUser.save();
            done(null, savedUser);
        }
    } catch(err) {
        console.error(err);
        done(err, null);
    }
    console.log(profile);
})

passport.use("discord", strategy);

app.get("/", async(req, res) => {
    res.render("index", {
        title: "Noisy Penguin Server List",
        icon: "/img/favicon.png"
    })
})


app.get("/login", passport.authenticate('discord'), (req, res) => {})

app.get("/login/callback", passport.authenticate("discord", {failureRedirect: "/"}), async(req, res) => {
    let user = await User.findOne({})
    if(admin.includes(req.user.id)) {
        user.staff = true
    } else {
        user.staff = false
    }
    res.redirect("/me")
})




app.get("/me", checkAuth, async(req, res) => {
    var user = await User.findOne({})
    if(user){
        res.send(user.userID)
    } else {
        res.send("User Not Found")
    }
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
        res.render("guild/views", {
            title: data.guildName + " | Noisy Penguin Server List", 
            header: data.guildName,
            icon: "/img/favicon.png",
            add: data.ownerID,
            join: data.guildID,
            ownerTag: data.owner,
            ownerAvatar: data.ownerIcon,
            guildid: data.guildID,
            desc: data.description,
            userDesc: userD.description
        })
    } else {
        res.send("Server not found")
    }
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

bot.login(process.env.DISCORD_CLIENT_SECRET)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Listening to port ${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})