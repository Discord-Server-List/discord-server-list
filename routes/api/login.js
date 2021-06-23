const { Router } = require("express");
var FormData = require("form-data");
var User = require("@models/User");
const router = Router();

router
.route("/")
.get((req, res) => {
    if(req.session.user) return res.redirect("/me");

    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Flogin%2Fcallback&response_type=code&scope=identify%20guilds%20email`;
    res.redirect(authorizeUrl);
})

router
.route("/callback")
.get((req, res, next) => {
    if(req.session.user) return res.redirect("/me");

    const accessCode = req.query.code;
    if (!accessCode) throw new Error('No access code returned from Discord');

    var data = new FormData()
    data.append('client_id', process.env.DISCORD_CLIENT_ID);
    data.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', process.env.REDIRECT);
    data.append('scope', scopes.join(" "));
    data.append('code', accessCode);

    fetch('https://discordapp.com/api/oauth2/token', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(response => {
        fetch('https://discordapp.com/api/users/@me', {
            method: 'GET',
            headers: {
                authorization: `${response.token_type} ${response.access_token}`
            }
        })
        .then(res2 => res2.json())
        .then(userRes => {
            userRes.tag = `${userRes.username}#${userRes.discriminator}`
            userRes.avatarURL = userRes.avatar ? `https://cdn.discordapp.com/avatars/${userRes.id}/${userRes.avatar}.png?size=1024` : null;
            let user = new User({
                userID: userRes.id,
                userTag: userRes.tag,
                username: userRes.username,
                userIcon: userRes.avatarURL,
                discriminator: userRes.discriminator,
                rtoken: userRes.refresh_token,
                atoken: userRes.access_token,
                userEmail: userRes.email
            }) 
            user.save((err) => {
                if(err) {
                    res.json({message: err})
                } else {
                    return res.redirect("/me")
                }
            })
        })
    })
})


module.exports = router;