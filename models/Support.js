var {Schema, model, isValidObjectId} = require("mongoose");

var supportSchema = new Schema({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: () => new Date()
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    supportID: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true
    },
    locale: {
        type: String
    },
    file: [Array]
})  

module.exports = model("Support Ticket", supportSchema)