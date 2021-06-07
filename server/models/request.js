const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  requester: {type: mongoose.Schema.Types.ObjectId, required: true},
  receiver: {type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = RequestSchema;