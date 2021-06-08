var mongoose = require('mongoose');

module.exports.connectDB = (uri) => {
    try {
        mongoose.connect(uri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log(`Connecting to ${uri}`)
    } catch (error) {
        console.error(error);
    }
}