const router = require("express").Router();
const user_controller = require("../controllers/user_controller");

require("dotenv").config();

const {verifyJWT} = require("../controllers/token_controller");

router.get("/", user_controller.get_all_user);

router.use(async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  if(!token) {
    return res.sendStatus(401);
  }

  try {
    const {user} = await verifyJWT(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch(err) {
    res.sendStatus(401);
  }
});

router.get("/current", user_controller.get_current_user);

router.patch("/current", user_controller.update_current_user);

router.get("/current/reactions", user_controller.get_user_post_reaction);

router.get("/current/saved-post", user_controller.get_all_saved_posts);

router.post("/current/saved-post", user_controller.add_user_saved_post);

router.delete("/current/saved-post", user_controller.delete_user_saved_post);

router.get("/current/saved-post/:postId", user_controller.get_saved_post);

router.get("/current/requests", user_controller.get_current_user_requests);

router.post("/current/requests", user_controller.create_request);

router.get("/current/requests/:userId", user_controller.get_request_status);

router.patch("/current/requests/:requestId", user_controller.accept_request);

router.delete("/current/requests/:requestId", user_controller.delete_request);

router.get("/current/friends", user_controller.get_current_user_friends);

router.delete("/current/friends/:friendId", user_controller.delete_current_user_friend);

router.patch("/current/profile-picture", user_controller.update_user_profile_picture);

router.get("/:userId", user_controller.get_user);

router.get("/:userId/posts", user_controller.get_user_posts);

router.get("/:userId/images", user_controller.get_user_images);

router.get("/:userId/friends", user_controller.get_user_friends);

module.exports = router;