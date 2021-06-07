const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  post: {type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true},
  url: {type: String, minLength: 1, maxLength: 500, required: true}
});

const UserSchema = new mongoose.Schema({
  display_name: {type: String, minLength: 6, maxLength: 250, required: true},
  username: {type: String, minLength: 6, maxLength: 100, required: true, unique: true},
  password: {type: String, minLength: 6, maxLength: 100, required: true},
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
  saved_posts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
  friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  profile_picture: {type: String, minLength: 1, maxLength: 500},
  tokens: [{type: String}],
  requests: [{type: mongoose.Schema.Types.ObjectId, ref: "Request"}],
  reactions: [{type: mongoose.Schema.Types.ObjectId, ref: "Reaction"}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
  images: [{type: imageSchema}],
});

module.exports = UserSchema;