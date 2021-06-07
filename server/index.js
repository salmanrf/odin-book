const http = require("http");
const socket_io = require("socket.io");
const mongoose = require("mongoose");

require("dotenv").config();

const app = require("./app");
const UserSchema = require("./models/user");

const userDB = mongoose.createConnection(process.env.USER_DB, {useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true});
userDB.on("error", () => console.log("unable to connect to users database"));

const UserModel = userDB.model("User", UserSchema);

const server = http.createServer(app);
const io = socket_io(server, {
  cors: {
    origin: process.env.REQ_ORIGIN,
  }
});

io.use((socket, next) => {
  socket.userId = socket.handshake.auth.userId;
  next();
});

io.on("connection", (socket) => {
  socket.join(socket.userId);
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`listening on port ${process.env.PORT}`);
});