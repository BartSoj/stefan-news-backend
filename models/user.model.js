const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 5},
    image: {type: String, default: "default.jpg"},
    description: {type: String, default: ""},
    role: {type: String, default: "pending"},
    show: {type: Boolean, default: false}
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;