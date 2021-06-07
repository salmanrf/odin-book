const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const auth = require("./authentication");
const user_router = require("./routes/user_router");
const post_router = require("./routes/post_router");
const {search_all} = require("./controllers/search_controller");
const {getRefreshToken} = require("./controllers/token_controller");

require("dotenv").config();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "files")));

app.use((req, res, next) => {
  const allowedOrigin = [process.env.REQ_ORIGIN, process.env.REQ_ORIGIN_ALIAS];
  const origin = req.headers.origin;

  if(!allowedOrigin.includes(origin))
    return res.sendStatus(401);

  res.setHeader("Access-Control-Allow-Origin", origin);
  
  res.set({
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": ["Content-Type", "Authorization"],
    "Access-Control-Allow-Methods": ["POST", "DELETE", "PATCH"]
  });

  if(req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cookieParser());

app.use("/api/user", user_router);
app.use("/api/post", post_router);
app.use("/api/search", search_all);
app.use("/api/refresh", getRefreshToken);
app.use("/api/auth/signup", auth.signup);
app.use("/api/auth/signin", auth.signin);
app.use("/api/auth/signout", auth.signout);

module.exports = app;