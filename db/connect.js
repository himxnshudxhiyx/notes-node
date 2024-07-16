const mongoose = require("mongoose");



const connectDB = (url) => {
    console.log("Connect DB");
    return mongoose.connect(url,);
}

module.exports = connectDB;
