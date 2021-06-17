const path = require("path");
const fs = require("fs/promises");
const {body, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");

require("dotenv").config();

const {generateJWT, verifyJWT} = require("./controllers/token_controller");

const {User: UserModel, User} = require("./controllers/db_connections");

exports.signup = [
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

    if(!errors.isEmpty()) {
      return res.status(400).json({error: errors.mapped()});
    }

    try {
      const registered = await UserModel.findOne({username: req.body.username});
    
      if(registered) {
        return res.status(400).json({error: {username: {msg: "Username is already taken"}}});
      }

      const hash = await bcrypt.hash(req.body.password, process.env.HASH_SALT);

      const user = new UserModel({
        display_name: req.body.display_name,
        username: req.body.username,
        password: hash,
      });

      Promise.all([
        user.save(),
        generateJWT({user: {id: user._id}}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "5m"}),
        fs.mkdir(path.join(__dirname, `./files/user_files/${user._id}`), {recursive: true})
      ])
      .then(([, token]) => res.status(201).json({token}))
      .catch((err) => res.status(500).json({err: err.messsage}));
    } catch(err) {
        res.status(500).json({error: err});
    }
  }
]

exports.signin = [
  body("username").trim().isLength({min: 6, max: 100}).withMessage("Username: Must contain 6 to 100 characters").escape(),
  body("password").trim().isLength({min: 6, max: 100}).withMessage("Password: Must contain 6 to 100 characters").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(400).json({error: errors.mapped()});
    }

    const user = await UserModel.findOne({username: req.body.username}).select("username password tokens");
    
    if(!user) {
      return res.status(400).json({error: {username: {msg: "Username not found"}}});
    }

    const correct = await bcrypt.compare(req.body.password, user.password);

    if(!correct) {
      return res.status(400).json({error: {password: {msg: "Incorrect password"}}}); 
    }
  
    const tokenId = uuidv4();
    user.tokens = [...user.tokens, tokenId];

    try {
      const [accessToken, refreshToken] = await Promise.all([
        // Generate access token
        generateJWT(
          {
            user: {id: user._id}
          }, 
          process.env.ACCESS_TOKEN_SECRET, {expiresIn: "5m"}
        ),
        // Generate refresh token
        generateJWT(
          {
            tokenId,
            user: {id: user._id}
          }, 
          process.env.REFRESH_TOKEN_SECRET, 
          {expiresIn: "3d"}
        ),
        // Save user update (new refresh token)
        user.save()
      ]);
  
      res.cookie("refresh_token", refreshToken, {sameSite: "none", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 3, secure: true});
      res.status(200).json({token: accessToken});
    } catch(err) {
      res.status(500).json({error: err.message});
    }
  }
]

exports.signout = async (req, res, next) => {
  if(!req.cookies["refresh_token"]) {
    res.clearCookie("refresh_token");  
    return res.sendStatus(401);
  }

  let decoded;

  res.clearCookie("refresh_token");

  try {
    decoded = await verifyJWT(req.cookies["refresh_token"], process.env.REFRESH_TOKEN_SECRET);

    const {tokenId, user: tokenUser} = decoded;

    await 
      User.findByIdAndUpdate(
        tokenUser.id,
        {
          $pull: {tokens: tokenId}
        }
      );

    res.sendStatus(200);

  } catch {
      res.sendStatus(500);
  }
}


