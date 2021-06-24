const { Router } = require("express");
var Guild = require("@models/Guild");
var router = Router();

router
.route("/")
.get(async(req, res) => {
    let searchQuery = req.query.q;
    if(!searchQuery) searchQuery = "";
    searchQuery = searchQuery.toLocaleLowerCase();

    let guilds = await Guild.find({})

    let result = guilds.filter(guild => {
        if (guild.guildName.toLowerCase().includes(searchQuery)) return true;
        else if (guild.description.toLowerCase().includes(search)) return true;
        else return false;
    });

    if(!result) return res.send({ error: "No bots found for this search" }).sendStatus(404);

    res.render("search", {
        icon: "/img/favicon.png",
        searchQuery,
        searchResult: result
    })
})

module.exports = router;