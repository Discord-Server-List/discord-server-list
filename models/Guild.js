var {Schema, model} = require("mongoose")
var findOrCreate = require('mongoose-findorcreate')

var guildSchema = new Schema({
    guildID: String,
    owner: String,
    ownerID: String,
    icon: String,
    emojis: [
        {
            emojiName: String,
            emojiID: String,
            animated: {
                type: Boolean,
                default: false
            }
        }
    ],
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
    },
    memberCount: {
        type: Number,
        required: true
    },
    emojiCount: {
        type: Number,
        required: true
    }
})

guildSchema.plugin(findOrCreate);

guildSchema.virtual('type').get(function () {
    return 'widget';
})

guildSchema.set('toObject', {
    virtuals: true
})

guildSchema.statics.random = function(callback) {
    this.count(function(err, guildCount) {
            if(err)
                return callback(err);
            var rand = Math.floor(Math.random() * guildCount);
            this.findOne().skip(rand).exec(callback);
    }.bind(this))
};

module.exports = model("Guild", guildSchema);