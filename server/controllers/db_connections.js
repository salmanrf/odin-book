const mongoose = require("mongoose");

require("dotenv").config();

const PostSchema = require("../models/post");
const UserSchema = require("../models/user");
const RequestSchema = require("../models/request");
const ReactionSchema = require("../models/reaction");
const CommentSchema = require("../models/comment");

const postDB = mongoose.createConnection(process.env.POST_DB, {useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});
const userDB = mongoose.createConnection(process.env.USER_DB, {useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});

const Post = postDB.model("Post", PostSchema);

const User = userDB.model("User", UserSchema);

const RequestModel = userDB.model("Request", RequestSchema);

const ReactionModel = postDB.model("Reaction", ReactionSchema);

const CommentModel = postDB.model("Comment", CommentSchema);

module.exports = {Post, User, RequestModel, ReactionModel, CommentModel};

