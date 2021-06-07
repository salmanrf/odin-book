const router = require("express").Router();

require("dotenv").config();

const {verifyJWT} = require("../controllers/token_controller");
const post_controller = require("../controllers/post_controller");

async function authorizeUser(req, res, next) {
  if(!req.headers["authorization"]) return res.sendStatus(401);

  const token = req.headers["authorization"].split(" ")[1];

  if(!token) return sendStatus(401);
  
  try {
    const {user} = await verifyJWT(token, process.env.ACCESS_TOKEN_SECRET);
  
    req.user = user;

    next();
  } catch(err) {
    res.status(401).json({error: err.message});
  }
}

router.get("/", post_controller.get_all_post);

router.get("/feed", [
  authorizeUser,
  post_controller.get_feed_posts
]);

router.get("/:postId", post_controller.get_single_post);

router.get("/:postId/reactions", post_controller.get_post_reactions);

router.get("/:postId/comments", post_controller.get_post_comment);

// AUTHORIZE USER FOR ALL PATHS EXCEPT "/feed" OR ONES WITH GET METHOD
router.use("/", authorizeUser);
// AUTHORIZE USER FOR ALL PATHS EXCEPT "/feed" OR ONES WITH GET METHOD

router.post("/", post_controller.create_post);

router.patch("/comments/:commentId", post_controller.update_comment);

router.patch("/:postId", post_controller.update_post);

router.delete("/:postId", post_controller.delete_post);

router.post("/:postId/images", post_controller.add_post_images);

router.post("/:postId/reactions", post_controller.create_post_reaction);

router.post("/:postId/comments", post_controller.create_post_comment);

router.delete("/:postId/comments/:commentId", post_controller.delete_post_comment);


module.exports = router;