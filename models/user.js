const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true }, // Changed to String
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    isLoggedIn: { type: Boolean, default: false } // Add this field
});

module.exports = mongoose.model('User', userSchema);