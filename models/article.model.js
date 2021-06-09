const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const articleSchema = new Schema({
    authorId: {type: String, required: true},
    author: {type: String, required: true},
    showAuthor: {type: Boolean, required: true, default: true},
    datetime: {type: Date, required: true},
    title: {type: String, required: true},
    text: {type: String, required: true},
    images: {type: Array},
    category: {type: String, required: true},
    status: {type: String, required: true, default: "nowy"}
}, {timestamps: true});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;