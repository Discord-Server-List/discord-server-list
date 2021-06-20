var {Schema, model} = require("mongoose");
const { nanoid } = require("nanoid");

var chatSupportSchema = new Schema({
    messageID: {
        type: String,
        default: nanoid(15),
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },  
    userEmail: {
        type: String,
        required: true
    }
})

module.exports = model("Chat_Support", chatSupportSchema);