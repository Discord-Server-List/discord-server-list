var {Schema, model} = require("mongoose")

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
    time: {
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
    atoken: String,
    atoken: String,
    discriminator: {
        type: String
    }
})

module.exports = model("User", userSchema);