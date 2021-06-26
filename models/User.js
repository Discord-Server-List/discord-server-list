var {Schema, model} = require("mongoose")
var findOrCreate = require('mongoose-findorcreate')

var userSchema = new Schema({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    guildLiked: {
        type: Number,
        required: true,
        default: 0
    },
    guildDisLiked: {
        type: Number,
        required: true,
        default: 0
    },
    addedAt: {
        type: Date,
        default: () => Date.now()
    },
    description: {
        type: String,
        default: "User has not setup any description"
    },
    staff: {
        type: Boolean,
        default: false
    },
    username: {
        type: String
    },
    userTag: {
        type: String
    },
    userIcon: {
        type: String
    },
    guilds: [String],
    rtoken: String,
    atoken: String,
    discriminator: {
        type: String
    },
    userEmail: {
        type: String
    },
    is_premium: {
        type: Boolean,
        default: false
    },
    next_payment_date: {
        type: Date
    },
    locale: {
        type: String,
        default: "en-US"
    },
    createdAt: {
        type: Date
    }
})

userSchema.plugin(findOrCreate);

module.exports = model("User", userSchema);