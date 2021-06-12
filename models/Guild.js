var {Schema, model} = require("mongoose")
var findOrCreate = require('mongoose-findorcreate')

var guildSchema = new Schema({
    guildID: String,
    owner: String,
    ownerID: String,
    icon: String,
    emojis: {
            name: String,
            emojiID: String,
            animated: {
                type: Boolean,
                default: false
            }
    },
    guildRegion: String,
    description: {
        type: String,
        required: false,
        default: "This Server has no description."
    },
    country: String,
    category: {
        type: Array,
        required: false,
        default: []
    },
    addedAt: {
        default: () => new Date(),
        type: Date
    },
    guildWebsite: {
        default: "",
        type: String
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    nsfw: {
        type: Boolean,
        default: false
    },
    guildCreatedAt: {
        type: Date
    },
    guildName: {
        type: String
    },
    guildInvite: {
        type: String,
        default: ""
    },
    defaultChannel: {
        type: String
    },
    ownerIcon: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    }
})

guildSchema.plugin(findOrCreate);

module.exports = model("Guild", guildSchema);