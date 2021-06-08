var Guild = require("../models/Guild");

module.exports = async() => {
    let guild = await Guild.find({});
    guild.sort((x, y) => y.likes - x.likes);
}