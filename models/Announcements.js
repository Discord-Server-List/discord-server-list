const { Schema, model } = require("mongoose");

var announcementsSchema = new Schema({
    title: {
        type: String,
        required: true
    }, 
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    locale: {
        type: String,
        default: "en-US",
        required: true
    }
})

module.exports = model("Announcements", announcementsSchema);