var Discord = require("discord.js");
var bot = new Discord.Client();
var fetch = require("node-fetch");
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
    let uData = await User.findOne({ userID: message.author.id })
    let args = message.content.slice(process.env.PREFIX.length).trim().split(/ + /g);
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

    let emojiuri = message.guild.emojis.cache.find((e) => e.url.toString());
    let emojiname = message.guild.emojis.cache.find((e) => e.name)
    let emojiid = message.guild.emojis.cache.find((emj) => emj.id)
    let isanimated = message.guild.emojis.cache.find((anim) => anim.animated)

    if (!data) {
        const newGuild = new Guild({ 
            guildID: message.guild.id,
            owner:  message.guild.owner.user.tag,
            ownerID: message.guild.ownerID,
            icon: message.guild.iconURL({dynamic: true, size: 512, format: "png"}),
            guildRegion: message.guild.region,
            guildCreatedAt: message.guild.createdAt.toLocaleString(),
            guildName: message.guild.name,
            guildInvite: "https://discord.gg/" + invite,
            defaultChannel: message.guild.systemChannel.toString(),
            ownerIcon: message.guild.owner.user.displayAvatarURL({dynamic: true, size: 512, format: "png"}),
            emojis: [
               {
                    emojiName: emojiname,
                    emojiID: emojiid,
                    animated: isanimated,
                    emojiURL: emojiuri
               }
            ]
        });
        newGuild.save();
        return;
    }

    /*if(!uData){
        User.create({
            userID: message.author.id,
            userTag: message.author.tag,
            username: message.author.username,
            userIcon: message.author.displayAvatarURL({dynamic: true, size: 512})
        })
    }*/

    //if (!message.content.toLowerCase().startsWith(process.env.PREFIX)) return;
    if(message.content == "r/serverinfo") {
        let e = new Discord.MessageEmbed()
        .setTitle(data.guildName)
        .setDescription(data.description)
        .setImage(data.icon)
        .addField('Join', `[Click Here](${process.env.DOMAIN}/server/join/${data.guildID})`, true)
        .addField('Owner', `<@${data.ownerID}>`, true)
        .setTimestamp(new Date())
        .setAuthor(data.guildName, data.icon, `${process.env.DOMAIN}/server/${data.guildID}`)
        message.channel.send(e);
    }
    if(message.content == "r/userinfo") {
        let e = new Discord.MessageEmbed()
        .setTitle(`${uData.username} Profile`)
        .setImage(`${uData.userIcon}.png`)
        .setDescription(uData.description)
        .addField('Add As Friend', `[Click Here](${process.env.DOMAIN}/user/add/${uData.userID})`, true)
        .setAuthor(uData.username, uData.userIcon, `${process.env.DOMAIN}/user/${uData.userID}`, true)
        .setTimestamp(new Date())
        message.channel.send(e);
    }

    if(message.content == "r/guildchangedesc") {
        let desc = args[0].length()
        let db = Guild.updateOne({description: desc});
        
    }

    if(message.content == "r/userchangedesc") {
        
    }
})

module.exports = bot;