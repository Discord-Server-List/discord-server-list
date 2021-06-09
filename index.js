require("dotenv").config();
require('module-alias/register')
var express = require("express");
const { connectDB } = require("@utils/db");
var session = require("express-session");
var lingua = require("lingua");
const Guild  = require("@models/Guild");
const User = require("@models/User");
var bot = require("@bot/index");
const { Strategy } = require('passport-discord');
const passport = require('passport');
var path = require('path')
const { checkAuth } = require("@utils/auth");
const Post = require("@models/Post");
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


connectDB(process.env.MONGODB_TEST)


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

const strats = new Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.REDIRECT,
    scope: ["identify", "guilds"]
}, async(accessToken, refreshToken, profile, done) => {
    try {
        let userdata = await User.findOne({userID: profile.id});
        if(userdata) {
            User.findOneAndUpdate(
                { userID: profile.id },
                { guilds: profile.guilds, rtoken: refreshToken, atoken: accessToken },
      
                async (err) => {
                  if (err) throw err;
                  let newUser = await User.findOne({ userID: profile.id });
                  done(null, newUser);
                }
              );
        } else {
            const newUser = await User.create({
                userID: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                userIcon: profile.avatar,
                guilds: profile.guilds,
                rtoken: refreshToken,
                atoken: accessToken,
            });
      
            const savedUser = await newUser.save();
      
            done(null, savedUser);
        }
    } catch (error) {
        console.log(error);
        done(error, null);
    }
})

passport.use("discord", strats);

app.get("/", async(req, res) => {
    res.render("index", {
        title: "Noisy Penguin Server List",
        icon: "/img/favicon.png",
        siteFont: "<%= lingua.font %>"
    })
})

app.get("/login", passport.authenticate('discord'), (req, res) => {})

app.get("/login/callback", checkAuth, passport.authenticate("discord", {
    failureRedirect: "/",
    successRedirect: "/me"
}))

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

bot.login(process.env.DISCORD_CLIENT_SECRET)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Listening to port ${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})