var {Schema, model} = require("mongoose")

var categorySchemas = new Schema({
    categoryName: {
        type: String,
        required: true
    }
})

module.exports = model("Server_Categories", categorySchemas)