const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema({
  post: {type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true},
  type: {type: String, enum: ["like", "laughing", "kiss", "crying", "angry"], required: true, default: "like"},
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
});

module.exports = ReactionSchema;