var {Schema, model} = require("mongoose");

var chatSupportSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    messageID: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true
    }
})

module.exports = model("Chat_Support", chatSupportSchema);