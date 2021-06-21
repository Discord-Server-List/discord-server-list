var { Schema, model } = require("mongoose");
const { nanoid } = require("nanoid");

var supportSchema = new Schema({
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
        default: nanoid(20)
    },
    locale: {
        type: String
    },
    file: [
        {
            file_name: String,
            file_size: Number,
            uploadedAt: {
                type: Date,
                default: () => new Date()
            }
        }
    ]
})  

module.exports = model("Support Ticket", supportSchema)