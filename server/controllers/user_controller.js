const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const {body, validationResult} = require("express-validator");
const {Post, User, ReactionModel, RequestModel} = require("./db_connections");
const fs = require("fs/promises");

require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `../files/user_files/${req.user.id}`))
  },
  filename: (req, file, cb) => {
    switch(file.mimetype) {
      case "image/jpeg":
        cb(null, `profile-picture-${req.user.id}-${Date.now()}.jpg`);
        break;
      case "image/png": 
        cb(null, `profile-picture-${req.user.id}-${Date.now()}.png`);    
        break;
      case "image/svg": 
        cb(null, `profile-picture-${req.user.id}-${Date.now()}.svg`);  
        break;
      case "image/gif": 
        cb(null, `profile-picture-${req.user.id}-${Date.now()}.gif`);
        break;
      default: 
        cb(new Error("Invalid file type"));
    }
  }
});

const profilePicUpload = multer({storage, limits: {fileSize: 1024 * 1024 * 5}}).single("profile_picture");

exports.get_all_user = (req, res, next) => {
  User.find()
    .then((users) => res.status(200).json({users}))
    .catch(() => res.sendStatus);
}

exports.get_current_user = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  let userQuery = User.findById(req.user.id);

  if(req.query.select) {
    userQuery = userQuery.select(req.query.select);
  } else {
    userQuery = userQuery.select("_id display_name profile_picture")
  }
  
  userQuery
    .then((user) => res.status(200).json({user}))
    .catch(() => res.sendStatus(500));
}

exports.update_current_user = [
  (req, res, next) => {
    if(!req.user) return res.sendStatus(401);

    next();
  },
  
  body("display_name")
    .trim()
    .isAlpha("en-US", {ignore: " "})
    .withMessage("Can only contains Alphabet")
    .isLength({min: 6, max: 250})
    .withMessage("Must contain 6 to 250 characters")
    .escape(),
  body("username")
    .trim()
    .isLength({min: 6, max: 100})
    .withMessage("Must contain 6 to 100 characters")
    .isAlphanumeric()
    .withMessage("Can't contain symbols / special characters")
    .escape(),
  body("password").trim().isLength({min: 6, max: 100}).withMessage("Must contain 6 to 100 characters").escape(),
  
  async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty())
      return res.status(400).json({error: errors.mapped()});

    const [user, registered] = await Promise.all([
      User.findById(req.user.id).select("_id display_name, username profile_picture"),
      User.findOne({username: req.body.username})
    ]);
    
    if(registered) {
      if(registered.username !== user.username)
        return res.status(400).json({error: {username: {msg: "Username is already taken"}}});
    }

    let hash;
    
    try {
      hash = await bcrypt.hash(req.body.password, parseInt(process.env.HASH_SALT));
    } catch(err) {
      res.status(500).json({error: err.message});
    }

    Promise.all([
      User.findByIdAndUpdate(
        req.user.id,
        {
          display_name: req.body.display_name,
          username: req.body.username,
          password: hash
        },
        {new: true}
      ),
      (req.user.profile_picture && req.body.profile_picture) &&
      fs.unlink(path.join(__dirname, `../files/${user.profile_picture}`))
    ])
    .then(([user]) => {
      res.status(200)
        .json({
          user: {
            id: user._id,
            profile_picture: user.profile_picture,
            display_name: user.display_name,
            username: user.username
          }
        });
    })
    .catch((err) => res.status(500).json({error: err.message}));
  }
]

exports.update_user_profile_picture = [
  (req, res, next) => {
    if(!req.user) return res.sendStatus(401);

    next();
  },

  (req, res, next) => {
    profilePicUpload(req, res, (err) => {
      if(err) 
        return res.status(500).json({error: err.message});

      next();
    })
  },

  (req, res, next) => {
    User.findByIdAndUpdate(
      req.user.id,
      {
        profile_picture: `user_files/${req.user.id}/${req.file.filename}`
      },
      {new: true}
    )
    .then((user) => {
      res.status(200)
        .json({
          user: {
            id: user._id,
            profile_picture: user.profile_picture,
            display_name: user.display_name,
            username: user.username
          }
        });
    })
    .catch(() => res.status(500).json({error: err.message}));
  }
];

exports.get_all_saved_posts = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  User.findById(req.user.id)
    .select("saved_posts")
    .populate({
      path: "saved_posts", 
      model: Post, 
      select: "content images date author",
      populate: {
        path: "author",
        model: User
      }
    })
    .then(({saved_posts}) => {
      res.status(200).json({saved_posts})
    })
    .catch(() => res.sendStatus(500));
}

exports.get_saved_post = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  User.findById(req.user.id)
    .select("saved_posts -_id")
    .then(({saved_posts}) => {
      const isSaved = saved_posts.includes(req.params.postId);
      res.status(200).json({postId: req.params.postId, isSaved});
    })
    .catch((err) => res.status(500).json({error: err.message}));
}

exports.add_user_saved_post = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  Promise.all([
    User.findByIdAndUpdate(
      req.user.id, 
      {
        $push: {saved_posts: req.body.postId}
      }
    ),
    Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: {savedBy: req.user.id}
      }
    )
  ])
  .then(() => res.sendStatus(200))
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.delete_user_saved_post = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  Promise.all([
    User.findByIdAndUpdate(
      req.user.id, 
      {
        $pull: {saved_posts: req.body.postId}
      }
    ),
    Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: {savedBy: req.user.id}
      }
    )
  ])
  .then(() => res.sendStatus(200))
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_user_post_reaction = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  if(!req.query.post) return res.sendStatus(400);

  User.findById(req.user.id)
    .select("reactions")
    .populate({
      path: "reactions", 
      model: ReactionModel,
      match: {post: req.query.post}
    })
    .then((user) => res.status(200).json({userReact: user.reactions[0]}))
    .catch(() => res.sendStatus(500));
}

exports.get_current_user_friends = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  User.findById(req.user.id)
    .select("friends")
    .populate({
      path: "friends",
      model: User,
      select: "_id display_name username profile_picture"
    })
    .then(({friends}) => res.status(200).json({friends}))
    .catch((err) => res.status(500).json({error: err.message}));
}

exports.delete_current_user_friend = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  Promise.all([
    User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {friends: req.params.friendId}
      }
    ),
    User.findByIdAndUpdate(
      req.params.friendId,
      {
        $pull: {friends: req.user.id}
      }
    )
  ])
  .then(() => res.status(200).json({request: {_id: null, status: 0}}))
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_user = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  let userQuery = User.findById(req.params.userId);

  if(req.query.select) {
    const selectors = req.query.select.split(",").reduce((a, b) => a + " " + b, "");

    userQuery = userQuery.select(selectors);
  } else {
    userQuery = 
      userQuery
        .select("-password -posts -requests -reactions -saved_posts -tokens")
        .populate({path: "friends", select: "_id profile_picture display_name"});
  }
  
  userQuery
    .then((user) => res.status(200).json({user}))
    .catch(() => res.sendStatus(500));
}

exports.get_user_posts = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  User.findById(
    req.params.userId
  )
    .select("posts")
    .populate({
      path: "posts",
      model: Post,
      select: "content images date author",
      populate: {
        path: "author",
        model: User
      }
    })
    .then(({posts}) => {
      res.status(200).json({posts})
    })
    .catch(() => res.sendStatus(500));
}

exports.get_user_images = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  User.findById(
    req.params.userId
  )
    .slice("images", req.query.count || null)
    .select("images")
    .then(({images}) => res.status(200).json({images}))
    .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_current_user_requests = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  const query = User.findById(req.user.id);

  query.select("requests");

  if(req.query.role) {
    if(req.query.role === "requester") {
      query.populate(
        {
          path: "requests", 
          model: RequestModel,
          match: {requester: req.user.id},
        }
      );
    } else if(req.query.role === "receiver") {
        query.populate(
          {
            path: "requests", 
            model: RequestModel,
            match: {receiver: req.user.id},
            populate: [
              {
                path: "requester",
                model: User,
                select: "_id display_name username profile_picture"
              },
              {
                path: "receiver",
                model: User,
                select: "_id display_name username profile_picture"
              },
            ]
          }
        );
    } else {
        return res.status(400).json({error: "Specify or omit role query !"});
    }
  } else {
      query.populate({path: "requests", model: RequestModel});
  }

  query
    .then(({requests}) => res.status(200).json({requests}))
    .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_user_friends = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  User.findById(req.params.userId)
    .select("friends")
    .populate(
      {
        path: "friends",
        model: User,
        select: "_id display_name username profile_picture",
        limit: req.query.count || null
      }
    )
    .then(({friends}) => res.status(200).json({friends}))
    .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_request_status = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);
  
  const userQuery = User.findById(req.user.id);

  userQuery 
    .select("requests friends")
    .populate({
      path: "requests",
      model: RequestModel,
      match: {$or: [{requester: req.params.userId}, {receiver: req.params.userId}]}
    })

  let requests, friends;

  try {
    ({requests, friends} = await userQuery); 
  } catch(err) {
    return res.status(500).json({error: err.message})
  }

  let request = requests[0];

  if(!request) {
    if(friends.includes(req.params.userId)) 
      return res.status(200).json({request : {_id: null, status: 3}});
    else
      return res.status(200).json({request : {_id: null, status: 0}});
  }

  let status;

  if(request.requester == req.user.id)
    status = 1;
  else if(request.receiver == req.user.id)
    status = 2;

  res.status(200).json({request : {_id: request._id, status}});
}

exports.create_request = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);
  
  const userQuery = User.findById(req.user.id);

  userQuery 
    .select("requests friends")
    .populate({
      path: "requests",
      model: RequestModel,
      match: {$or: [{requester: req.query.userId}, {receiver: req.query.userId}]}
    })

  let requests, friends;

  try {
    ({requests, friends} = await userQuery); 
  } catch(err) {
    return res.status(500).json({error: err.message})
  }

  let request = requests[0];

  if(request) {
    if(request.requester == req.user.id) 
      return res.status(201).json({request : {_id: null, status: 1}});
    else if(request.receiver == req.user.id)
      return res.status(201).json({request : {_id: null, status: 2}});
  } else {
      if(friends.includes(req.query.userId))
        return res.status(201).json({request : {_id: null, status: 3}});
  }

  // No Request and not a friend , therefore continue
  const newRequest = new RequestModel({
    requester: req.user.id,
    receiver: req.body.receiver
  });

  Promise.all([
    newRequest.save(),
    User.updateMany(
      {_id: {$in: [newRequest.requester, newRequest.receiver]}},
      {
        $push: {requests: newRequest}
      }
    )
  ])
  .then(([request]) => res.status(201).json({request: {_id: newRequest._id, status: 1}}))
  .catch(() => res.sendStatus(500));
}

exports.accept_request = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  try {
    const query = User.findById(req.user.id);

    query.select("requests")
      .populate(
        {
          path: "requests",
          model: RequestModel,
          match: {
            _id: req.params.requestId
          }
        }
      )
    
    const {requests} = await query;
    const request = requests[0];

    if(!request) 
      return res.status(200).json({request: {_id: null, status: 0}});

    // Can't accept request if current user is not the receiver
    if(request.receiver.toString() !== req.user.id)
      return res.status(401).json({request: {_id: null, status: 0}});

    Promise.all([
      RequestModel.findByIdAndDelete(request._id),
      User.findByIdAndUpdate(
        req.user.id,
        {
          $pull: {requests: request._id}  
        }
      ),
      User.findByIdAndUpdate(
        request.receiver,
        {
          $push: {friends: request.requester}
        }
      ),
      User.findByIdAndUpdate(
        request.requester,
        {
          $push: {friends: request.receiver}
        }
      )
    ])
    .then(() => {
      let newFriend = null;

      if(req.user == request.requester)
        newFriend = request.receiver;
      else
        newFriend = request.requester;

      res.status(200).json({request: {_id: null, status: 3}, newFriend});
    })
  } catch(err) {
    res.status(500).json({error: err.message});
  }
}

exports.delete_request = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  const request = await RequestModel.findById(req.params.requestId);

  if(!request)
    return res.status(200).json({request: {_id: null, status: 0}});

  Promise.all([
    User.findByIdAndUpdate(
      request.receiver,
      {
        $pull: {requests: request._id}
      }
    ),
    User.findByIdAndUpdate(
      request.requester,
      {
        $pull: {requests: request._id}
      }
    ),
    request.delete()
  ])
  .then(() => res.status(200).json({request: {_id: null, status: 0}}))
  .catch((err) => res.status(500).json({error: err.message}));
}