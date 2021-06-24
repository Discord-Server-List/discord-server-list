const Guild = require("@models/bots");

module.exports = async () => {
    let guild = await Guild.find({"state": {$ne: "deleted"}}, { _id: false, auth: false, __v: false, addedAt: false })
    guild.sort((a, b) => b.likes - a.likes);
    /*return guild.map(x => {
        return x;
    })*/
};