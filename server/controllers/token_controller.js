const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const user_db = mongoose.createConnection(process.env.USER_DB, {useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true});
user_db.on("error", (err) => console.error(err.message));
const UserSchema = require("../models/user");
const UserModel = user_db.model("User", UserSchema);

const getRefreshToken = async (req, res, next) => {
  if(!req.cookies["refresh_token"]) {
    return res.sendStatus(401);
  }

  console.log(req.cookies);
  console.log(req.cookies["refresh_token"]);

  let decoded = jwt.decode(req.cookies["refresh_token"], {complete: true});
  const tokenId = decoded.payload && decoded.payload.tokenId;
  const userId = decoded.payload && decoded.payload.user.id;

  try {
    const {tokenId, user: tokenUser} = await verifyJWT(req.cookies["refresh_token"], process.env.REFRESH_TOKEN_SECRET);
  
    const user = await UserModel.findById(tokenUser.id).select("tokens");

    if(!user.tokens.includes(tokenId)) {
      return res.status(401).json({error: {msg: "JWT has expired or been blacklisted"}});
    }

    const accessToken = await generateJWT({user: {id: user._id}}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "5m"});

    res.status(200).json({token: accessToken});
    
  } catch {
      UserModel.findByIdAndUpdate(
        userId,
        {
          $pull: {tokens: tokenId}
        }
      )
      .then(() => {
        res.clearCookie("refresh_token");
      })
      .catch(() => null)
      .finally(() => res.sendStatus(401));
  }
}

const generateJWT = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, 
      (err, token) => {
        if(err) return reject(err);

        return resolve(token);
      }
    );
  });
}

const verifyJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, 
      (err, decoded) => {
        if(err) return reject(err);

        return resolve(decoded);
      }  
    );
  });
}

module.exports = {verifyJWT, generateJWT, getRefreshToken};
