var Discord = require("discord.js");
var bot = new Discord.Client();
var Guild = require("../models/Guild");
const User = require("../models/User");

bot.on("ready", () => {
    console.log(`${bot.user.username} Is ready`)
    bot.user.setActivity({
        type: "WATCHING",
        name: `${process.env.DOMAIN}`
    })
})

bot.on("message", async(message) => {
    let data = await Guild.findOne({ guildID: message.guild.id });
    let uData = await User.findOne({ userID: message.author.id});
    
    let channelID;
    let channels = message.guild.channels.cache;
    let defaultC = message.guild.systemChannel;
    let invite = await defaultC.createInvite({ maxAge: 0, maxUses: 0 });
    channelLoop:
    for (let key in channels) {
        let c = channels[key];
        if (c[1].type === "text") {
            channelID = c[0];
            break channelLoop;
        }
    }

    if (!data) {
        const newGuild = new Guild({ 
            guildID: message.guild.id,
            owner:  message.guild.owner.user.tag,
            ownerID: message.guild.ownerID,
            icon: message.guild.iconURL({dynamic: true, size: 512}),
            guildRegion: message.guild.region,
            guildCreatedAt: message.guild.createdAt.toLocaleString(),
            guildName: message.guild.name,
            guildInvite: "https://discord.gg/" + invite,
            defaultChannel: message.guild.systemChannel.toString(),
            ownerIcon: message.guild.owner.user.displayAvatarURL({dynamic: true, size: 512})
        });
        newGuild.save();
        return;
    }

    if(!uData){
        User.create({
            userID: message.author.id,
            userTag: message.author.tag,
            username: message.author.username,
            userIcon: message.author.displayAvatarURL({dynamic: true, size: 512})
        })
    }


    //if (!message.content.toLowerCase().startsWith(process.env.PREFIX)) return;
    if(message.content == "r/serverinfo") {
        let e = new Discord.MessageEmbed()
        .setTitle(data.guildName)
        .setDescription(data.description)
        .addField('Join', `[Click Here](${process.env.DOMAIN}/server/join/${data.guildID})`, true)
        .addField('Owner', `<@${data.ownerID}>`, true)
        .setAuthor(data.guildName, data.icon, `${process.env.DOMAIN}/server/${data.guildID}`)
        message.channel.send(e);
    }
    if(message.content == "r/userinfo") {

    }
    if(message.content =="r/guildchangedesc") {
        //let db = Guild.updateOne({description: })
    }
})

module.exports = bot;