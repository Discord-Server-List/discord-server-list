var {Schema, model} = require("mongoose")

var categorySchemas = new Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryID: {
        type: Schema.Types.ObjectId,
        index: true,
        auto: true,
        required: true
    }
})

module.exports = model("Server_Categories", categorySchemas)