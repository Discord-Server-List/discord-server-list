var {Schema, model} = require("mongoose")

var planSchema = new Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    }
}, {
    timestamps: true
})

module.export = model("Plan", planSchema);