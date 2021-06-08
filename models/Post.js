var {Schema, model} = require("mongoose");

var postSchema = new Schema({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    title: {
        type: String,
        required: true,
        default: ""
    },
    body: {
        type: String,
        required: true
    },
    upvoted: {
        type: Number,
        default: 0
    },
    downvoted: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    comments: [{
        user: String,
        comment: String,
        created_at: {
            type: Date,
            default: () => new Date()
        }
    }],
    email: {
        type: String,
        required: true
    }
})

module.exports = model("Post", postSchema);