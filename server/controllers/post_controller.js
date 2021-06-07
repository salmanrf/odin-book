const {body, validationResult} = require("express-validator");
const path = require("path");
const multer = require("multer");
const fs = require("fs/promises");
const {v4: uuidv4} = require("uuid");

const {Post, User, ReactionModel, CommentModel} = require("./db_connections");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const postDir = path.join(__dirname, `../files/user_files/${req.user.id}/posts/${req.post._id}`);

      // Default options === {recursive: false}
      // If post is new, create a directory
      if(req.post.new)
        await fs.mkdir(postDir, {recursive: true});

      cb(null, postDir);
    } catch(err) {
      const error = new Error(err.message);
      error.status = 500;
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const filename = uuidv4();
    
    switch(file.mimetype) {
      case "image/jpeg":
        cb(null, `${filename}.jpg`);
        break;
      case "image/png": 
        cb(null, `${filename}.png`);    
        break;
      case "image/svg": 
        cb(null, `${filename}.svg`);  
        break;
      case "image/gif": 
        cb(null, `${filename}.gif`);
        break;
      default: 
        cb(new Error("Invalid file type"));
    }
  }
});

const limits = {fileSize: 1024 * 1024 * 10, files: 10};

const upload = multer({storage, limits}).array("images", 10);

const PostTemps = {};

exports.get_all_post = (req, res, next) => {
  Post.find()
    .select("content images date author")
    .populate({path: "author", select: "display_name _id profile_picture", model: User})
    .then((posts) => res.status(200).json({posts}))
    .catch(() => res.sendStatus(500));
}

exports.get_feed_posts = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  Promise.all([
    User.findById(req.user.id)
      .select("friends")
      .populate({
        path: "friends",
        model: User,
        select: "posts",
        populate: {
          path: "posts",
          model: Post,
          select: "content images date author",
          populate: {
            path: "author",
            model: User,
            select: "_id display_name profile_picture"
          }
        }
      }),
    User.findById(req.user.id)
      .select("posts")
      .populate({
        path: "posts", 
        model: Post,
        select: "content images date author", 
        populate: {
          path: "author",
          model: User,
          select: "_id display_name profile_picture"
        }
      })
  ])
  .then(([{friends}, {posts: userPosts}]) => {
    const posts = friends.reduce((collection, friend) => [...collection, ...friend.posts], userPosts);

    res.status(200).json({posts});
  })
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_single_post = (req, res, next) => {
  Post.findById(req.params.postId)
    .select("content images date author")
    .populate({path: "author", select: "display_name _id profile_picture", model: User})
    .then((post) => res.status(200).json({post}))
    .catch(() => res.sendStatus(500));
}

exports.create_post = [
  body("content").trim().escape().isLength({max: 250}).withMessage("Can't contain more than 250 characters !"),

  async (req, res, next) => {
    if(!req.user) return res.sendStatus(401);
    
    const errors = validationResult(req);

    if(!errors.isEmpty()) 
      return res.status(400).json({error: errors.mapped()});

    const post = new Post({
      author: req.user.id,
      content: req.body.content
    });      

    // Saves post temporary if post has incoming images
    if(Number.parseInt(req.query.images)) {
      post.new = true;
      PostTemps[post._id] = post;

      return res.status(201).json({post: {_id: post._id}});
    }

    const postDir = path.join(__dirname, `../files/user_files/${req.user.id}/posts/${post._id}`);

    Promise.all([
      post.save(),
      User.findByIdAndUpdate(
        req.user.id,
        {
          $push: {posts: post}
        }
      ),
      fs.mkdir(postDir, {recursive: true})
    ])
    .then(async ([post]) => {
      const populated = await 
        Post.findById(post._id)
          .populate(
            {
              path: "author", 
              select: "display_name _id profile_picture", 
              model: User
            }
          );
      res.status(200).json({post: populated})
    })
    .catch((err) => res.status(500).json({error: err.message}));
  }
]

exports.add_post_images = [
  (req, res, next) => {
    if(!req.user) 
      return res.sendStatus(401);
    
    if(PostTemps[req.params.postId]) {
      req.post = PostTemps[req.params.postId];

      PostTemps[req.params.postId] = null;

      if(req.post.author.toString() !== req.user.id.toString())
        return res.status(401).json({error: {message: "you don't have control over this post"}});
        
      return next();
    }
    
    User.findById(req.user.id)
      .select("posts")
      .populate({path: "posts", model: Post, match: {_id: req.params.postId}})
      .then(({posts}) => {
        if(posts[0]) {
          const post = posts[0];
          post.new = false;
          req.post = post;
          return next();
        }
        
        res.sendStatus(404);
      })
      .catch((err) => res.status(500).json({error: err.message}));
  },

  (req, res, next) => {
    upload(req, res, (err) => {
      if(err) {
        return res.status(500).json({error: err.message});
      }

      next();
    });
  },

  async (req, res, next) => {
    const post = req.post;
    
    const newImages = [];
    
    for(const file of req.files) {
      const url = `user_files/${req.user.id}/posts/${post._id}/${file.filename}`;
      post.images.push(url);
      newImages.push({post: post._id, url});
    }

    Promise.all([
      post.save(),
      User.findByIdAndUpdate(
        req.user.id,
        {
          $push: {images: {$each: newImages}}
        }
      ),
      post.new &&
        User.findByIdAndUpdate(
          req.user.id, 
          {
            $push: {posts: post},
          }
        )
    ])
    .then(async ([post]) => (
      User.findById(req.user.id)
        .select("posts")
        .populate(
          {
            path: "posts", 
            model: Post, 
            match: {_id: post._id},
            populate: {
              path: "author", 
              select: "display_name _id profile_picture", 
              model: User
            }
          }
        )
      )
    )
    .then(({posts}) => {
      res.status(200).json({post: posts[0]})
    })
    .catch((err) => res.status(500).json({error: err.message}));  
  }
]

exports.update_post = [
  body("contentUpdate").trim().escape().isLength({max: 250}).withMessage("Can't contain more than 250 characters !"),
  body("deletedImages").isArray(),
  body("newImages").isArray(),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(400).json({error: errors.mapped()});
    }

    next();
  },

  async (req, res, next) => {
    if(!req.user) return res.sendStatus(401);
  
    const {contentUpdate, deletedImages} = req.body;

    Promise.all([
      Post.findOneAndUpdate(
        {_id: req.params.postId, author: req.user.id}, 
        {
          content: contentUpdate,
          $pull: {images: {$in: deletedImages}},
        },
        {new: true}
      ),
      User.findByIdAndUpdate(
        req.user.id,
        {
          $pull: {images: {url: {$in: deletedImages}}}
        }
      ),
      // Returns an array of promises of file system operation
      ...deletedImages.map((imgPath) => {
        // Delete all images included in deletedImages (from req.body)
        fs.unlink(path.join(__dirname, `../files/${imgPath}`));
      })
    ])
    .then(([post]) => {
      res.status(200).json({post});
    })
    .catch((err) => res.status(500).json({error: err.message}));
  }
]

exports.delete_post = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  let post;

  try {
    post = await 
      Post.findOne(
          {_id: req.params.postId, author: req.user.id}      
      )
      .populate({
        path: "reactions",
        model: ReactionModel
      })
      .populate({
        path: "comments",
        model: CommentModel
      });

  }catch(err) {
    res.status(500).json({error: err.message});
  }
  
  if(!post) 
    return res.sendStatus(404);

  Promise.all([
    // Remove post from user.posts
    User.findByIdAndUpdate(
      post.author,
      {
        $pull: {
          images: {post: post._id},
          posts: post._id
        },
      }
    ),
    // Remove reaction from user.reactions
    User.updateMany(
      {_id: {$in: post.reactions.map((react) => react.user)}},
      {
        $pull: {reactions: {$in: post.reactions}}
      }
    ),
    // Remove comment from user.comments
    User.updateMany(
      {_id: {$in: post.comments.map((comment) => comment.author)}},
      {
        $pull: {comments: {$in: post.comments}}
      }
    ),
    // Remove this post from users's saved_posts
    User.updateMany(
      {_id: {$in: post.savedBy}},
      {
        $pull: {saved_posts: post._id}
      }
    ),
    // Delete reactions associated with this post
    ReactionModel.deleteMany({_id: {$in: post.reactions}}),
    // Delete comments associated with this post
    CommentModel.deleteMany({_id: {$in: post.comments}}),
    // Delete the directory for this post
    fs.rmdir(path.join(__dirname, `../files/user_files/${post.author.toString()}/posts/${post._id}`), {recursive: true}),
    // Delete the post itself
    post.delete(),
  ])
  .then(() => res.sendStatus(200))
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_post_reactions = async (req, res, next) => {
  const {reactions} = await Post.findById(req.params.postId).populate({path: "reactions", model: ReactionModel})
  
  const reactTypes = {
    like: 0,
    laughing: 0,
    kiss: 0,
    crying: 0,
    angry: 0
  };

  for(let r of reactions) {
    // Stop counting when all types has more than 0 count
    // or reaches the end of reactions
    if(Object.keys(reactTypes).every((name) => reactTypes[name].count > 0)) 
      break;

    reactTypes[r.type] += 1;
  }

  const {like, laughing, kiss, crying, angry} = reactTypes;

  res
    .status(200)
    .json({
      count: reactions.length, 
      like,laughing, kiss, crying, angry
    });
}

exports.create_post_reaction = async (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  if(!req.params.postId) return res.sendStatus(400);

  // Check if user has a reaction to this post
  const {reactions : userReact} = await User.findById(req.user.id)
    .select("reactions")
    .populate({
      path: "reactions", 
      model: ReactionModel, 
      match: {post: req.params.postId}}
    );

  // If it does, update or delete the reaction
  if(userReact.length > 0) {
    // Store the newly found reaction to be used in another handler
    req.userReact = userReact[0];

    // If user sends along a type query, update the reaction
    if(req.query.type)
      return updatePostReaction(req, res, next);
    else
      // If it doesn't, delete the reaction
      return deletePostReaction(req, res, next);
  }
  
  // If reaction doesn't exist, create a new one
  const reaction = new ReactionModel({
    post: req.params.postId,
    type: req.query.type,
    user: req.user.id
  });

  let saved;

  try {
    saved = await reaction.save();
  } catch(err) {
    res.status(500).json({error: err.message});
  }

  Promise.all([
    User.findByIdAndUpdate(req.user.id, {
      $push: {reactions: saved}
    }),
    Post.findByIdAndUpdate(req.params.postId, {
      $push: {reactions: saved}
    })
  ])
    .then(() => res.status(200).json({reaction: saved}))
    .catch((err) => res.status(500).json({error: err.message}));
}

async function updatePostReaction(req, res, next) {
  const userReact = req.userReact;
  
  if(req.query.type) {
    reaction = await ReactionModel.findByIdAndUpdate(userReact, {type: req.query.type}, {new: true});

    return res.status(200).json({reaction});
  }
}

async function deletePostReaction(req, res, next) {
  const userReact = req.userReact;

  Promise.all([
    User.findByIdAndUpdate(req.user.id, {$pull: {reactions: userReact}}, {new: true}),
    Post.findByIdAndUpdate(req.params.postId, {$pull: {reactions: userReact}}, {new: true}),
    ReactionModel.findByIdAndDelete(userReact)
  ])
  .then(() => res.status(200).json({reaction: null}))
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.get_post_comment = (req, res, next) => {
  Promise.all([
    Post.findById(req.params.postId)
      .select("comments"),
    Post.findById(req.params.postId)
      .select("comments")
      .populate({
        path: "comments", 
        model: CommentModel,
        limit: req.query.count || null,
        populate: {
          path: "author",
          select: "_id display_name profile_picture",
          model: User
        }  
      }),
  ])
  .then(([{comments}, {comments: commentsPopulated}]) => {
    res
      .status(200)
      .json({
        count: comments.length,
        comments: commentsPopulated
      })
  })
  .catch((err) => res.status(500).json({error: err.message}));
}

exports.create_post_comment = [
  body("content").trim().isLength({min: 1, max: 250}).withMessage("Must contain 1 - 250 characters").escape(),
  
  async (req, res, next) => {
    if(!req.user) return res.sendStatus(401);
  
    if(!req.params.postId) return res.sendStatus(400);

    const errors = validationResult(req);

    if(!errors.isEmpty()) 
      return res.status(400).json({error: errors.mapped()});
  
    const comment = new CommentModel({
      content: req.body.content,
      author: req.user.id,
      post: req.params.postId
    });
  
    let saved;
  
    try {
      saved = await comment.save();
    } catch(err) {
      return res.status(500).json({error: err.message});
    }
  
    Promise.all([
      Post.findByIdAndUpdate(req.params.postId, {
        $push: {comments: saved}
      }),
      User.findByIdAndUpdate(req.user.id, {
        $push: {comments: saved}
      })
    ])
      .then(() => res.status(201).json({comment: saved}))
      .catch((err) => res.status(500).json({error: err.message}));   
  }
]

exports.update_comment = [
  body("update").trim().isLength({min: 1, max: 250}).withMessage("Must contain 1 - 250 characters").escape(),
  
  (req, res, next) => {
    if(!req.user) return res.sendStatus(401);
  
    const errors = validationResult(req);

    if(!errors.isEmpty()) 
      return res.status(400).json({error: errors.mapped()});
  
    CommentModel.findByIdAndUpdate(
      req.params.commentId, 
      {content: req.body.update},
      {new: true}
    )
    .then((comment) => res.status(200).json({comment}))
    .catch((err) => res.status(500).json({error: err.message}));
  }
] 

exports.delete_post_comment = (req, res, next) => {
  if(!req.user) return res.sendStatus(401);

  Promise.all([
    CommentModel.findByIdAndDelete(req.params.commentId),
    User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {comments: req.params.commentId}       
      }
    ),
    Post.findByIdAndUpdate(
      req.params.postId,
      {
        $pull: {comments: req.params.commentId}
      }
    )
  ])
  .then(() => res.sendStatus(200))
  .catch((err) => res.status(500).json({error: err.message}));
}