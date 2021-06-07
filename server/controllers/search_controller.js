const {User, Post} = require("./db_connections");

exports.search_all = (req, res, next) => {
  Promise.all([
    User.find({
      $or: [
        {
          display_name: {$regex: req.query.keyword || "", $options: "i"}
        },
        {
          Username: {$regex: req.query.keyword || "", $options: "i"}
        },
      ]
    })
    .select("_id display_name username profile_picture"),
    Post.find({
      content: {$regex: req.query.keyword || "", $options: "i"}
    })
    .select("_id content author")
    .populate({
      path: "author",
      model: User,
      select: "display_name profile_picture"
    }),
  ])
  .then(([users, posts]) => res.status(200).json({users, posts}))
  .catch((err) => res.status(500).json({error: err.message}));
}