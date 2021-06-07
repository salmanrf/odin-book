const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {type: String, required: true, maxLength: 200},
  author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  post: {type: mongoose.Schema.Types.ObjectId, ref: "Post"},
});

module.exports = CommentSchema;