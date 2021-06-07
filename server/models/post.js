const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
  date: {type: Date, default: new Date()},
  content: {type: String, maxLength: 250},
  images: [{type: String, maxLength: 500}],
  reactions: [{type: mongoose.Schema.Types.ObjectId, ref: "Reaction"}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
  savedBy: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
});

module.exports = PostSchema;